# FlowBot Cloud Deployment Script for Windows
# Deploys Flow Orchestrator to Google Cloud Run

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  FlowBot Cloud Deployment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ID = "affiliateflow-abzfy"
$REGION = "us-central1"
$SERVICE_NAME = "flow-orchestrator"

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud version --format="value('Google Cloud SDK')" 2>&1
    Write-Host "[OK] gcloud CLI found" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] gcloud CLI not found" -ForegroundColor Red
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Project: $PROJECT_ID" -ForegroundColor Gray
Write-Host "Region: $REGION" -ForegroundColor Gray
Write-Host ""

# Set project
Write-Host "Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to set project" -ForegroundColor Red
    Write-Host "Run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Project configured" -ForegroundColor Green
Write-Host ""

# Choose deployment option
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Choose Deployment Option" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1) Cloud Run Only (Recommended)" -ForegroundColor White
Write-Host "   - Cost: ~5-20 dollars/month" -ForegroundColor Gray
Write-Host "   - Setup: 10 minutes" -ForegroundColor Gray
Write-Host "   - Best for: Testing and low traffic" -ForegroundColor Gray
Write-Host ""
Write-Host "2) Full GKE + Cloud Run (Production)" -ForegroundColor White
Write-Host "   - Cost: ~150-300 dollars/month" -ForegroundColor Gray
Write-Host "   - Setup: 30 minutes" -ForegroundColor Gray
Write-Host "   - Best for: High traffic and scaling" -ForegroundColor Gray
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -ne "1" -and $choice -ne "2") {
    Write-Host "[ERROR] Invalid choice" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Enabling required APIs..." -ForegroundColor Yellow

$apis = @(
    "aiplatform.googleapis.com",
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "bigquery.googleapis.com"
)

if ($choice -eq "2") {
    $apis += "container.googleapis.com"
}

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api --quiet 2>&1 | Out-Null
}

Write-Host "[OK] APIs enabled" -ForegroundColor Green
Write-Host ""

# Create BigQuery dataset
Write-Host "Setting up BigQuery..." -ForegroundColor Yellow
bq mk --dataset --location=US "${PROJECT_ID}:trends" 2>&1 | Out-Null
bq mk --table "${PROJECT_ID}:trends.historical" "product_name:STRING,category:STRING,search_volume:INTEGER,date:DATE" 2>&1 | Out-Null
bq mk --table "${PROJECT_ID}:trends.current" "category:STRING,product:STRING,growth_rate:FLOAT,volume:INTEGER,score:INTEGER,timestamp:TIMESTAMP" 2>&1 | Out-Null
Write-Host "[OK] BigQuery datasets created" -ForegroundColor Green
Write-Host ""

# Create Flow Orchestrator service
Write-Host "Creating Flow Orchestrator service..." -ForegroundColor Yellow

$orchestratorDir = "services/flow-orchestrator"
if (-not (Test-Path $orchestratorDir)) {
    New-Item -ItemType Directory -Path $orchestratorDir -Force | Out-Null
}

# Create index.js
$indexJs = @'
const express = require('express');
const { VertexAI } = require('@google-cloud/aiplatform');
const app = express();
app.use(express.json());
app.use(require('cors')());

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'affiliateflow-abzfy',
  location: 'us-central1'
});

app.post('/api/flow', async (req, res) => {
  const { message, userId, history } = req.body;
  
  try {
    console.log('Processing message:', message);
    
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048
      }
    });
    
    const systemPrompt = `You are Flow, an AI assistant for AffiliateFlow. Help users with:
- Finding trending products
- Generating content (captions, scripts)
- Campaign management
- Analytics and insights
- Product search

Be friendly, helpful, and actionable. When users ask to find trends or generate content, provide specific, useful responses.`;
    
    const fullPrompt = systemPrompt + '\n\nUser: ' + message;
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();
    
    console.log('Response generated successfully');
    
    res.json({ 
      answer: response,
      timestamp: new Date().toISOString(),
      model: 'gemini-pro'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to generate response'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'flow-orchestrator'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    service: 'AffiliateFlow Orchestrator',
    version: '1.0.0',
    endpoints: ['/api/flow', '/health']
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Flow Orchestrator running on port ${PORT}`);
});
'@

Set-Content -Path "$orchestratorDir/index.js" -Value $indexJs

# Create package.json
$packageJson = @'
{
  "name": "flow-orchestrator",
  "version": "1.0.0",
  "description": "AffiliateFlow AI Orchestrator",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@google-cloud/aiplatform": "^3.27.0",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
'@

Set-Content -Path "$orchestratorDir/package.json" -Value $packageJson

# Create Dockerfile
$dockerfile = @'
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
'@

Set-Content -Path "$orchestratorDir/Dockerfile" -Value $dockerfile

# Create .gcloudignore
$gcloudignore = @'
node_modules/
.env
.env.local
*.log
'@

Set-Content -Path "$orchestratorDir/.gcloudignore" -Value $gcloudignore

Write-Host "[OK] Service files created" -ForegroundColor Green
Write-Host ""

# Deploy to Cloud Run
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Deploying to Cloud Run" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This may take 3-5 minutes..." -ForegroundColor Yellow
Write-Host ""

Push-Location $orchestratorDir

try {
    gcloud run deploy $SERVICE_NAME `
      --source . `
      --region=$REGION `
      --allow-unauthenticated `
      --set-env-vars GCP_PROJECT_ID=$PROJECT_ID `
      --memory=1Gi `
      --cpu=1 `
      --min-instances=0 `
      --max-instances=10 `
      --timeout=60 `
      --quiet

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[OK] Cloud Run deployment successful!" -ForegroundColor Green
    } else {
        throw "Deployment failed"
    }
} catch {
    Write-Host "[ERROR] Deployment failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# Get the service URL
Write-Host ""
Write-Host "Getting service URL..." -ForegroundColor Yellow

$orchestratorUrl = gcloud run services describe $SERVICE_NAME `
  --region=$REGION `
  --format="value(status.url)"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Flow Orchestrator URL:" -ForegroundColor Cyan
Write-Host "  $orchestratorUrl" -ForegroundColor White
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Add to client/.env.local:" -ForegroundColor White
Write-Host ""
Write-Host "   FLOW_ORCHESTRATOR_URL=$orchestratorUrl" -ForegroundColor Gray
Write-Host "   ENABLE_CLOUD_FLOW=true" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the API:" -ForegroundColor White
Write-Host ""
Write-Host "   Invoke-RestMethod -Uri '$orchestratorUrl/api/flow' ```" -ForegroundColor Gray
Write-Host "     -Method Post ```" -ForegroundColor Gray
Write-Host "     -ContentType 'application/json' ```" -ForegroundColor Gray
Write-Host "     -Body (ConvertTo-Json @{message='Hello FlowBot'; userId='test'})" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Restart your Next.js app" -ForegroundColor White
Write-Host ""
Write-Host "Estimated cost: ~5-20 dollars/month" -ForegroundColor Yellow
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - CLOUD_FLOW_INTEGRATION.md" -ForegroundColor Gray
Write-Host "  - VERTEX_AI_GKE_ARCHITECTURE.md" -ForegroundColor Gray
Write-Host "  - FLOW_QUICK_REFERENCE.md" -ForegroundColor Gray
Write-Host ""

# Save URL to file
$orchestratorUrl | Out-File -FilePath "ORCHESTRATOR_URL.txt" -Encoding UTF8
Write-Host "[OK] URL saved to: ORCHESTRATOR_URL.txt" -ForegroundColor Green
Write-Host ""

# Offer to update .env.local
Write-Host "Update client/.env.local now? (y/n): " -ForegroundColor Yellow -NoNewline
$updateEnv = Read-Host

if ($updateEnv -eq "y") {
    $envPath = "client/.env.local"
    
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -Raw
        
        if ($envContent -match "FLOW_ORCHESTRATOR_URL") {
            $envContent = $envContent -replace "FLOW_ORCHESTRATOR_URL=.*", "FLOW_ORCHESTRATOR_URL=$orchestratorUrl"
        } else {
            $envContent += "`nFLOW_ORCHESTRATOR_URL=$orchestratorUrl"
        }
        
        if ($envContent -match "ENABLE_CLOUD_FLOW") {
            $envContent = $envContent -replace "ENABLE_CLOUD_FLOW=.*", "ENABLE_CLOUD_FLOW=true"
        } else {
            $envContent += "`nENABLE_CLOUD_FLOW=true"
        }
        
        Set-Content -Path $envPath -Value $envContent
        Write-Host "[OK] Updated client/.env.local" -ForegroundColor Green
        Write-Host ""
        Write-Host "Restart your dev server to apply changes:" -ForegroundColor Yellow
        Write-Host "  cd client" -ForegroundColor Gray
        Write-Host "  npm run dev" -ForegroundColor Gray
    } else {
        Write-Host "[WARN] client/.env.local not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Setup complete - FlowBot is now running on Google Cloud" -ForegroundColor Green
Write-Host ""

Write-Host ""
