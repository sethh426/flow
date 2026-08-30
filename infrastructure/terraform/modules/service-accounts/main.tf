variable "project_id" {
  type = string
}

# Master AI Orchestrator Service Account
resource "google_service_account" "orchestrator" {
  account_id   = "affiliate-flow-orchestrator"
  display_name = "Affiliate Flow Master AI Orchestrator"
  project      = var.project_id
}

# Content Generation Service Account
resource "google_service_account" "content_gen" {
  account_id   = "affiliate-flow-content-gen"
  display_name = "Affiliate Flow Content Generation"
  project      = var.project_id
}

# Analytics Service Account
resource "google_service_account" "analytics" {
  account_id   = "affiliate-flow-analytics"
  display_name = "Affiliate Flow Analytics"
  project      = var.project_id
}

# Financial Processing Service Account
resource "google_service_account" "finance" {
  account_id   = "affiliate-flow-finance"
  display_name = "Affiliate Flow Financial Processing"
  project      = var.project_id
}

# IAM Bindings for Orchestrator
resource "google_project_iam_member" "orchestrator_tasks" {
  project = var.project_id
  role    = "roles/cloudtasks.enqueuer"
  member  = "serviceAccount:${google_service_account.orchestrator.email}"
}

resource "google_project_iam_member" "orchestrator_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.orchestrator.email}"
}

resource "google_project_iam_member" "orchestrator_ai" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.orchestrator.email}"
}

resource "google_project_iam_member" "orchestrator_bigquery" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.orchestrator.email}"
}

# IAM Bindings for Content Gen
resource "google_project_iam_member" "content_gen_ai" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.content_gen.email}"
}

resource "google_project_iam_member" "content_gen_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.content_gen.email}"
}

resource "google_project_iam_member" "content_gen_storage" {
  project = var.project_id
  role    = "roles/storage.objectCreator"
  member  = "serviceAccount:${google_service_account.content_gen.email}"
}

# IAM Bindings for Analytics
resource "google_project_iam_member" "analytics_bigquery_data" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.analytics.email}"
}

resource "google_project_iam_member" "analytics_bigquery_jobs" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.analytics.email}"
}

# Outputs
output "orchestrator_email" {
  value = google_service_account.orchestrator.email
}

output "content_gen_email" {
  value = google_service_account.content_gen.email
}

output "analytics_email" {
  value = google_service_account.analytics.email
}

output "finance_email" {
  value = google_service_account.finance.email
}
