#!/usr/bin/env bash
set -euo pipefail

### EDIT THESE ###
PROJECT_ID="appy-32f2xp"
REGION="us-central1"
SA_NAME="affiliateflow-scraper"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
REPO_URL="https://github.com/luxcognita/JSON-product-finder.git"
WORKDIR="$HOME/affiliateflow"
APIFY_TOKEN="REDACTED_APIFY_API_TOKEN"
##################

# 1) gcloud basics
gcloud config set project "$PROJECT_ID"
gcloud config set run/region "$REGION"

# 2) Enable APIs
gcloud services enable \
  run.googleapis.com \
  workflows.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com

# 3) Ensure SA exists
if ! gcloud iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="AffiliateFlow SA"
fi

# 4) Grant it the roles it needs
for ROLE in roles/run.invoker roles/datastore.user; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --condition=None \
    --quiet || true
done

# 5) Store (or rotate) your Apify token in Secret Manager
if ! gcloud secrets describe APIFY_TOKEN >/dev/null 2>&1; then
  echo -n "$APIFY_TOKEN" | gcloud secrets create APIFY_TOKEN \
    --data-file=- --quiet
  gcloud secrets add-iam-policy-binding APIFY_TOKEN \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None \
    --quiet
else
  echo -n "$APIFY_TOKEN" | gcloud secrets versions add APIFY_TOKEN \
    --data-file=- --quiet
fi

# 6) Clone your repo
rm -rf "$WORKDIR"
git clone "$REPO_URL" "$WORKDIR"

# 7) Deploy product-mapper with secret injection
cd "$WORKDIR/services/product-mapper"
gcloud run deploy product-mapper \
  --source=. \
  --service-account="$SA_EMAIL" \
  --allow-unauthenticated \
  --set-secrets=APIFY_TOKEN=APIFY_TOKEN:latest

# 8) Deploy trend-finder
cd "$WORKDIR/services/trend-finder"
gcloud run deploy trend-finder \
  --source=. \
  --service-account="$SA_EMAIL" \
  --allow-unauthenticated

# 9) Deploy the workflow
cd "$WORKDIR/workflows"
gcloud workflows deploy trend-pipeline \
  --source=trend-pipeline.yaml \
  --location="$REGION"

# 10) Schedule it daily at 2 AM
gcloud scheduler jobs create http affiliateflow-daily \
  --schedule="0 2 * * *" \
  --location="$REGION" \
  --uri="https://workflowexecutions.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/workflows/trend-pipeline/executions" \
  --oauth-service-account-email="$SA_EMAIL"

echo "✅ All done! Your services should now be live with the Apify token correctly mounted."
