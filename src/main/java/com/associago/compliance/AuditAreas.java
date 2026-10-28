package com.associago.compliance;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** Which entities are audited, the functional area they belong to, and which properties never reach the log. */
public final class AuditAreas {

    public static final String DATABASE_CONFIG = "DatabaseConfig";

    private static final Map<String, List<String>> AREAS = new LinkedHashMap<>();

    static {
        AREAS.put("MEMBERS", List.of("User", "Member", "UserAssociation", "MedicalCertificate", "MemberConsent"));
        AREAS.put("FINANCE", List.of("Transaction", "Invoice", "PaymentMethod", "Account", "JournalEntry", "CashRegister"));
        AREAS.put("ACTIVITIES", List.of("Activity", "ActivityParticipant", "ActivitySchedule", "ActivityCost", "ActivityInstructor"));
        AREAS.put("EVENTS", List.of("Event", "EventParticipant"));
        AREAS.put("ASSEMBLIES", List.of("Assembly", "AssemblyMotion", "AssemblyParticipant", "AssemblyDocument", "AssemblyVote"));
        AREAS.put("INVENTORY", List.of("InventoryItem", "InventoryLoan"));
        AREAS.put("VOLUNTEERS", List.of("Volunteer", "VolunteerShift", "VolunteerExpense"));
        AREAS.put("COUPONS", List.of("Coupon"));
        AREAS.put("BUDGET", List.of("Budget", "BudgetLine"));
        AREAS.put("BALANCE", List.of("AnnualBalance", "AnnualBalanceLine"));
        AREAS.put("CERTIFICATES", List.of("CertificateTemplate", "IssuedCertificate"));
        AREAS.put("COMMUNICATIONS", List.of("Communication", "CommunicationTemplate"));
        AREAS.put("ASSOCIATION", List.of("Association", "AssociationLocation", "AssociationDocument", "AssociationDeadline"));
        AREAS.put("SETTINGS", List.of(DATABASE_CONFIG));
        AREAS.put("SIGNATURES", List.of("InstitutionalSignature"));
    }

    private static final Map<String, String> AREA_BY_TYPE = new LinkedHashMap<>();

    static {
        AREAS.forEach((area, types) -> types.forEach(type -> AREA_BY_TYPE.put(type, area)));
    }

    /** Bookkeeping columns: a change limited to these is not worth an entry. */
    private static final Set<String> TECHNICAL = Set.of("createdat", "updatedat", "version", "lastloginat", "lastlogin");

    private static final Pattern SENSITIVE = Pattern.compile(
            "password|passwd|pwd|token|secret|hash|credential|salt|otp|apikey|logo|image|blob|signaturedata");

    private AuditAreas() {
    }

    public static String areaOf(String entityType) {
        return entityType == null ? null : AREA_BY_TYPE.get(entityType);
    }

    public static List<String> typesOf(String area) {
        return area == null ? List.of() : AREAS.getOrDefault(area.toUpperCase(Locale.ROOT), List.of());
    }

    public static Map<String, List<String>> areas() {
        return Collections.unmodifiableMap(AREAS);
    }

    public static boolean isTechnical(String property) {
        return TECHNICAL.contains(property.toLowerCase(Locale.ROOT));
    }

    /** Credentials, hashes, tokens, connection settings and binary payloads (logos, signatures). */
    public static boolean isSensitive(String property, Class<?> type) {
        if (type == byte[].class || type == Byte[].class) return true;
        String p = property.toLowerCase(Locale.ROOT);
        return SENSITIVE.matcher(p).find()
                || (property.startsWith("db") && property.length() > 2 && Character.isUpperCase(property.charAt(2)))
                || p.startsWith("remote") || p.startsWith("smtp");
    }
}
