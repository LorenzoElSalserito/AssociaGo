package com.associago.assembly;

import com.associago.assembly.repository.*;
import com.associago.member.repository.MemberRepository;
import com.associago.stats.dto.AssemblyWithDetailsDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class AssemblyService {

    private static final Set<String> PARTICIPATION_TYPES = Set.of("PRESENT", "PROXY", "ABSENT");

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
    public AssemblyParticipant updateParticipant(Long participantId, AssemblyParticipant details) {
        AssemblyParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new EntityNotFoundException("PARTICIPANT_NOT_FOUND"));
        String type = details.getParticipationType();
        if (!PARTICIPATION_TYPES.contains(type)) throw new IllegalArgumentException("PARTICIPANT_INVALID_TYPE");
        if (details.getUserAssociationId() != null) participant.setUserAssociationId(details.getUserAssociationId());
        participant.setParticipationType(type);
        participant.setProxyReceiverId("PROXY".equals(type) ? details.getProxyReceiverId() : null);
        participant.setRole(details.getRole());
        participant.setNotes(details.getNotes());
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
    public AssemblyMotion updateMotion(Long motionId, AssemblyMotion details) {
        AssemblyMotion motion = findMotion(motionId);
        if (details.getTitle() == null || details.getTitle().isBlank()) throw new IllegalArgumentException("MOTION_TITLE_REQUIRED");
        motion.setTitle(details.getTitle());
        motion.setDescription(details.getDescription());
        motion.setVotingType(details.getVotingType());
        motion.setOrderNumber(details.getOrderNumber());
        motion.setPlanned(details.isPlanned());
        motion.setDecisionSummary(details.getDecisionSummary());
        motion.setNotes(details.getNotes());
        if (motion.isVoteRecorded()) applyOutcome(motion);
        motion.setUpdatedAt(LocalDateTime.now());
        return motionRepository.save(motion);
    }

    /** Records the vote counts of a motion; the outcome is always computed here, never trusted from the client. */
    @Transactional
    public AssemblyMotion recordVotes(Long motionId, Integer favor, Integer against, Integer abstain) {
        AssemblyMotion motion = findMotion(motionId);
        if (favor == null || against == null || abstain == null) throw new IllegalArgumentException("MOTION_VOTES_REQUIRED");
        if (favor < 0 || against < 0 || abstain < 0) throw new IllegalArgumentException("MOTION_VOTES_NEGATIVE");
        long voters = participantRepository.findByAssemblyId(motion.getAssemblyId()).stream()
                .filter(p -> "PRESENT".equals(p.getParticipationType()) || "PROXY".equals(p.getParticipationType()))
                .count();
        if (voters == 0) throw new IllegalArgumentException("MOTION_NO_VOTERS");
        if ((long) favor + against + abstain > voters) throw new IllegalArgumentException("MOTION_VOTES_EXCEED_VOTERS");
        motion.setVotesInFavor(favor);
        motion.setVotesAgainst(against);
        motion.setVotesAbstain(abstain);
        motion.setValidVotes(favor + against + abstain);
        applyOutcome(motion);
        motion.setUpdatedAt(LocalDateTime.now());
        return motionRepository.save(motion);
    }

    @Transactional
    public AssemblyMotion clearVotes(Long motionId) {
        AssemblyMotion motion = findMotion(motionId);
        motion.setVotesInFavor(0);
        motion.setVotesAgainst(0);
        motion.setVotesAbstain(0);
        motion.setValidVotes(0);
        motion.setDecisionTaken(null);
        motion.setApproved(false);
        motion.setUpdatedAt(LocalDateTime.now());
        return motionRepository.save(motion);
    }

    private AssemblyMotion findMotion(Long motionId) {
        return motionRepository.findById(motionId)
                .orElseThrow(() -> new EntityNotFoundException("MOTION_NOT_FOUND"));
    }

    private static void applyOutcome(AssemblyMotion motion) {
        String outcome = AssemblyMotion.computeOutcome(motion.getVotingType(),
                nz(motion.getVotesInFavor()), nz(motion.getVotesAgainst()), nz(motion.getVotesAbstain()));
        motion.setDecisionTaken(outcome);
        motion.setApproved(AssemblyMotion.OUTCOME_APPROVED.equals(outcome));
    }

    private static int nz(Integer value) {
        return value == null ? 0 : value;
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
