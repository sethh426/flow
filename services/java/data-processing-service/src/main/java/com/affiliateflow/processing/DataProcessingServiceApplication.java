package com.affiliateflow.processing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;

@SpringBootApplication
@EnableBatchProcessing
public class DataProcessingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DataProcessingServiceApplication.class, args);
    }
}
