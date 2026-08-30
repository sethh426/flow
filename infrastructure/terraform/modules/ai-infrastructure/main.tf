variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "orchestrator_sa" {
  type = string
}

variable "content_gen_sa" {
  type = string
}

# Secret Manager - Gemini API Key
resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "gemini-api-key"
  project   = var.project_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "gemini_api_key_version" {
  secret      = google_secret_manager_secret.gemini_api_key.id
  secret_data = var.gemini_api_key
}

# IAM for secret access
resource "google_secret_manager_secret_iam_member" "orchestrator_gemini_access" {
  secret_id = google_secret_manager_secret.gemini_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.orchestrator_sa}"
}

resource "google_secret_manager_secret_iam_member" "content_gen_gemini_access" {
  secret_id = google_secret_manager_secret.gemini_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.content_gen_sa}"
}

# Artifact Registry
resource "google_artifact_registry_repository" "images" {
  location      = var.region
  repository_id = "affiliate-flow-images"
  description   = "Affiliate Flow container images"
  format        = "DOCKER"
  project       = var.project_id
}

# Outputs
output "artifact_registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.images.repository_id}"
}
