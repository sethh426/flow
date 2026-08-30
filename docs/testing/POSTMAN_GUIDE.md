# Postman Collection Guide

## 📮 Getting Started

### Import Collection

1. Open Postman
2. Click "Import" button
3. Select `postman/AffiliateFlow-API.postman_collection.json`
4. Import environments from `postman/environments/`

### Select Environment

1. Click environment dropdown (top right)
2. Select "Local", "Staging", or "Production"
3. Configure environment variables

### Configure Variables

**Required Variables**:
- `auth_token` - Your authentication token
- `gemini_api_key` - Your Gemini API key (if needed)

**Auto-configured**:
- `base_url` - Frontend URL
- `api_url` - Backend API URL

---

## 📁 Collection Structure

### 1. Health Checks

Test service availability and status.

**API Health**
```
GET {{api_url}}/health
```
Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-27T12:00:00Z"
}
```

**Orchestrator Health**
```
GET {{api_url}}/api/orchestrator/health
```

**Product Mapper Health**
```
GET {{api_url}}/api/products/health
```

---

### 2. Content Generation

Generate content using AI.

**Generate Content**
```http
POST {{api_url}}/api/content/generate
Content-Type: application/json

{
  "prompt": "Create a social media post about fashion trends",
  "platform": "instagram",
  "tone": "casual",
  "length": "medium"
}
```

**Generate Image**
```http
POST {{api_url}}/api/image/generate
Content-Type: application/json

{
  "prompt": "Modern fashion influencer in urban setting",
  "style": "photorealistic",
  "size": "1024x1024"
}
```

**Get Content History**
```
GET {{api_url}}/api/content/history?limit=10
```

---

### 3. Product Mapping

Search and map products to content.

**Search Products**
```http
POST {{api_url}}/api/products/search
Content-Type: application/json

{
  "query": "summer dresses",
  "retailer": "nordstrom",
  "maxResults": 10
}
```

**Get Product Details**
```
GET {{api_url}}/api/products/:productId
```
Path Variable: `productId` = Product ID

**Map Content to Products**
```http
POST {{api_url}}/api/products/map
Content-Type: application/json

{
  "contentId": "content_123",
  "products": [
    {
      "productId": "prod_1",
      "position": "main"
    }
  ]
}
```

---

### 4. Trend Finder

Discover and analyze trends.

**Get Current Trends**
```
GET {{api_url}}/api/trends?category=fashion&region=US
```

**Analyze Trend**
```http
POST {{api_url}}/api/trends/analyze
Content-Type: application/json

{
  "keyword": "sustainable fashion",
  "timeRange": "30d"
}
```

**Get Trend Suggestions**
```http
POST {{api_url}}/api/trends/suggest
Content-Type: application/json

{
  "category": "fashion",
  "audience": "women_25_34",
  "count": 5
}
```

---

### 5. Workflows

Manage and execute workflows.

**List Workflows**
```
GET {{api_url}}/api/workflows
```

**Create Workflow**
```http
POST {{api_url}}/api/workflows
Content-Type: application/json

{
  "name": "Fashion Content Pipeline",
  "description": "Automated content generation",
  "nodes": [
    {
      "id": "trend-finder",
      "type": "trend-finder",
      "config": {}
    }
  ],
  "edges": []
}
```

**Get Workflow**
```
GET {{api_url}}/api/workflows/:workflowId
```

**Execute Workflow**
```http
POST {{api_url}}/api/workflows/:workflowId/execute
Content-Type: application/json

{
  "input": {
    "category": "fashion"
  }
}
```

**Delete Workflow**
```
DELETE {{api_url}}/api/workflows/:workflowId
```

---

### 6. Analytics

Track and analyze performance.

**Get Dashboard Stats**
```
GET {{api_url}}/api/analytics/dashboard
```

**Get Performance Metrics**
```
GET {{api_url}}/api/analytics/performance?period=30d
```

**Track Event**
```http
POST {{api_url}}/api/analytics/track
Content-Type: application/json

{
  "event": "content_generated",
  "properties": {
    "platform": "instagram",
    "contentType": "post"
  }
}
```

---

## 🧪 Testing Workflow

### 1. Health Check

Start with health checks to verify services are running:

1. Run "API Health"
2. Run "Orchestrator Health"
3. Run "Product Mapper Health"

All should return 200 OK.

### 2. Content Generation Flow

```
1. Generate Content → Save content ID
2. Generate Image → Save image URL
3. Get Content History → Verify content appears
```

### 3. Product Mapping Flow

```
1. Search Products → Get product IDs
2. Get Product Details → Verify product data
3. Map Content to Products → Link content
```

### 4. Trend Analysis Flow

```
1. Get Current Trends → See trending topics
2. Analyze Trend → Get trend details
3. Get Trend Suggestions → Get content ideas
```

### 5. Workflow Execution Flow

```
1. Create Workflow → Save workflow ID
2. Get Workflow → Verify configuration
3. Execute Workflow → Run automation
4. Check results
5. Delete Workflow → Cleanup
```

---

## 🔧 Advanced Usage

### Chaining Requests

Use test scripts to chain requests:

```javascript
// In "Generate Content" test
pm.test("Save content ID", function() {
    const response = pm.response.json();
    pm.environment.set("content_id", response.id);
});

// In "Map Content to Products" request body
{
  "contentId": "{{content_id}}",
  "products": []
}
```

### Collection Runner

Run entire collection:

1. Click "Run collection" (Runner icon)
2. Select environment
3. Configure iterations
4. Run and view results

### Pre-request Scripts

Set up data before requests:

```javascript
// Generate timestamp
pm.environment.set("timestamp", Date.now());

// Create UUID
pm.environment.set("request_id", pm.variables.replaceIn('{{$guid}}'));
```

### Test Assertions

Add comprehensive tests:

```javascript
pm.test("Status is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response time < 2s", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Has required fields", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property('data');
    pm.expect(json.data).to.be.an('array');
});

pm.test("Content is valid", () => {
    const json = pm.response.json();
    pm.expect(json.data[0]).to.have.all.keys(
        'id', 'title', 'content', 'createdAt'
    );
});
```

---

## 🌍 Environments

### Local Development
```json
{
  "base_url": "http://localhost:3000",
  "api_url": "http://localhost:8080"
}
```

### Staging
```json
{
  "base_url": "https://staging.affiliateflow.com",
  "api_url": "https://api-staging.affiliateflow.com"
}
```

### Production
```json
{
  "base_url": "https://affiliateflow.com",
  "api_url": "https://api.affiliateflow.com"
}
```

---

## 🤖 Newman CLI

Run collections from command line:

### Installation
```powershell
npm install -g newman
```

### Basic Run
```powershell
newman run postman/AffiliateFlow-API.postman_collection.json `
  -e postman/environments/Local.postman_environment.json
```

### With Reporters
```powershell
newman run postman/AffiliateFlow-API.postman_collection.json `
  -e postman/environments/Local.postman_environment.json `
  --reporters cli,html,json `
  --reporter-html-export newman-report.html `
  --reporter-json-export newman-results.json
```

### Run Specific Folder
```powershell
newman run postman/AffiliateFlow-API.postman_collection.json `
  --folder "Health Checks"
```

### CI/CD Integration
```powershell
# Run with exit code on failure
newman run postman/AffiliateFlow-API.postman_collection.json `
  -e postman/environments/Staging.postman_environment.json `
  --bail `
  --color off
```

---

## 📊 Monitoring

### Set up Monitors

1. In Postman, go to "Monitors"
2. Click "Create Monitor"
3. Select collection
4. Choose frequency (5min, 1hr, 1day)
5. Select environment
6. Configure notifications

### Monitor Alerts

Get notified when:
- Tests fail
- Response time exceeds threshold
- Status codes indicate errors

### Performance Tracking

Track over time:
- Average response time
- Success rate
- Error patterns
- Availability percentage

---

## 💡 Tips & Best Practices

### 1. Use Variables
- Avoid hardcoded values
- Use environment variables for URLs, tokens
- Use collection variables for test data

### 2. Organize Requests
- Group related requests in folders
- Use descriptive names
- Add documentation to requests

### 3. Write Tests
- Validate status codes
- Check response structure
- Verify business logic
- Test error scenarios

### 4. Handle Authentication
- Save tokens in environment
- Refresh tokens in pre-request scripts
- Use collection-level auth

### 5. Document Everything
- Add descriptions to requests
- Document required parameters
- Include example responses
- Share with team

---

## 🔍 Troubleshooting

### Request Fails

1. Check environment is selected
2. Verify base URL is correct
3. Confirm API is running
4. Check network connectivity

### Variables Not Working

1. Verify variable name matches
2. Check environment scope
3. Ensure no typos in {{variable}}
4. Check variable is set

### Authentication Issues

1. Verify auth_token is set
2. Check token hasn't expired
3. Confirm auth method (Bearer, API Key)
4. Check header format

### Slow Responses

1. Check API performance
2. Increase timeout setting
3. Reduce payload size
4. Check network conditions

---

## 📚 Resources

- [Postman Learning Center](https://learning.postman.com/)
- [Newman Documentation](https://learning.postman.com/docs/collections/using-newman-cli/)
- [Postman API](https://www.postman.com/postman/workspace/postman-public-workspace/documentation/12959542-c8142d51-e97c-46b6-bd77-52bb66712c9a)
