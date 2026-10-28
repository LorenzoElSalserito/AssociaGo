package com.associago.assembly;

import com.associago.association.Association;
import com.associago.association.AssociationService;
import java.io.File;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class AssemblyMotionVotingTests {

    static {
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(System.getProperty("java.io.tmpdir"), "associago-test-" + UUID.randomUUID());
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Autowired private AssemblyService assemblyService;
    @Autowired private AssociationService associationService;

    private Assembly assembly;

    @BeforeEach
    void setUp() {
        String marker = UUID.randomUUID().toString().substring(0, 8);
        Association association = new Association();
        association.setName("Voto " + marker);
        association.setSlug("voto-" + marker);
        association.setEmail("voto-" + marker + "@example.invalid");
        association.setPassword("vote-password");
        association.setType("APS");
        association = associationService.create(association);
        Assembly draft = new Assembly();
        draft.setAssociationId(association.getId());
        draft.setTitle("Assemblea " + marker);
        draft.setDate(LocalDateTime.now());
        draft.setType("ORDINARY");
        assembly = assemblyService.createAssembly(draft);
        // 6 present + 4 proxies = 10 voters; absentees do not vote.
        for (int i = 0; i < 6; i++) participant("PRESENT");
        for (int i = 0; i < 4; i++) participant("PROXY");
        participant("ABSENT");
    }

    @Test
    void simpleMajorityNeedsMoreFavourThanAgainst() {
        AssemblyMotion motion = motion("SIMPLE");
        assertThat(motion.getOutcome()).isEqualTo("PENDING");
        assertThat(assemblyService.recordVotes(motion.getId(), 4, 3, 3).getOutcome()).isEqualTo("APPROVED");
        AssemblyMotion tie = assemblyService.recordVotes(motion.getId(), 3, 3, 4);
        assertThat(tie.getOutcome()).isEqualTo("REJECTED");
        assertThat(tie.isApproved()).isFalse();
        assertThat(tie.getValidVotes()).isEqualTo(10);
    }

    @Test
    void qualifiedMajorityNeedsTwoThirdsOfVotesCast() {
        AssemblyMotion motion = motion("QUALIFIED");
        AssemblyMotion approved = assemblyService.recordVotes(motion.getId(), 6, 2, 1);
        assertThat(approved.getOutcome()).isEqualTo("APPROVED");
        assertThat(approved.isApproved()).isTrue();
        // 6 of 10 is below two thirds: abstentions count as votes cast.
        assertThat(assemblyService.recordVotes(motion.getId(), 6, 1, 3).getOutcome()).isEqualTo("REJECTED");
    }

    @Test
    void unanimityFailsWithASingleAgainst() {
        AssemblyMotion motion = motion("UNANIMITY");
        assertThat(assemblyService.recordVotes(motion.getId(), 8, 0, 2).getOutcome()).isEqualTo("APPROVED");
        assertThat(assemblyService.recordVotes(motion.getId(), 9, 1, 0).getOutcome()).isEqualTo("REJECTED");
        assertThat(assemblyService.recordVotes(motion.getId(), 0, 0, 5).getOutcome()).isEqualTo("REJECTED");
    }

    @Test
    void consultativeVoteIsOnlyNoted() {
        AssemblyMotion noted = assemblyService.recordVotes(motion("CONSULTATIVE").getId(), 9, 1, 0);
        assertThat(noted.getOutcome()).isEqualTo("NOTED");
        assertThat(noted.isApproved()).isFalse();
    }

    @Test
    void invalidCountsAreRefused() {
        Long id = motion("SIMPLE").getId();
        assertThatThrownBy(() -> assemblyService.recordVotes(id, -1, 0, 0)).hasMessage("MOTION_VOTES_NEGATIVE");
        assertThatThrownBy(() -> assemblyService.recordVotes(id, 6, 4, 1)).hasMessage("MOTION_VOTES_EXCEED_VOTERS");
        assertThatThrownBy(() -> assemblyService.recordVotes(id, null, 0, 0)).hasMessage("MOTION_VOTES_REQUIRED");
        assertThat(assemblyService.getMotions(assembly.getId()).get(0).getOutcome()).isEqualTo("PENDING");
    }

    @Test
    void updatingMotionRecomputesRecordedOutcome() {
        AssemblyMotion motion = motion("SIMPLE");
        assemblyService.recordVotes(motion.getId(), 6, 3, 1);
        AssemblyMotion changes = new AssemblyMotion();
        changes.setTitle("Bilancio rivisto");
        changes.setDescription("Nuova descrizione");
        changes.setVotingType("QUALIFIED");
        changes.setOrderNumber(3);
        changes.setPlanned(false);
        changes.setNotes("nota");
        AssemblyMotion updated = assemblyService.updateMotion(motion.getId(), changes);
        assertThat(updated.getTitle()).isEqualTo("Bilancio rivisto");
        assertThat(updated.getOrderNumber()).isEqualTo(3);
        assertThat(updated.isPlanned()).isFalse();
        assertThat(updated.getOutcome()).isEqualTo("REJECTED");
        assertThat(assemblyService.clearVotes(motion.getId()).getOutcome()).isEqualTo("PENDING");
    }

    @Test
    void updatingParticipantChangesTypeRoleAndProxy() {
        AssemblyParticipant p = participant("PRESENT");
        AssemblyParticipant changes = new AssemblyParticipant();
        changes.setParticipationType("PROXY");
        changes.setRole("SECRETARY");
        changes.setProxyReceiverId(77L);
        AssemblyParticipant updated = assemblyService.updateParticipant(p.getId(), changes);
        assertThat(updated.getParticipationType()).isEqualTo("PROXY");
        assertThat(updated.getRole()).isEqualTo("SECRETARY");
        assertThat(updated.getProxyReceiverId()).isEqualTo(77L);
        assertThat(updated.getUserAssociationId()).isEqualTo(p.getUserAssociationId());

        changes.setParticipationType("PRESENT");
        assertThat(assemblyService.updateParticipant(p.getId(), changes).getProxyReceiverId()).isNull();
        changes.setParticipationType("BOGUS");
        assertThatThrownBy(() -> assemblyService.updateParticipant(p.getId(), changes)).hasMessage("PARTICIPANT_INVALID_TYPE");
    }

    private AssemblyMotion motion(String votingType) {
        AssemblyMotion motion = new AssemblyMotion();
        motion.setAssemblyId(assembly.getId());
        motion.setTitle("Mozione " + votingType);
        motion.setVotingType(votingType);
        return assemblyService.addMotion(motion);
    }

    private AssemblyParticipant participant(String type) {
        AssemblyParticipant p = new AssemblyParticipant();
        p.setAssemblyId(assembly.getId());
        p.setUserAssociationId(1000L + (long) (Math.random() * 100000));
        p.setParticipationType(type);
        p.setRole("MEMBER");
        return assemblyService.addParticipant(p);
    }
}
