package com.associago.transfer;

import com.associago.association.Association;
import com.associago.association.repository.AssociationRepository;
import com.associago.membership.repository.UserAssociationRepository;
import com.associago.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class MemberTransferTests {
    final UserRepository users=mock(UserRepository.class);
    final UserAssociationRepository memberships=mock(UserAssociationRepository.class);
    final AssociationRepository associations=mock(AssociationRepository.class);
    final MemberTransferService service=new MemberTransferService(users,memberships,associations,new ObjectMapper(),com.associago.shared.i18n.Messages.standalone());
    @Test void csvRoundTripPreservesQuotesUnicodeNewlinesAndNeutralizesFormulas() throws Exception {
        var row=new LinkedHashMap<>(service.example().getFirst());
        row.put("first_name","Èlisa");row.put("notes","=1+1\n\"test\"; testo");
        String csv=service.serialize(List.of(row),"csv");
        assertThat(csv).contains("'=1+1");
        var file=new MockMultipartFile("file","data.csv","text/csv",csv.getBytes(StandardCharsets.UTF_8));
        assertThat(service.parse(file)).containsExactly(row);
    }
    @Test void jsonRoundTripAndSchemaValidation() throws Exception {
        var rows=service.example();
        var file=new MockMultipartFile("file","data.json","application/json",service.serialize(rows,"json").getBytes(StandardCharsets.UTF_8));
        assertThat(service.parse(file)).isEqualTo(rows);
        assertThatThrownBy(()->service.parse(new MockMultipartFile("file","bad.json","application/json","[]".getBytes()))).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void invalidBatchNeverWritesAnyRows() {
        when(associations.findById(1L)).thenReturn(Optional.of(new Association()));
        var invalid=new LinkedHashMap<>(service.example().getFirst());invalid.put("first_name","");
        assertThatThrownBy(()->service.importRows(1L,List.of(service.example().getFirst(),invalid),false)).isInstanceOf(IllegalArgumentException.class);
        verify(users,never()).save(any());verify(memberships,never()).save(any());
    }
    @Test void previewSkipsDuplicateIdentitiesWithoutWriting() {
        when(associations.findById(1L)).thenReturn(Optional.of(new Association()));
        var result=service.importRows(1L,List.of(service.example().getFirst(),service.example().getFirst()),true);
        assertThat(result.get("importedRows")).isEqualTo(1);assertThat(result.get("skippedRows")).isEqualTo(1);
        verify(users,never()).save(any());verify(memberships,never()).save(any());
    }
}
