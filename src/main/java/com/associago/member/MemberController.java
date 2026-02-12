package com.associago.member;

import com.associago.utils.FiscalCodeUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public ResponseEntity<Iterable<Member>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {
        return memberService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Member> createMember(@RequestBody Member member) {
        return ResponseEntity.ok(memberService.createMember(member));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Long id, @RequestBody Member member) {
        try {
            return ResponseEntity.ok(memberService.updateMember(id, member));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }

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
