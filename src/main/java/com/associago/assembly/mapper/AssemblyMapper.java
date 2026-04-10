package com.associago.assembly.mapper;

import com.associago.assembly.Assembly;
import com.associago.assembly.dto.AssemblyCreateDTO;
import com.associago.assembly.dto.AssemblyDTO;

public final class AssemblyMapper {

    private AssemblyMapper() {}

    public static AssemblyDTO toDTO(Assembly assembly) {
        return new AssemblyDTO(
                assembly.getId(),
                assembly.getAssociationId(),
                assembly.getTitle(),
                assembly.getDescription(),
                assembly.getDate(),
                assembly.getStartTime(),
                assembly.getEndTime(),
                assembly.getLocation(),
                assembly.getType(),
                assembly.getStatus(),
                assembly.getPresident(),
                assembly.getSecretary(),
                assembly.getFirstCallQuorum(),
                assembly.getSecondCallQuorum(),
                assembly.isQuorumReached(),
                assembly.getMinutesPath(),
                assembly.getNotes(),
                assembly.getCreatedAt(),
                assembly.getUpdatedAt()
        );
    }

    public static Assembly toEntity(AssemblyCreateDTO dto) {
        Assembly assembly = new Assembly();
        assembly.setAssociationId(dto.associationId());
        assembly.setTitle(dto.title());
        assembly.setDescription(dto.description());
        assembly.setDate(dto.date());
        assembly.setStartTime(dto.startTime());
        assembly.setEndTime(dto.endTime());
        assembly.setLocation(dto.location());
        assembly.setType(dto.type());
        assembly.setStatus(dto.status());
        assembly.setPresident(dto.president());
        assembly.setSecretary(dto.secretary());
        assembly.setFirstCallQuorum(dto.firstCallQuorum());
        assembly.setSecondCallQuorum(dto.secondCallQuorum());
        assembly.setNotes(dto.notes());
        return assembly;
    }

    public static void updateEntity(Assembly assembly, AssemblyCreateDTO dto) {
        assembly.setAssociationId(dto.associationId());
        assembly.setTitle(dto.title());
        assembly.setDescription(dto.description());
        assembly.setDate(dto.date());
        assembly.setStartTime(dto.startTime());
        assembly.setEndTime(dto.endTime());
        assembly.setLocation(dto.location());
        assembly.setType(dto.type());
        assembly.setStatus(dto.status());
        assembly.setPresident(dto.president());
        assembly.setSecretary(dto.secretary());
        assembly.setFirstCallQuorum(dto.firstCallQuorum());
        assembly.setSecondCallQuorum(dto.secondCallQuorum());
        assembly.setNotes(dto.notes());
    }
}
