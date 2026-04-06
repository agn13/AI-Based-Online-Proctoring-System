package com.proctoring.controller;

import com.proctoring.dto.FrameRequest;
import com.proctoring.service.ProctoringService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proctoring")
public class ProctoringController {

    private final ProctoringService proctoringService;

    public ProctoringController(ProctoringService proctoringService) {
        this.proctoringService = proctoringService;
    }

    @PostMapping("/frame")
    public ResponseEntity<String> pushFrame(@Valid @RequestBody FrameRequest request) {
        proctoringService.processFrame(request);
        return ResponseEntity.ok("Frame received");
    }
}
