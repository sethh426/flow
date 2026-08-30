variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

# BigQuery Datasets
resource "google_bigquery_dataset" "affiliate_analytics" {
  dataset_id  = "affiliate_analytics"
  location    = "US"
  description = "Affiliate Flow analytics data"
  project     = var.project_id

  delete_contents_on_destroy = false
}

resource "google_bigquery_dataset" "affiliate_finance" {
  dataset_id  = "affiliate_finance"
  location    = "US"
  description = "Financial and billing data"
  project     = var.project_id

  delete_contents_on_destroy = false
}

resource "google_bigquery_dataset" "ai_metrics" {
  dataset_id  = "ai_metrics"
  location    = "US"
  description = "AI performance and cost metrics"
  project     = var.project_id

  delete_contents_on_destroy = false
}

# BigQuery Tables
resource "google_bigquery_table" "user_activity" {
  dataset_id = google_bigquery_dataset.affiliate_analytics.dataset_id
  table_id   = "user_activity"
  project    = var.project_id

  schema = jsonencode([
    { name = "user_id", type = "STRING", mode = "REQUIRED" },
    { name = "event_type", type = "STRING", mode = "REQUIRED" },
    { name = "event_timestamp", type = "TIMESTAMP", mode = "REQUIRED" },
    { name = "session_id", type = "STRING", mode = "NULLABLE" },
    { name = "page_url", type = "STRING", mode = "NULLABLE" },
    { name = "metadata", type = "JSON", mode = "NULLABLE" }
  ])

  time_partitioning {
    type  = "DAY"
    field = "event_timestamp"
  }
}

resource "google_bigquery_table" "product_performance" {
  dataset_id = google_bigquery_dataset.affiliate_analytics.dataset_id
  table_id   = "product_performance"
  project    = var.project_id

  schema = jsonencode([
    { name = "product_id", type = "STRING", mode = "REQUIRED" },
    { name = "user_id", type = "STRING", mode = "REQUIRED" },
    { name = "views", type = "INTEGER", mode = "NULLABLE" },
    { name = "clicks", type = "INTEGER", mode = "NULLABLE" },
    { name = "conversions", type = "INTEGER", mode = "NULLABLE" },
    { name = "revenue", type = "FLOAT", mode = "NULLABLE" },
    { name = "date", type = "DATE", mode = "REQUIRED" }
  ])

  time_partitioning {
    type  = "DAY"
    field = "date"
  }
}

resource "google_bigquery_table" "flowcoins_transactions" {
  dataset_id = google_bigquery_dataset.affiliate_finance.dataset_id
  table_id   = "flowcoins_transactions"
  project    = var.project_id

  schema = jsonencode([
    { name = "transaction_id", type = "STRING", mode = "REQUIRED" },
    { name = "user_id", type = "STRING", mode = "REQUIRED" },
    { name = "amount", type = "INTEGER", mode = "REQUIRED" },
    { name = "type", type = "STRING", mode = "REQUIRED" },
    { name = "timestamp", type = "TIMESTAMP", mode = "REQUIRED" },
    { name = "metadata", type = "JSON", mode = "NULLABLE" }
  ])

  time_partitioning {
    type  = "DAY"
    field = "timestamp"
  }
}

resource "google_bigquery_table" "generation_stats" {
  dataset_id = google_bigquery_dataset.ai_metrics.dataset_id
  table_id   = "generation_stats"
  project    = var.project_id

  schema = jsonencode([
    { name = "request_id", type = "STRING", mode = "REQUIRED" },
    { name = "user_id", type = "STRING", mode = "REQUIRED" },
    { name = "model", type = "STRING", mode = "REQUIRED" },
    { name = "input_tokens", type = "INTEGER", mode = "NULLABLE" },
    { name = "output_tokens", type = "INTEGER", mode = "NULLABLE" },
    { name = "latency_ms", type = "INTEGER", mode = "NULLABLE" },
    { name = "cost_usd", type = "FLOAT", mode = "NULLABLE" },
    { name = "timestamp", type = "TIMESTAMP", mode = "REQUIRED" }
  ])

  time_partitioning {
    type  = "DAY"
    field = "timestamp"
  }
}

# Cloud Tasks Queues
resource "google_cloud_tasks_queue" "ai_processing" {
  name     = "ai-processing-queue"
  location = var.region
  project  = var.project_id

  rate_limits {
    max_dispatches_per_second = 100
    max_concurrent_dispatches = 50
  }

  retry_config {
    max_attempts = 5
    min_backoff  = "10s"
    max_backoff  = "300s"
  }
}

resource "google_cloud_tasks_queue" "content_generation" {
  name     = "content-generation-queue"
  location = var.region
  project  = var.project_id

  rate_limits {
    max_dispatches_per_second = 50
    max_concurrent_dispatches = 25
  }

  retry_config {
    max_attempts = 3
    min_backoff  = "5s"
    max_backoff  = "120s"
  }
}

resource "google_cloud_tasks_queue" "product_mapping" {
  name     = "product-mapping-queue"
  location = var.region
  project  = var.project_id

  rate_limits {
    max_dispatches_per_second = 200
    max_concurrent_dispatches = 100
  }

  retry_config {
    max_attempts = 5
    min_backoff  = "5s"
    max_backoff  = "180s"
  }
}

# Cloud Storage Buckets
resource "google_storage_bucket" "user_content" {
  name     = "${var.project_id}-user-content"
  location = var.region
  project  = var.project_id

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "ai_images" {
  name     = "${var.project_id}-ai-images"
  location = var.region
  project  = var.project_id

  uniform_bucket_level_access = true
}

resource "google_storage_bucket" "backups" {
  name     = "${var.project_id}-backups"
  location = var.region
  project  = var.project_id

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

# Redis Instance
resource "google_redis_instance" "cache" {
  name           = "affiliate-flow-cache"
  tier           = "STANDARD_HA"
  memory_size_gb = 5
  region         = var.region
  project        = var.project_id

  redis_version     = "REDIS_7_0"
  auth_enabled      = true
  transit_encryption_mode = "SERVER_AUTHENTICATION"

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 2
        minutes = 0
      }
    }
  }
}

# Outputs
output "redis_host" {
  value = google_redis_instance.cache.host
}

output "redis_port" {
  value = google_redis_instance.cache.port
}
