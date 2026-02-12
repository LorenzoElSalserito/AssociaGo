package com.associago.assembly.repository;

import com.associago.assembly.Assembly;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssemblyRepository extends CrudRepository<Assembly, Long> {
    List<Assembly> findByAssociationId(Long associationId);
}
