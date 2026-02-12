package com.associago.membership;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/memberships")
public class MembershipController {

    private final MembershipService membershipService;

    @Autowired
    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping("/association/{associationId}")
    public List<UserAssociation> getMembershipsByAssociation(@PathVariable Long associationId) {
        return membershipService.findByAssociationId(associationId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserAssociation> getMembershipById(@PathVariable Long id) {
        return membershipService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserAssociation createMembership(@RequestBody UserAssociation membership) {
        return membershipService.save(membership);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserAssociation> updateMembership(@PathVariable Long id, @RequestBody UserAssociation details) {
        return membershipService.findById(id)
                .map(existing -> {
                    existing.setRole(details.getRole());
                    existing.setStatus(details.getStatus());
                    existing.setMembershipCardNumber(details.getMembershipCardNumber());
                    existing.setExpirationDate(details.getExpirationDate());
                    existing.setLastRenewalDate(details.getLastRenewalDate());
                    existing.setNotes(details.getNotes());
                    existing.setBoardMember(details.isBoardMember());
                    return ResponseEntity.ok(membershipService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMembership(@PathVariable Long id) {
        if (membershipService.findById(id).isPresent()) {
            membershipService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
