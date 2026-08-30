#!/bin/bash
# Complete GCP Workload Identity Federation Setup Script
# This allows GitHub Actions to deploy without service account keys

set -e

# Configuration
PROJECT_ID="affiliateflow-abzfy"
REGION="us-central1"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-actions-provider"
SA_NAME="github-actions-deployer"
REPO_OWNER="luxcognita"
REPO_NAME="affiliateflow-unified"

echo "🚀 Setting up Workload Identity Federation for GitHub Actions"
echo "Project: $PROJECT_ID"

# Enable required APIs
echo "📦 Enabling required GCP APIs..."
gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  sts.googleapis.com \
  --project=$PROJECT_ID

# Create Workload Identity Pool
echo "🔐 Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create $POOL_NAME \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions Pool" \
  --description="Workload Identity Pool for GitHub Actions" \
  || echo "Pool already exists"

# Get Pool ID
POOL_ID=$(gcloud iam workload-identity-pools describe $POOL_NAME \
  --project=$PROJECT_ID \
  --location=global \
  --format="value(name)")

echo "Pool ID: $POOL_ID"

# Create Workload Identity Provider
echo "🔗 Creating GitHub OIDC Provider..."
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=$POOL_NAME \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  || echo "Provider already exists"

# Create Service Account
echo "👤 Creating GitHub Actions Service Account..."
gcloud iam service-accounts create $SA_NAME \
  --project=$PROJECT_ID \
  --display-name="GitHub Actions Deployer" \
  --description="Service account for GitHub Actions deployments" \
  || echo "Service account already exists"

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant necessary roles to Service Account
echo "🔒 Granting IAM roles..."
ROLES=(
  "roles/firebase.admin"
  "roles/firebasehosting.admin"
  "roles/cloudfunctions.admin"
  "roles/storage.admin"
  "roles/compute.admin"
  "roles/container.admin"
  "roles/iam.serviceAccountUser"
  "roles/resourcemanager.projectIamAdmin"
)

for role in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$role" \
    --condition=None
done

# Allow GitHub repo to impersonate the service account
echo "🎭 Configuring Workload Identity Federation..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

# Get Workload Identity Provider resource name
PROVIDER_RESOURCE=$(gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=$POOL_NAME \
  --format="value(name)")

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Add these secrets to your GitHub repository:"
echo "   Repository → Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "WIF_PROVIDER:"
echo "$PROVIDER_RESOURCE"
echo ""
echo "WIF_SERVICE_ACCOUNT:"
echo "$SA_EMAIL"
echo ""
echo "🔐 For Firebase deployments, also add:"
echo "   FIREBASE_TOKEN (generate with: firebase login:ci)"
echo ""
