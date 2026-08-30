#!/usr/bin/env bash
set -euo pipefail

# ───── CONFIG ─────────────────────────────────────────────────────
PROJECT_ID="appy-32f2xp"          # your GCP project ID
REGION="us-central1"              # your default region
SA_ID="affiliateflow-scraper"     # service-account basename
SA_EMAIL="$SA_ID@$PROJECT_ID.iam.gserviceaccount.com"

# ───── INIT ───────────────────────────────────────────────────────
gcloud config set project "$PROJECT_ID" >/dev/null
gcloud config set run/region "$REGION"   >/dev/null

# ───── ENABLE APIS ───────────────────────────────────────────────
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  --quiet

# ───── SERVICE ACCOUNT + ROLES ─────────────────────────────────
echo "👤 Ensuring SA $SA_EMAIL"
gcloud iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1 || \
  gcloud iam service-accounts create "$SA_ID" --display-name="AffiliateFlow SA"

for ROLE in iam.serviceAccountUser run.invoker; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --quiet \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/$ROLE" \
    --condition=None
done

# ───── DEPLOY PLACEHOLDER CLOUD RUN ──────────────────────────────
echo "🚀 Deploying placeholder cred-bot…"
cat > Dockerfile <<'DOCKER'
FROM python:3.11-slim
RUN pip install flask gunicorn
ENV PORT 8080
COPY app.py /app.py
CMD exec gunicorn --bind ":$PORT" --workers 1 app:app
DOCKER

cat > app.py <<'PY'
from flask import Flask, jsonify
app = Flask(__name__)
@app.route("/whoami")
def whoami():
    return jsonify({"status":"ok"})
PY

gcloud run deploy cred-bot \
  --source=. \
  --region="$REGION" \
  --service-account="$SA_EMAIL" \
  --allow-unauthenticated

# ───── FINISH ────────────────────────────────────────────────────
URL=$(gcloud run services describe cred-bot \
        --region="$REGION" \
        --format='value(status.url)')
echo -e "\n✅ Cred-Bot URL → $URL\n"
