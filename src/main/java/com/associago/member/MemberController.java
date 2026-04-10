package com.associago.member;

import com.associago.member.dto.MemberCreateDTO;
import com.associago.member.dto.MemberDTO;
import com.associago.member.dto.MemberUpdateDTO;
import com.associago.member.mapper.MemberMapper;
import com.associago.utils.FiscalCodeUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/v1/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public ResponseEntity<List<MemberDTO>> getAllMembers() {
        List<MemberDTO> members = StreamSupport.stream(memberService.getAllMembers().spliterator(), false)
                .map(MemberMapper::toDTO)
                .toList();
        return ResponseEntity.ok(members);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberDTO> getMemberById(@PathVariable Long id) {
        return memberService.getMemberById(id)
                .map(MemberMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MemberDTO> createMember(@Valid @RequestBody MemberCreateDTO createDTO) {
        Member member = MemberMapper.toEntity(createDTO);
        Member saved = memberService.createMember(member);
        return ResponseEntity.ok(MemberMapper.toDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberDTO> updateMember(@PathVariable Long id, @Valid @RequestBody MemberUpdateDTO updateDTO) {
        return memberService.getMemberById(id)
                .map(member -> {
                    MemberMapper.updateEntity(member, updateDTO);
                    Member updated = memberService.updateMember(id, member);
                    return ResponseEntity.ok(MemberMapper.toDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }

    // --- Duplicate Detection ---

    @GetMapping("/check-duplicates")
    public ResponseEntity<List<MemberDTO>> checkDuplicates(@RequestParam(required = false) String email,
                                                            @RequestParam(required = false) String fiscalCode) {
        List<MemberDTO> duplicates = memberService.findDuplicates(email, fiscalCode).stream()
                .map(MemberMapper::toDTO)
                .toList();
        return ResponseEntity.ok(duplicates);
    }

    // --- Consent Management ---

    @GetMapping("/{id}/consents")
    public ResponseEntity<List<MemberConsent>> getConsents(@PathVariable Long id,
                                                           @RequestParam Long associationId) {
        return ResponseEntity.ok(memberService.getConsents(id, associationId));
    }

    @PostMapping("/{id}/consents")
    public ResponseEntity<MemberConsent> grantConsent(@PathVariable Long id,
                                                       @RequestParam Long associationId,
                                                       @RequestParam String consentType,
                                                       @RequestParam(required = false) String lawfulBasis) {
        return ResponseEntity.ok(memberService.grantConsent(id, associationId, consentType, lawfulBasis));
    }

    @PostMapping("/consents/{consentId}/revoke")
    public ResponseEntity<MemberConsent> revokeConsent(@PathVariable Long consentId) {
        return ResponseEntity.ok(memberService.revokeConsent(consentId));
    }

    // --- Fiscal Code ---

    @PostMapping("/calculate-fiscal-code")
    public ResponseEntity<Map<String, String>> calculateFiscalCode(@RequestBody Map<String, Object> payload) {
        try {
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String gender = (String) payload.get("gender");
            String birthPlaceCode = (String) payload.get("birthPlaceCode");
            String birthDateStr = (String) payload.get("birthDate");

            if (birthDateStr == null) throw new IllegalArgumentException("Birth date is required");
            LocalDate birthDate = LocalDate.parse(birthDateStr);

            String fc = FiscalCodeUtils.calculate(firstName, lastName, birthDate, gender, birthPlaceCode);
            return ResponseEntity.ok(Map.of("fiscalCode", fc));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
