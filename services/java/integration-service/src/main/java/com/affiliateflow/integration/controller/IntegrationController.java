package com.affiliateflow.integration.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/integration")
public class IntegrationController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "integration-service");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/connectors")
    public ResponseEntity<List<Map<String, Object>>> getConnectors() {
        List<Map<String, Object>> connectors = new ArrayList<>();
        
        Map<String, Object> nordstrom = new HashMap<>();
        nordstrom.put("name", "Nordstrom");
        nordstrom.put("status", "connected");
        nordstrom.put("lastSync", "2024-01-15T10:30:00Z");
        connectors.add(nordstrom);

        Map<String, Object> shopify = new HashMap<>();
        shopify.put("name", "Shopify");
        shopify.put("status", "connected");
        shopify.put("lastSync", "2024-01-15T09:15:00Z");
        connectors.add(shopify);

        return ResponseEntity.ok(connectors);
    }

    @PostMapping("/sync/{connector}")
    public ResponseEntity<Map<String, Object>> syncConnector(@PathVariable String connector) {
        Map<String, Object> result = new HashMap<>();
        result.put("connector", connector);
        result.put("status", "syncing");
        result.put("message", "Sync initiated for " + connector);
        return ResponseEntity.ok(result);
    }
}
