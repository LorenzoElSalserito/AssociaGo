package com.associago.assembly.repository;

import com.associago.assembly.AssemblyParticipant;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssemblyParticipantRepository extends CrudRepository<AssemblyParticipant, Long> {
    List<AssemblyParticipant> findByAssemblyId(Long assemblyId);
    int countByAssemblyId(Long assemblyId);
}
