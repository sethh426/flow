# Create Java Service Script
# Creates a new Java Spring Boot service from template

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("rest-api", "data-processor", "test-suite")]
    [string]$Template = "rest-api",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 8080
)

$servicePath = "services/java/$ServiceName"

Write-Host "☕ Creating Java Service: $ServiceName" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if service already exists
if (Test-Path $servicePath) {
    Write-Host "❌ Service already exists: $servicePath" -ForegroundColor Red
    exit 1
}

# Create service directory
Write-Host "1. Creating service directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $servicePath -Force | Out-Null
New-Item -ItemType Directory -Path "$servicePath/src/main/java/com/affiliateflow/$ServiceName" -Force | Out-Null
New-Item -ItemType Directory -Path "$servicePath/src/main/resources" -Force | Out-Null
New-Item -ItemType Directory -Path "$servicePath/src/test/java/com/affiliateflow/$ServiceName" -Force | Out-Null
Write-Host "   ✓ Directory structure created" -ForegroundColor Green

# Create POM based on template
Write-Host ""
Write-Host "2. Creating pom.xml..." -ForegroundColor Yellow

$pomContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.affiliateflow</groupId>
        <artifactId>affiliateflow-java-parent</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>$ServiceName</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>$ServiceName</name>
    <description>$ServiceName service for AffiliateFlow</description>

    <dependencies>
        <!-- Spring Boot Starter Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Starter Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- JSON Processing -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
"@

Set-Content -Path "$servicePath/pom.xml" -Value $pomContent
Write-Host "   ✓ pom.xml created" -ForegroundColor Green

# Create application.yml
Write-Host ""
Write-Host "3. Creating application.yml..." -ForegroundColor Yellow

$appYml = @"
server:
  port: $Port

spring:
  application:
    name: $ServiceName
  
logging:
  level:
    com.affiliateflow: DEBUG
    org.springframework: INFO
"@

Set-Content -Path "$servicePath/src/main/resources/application.yml" -Value $appYml
Write-Host "   ✓ application.yml created" -ForegroundColor Green

# Create main application class
Write-Host ""
Write-Host "4. Creating application class..." -ForegroundColor Yellow

$mainClass = @"
package com.affiliateflow.$ServiceName;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
"@

$className = (Get-Culture).TextInfo.ToTitleCase($ServiceName)
Set-Content -Path "$servicePath/src/main/java/com/affiliateflow/$ServiceName/Application.java" -Value $mainClass
Write-Host "   ✓ Application.java created" -ForegroundColor Green

# Create REST controller based on template
Write-Host ""
Write-Host "5. Creating controller..." -ForegroundColor Yellow

$controller = @"
package com.affiliateflow.$ServiceName;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class Controller {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "$ServiceName",
            "timestamp", String.valueOf(System.currentTimeMillis())
        ));
    }

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> hello(@RequestParam(defaultValue = "World") String name) {
        return ResponseEntity.ok(Map.of(
            "message", "Hello, " + name + "!",
            "service", "$ServiceName"
        ));
    }
}
"@

Set-Content -Path "$servicePath/src/main/java/com/affiliateflow/$ServiceName/Controller.java" -Value $controller
Write-Host "   ✓ Controller.java created" -ForegroundColor Green

# Create test
Write-Host ""
Write-Host "6. Creating test..." -ForegroundColor Yellow

$test = @"
package com.affiliateflow.$ServiceName;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTest {

    @Test
    void contextLoads() {
        // Test that application context loads successfully
    }
}
"@

Set-Content -Path "$servicePath/src/test/java/com/affiliateflow/$ServiceName/ApplicationTest.java" -Value $test
Write-Host "   ✓ ApplicationTest.java created" -ForegroundColor Green

# Create Dockerfile
Write-Host ""
Write-Host "7. Creating Dockerfile..." -ForegroundColor Yellow

$dockerfile = @"
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY target/$ServiceName-1.0.0.jar app.jar

EXPOSE $Port

ENTRYPOINT ["java", "-jar", "app.jar"]
"@

Set-Content -Path "$servicePath/Dockerfile" -Value $dockerfile
Write-Host "   ✓ Dockerfile created" -ForegroundColor Green

# Create README
Write-Host ""
Write-Host "8. Creating README..." -ForegroundColor Yellow

$readme = @"
# $ServiceName

Java Spring Boot service for AffiliateFlow

## Build

``````powershell
mvn clean package
``````

## Run

``````powershell
mvn spring-boot:run
``````

## Test

``````powershell
mvn test
``````

## Docker

``````powershell
# Build
docker build -t $ServiceName .

# Run
docker run -p ${Port}:${Port} $ServiceName
``````

## API Endpoints

- \`GET /api/health\` - Health check
- \`GET /api/hello?name=Name\` - Hello endpoint

## Port

$Port
"@

Set-Content -Path "$servicePath/README.md" -Value $readme
Write-Host "   ✓ README.md created" -ForegroundColor Green

# Update parent POM to include this module
Write-Host ""
Write-Host "9. Updating parent POM..." -ForegroundColor Yellow

$parentPomPath = "services/java/pom.xml"
if (Test-Path $parentPomPath) {
    $parentPomContent = Get-Content $parentPomPath -Raw
    
    if ($parentPomContent -match '(<modules>)(.*?)(</modules>)') {
        $modulesContent = $matches[2].Trim()
        
        if ($modulesContent -eq "<!-- Modules will be added here -->") {
            # First module
            $newModules = "`n        <module>$ServiceName</module>`n    "
        } else {
            # Add to existing modules
            $newModules = $modulesContent + "`n        <module>$ServiceName</module>`n    "
        }
        
        $parentPomContent = $parentPomContent -replace '(<modules>)(.*?)(</modules>)', "`$1$newModules`$3"
        Set-Content -Path $parentPomPath -Value $parentPomContent
        Write-Host "   ✓ Parent POM updated" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ Service created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Service details:" -ForegroundColor Cyan
Write-Host "  Name: $ServiceName" -ForegroundColor White
Write-Host "  Port: $Port" -ForegroundColor White
Write-Host "  Path: $servicePath" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Build: cd $servicePath && mvn clean package" -ForegroundColor Gray
Write-Host "  2. Run: mvn spring-boot:run" -ForegroundColor Gray
Write-Host "  3. Test: curl http://localhost:${Port}/api/health" -ForegroundColor Gray
Write-Host ""
