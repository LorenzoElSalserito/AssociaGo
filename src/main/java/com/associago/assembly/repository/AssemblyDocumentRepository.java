package com.associago.assembly.repository;

import com.associago.assembly.AssemblyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssemblyDocumentRepository extends JpaRepository<AssemblyDocument, Long> {
    List<AssemblyDocument> findByAssemblyId(Long assemblyId);
}
