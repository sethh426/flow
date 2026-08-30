terraform {
  required_version = ">= 1.5"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  backend "gcs" {
    bucket = "affiliate-flow-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Project configuration
resource "google_project_service" "required_apis" {
  for_each = toset([
    "container.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "aiplatform.googleapis.com",
    "bigquery.googleapis.com",
    "firestore.googleapis.com",
    "cloudtasks.googleapis.com",
    "compute.googleapis.com",
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

# Service Accounts
module "service_accounts" {
  source = "./modules/service-accounts"
  
  project_id = var.project_id
  
  depends_on = [google_project_service.required_apis]
}

# Networking
module "networking" {
  source = "./modules/networking"
  
  project_id = var.project_id
  region     = var.region
  
  depends_on = [google_project_service.required_apis]
}

# GKE Cluster
module "gke" {
  source = "./modules/gke"
  
  project_id    = var.project_id
  region        = var.region
  cluster_name  = var.cluster_name
  network_name  = module.networking.network_name
  subnet_name   = module.networking.subnet_name
  
  depends_on = [module.networking]
}

# Data Layer
module "data_layer" {
  source = "./modules/data-layer"
  
  project_id = var.project_id
  region     = var.region
  
  depends_on = [google_project_service.required_apis]
}

# AI Infrastructure
module "ai_infrastructure" {
  source = "./modules/ai-infrastructure"
  
  project_id          = var.project_id
  region              = var.region
  gemini_api_key      = var.gemini_api_key
  orchestrator_sa     = module.service_accounts.orchestrator_email
  content_gen_sa      = module.service_accounts.content_gen_email
  
  depends_on = [module.service_accounts]
}

# Monitoring and Alerting
module "monitoring" {
  source = "./modules/monitoring"
  
  project_id           = var.project_id
  notification_email   = var.notification_email
  
  depends_on = [google_project_service.required_apis]
}

# Outputs
output "gke_cluster_name" {
  value = module.gke.cluster_name
}

output "gke_cluster_endpoint" {
  value     = module.gke.cluster_endpoint
  sensitive = true
}

output "artifact_registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/affiliate-flow-images"
}

output "orchestrator_service_account" {
  value = module.service_accounts.orchestrator_email
}
