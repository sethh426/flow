package com.affiliateflow.analytics.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "analytics-service");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", 45230.50);
        stats.put("totalClicks", 15420);
        stats.put("totalConversions", 842);
        stats.put("conversionRate", 5.46);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics(
            @RequestParam(defaultValue = "30d") String period) {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("period", period);
        metrics.put("revenue", 45230.50);
        metrics.put("clicks", 15420);
        metrics.put("impressions", 245600);
        metrics.put("ctr", 6.28);
        return ResponseEntity.ok(metrics);
    }
}
