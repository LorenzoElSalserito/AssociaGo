package com.associago.transfer;

import com.associago.shared.i18n.Messages;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/data/members")
public class MemberTransferController {
    private final MemberTransferService service;
    private final Messages messages;
    public MemberTransferController(MemberTransferService service, Messages messages) {this.service=service; this.messages=messages;}
    @GetMapping({"/template","/export"})
    public ResponseEntity<String> download(@RequestParam String format,@RequestParam Long associationId,jakarta.servlet.http.HttpServletRequest request) throws Exception {
        boolean template=request.getRequestURI().endsWith("/template");
        var rows=template?service.example():service.exportRows(associationId);
        String content=service.serialize(rows,format);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"associago-soci-"+(template?"esempio":"export")+"."+format+"\"")
                .contentType(MediaType.parseMediaType("json".equals(format)?"application/json;charset=UTF-8":"text/csv;charset=UTF-8")).body(content);
    }
    @PostMapping({"/preview","/import"})
    public Map<String,Object> upload(@RequestParam MultipartFile file,@RequestParam Long associationId,jakarta.servlet.http.HttpServletRequest request) throws Exception {
        return service.importRows(associationId,service.parse(file),request.getRequestURI().endsWith("/preview"));
    }
    @ExceptionHandler({IllegalArgumentException.class,com.fasterxml.jackson.core.JsonProcessingException.class,com.opencsv.exceptions.CsvException.class})
    public ResponseEntity<Map<String,String>> invalid(Exception error) {
        String message=error instanceof IllegalArgumentException?messages.describe(error):messages.get("transfer.invalidFile");
        return ResponseEntity.badRequest().body(Map.of("message",message));
    }
}
