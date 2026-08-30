variable "project_id" {
  type = string
}

variable "notification_email" {
  type = string
}

# Notification Channel
resource "google_monitoring_notification_channel" "email" {
  display_name = "Email Notifications"
  type         = "email"
  project      = var.project_id

  labels = {
    email_address = var.notification_email
  }
}

# Alert Policy - High Error Rate
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate"
  combiner     = "OR"
  project      = var.project_id

  conditions {
    display_name = "Error rate > 5%"
    
    condition_threshold {
      filter          = "resource.type=\"k8s_container\" AND metric.type=\"logging.googleapis.com/user/error_count\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Alert Policy - High Latency
resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "High API Latency"
  combiner     = "OR"
  project      = var.project_id

  conditions {
    display_name = "P95 latency > 2s"
    
    condition_threshold {
      filter          = "resource.type=\"k8s_container\" AND metric.type=\"custom.googleapis.com/api/latency\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 2000
      
      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_PERCENTILE_95"
        cross_series_reducer = "REDUCE_PERCENTILE_95"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
}

# Alert Policy - High AI Cost
resource "google_monitoring_alert_policy" "high_ai_cost" {
  display_name = "High AI Costs"
  combiner     = "OR"
  project      = var.project_id

  conditions {
    display_name = "Daily AI cost > $100"
    
    condition_threshold {
      filter          = "resource.type=\"global\" AND metric.type=\"custom.googleapis.com/ai/daily_cost\""
      duration        = "3600s"
      comparison      = "COMPARISON_GT"
      threshold_value = 100
      
      aggregations {
        alignment_period   = "3600s"
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
}

# Uptime Check
resource "google_monitoring_uptime_check_config" "https" {
  display_name = "Affiliate Flow HTTPS Check"
  timeout      = "10s"
  period       = "60s"
  project      = var.project_id

  http_check {
    path         = "/"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = "flow-69826693-f6d27.web.app"
    }
  }
}

# Outputs
output "notification_channel_id" {
  value = google_monitoring_notification_channel.email.id
}
