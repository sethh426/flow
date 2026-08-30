variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "affiliate-flow-prod"
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
  default     = "affiliate-flow-cluster"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "gemini_api_key" {
  description = "Gemini API key for AI services"
  type        = string
  sensitive   = true
}

variable "nordstrom_api_key" {
  description = "Nordstrom API key for product data"
  type        = string
  sensitive   = true
  default     = ""
}

variable "notification_email" {
  description = "Email for monitoring alerts"
  type        = string
}

variable "domain_name" {
  description = "Custom domain for the application"
  type        = string
  default     = ""
}

variable "enable_backup" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "min_nodes" {
  description = "Minimum number of nodes in GKE cluster"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum number of nodes in GKE cluster"
  type        = number
  default     = 10
}
