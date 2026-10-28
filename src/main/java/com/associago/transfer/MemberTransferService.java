package com.associago.transfer;

import com.associago.association.repository.AssociationRepository;
import com.associago.membership.UserAssociation;
import com.associago.shared.i18n.LocalizedException;
import com.associago.shared.i18n.Messages;
import com.associago.membership.repository.UserAssociationRepository;
import com.associago.user.User;
import com.associago.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class MemberTransferService {
    static final List<String> FIELDS = List.of("first_name", "last_name", "email", "phone", "tax_code", "birth_date", "birth_place", "gender", "address", "city", "zip_code", "membership_card_number", "role", "status", "join_date", "expiration_date", "notes");
    private final UserRepository users;
    private final UserAssociationRepository memberships;
    private final AssociationRepository associations;
    private final ObjectMapper mapper;
    private final Messages messages;
    public MemberTransferService(UserRepository users, UserAssociationRepository memberships, AssociationRepository associations, ObjectMapper mapper, Messages messages) {
        this.users=users; this.memberships=memberships; this.associations=associations; this.mapper=mapper; this.messages=messages;
    }
    public List<Map<String,String>> example() {
        Map<String,String> row = new LinkedHashMap<>();
        FIELDS.forEach(key -> row.put(key,""));
        row.put("first_name","Mario"); row.put("last_name","Rossi"); row.put("email","mario@example.invalid");
        row.put("phone","+390000000000"); row.put("birth_date","1990-01-01"); row.put("gender","M");
        row.put("role","MEMBER"); row.put("status","ACTIVE"); row.put("join_date",LocalDate.now().toString());
        row.put("notes",messages.get("transfer.exampleNote"));
        return List.of(row);
    }
    @Transactional(readOnly=true)
    public List<Map<String,String>> exportRows(Long associationId) {
        return memberships.findByAssociationId(associationId).stream().map(m -> {
            var u=m.getUser(); Map<String,String> r=new LinkedHashMap<>();
            Object[] values={u.getFirstName(),u.getLastName(),u.getEmail(),u.getPhone(),u.getTaxCode(),u.getBirthDate(),u.getBirthPlace(),u.getGender(),u.getAddress(),u.getCity(),u.getZipCode(),m.getMembershipCardNumber(),m.getRole(),m.getStatus(),m.getJoinDate(),m.getExpirationDate(),m.getNotes()};
            for(int i=0;i<FIELDS.size();i++) r.put(FIELDS.get(i),Objects.toString(values[i],""));
            return r;
        }).toList();
    }
    public String serialize(List<Map<String,String>> rows,String format) throws IOException {
        if ("json".equals(format)) return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(Map.of("formatVersion",1,"entity","members","rows",rows));
        if (!"csv".equals(format)) throw new LocalizedException("transfer.unsupportedFormat");
        StringWriter out=new StringWriter();
        try(CSVWriter writer=new CSVWriter(out,';',CSVWriter.DEFAULT_QUOTE_CHARACTER,CSVWriter.DEFAULT_ESCAPE_CHARACTER,"\r\n")) {
            writer.writeNext(FIELDS.toArray(String[]::new));
            for(var row:rows) writer.writeNext(FIELDS.stream().map(k -> spreadsheetSafe(row.getOrDefault(k,""))).toArray(String[]::new));
        }
        return "\uFEFF"+out;
    }
    private static String spreadsheetSafe(String value) {
        return value.matches("(?s)^[\\s]*[=+@-].*") ? "'"+value : value;
    }
    public List<Map<String,String>> parse(MultipartFile file) throws Exception {
        if(file.isEmpty() || file.getSize()>5*1024*1024) throw new LocalizedException("transfer.fileSize");
        String text=new String(file.getBytes(),StandardCharsets.UTF_8).replaceFirst("^\\uFEFF","");
        List<Map<String,String>> rows=new ArrayList<>();
        if(Objects.toString(file.getOriginalFilename(),"").toLowerCase().endsWith(".json")) {
            var root=mapper.readTree(text);
            if(root.path("formatVersion").asInt()!=1 || !"members".equals(root.path("entity").asText()) || !root.path("rows").isArray()) throw new LocalizedException("transfer.invalidJson");
            for(var node:root.path("rows")) {
                if(!node.isObject()) throw new LocalizedException("transfer.rowNotObject");
                Map<String,String> row=new LinkedHashMap<>();
                for(String field:FIELDS) {
                    var value=node.get(field);
                    if(value!=null && !value.isNull() && !value.isTextual()) throw new LocalizedException("transfer.fieldNotText",field);
                    row.put(field,value==null || value.isNull()?"":value.asText());
                }
                rows.add(row);
            }
        } else {
            String headerLine=text.lines().findFirst().orElse("");
            char separator=headerLine.contains(";")?';':',';
            try(CSVReader reader=new CSVReaderBuilder(new StringReader(text)).withCSVParser(new CSVParserBuilder().withSeparator(separator).build()).build()) {
                String[] header=reader.readNext();
                if(header==null) throw new LocalizedException("transfer.missingHeader");
                List<String> columns=Arrays.stream(header).map(s -> alias(s.trim().toLowerCase())).toList();
                if(!columns.containsAll(List.of("first_name","last_name"))) throw new LocalizedException("transfer.requiredHeaders");
                String[] values;
                while((values=reader.readNext())!=null) {
                    if(Arrays.stream(values).allMatch(String::isBlank)) continue;
                    if(values.length!=columns.size()) throw new LocalizedException("transfer.columnCount",rows.size()+2);
                    Map<String,String> row=new LinkedHashMap<>();
                    for(int i=0;i<values.length;i++) row.put(columns.get(i),values[i].replaceFirst("^'(?=\\s*[=+@-])",""));
                    rows.add(row);
                }
            }
        }
        if(rows.isEmpty() || rows.size()>5000) throw new LocalizedException("transfer.rowLimit");
        return rows;
    }
    private static String alias(String key) {
        return switch(key) {case "nome" -> "first_name"; case "cognome" -> "last_name"; case "codice_fiscale","fiscal_code" -> "tax_code"; case "telefono" -> "phone"; case "note" -> "notes"; default -> key;};
    }
    private static String value(Map<String,String> row,String key) { String v=row.get(key);return v==null || v.isBlank()?null:v.trim(); }
    private static LocalDate date(Map<String,String> row,String key) {
        var v=value(row,key);
        try {return v==null?null:LocalDate.parse(v);} catch(DateTimeParseException e) {throw new LocalizedException("transfer.invalidDate",key);}
    }
    private User match(Map<String,String> row) {
        var tax=value(row,"tax_code"); var email=value(row,"email");
        var byTax=tax==null?Optional.<User>empty():users.findByTaxCode(tax);
        var byEmail=email==null?Optional.<User>empty():users.findByEmailIgnoreCase(email);
        if(byTax.isPresent() && byEmail.isPresent() && !byTax.get().getId().equals(byEmail.get().getId())) throw new LocalizedException("transfer.identityConflict");
        var found=byTax.or(() -> byEmail).orElse(null);
        if(found!=null && tax!=null && found.getTaxCode()!=null && !tax.equalsIgnoreCase(found.getTaxCode())) throw new LocalizedException("transfer.taxCodeMismatch");
        return found;
    }
    @Transactional
    public Map<String,Object> importRows(Long associationId,List<Map<String,String>> rows,boolean preview) {
        var association=associations.findById(associationId).orElseThrow(() -> new LocalizedException("transfer.associationMissing"));
        List<String> errors=new ArrayList<>();
        Set<String> identities=new HashSet<>(); int skipped=0; List<Map<String,String>> accepted=new ArrayList<>();
        for(int i=0;i<rows.size();i++) {
            var r=rows.get(i);
            try {
                if(value(r,"first_name")==null || value(r,"last_name")==null) throw new LocalizedException("transfer.nameRequired");
                if(value(r,"email")==null && value(r,"tax_code")==null) throw new LocalizedException("transfer.identityRequired");
                if(value(r,"email")!=null && !value(r,"email").matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")) throw new LocalizedException("transfer.invalidEmail");
                date(r,"birth_date");date(r,"join_date");date(r,"expiration_date");
                if(value(r,"status")!=null && !Set.of("ACTIVE","EXPIRED","SUSPENDED","RESIGNED").contains(value(r,"status"))) throw new LocalizedException("transfer.invalidStatus");
                if(value(r,"role")!=null && !Arrays.stream(value(r,"role").split(",")).allMatch(Set.of("MEMBER","FOUNDER","HONORARY","PRESIDENT","VICE_PRESIDENT","SECRETARY","TREASURER","COUNCILLOR","ADMIN")::contains)) throw new LocalizedException("transfer.invalidRole");
                var found=match(r);
                String tax=value(r,"tax_code"), email=value(r,"email");
                boolean duplicate=(tax!=null && identities.contains("t:"+tax.toLowerCase())) || (email!=null && identities.contains("e:"+email.toLowerCase()));
                if(tax!=null) identities.add("t:"+tax.toLowerCase()); if(email!=null) identities.add("e:"+email.toLowerCase());
                if(duplicate || (found!=null && memberships.findByUserIdAndAssociationId(found.getId(),associationId).isPresent())) skipped++;
                else accepted.add(r);
            } catch(Exception e) { errors.add(messages.get("import.row",i+2,messages.describe(e))); }
        }
        if(!preview && !errors.isEmpty()) throw new IllegalArgumentException(String.join("\n",errors));
        if(!preview) for(var r:accepted) {
            User u=match(r);
            if(u==null) {
                u=new User();u.setFirstName(value(r,"first_name"));u.setLastName(value(r,"last_name"));u.setEmail(value(r,"email"));u.setTaxCode(value(r,"tax_code"));u.setPhone(value(r,"phone"));u.setBirthDate(date(r,"birth_date"));u.setBirthPlace(value(r,"birth_place"));u.setGender(value(r,"gender"));u.setAddress(value(r,"address"));u.setCity(value(r,"city"));u.setZipCode(value(r,"zip_code"));u=users.save(u);
            }
            var m=new UserAssociation();m.setUser(u);m.setAssociation(association);m.setMembershipCardNumber(value(r,"membership_card_number"));m.setRole(Objects.requireNonNullElse(value(r,"role"),"MEMBER"));m.setStatus(Objects.requireNonNullElse(value(r,"status"),"ACTIVE"));m.setJoinDate(date(r,"join_date"));m.setExpirationDate(date(r,"expiration_date"));m.setNotes(value(r,"notes"));memberships.save(m);
        }
        return Map.of("totalRows",rows.size(),"importedRows",accepted.size(),"skippedRows",skipped,"errorRows",errors.size(),"errorsDetail",String.join("\n",errors),"status",preview?"PREVIEW":"COMPLETED");
    }
}
