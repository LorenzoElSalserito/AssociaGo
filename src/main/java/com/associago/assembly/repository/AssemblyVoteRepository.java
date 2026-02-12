package com.associago.assembly.repository;

import com.associago.assembly.AssemblyVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssemblyVoteRepository extends JpaRepository<AssemblyVote, Long> {
    List<AssemblyVote> findByAssemblyId(Long assemblyId);
    List<AssemblyVote> findByMotionId(Long motionId);
}
