package com.associago.assembly;

import com.associago.assembly.repository.*;
import com.associago.member.repository.MemberRepository;
import com.associago.stats.dto.AssemblyWithDetailsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AssemblyService {

    private final AssemblyRepository assemblyRepository;
    private final AssemblyParticipantRepository participantRepository;
    private final AssemblyMotionRepository motionRepository;
    private final AssemblyDocumentRepository documentRepository;
    private final AssemblyVoteRepository voteRepository;
    private final MemberRepository memberRepository;

    @Autowired
    public AssemblyService(AssemblyRepository assemblyRepository,
                           AssemblyParticipantRepository participantRepository,
                           AssemblyMotionRepository motionRepository,
                           AssemblyDocumentRepository documentRepository,
                           AssemblyVoteRepository voteRepository,
                           MemberRepository memberRepository) {
        this.assemblyRepository = assemblyRepository;
        this.participantRepository = participantRepository;
        this.motionRepository = motionRepository;
        this.documentRepository = documentRepository;
        this.voteRepository = voteRepository;
        this.memberRepository = memberRepository;
    }

    // --- CRUD ---

    public Iterable<Assembly> getAllAssemblies() {
        return assemblyRepository.findAll();
    }

    public Optional<Assembly> getAssemblyById(Long id) {
        return assemblyRepository.findById(id);
    }

    @Transactional
    public Assembly createAssembly(Assembly assembly) {
        assembly.setCreatedAt(LocalDateTime.now());
        assembly.setUpdatedAt(LocalDateTime.now());
        if (assembly.getStatus() == null) assembly.setStatus("DRAFT");
        return assemblyRepository.save(assembly);
    }

    @Transactional
    public Assembly updateAssembly(Long id, Assembly assemblyDetails) {
        return assemblyRepository.findById(id).map(assembly -> {
            assembly.setTitle(assemblyDetails.getTitle());
            assembly.setDescription(assemblyDetails.getDescription());
            assembly.setDate(assemblyDetails.getDate());
            assembly.setStartTime(assemblyDetails.getStartTime());
            assembly.setEndTime(assemblyDetails.getEndTime());
            assembly.setLocation(assemblyDetails.getLocation());
            assembly.setType(assemblyDetails.getType());
            assembly.setStatus(assemblyDetails.getStatus());
            assembly.setPresident(assemblyDetails.getPresident());
            assembly.setSecretary(assemblyDetails.getSecretary());
            assembly.setFirstCallQuorum(assemblyDetails.getFirstCallQuorum());
            assembly.setSecondCallQuorum(assemblyDetails.getSecondCallQuorum());
            assembly.setQuorumReached(assemblyDetails.isQuorumReached());
            assembly.setMinutesPath(assemblyDetails.getMinutesPath());
            assembly.setNotes(assemblyDetails.getNotes());
            assembly.setUpdatedAt(LocalDateTime.now());
            return assemblyRepository.save(assembly);
        }).orElseThrow(() -> new RuntimeException("Assembly not found"));
    }

    @Transactional
    public void deleteAssembly(Long id) {
        assemblyRepository.deleteById(id);
    }

    // --- Participants ---

    public List<AssemblyParticipant> getParticipants(Long assemblyId) {
        return participantRepository.findByAssemblyId(assemblyId);
    }

    @Transactional
    public AssemblyParticipant addParticipant(AssemblyParticipant participant) {
        return participantRepository.save(participant);
    }

    @Transactional
    public void removeParticipant(Long participantId) {
        participantRepository.deleteById(participantId);
    }

    // --- Motions ---

    public List<AssemblyMotion> getMotions(Long assemblyId) {
        return motionRepository.findByAssemblyId(assemblyId);
    }

    @Transactional
    public AssemblyMotion addMotion(AssemblyMotion motion) {
        return motionRepository.save(motion);
    }

    @Transactional
    public void deleteMotion(Long motionId) {
        motionRepository.deleteById(motionId);
    }

    // --- Documents ---

    public List<AssemblyDocument> getDocuments(Long assemblyId) {
        return documentRepository.findByAssemblyId(assemblyId);
    }

    @Transactional
    public AssemblyDocument addDocument(AssemblyDocument document) {
        return documentRepository.save(document);
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        documentRepository.deleteById(documentId);
    }

    // --- Votes ---

    public List<AssemblyVote> getVotesByMotion(Long motionId) {
        return voteRepository.findByMotionId(motionId);
    }

    @Transactional
    public AssemblyVote castVote(AssemblyVote vote) {
        return voteRepository.save(vote);
    }

    // --- Advanced Reporting & Logic ---

    public AssemblyWithDetailsDTO getAssemblyWithDetails(Long assemblyId) {
        Assembly assembly = assemblyRepository.findById(assemblyId)
                .orElseThrow(() -> new RuntimeException("Assembly not found"));

        List<AssemblyParticipant> participants = participantRepository.findByAssemblyId(assemblyId);
        List<AssemblyMotion> motions = motionRepository.findByAssemblyId(assemblyId);
        List<AssemblyDocument> documents = documentRepository.findByAssemblyId(assemblyId);

        AssemblyWithDetailsDTO dto = new AssemblyWithDetailsDTO();
        dto.setAssembly(assembly);
        dto.setParticipants(participants);
        dto.setMotions(motions);
        dto.setDocuments(documents);

        // Stats
        long totalActiveMembers = memberRepository.countByMembershipStatus("ACTIVE");
        dto.setTotalParticipants((int) totalActiveMembers);
        
        int present = (int) participants.stream()
                .filter(p -> "PRESENT".equals(p.getParticipationType()))
                .count();
        dto.setPresentParticipants(present);
        
        int proxy = (int) participants.stream()
                .filter(p -> "PROXY".equals(p.getParticipationType()))
                .count();
        dto.setProxyParticipants(proxy);

        int totalVotes = present + proxy;

        if (totalActiveMembers > 0) {
            dto.setParticipationPercentage((double) totalVotes / totalActiveMembers * 100);
        } else {
            dto.setParticipationPercentage(0.0);
        }

        // Quorum Check Logic
        boolean quorumReached = false;
        // Assuming firstCallQuorum and secondCallQuorum are percentages (e.g., 50.0 for 50%)
        // If they are null, we assume standard defaults (50% + 1 for first call, any for second)
        
        double requiredQuorum = 0.0;
        
        // Determine if we are in first or second call based on assembly type or status
        // For simplicity, we check against both thresholds if provided
        
        if (assembly.getFirstCallQuorum() != null) {
             if (dto.getParticipationPercentage() >= assembly.getFirstCallQuorum()) {
                 quorumReached = true;
             }
        }
        
        // If not reached in first call (or not specified), check second call logic
        // Usually second call has lower quorum
        if (!quorumReached && assembly.getSecondCallQuorum() != null) {
            if (dto.getParticipationPercentage() >= assembly.getSecondCallQuorum()) {
                quorumReached = true;
            }
        }

        dto.setQuorumReached(quorumReached);
        
        // Update assembly status if needed
        if (assembly.isQuorumReached() != quorumReached) {
            assembly.setQuorumReached(quorumReached);
            assemblyRepository.save(assembly);
        }

        return dto;
    }
}
