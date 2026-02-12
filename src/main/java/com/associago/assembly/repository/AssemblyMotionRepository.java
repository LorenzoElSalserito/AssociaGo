package com.associago.assembly.repository;

import com.associago.assembly.AssemblyMotion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssemblyMotionRepository extends CrudRepository<AssemblyMotion, Long> {
    List<AssemblyMotion> findByAssemblyId(Long assemblyId);
}
