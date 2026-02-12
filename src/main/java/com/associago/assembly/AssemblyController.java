package com.associago.assembly;

import com.associago.stats.dto.AssemblyWithDetailsDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assemblies")
public class AssemblyController {

    private final AssemblyService assemblyService;

    public AssemblyController(AssemblyService assemblyService) {
        this.assemblyService = assemblyService;
    }

    // --- CRUD ---

    @GetMapping
    public ResponseEntity<Iterable<Assembly>> getAllAssemblies() {
        return ResponseEntity.ok(assemblyService.getAllAssemblies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assembly> getAssemblyById(@PathVariable Long id) {
        return assemblyService.getAssemblyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Assembly> createAssembly(@RequestBody Assembly assembly) {
        return ResponseEntity.ok(assemblyService.createAssembly(assembly));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assembly> updateAssembly(@PathVariable Long id, @RequestBody Assembly assembly) {
        try {
            return ResponseEntity.ok(assemblyService.updateAssembly(id, assembly));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssembly(@PathVariable Long id) {
        assemblyService.deleteAssembly(id);
        return ResponseEntity.noContent().build();
    }

    // --- Participants ---

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<AssemblyParticipant>> getParticipants(@PathVariable Long id) {
        return ResponseEntity.ok(assemblyService.getParticipants(id));
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<AssemblyParticipant> addParticipant(@PathVariable Long id, @RequestBody AssemblyParticipant participant) {
        participant.setAssemblyId(id);
        return ResponseEntity.ok(assemblyService.addParticipant(participant));
    }

    @DeleteMapping("/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable Long participantId) {
        assemblyService.removeParticipant(participantId);
        return ResponseEntity.noContent().build();
    }

    // --- Motions ---

    @GetMapping("/{id}/motions")
    public ResponseEntity<List<AssemblyMotion>> getMotions(@PathVariable Long id) {
        return ResponseEntity.ok(assemblyService.getMotions(id));
    }

    @PostMapping("/{id}/motions")
    public ResponseEntity<AssemblyMotion> addMotion(@PathVariable Long id, @RequestBody AssemblyMotion motion) {
        motion.setAssemblyId(id);
        return ResponseEntity.ok(assemblyService.addMotion(motion));
    }

    @DeleteMapping("/motions/{motionId}")
    public ResponseEntity<Void> deleteMotion(@PathVariable Long motionId) {
        assemblyService.deleteMotion(motionId);
        return ResponseEntity.noContent().build();
    }

    // --- Documents ---

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<AssemblyDocument>> getDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(assemblyService.getDocuments(id));
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<AssemblyDocument> addDocument(@PathVariable Long id, @RequestBody AssemblyDocument document) {
        document.setAssemblyId(id);
        return ResponseEntity.ok(assemblyService.addDocument(document));
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long documentId) {
        assemblyService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }

    // --- Votes ---

    @GetMapping("/motions/{motionId}/votes")
    public ResponseEntity<List<AssemblyVote>> getVotes(@PathVariable Long motionId) {
        return ResponseEntity.ok(assemblyService.getVotesByMotion(motionId));
    }

    @PostMapping("/motions/{motionId}/votes")
    public ResponseEntity<AssemblyVote> castVote(@PathVariable Long motionId, @RequestBody AssemblyVote vote) {
        vote.setMotionId(motionId);
        return ResponseEntity.ok(assemblyService.castVote(vote));
    }

    // --- Details & Stats ---

    @GetMapping("/{id}/details")
    public ResponseEntity<AssemblyWithDetailsDTO> getAssemblyDetails(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(assemblyService.getAssemblyWithDetails(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
