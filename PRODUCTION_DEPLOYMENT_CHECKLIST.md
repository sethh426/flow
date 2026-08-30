# Production Deployment Checklist

## **Pre-Deployment (1-2 Days Before)**

### Environment Setup
- [ ] **GCP Project Created** (`gcloud projects create affiliate-flow-prod`)
- [ ] **Billing Account Linked** (verify $500/month budget alert)
- [ ] **APIs Enabled** (20+ services - see infrastructure/gcp/README.md)
- [ ] **Domain Registered** (affiliateflow.ai or similar)
- [ ] **SSL Certificates** (Let's Encrypt or GCP-managed)
- [ ] **CDN Configured** (Cloud CDN for static assets)

### Security
- [ ] **Workload Identity Federation** (no service account keys)
- [ ] **Secret Manager Setup** (4+ API keys stored)
- [ ] **Firestore Security Rules** (tenant isolation enabled)
- [ ] **VPC Service Controls** (data exfiltration prevention)
- [ ] **IAM Roles Configured** (principle of least privilege)
- [ ] **Audit Logging Enabled** (7-day retention minimum)
- [ ] **DDoS Protection** (Cloud Armor policies)

### Database
- [ ] **Firestore Indexes Created** (3 composite indexes)
- [ ] **Backup Policy** (daily automated backups)
- [ ] **Data Migration Plan** (if migrating from existing system)
- [ ] **Test Data Removed** (production-only data)

### Third-Party Integrations
- [ ] **Shopify App Approved** (OAuth credentials)
- [ ] **Stripe Account Verified** (live API keys)
- [ ] **Klaviyo Account** (API key, 50K req/day limit)
- [ ] **Twilio Account** (SMS credits loaded)
- [ ] **Google Analytics 4** (tracking ID configured)

---

## **Day of Deployment (Go-Live)**

### Code Deployment
- [ ] **Git Tag Created** (`v1.0.0-production`)
- [ ] **Next.js Build Successful** (`npm run build` passes)
- [ ] **Environment Variables Set** (`.env.production`)
- [ ] **Cloud Functions Deployed** (business-classifier, workflow-executor)
- [ ] **Cloud Run Services** (Next.js app, webhook-receiver)
- [ ] **Static Assets Uploaded** (to Cloud Storage + CDN)

### Infrastructure
- [ ] **Pub/Sub Topics Created** (4 topics)
- [ ] **Cloud Tasks Queues** (3 queues with rate limits)
- [ ] **Workflows Orchestrator** (YAML deployed)
- [ ] **Load Balancer Configured** (HTTPS redirect, health checks)
- [ ] **DNS Records Updated** (A/AAAA records to load balancer)

### Monitoring & Alerts
- [ ] **Error Reporting** (GCP Error Reporting enabled)
- [ ] **Uptime Checks** (5-minute intervals)
- [ ] **Alert Policies** (CPU > 80%, error rate > 1%, latency > 2s)
- [ ] **Dashboards Created** (metrics overview, workflow performance)
- [ ] **PagerDuty/OpsGenie** (on-call rotation configured)
- [ ] **Status Page** (status.affiliateflow.ai)

### Testing
- [ ] **Smoke Tests Pass** (critical path: signup → onboarding → workflow → execution)
- [ ] **Performance Tests** (Lighthouse score > 90)
- [ ] **Load Tests** (Artillery/k6: 100 concurrent users)
- [ ] **Security Scan** (OWASP ZAP or similar)
- [ ] **Accessibility Audit** (WCAG 2.1 AA compliance)

---

## **Post-Deployment (First 24 Hours)**

### Validation
- [ ] **End-to-End User Flow** (complete onboarding as real user)
- [ ] **Workflow Execution** (trigger abandoned cart, verify emails sent)
- [ ] **Integration Tests** (Shopify webhook received, Stripe payment processed)
- [ ] **Analytics Tracking** (GA4 events firing correctly)
- [ ] **Error Logs Review** (no critical errors in Cloud Logging)

### Performance
- [ ] **Response Times < 200ms** (median p50)
- [ ] **Database Queries Optimized** (Firestore read/write counts)
- [ ] **CDN Cache Hit Rate > 80%**
- [ ] **Memory Usage Stable** (no leaks detected)

### Business Metrics
- [ ] **First User Signed Up** ✅
- [ ] **First Workflow Created** ✅
- [ ] **First Automation Triggered** ✅
- [ ] **First Conversion Tracked** ✅
- [ ] **Billing Integration Working** (Stripe subscription created)

### Communication
- [ ] **Team Notified** (Slack/Teams announcement)
- [ ] **Stakeholders Updated** (go-live email sent)
- [ ] **Social Media Post** (product launch announcement)
- [ ] **Blog Post Published** (launch story, product features)

---

## **Week 1 Checklist**

### Customer Success
- [ ] **10 Beta Users Onboarded** (target achieved)
- [ ] **User Feedback Collected** (survey sent, 5+ responses)
- [ ] **Support Tickets < 5** (Zendesk/Intercom)
- [ ] **Average Onboarding Time < 30 min** (validated)

### Product
- [ ] **Classification Accuracy > 95%** (business classifier validated)
- [ ] **Workflow Completion Rate > 85%** (automated workflows)
- [ ] **A/B Test Started** (email subject lines, 2 variants)

### Infrastructure
- [ ] **Uptime > 99.5%** (target: 99.9%)
- [ ] **Cost Under Budget** ($336-500/month target)
- [ ] **Backup Restoration Tested** (disaster recovery drill)

### Compliance
- [ ] **Privacy Policy Published** (GDPR, CCPA compliant)
- [ ] **Terms of Service** (attorney reviewed)
- [ ] **Cookie Banner** (consent management)
- [ ] **Data Processing Agreement** (for enterprise customers)

---

## **Month 1 Milestones**

### Growth
- [ ] **50 Active Users** (paying customers)
- [ ] **$5K MRR** (monthly recurring revenue)
- [ ] **80%+ Retention** (users active after 30 days)
- [ ] **NPS Score > 40** (Net Promoter Score)

### Product Enhancements
- [ ] **2nd Vertical Launched** (expand beyond initial vertical)
- [ ] **Mobile App Beta** (iOS/Android - optional)
- [ ] **API Documentation** (for advanced users)
- [ ] **Zapier Integration** (1,000+ app connections)

### Team
- [ ] **Customer Success Hire** (if > 50 users)
- [ ] **Engineering Resources** (contractor or full-time)
- [ ] **Security Audit** (third-party penetration test)

---

## **Emergency Rollback Plan**

### If Critical Issue Detected
1. **Stop Traffic** (Cloud Load Balancer: pause new traffic)
2. **Rollback Code** (`gcloud run services update --image=PREVIOUS_VERSION`)
3. **Database Restore** (from latest backup if needed)
4. **Notify Users** (status page update, email if multi-hour outage)
5. **Post-Mortem** (within 48 hours, root cause analysis)

### Rollback Commands
```bash
# Rollback Cloud Run
gcloud run services update affiliate-flow-app \
  --region=us-central1 \
  --image=gcr.io/PROJECT_ID/affiliate-flow-app:PREVIOUS_TAG

# Rollback Cloud Function
gcloud functions deploy business-classifier \
  --region=us-central1 \
  --source=./previous-version

# Restore Firestore (if needed)
gcloud firestore import gs://PROJECT_ID-backups/TIMESTAMP
```

---

## **Success Criteria**

### Technical
- ✅ **Uptime: 99.5%+** (first month)
- ✅ **Response Time: < 200ms** (p50)
- ✅ **Error Rate: < 0.1%**
- ✅ **Classification Accuracy: 95%+**

### Business
- ✅ **10 Beta Users** (Week 1)
- ✅ **50 Paying Customers** (Month 1)
- ✅ **$5K MRR** (Month 1)
- ✅ **$20K MRR** (Month 3)

### Customer
- ✅ **Onboarding < 30 min**
- ✅ **First Workflow < 5 min**
- ✅ **Support Response < 2 hours**
- ✅ **NPS > 40**

---

## **Contact List**

### On-Call Rotation
- **Primary:** [Your Name] - [Phone] - [Email]
- **Secondary:** [Engineer 2] - [Phone] - [Email]
- **Escalation:** [CTO/Founder] - [Phone] - [Email]

### Vendor Support
- **GCP Support:** Premium tier (1-hour response)
- **Stripe Support:** support@stripe.com
- **Shopify Partners:** partners@shopify.com
- **Twilio Support:** help.twilio.com

### Internal
- **Engineering Team:** #engineering-alerts
- **Customer Success:** #customer-success
- **Executives:** #executive-updates

---

**Last Updated:** January 11, 2025  
**Owner:** Engineering Team  
**Next Review:** Weekly until Month 3, then monthly
