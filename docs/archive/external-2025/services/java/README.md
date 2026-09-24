> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# Java Services Setup Guide

## Overview
AffiliateFlow now includes 3 Spring Boot microservices for enterprise-grade functionality:

### Services
1. **Analytics Service** (Port 8090) - Real-time analytics and reporting
2. **Data Processing Service** (Port 8091) - ETL and batch processing with Spring Batch
3. **Integration Service** (Port 8092) - External system integrations

## Prerequisites

### Required
- Java 17 or higher
- Maven 3.9+ (or use included Maven wrapper)
- Docker (for containerization)

### Optional
- Spring Roo 2.0+ (for entity generation)
- PostgreSQL (for production database)

## Quick Start

### 1. Build All Services

```powershell
# Using Maven (if in PATH)
cd services/java/analytics-service
mvn clean package

cd ../data-processing-service
mvn clean package

cd ../integration-service
mvn clean package
```

### 2. Run Locally

```powershell
# Analytics Service
cd services/java/analytics-service
java -jar target/analytics-service-1.0.0-SNAPSHOT.jar

# Data Processing Service (new terminal)
cd services/java/data-processing-service
java -jar target/data-processing-service-1.0.0-SNAPSHOT.jar

# Integration Service (new terminal)
cd services/java/integration-service
java -jar target/integration-service-1.0.0-SNAPSHOT.jar
```

### 3. Test Endpoints

```powershell
# Analytics Service Health Check
curl http://localhost:8090/api/analytics/health

# Get Dashboard Stats
curl http://localhost:8090/api/analytics/dashboard

# Data Processing Health
curl http://localhost:8091/api/processing/health

# Integration Service Health
curl http://localhost:8092/api/integration/health

# List Connectors
curl http://localhost:8092/api/integration/connectors
```

## Using Spring Roo

Spring Roo provides rapid JPA entity generation. Each service includes a `.roo` script:

### Run Roo Scripts

```bash
# Analytics Service
cd services/java/analytics-service
roo script --file analytics-entities.roo

# Data Processing Service
cd services/java/data-processing-service
roo script --file processing-entities.roo

# Integration Service
cd services/java/integration-service
roo script --file integration-entities.roo
```

### What Roo Generates
- JPA entities with fields and relationships
- Spring Data JPA repositories
- Service layer interfaces and implementations
- REST controllers with CRUD operations

## Docker Deployment

### Build Docker Images

```powershell
# Build all Java service images
cd services/java

docker build -t analytics-service:latest ./analytics-service
docker build -t data-processing-service:latest ./data-processing-service
docker build -t integration-service:latest ./integration-service
```

### Run with Docker

```powershell
# Analytics Service
docker run -d -p 8090:8090 --name analytics analytics-service:latest

# Data Processing Service
docker run -d -p 8091:8091 --name processing data-processing-service:latest

# Integration Service
docker run -d -p 8092:8092 --name integration integration-service:latest
```

## Configuration

### Database Configuration

By default, services use H2 in-memory database for development. For production, configure PostgreSQL:

**application.properties**:
```properties
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/affiliateflow
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### Environment Variables

```powershell
# Set Java service ports
$env:ANALYTICS_PORT=8090
$env:PROCESSING_PORT=8091
$env:INTEGRATION_PORT=8092

# Database
$env:DB_HOST=localhost
$env:DB_PORT=5432
$env:DB_NAME=affiliateflow

# Run service with env vars
java -jar -Dserver.port=$env:ANALYTICS_PORT target/analytics-service-1.0.0-SNAPSHOT.jar
```

## API Endpoints

### Analytics Service (8090)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/health` | GET | Health check |
| `/api/analytics/dashboard` | GET | Dashboard statistics |
| `/api/analytics/performance` | GET | Performance metrics |
| `/actuator/health` | GET | Spring Boot health |
| `/actuator/metrics` | GET | Application metrics |
| `/actuator/prometheus` | GET | Prometheus metrics |

### Data Processing Service (8091)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/processing/health` | GET | Health check |
| `/api/processing/process-products` | POST | Start batch job |
| `/api/processing/jobs/status` | GET | Job status |
| `/actuator/health` | GET | Spring Boot health |

### Integration Service (8092)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integration/health` | GET | Health check |
| `/api/integration/connectors` | GET | List connectors |
| `/api/integration/sync/{connector}` | POST | Sync connector |
| `/actuator/health` | GET | Spring Boot health |
| `/actuator/integrationgraph` | GET | Integration flow graph |

## H2 Database Console

All services include H2 console for development:

- Analytics: http://localhost:8090/h2-console
- Processing: http://localhost:8091/h2-console
- Integration: http://localhost:8092/h2-console

**Connection Details**:
- JDBC URL: `jdbc:h2:mem:analyticsdb` (or processingdb/integrationdb)
- Username: `sa`
- Password: (empty)

## Troubleshooting

### Maven Not in PATH

Use Maven wrapper or full path:
```powershell
# Find Maven
where.exe mvn

# Use full path
& "C:\Program Files\Apache\maven\bin\mvn.cmd" clean package
```

### Port Already in Use

```powershell
# Find process using port
netstat -ano | findstr :8090

# Kill process
taskkill /PID <PID> /F

# Or change port
java -jar -Dserver.port=8093 target/analytics-service-1.0.0-SNAPSHOT.jar
```

### Build Errors

```powershell
# Clean Maven cache
mvn clean
mvn dependency:purge-local-repository

# Update dependencies
mvn -U clean package
```

## Integration with Node.js Services

Java services complement the existing Node.js microservices:

### Service Communication

```javascript
// Node.js calling Java Analytics Service
const axios = require('axios');

async function getAnalytics() {
  const response = await axios.get('http://localhost:8090/api/analytics/dashboard');
  return response.data;
}
```

### Kubernetes Deployment

Java services are ready for K8s deployment. They will be added to the existing deployment scripts.

## Next Steps

1. **Generate Entities**: Run Roo scripts to create domain models
2. **Add Business Logic**: Implement service methods
3. **Connect to Firebase**: Integrate with existing Firestore data
4. **Deploy to K8s**: Add to cluster deployment
5. **Add to CI/CD**: Integrate with build pipeline

## Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Roo Documentation](https://projects.spring.io/spring-roo/)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Batch](https://spring.io/projects/spring-batch)
- [Spring Integration](https://spring.io/projects/spring-integration)
