#!/bin/bash
set -e  # Exit immediately if any command fails

# --- Start of Script ---

# 1. SET YOUR PROJECT ID
# ======================
echo "--------------------------------------------------------"
echo "Step 1: Set your Google Cloud Project ID"
echo "--------------------------------------------------------"
read -p "Please enter your Google Cloud Project ID: " GCP_PROJECT
gcloud config set project "$GCP_PROJECT"
echo ""
echo "Project set to: $GCP_PROJECT"
echo ""

# 2. ENABLE REQUIRED APIS
# =======================
echo "--------------------------------------------------------"
echo "Step 2: Enabling required Google Cloud APIs..."
echo "This may take a minute..."
echo "--------------------------------------------------------"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
echo ""
echo "APIs enabled successfully."
echo ""

# 3. DEPLOY THE SCRAPER MICROSERVICE
# ==================================
echo "--------------------------------------------------------"
echo "Step 3: Deploying the 'product-mapper' microservice..."
echo "This will take a few minutes. Please be patient."
echo "--------------------------------------------------------"
gcloud run deploy product-mapper \
  --source ./src/workspace/services/product-mapper \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --timeout=300 \
  --memory=1Gi

# 4. GET THE SERVICE URL
# ======================
echo "--------------------------------------------------------"
echo "Step 4: Retrieving the Service URL..."
echo "--------------------------------------------------------"
SERVICE_URL=$(gcloud run services describe product-mapper --platform managed --region us-central1 --format 'value(status.url)')

echo ""
echo "✅ DEPLOYMENT COMPLETE! ✅"
echo ""
echo "Your scraper service is now live."
echo "Your Service URL is: $SERVICE_URL"
echo ""
echo "--------------------------------------------------------"
echo "NEXT STEP: Copy the Service URL above and paste it into your application code."
echo "Update these files:"
echo " - src/ai/flows/search-and-summarize-flow.ts"
echo " - src/ai/flows/product-scraper-flow.ts"
echo "--------------------------------------------------------"

# --- End of Script ---
