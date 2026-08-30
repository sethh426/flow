# Affiliate Flow - Terraform Infrastructure as Code
# This defines all GCP resources optimized for FREE tier

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "affiliateflow-abzfy"
}

variable "region" {
  description = "Default GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudfunctions.googleapis.com",
    "firestore.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudtasks.googleapis.com",
    "pubsub.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "cloudtrace.googleapis.com",
    "clouderrorreporting.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "aiplatform.googleapis.com",
    "storage.googleapis.com"
  ])

  service            = each.key
  disable_on_destroy = false
}

# Service Accounts
resource "google_service_account" "orchestrator" {
  account_id   = "affiliate-flow-orchestrator"
  display_name = "Affiliate Flow Master Orchestrator"
  description  = "Primary service account for AI orchestration"
}

resource "google_service_account" "content_gen" {
  account_id   = "affiliate-flow-content-gen"
  display_name = "Affiliate Flow Content Generator"
  description  = "Service account for content generation services"
}

resource "google_service_account" "image_gen" {
  account_id   = "affiliate-flow-image-gen"
  display_name = "Affiliate Flow Image Generator"
  description  = "Service account for AI image generation"
}

resource "google_service_account" "analytics" {
  account_id   = "affiliate-flow-analytics"
  display_name = "Affiliate Flow Analytics"
  description  = "Service account for analytics and reporting"
}

# IAM Roles for Orchestrator
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

resource "google_project_iam_member" "orchestrator_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.orchestrator.email}"
}

# IAM Roles for Content Generator
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

# IAM Roles for Image Generator
resource "google_project_iam_member" "image_gen_ai" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.image_gen.email}"
}

resource "google_project_iam_member" "image_gen_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.image_gen.email}"
}

# IAM Roles for Analytics
resource "google_project_iam_member" "analytics_bigquery" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.analytics.email}"
}

resource "google_project_iam_member" "analytics_firestore" {
  project = var.project_id
  role    = "roles/datastore.viewer"
  member  = "serviceAccount:${google_service_account.analytics.email}"
}

# Secret Manager Secrets
resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "GEMINI_API_KEY"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "firebase_config" {
  secret_id = "FIREBASE_CONFIG"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "nordstrom_api_key" {
  secret_id = "NORDSTROM_API_KEY"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "webhook_secret" {
  secret_id = "WEBHOOK_SECRET"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "admin_api_key" {
  secret_id = "ADMIN_API_KEY"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "database_url" {
  secret_id = "DATABASE_URL"
  
  replication {
    auto {}
  }
}

# Cloud Storage Buckets
resource "google_storage_bucket" "content" {
  name          = "${var.project_id}-content"
  location      = var.region
  force_destroy = false
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket" "images" {
  name          = "${var.project_id}-images"
  location      = var.region
  force_destroy = false
  
  uniform_bucket_level_access = true
  
  cors {
    origin          = ["https://affiliateflow-abzfy.web.app"]
    method          = ["GET", "HEAD", "PUT", "POST"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "backups" {
  name          = "${var.project_id}-backups"
  location      = var.region
  force_destroy = false
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket" "temp" {
  name          = "${var.project_id}-temp"
  location      = var.region
  force_destroy = true
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    condition {
      age = 1
    }
    action {
      type = "Delete"
    }
  }
}

# Cloud Tasks Queues
resource "google_cloud_tasks_queue" "content_generation" {
  name     = "content-generation"
  location = var.region
  
  rate_limits {
    max_dispatches_per_second = 10
    max_concurrent_dispatches = 100
  }
  
  retry_config {
    max_attempts = 5
    max_backoff  = "3600s"
    min_backoff  = "1s"
  }
}

resource "google_cloud_tasks_queue" "image_generation" {
  name     = "image-generation"
  location = var.region
  
  rate_limits {
    max_dispatches_per_second = 5
    max_concurrent_dispatches = 50
  }
  
  retry_config {
    max_attempts = 3
    max_backoff  = "1800s"
    min_backoff  = "1s"
  }
}

resource "google_cloud_tasks_queue" "webhook_processing" {
  name     = "webhook-processing"
  location = var.region
  
  rate_limits {
    max_dispatches_per_second = 50
    max_concurrent_dispatches = 200
  }
  
  retry_config {
    max_attempts = 5
    max_backoff  = "600s"
    min_backoff  = "0.1s"
  }
}

resource "google_cloud_tasks_queue" "analytics_jobs" {
  name     = "analytics-jobs"
  location = var.region
  
  rate_limits {
    max_dispatches_per_second = 1
    max_concurrent_dispatches = 10
  }
  
  retry_config {
    max_attempts = 3
    max_backoff  = "7200s"
    min_backoff  = "5s"
  }
}

# Pub/Sub Topics
resource "google_pubsub_topic" "content_requests" {
  name = "content-requests"
  
  message_retention_duration = "86400s" # 1 day
}

resource "google_pubsub_topic" "image_requests" {
  name = "image-requests"
  
  message_retention_duration = "86400s"
}

resource "google_pubsub_topic" "webhook_events" {
  name = "webhook-events"
  
  message_retention_duration = "604800s" # 7 days
}

resource "google_pubsub_topic" "analytics_events" {
  name = "analytics-events"
  
  message_retention_duration = "2592000s" # 30 days
}

# Pub/Sub Subscriptions
resource "google_pubsub_subscription" "content_requests_sub" {
  name  = "content-requests-sub"
  topic = google_pubsub_topic.content_requests.name
  
  ack_deadline_seconds = 600
  
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}

resource "google_pubsub_subscription" "image_requests_sub" {
  name  = "image-requests-sub"
  topic = google_pubsub_topic.image_requests.name
  
  ack_deadline_seconds = 600
  
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}

# Cloud Scheduler Jobs (3 FREE jobs per month)
resource "google_cloud_scheduler_job" "daily_trend_discovery" {
  name             = "daily-trend-discovery"
  description      = "Daily trend discovery sweep"
  schedule         = "0 8 * * *"
  time_zone        = "America/New_York"
  attempt_deadline = "320s"
  region           = var.region
  
  http_target {
    http_method = "POST"
    uri         = "https://flow-orchestrator-292572827197.us-central1.run.app/trends/discover"
    
    oidc_token {
      service_account_email = google_service_account.orchestrator.email
    }
  }
  
  retry_config {
    retry_count = 3
  }
}

resource "google_cloud_scheduler_job" "weekly_analytics" {
  name             = "weekly-analytics"
  description      = "Weekly analytics report generation"
  schedule         = "0 9 * * 1"
  time_zone        = "America/New_York"
  attempt_deadline = "600s"
  region           = var.region
  
  http_target {
    http_method = "POST"
    uri         = "https://flow-orchestrator-292572827197.us-central1.run.app/analytics/weekly"
    
    oidc_token {
      service_account_email = google_service_account.orchestrator.email
    }
  }
  
  retry_config {
    retry_count = 2
  }
}

resource "google_cloud_scheduler_job" "daily_cleanup" {
  name             = "daily-cleanup"
  description      = "Daily cleanup of temporary data"
  schedule         = "0 2 * * *"
  time_zone        = "America/New_York"
  attempt_deadline = "1800s"
  region           = var.region
  
  http_target {
    http_method = "POST"
    uri         = "https://flow-orchestrator-292572827197.us-central1.run.app/maintenance/cleanup"
    
    oidc_token {
      service_account_email = google_service_account.orchestrator.email
    }
  }
  
  retry_config {
    retry_count = 1
  }
}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "affiliate_flow" {
  location      = var.region
  repository_id = "affiliate-flow"
  description   = "Docker images for Affiliate Flow services"
  format        = "DOCKER"
}

# Outputs
output "service_accounts" {
  description = "Created service account emails"
  value = {
    orchestrator = google_service_account.orchestrator.email
    content_gen  = google_service_account.content_gen.email
    image_gen    = google_service_account.image_gen.email
    analytics    = google_service_account.analytics.email
  }
}

output "storage_buckets" {
  description = "Created storage bucket names"
  value = {
    content = google_storage_bucket.content.name
    images  = google_storage_bucket.images.name
    backups = google_storage_bucket.backups.name
    temp    = google_storage_bucket.temp.name
  }
}

output "cloud_tasks_queues" {
  description = "Created Cloud Tasks queue names"
  value = {
    content_generation  = google_cloud_tasks_queue.content_generation.name
    image_generation    = google_cloud_tasks_queue.image_generation.name
    webhook_processing  = google_cloud_tasks_queue.webhook_processing.name
    analytics_jobs      = google_cloud_tasks_queue.analytics_jobs.name
  }
}

output "pubsub_topics" {
  description = "Created Pub/Sub topic names"
  value = {
    content_requests = google_pubsub_topic.content_requests.name
    image_requests   = google_pubsub_topic.image_requests.name
    webhook_events   = google_pubsub_topic.webhook_events.name
    analytics_events = google_pubsub_topic.analytics_events.name
  }
}

output "scheduler_jobs" {
  description = "Created Cloud Scheduler job names"
  value = {
    daily_trend_discovery = google_cloud_scheduler_job.daily_trend_discovery.name
    weekly_analytics      = google_cloud_scheduler_job.weekly_analytics.name
    daily_cleanup         = google_cloud_scheduler_job.daily_cleanup.name
  }
}

output "artifact_registry" {
  description = "Artifact Registry repository"
  value       = google_artifact_registry_repository.affiliate_flow.name
}
