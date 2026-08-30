package com.affiliateflow.processing.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/processing")
public class ProcessingController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "data-processing-service");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/process-products")
    public ResponseEntity<Map<String, Object>> processProducts(
            @RequestParam(defaultValue = "100") int batchSize) {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "processing");
        result.put("batchSize", batchSize);
        result.put("message", "Product processing job started");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/jobs/status")
    public ResponseEntity<Map<String, Object>> getJobStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("activeJobs", 0);
        status.put("completedJobs", 42);
        status.put("failedJobs", 1);
        return ResponseEntity.ok(status);
    }
}
