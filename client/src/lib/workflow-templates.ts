// Vertical-specific workflow templates with proven conversion benchmarks

export interface WorkflowTemplate {
  id: string;
  vertical: string;
  name: string;
  description: string;
  conversionBenchmark: string;
  icon: string;
  color: string;
  nodes: any[];
  edges: any[];
  automations: WorkflowAutomation[];
  integrations: string[];
  kpis: string[];
}

export interface WorkflowAutomation {
  id: string;
  trigger: string;
  action: string;
  timing: string;
  condition?: string;
}

// DROPSHIPPING / ONLINE RETAIL TEMPLATE
export const dropshippingTemplate: WorkflowTemplate = {
  id: 'dropshipping',
  vertical: 'Online Retail / Dropshipping',
  name: 'E-commerce Conversion Optimizer',
  description: 'Abandoned cart recovery + dynamic pricing + review automation',
  conversionBenchmark: '6.82% (Food/Bev) | 4.59% (Beauty) | 2-4% (Fashion)',
  icon: '📦',
  color: '#2196f3',
  nodes: [
    { id: '1', type: 'trigger', data: { label: 'Cart Abandoned' }, position: { x: 100, y: 100 } },
    { id: '2', type: 'wait', data: { label: 'Wait 1 Hour' }, position: { x: 100, y: 200 } },
    { id: '3', type: 'email', data: { label: 'Send Reminder Email' }, position: { x: 100, y: 300 } },
    { id: '4', type: 'wait', data: { label: 'Wait 24 Hours' }, position: { x: 100, y: 400 } },
    { id: '5', type: 'email', data: { label: 'Social Proof Email' }, position: { x: 100, y: 500 } },
    { id: '6', type: 'wait', data: { label: 'Wait 72 Hours' }, position: { x: 100, y: 600 } },
    { id: '7', type: 'email', data: { label: '10% Discount Offer' }, position: { x: 100, y: 700 } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
    { id: 'e5-6', source: '5', target: '6' },
    { id: 'e6-7', source: '6', target: '7' },
  ],
  automations: [
    {
      id: 'abandon-1hr',
      trigger: 'Cart abandoned for 1 hour',
      action: 'Send reminder email with product images',
      timing: '1 hour after abandonment',
    },
    {
      id: 'abandon-24hr',
      trigger: 'Still not purchased after 24 hours',
      action: 'Send social proof + testimonials',
      timing: '24 hours after first email',
    },
    {
      id: 'abandon-72hr',
      trigger: 'Still not purchased after 72 hours',
      action: 'Send 10% discount code',
      timing: '72 hours after first email',
      condition: 'Cart value > $50',
    },
    {
      id: 'review-request',
      trigger: 'Order delivered (7-14 days)',
      action: 'Request product review via email + SMS',
      timing: '7-14 days post-delivery',
    },
  ],
  integrations: [
    'Shopify GraphQL Admin API',
    'WooCommerce REST API v3',
    'Stripe Payments',
    'Klaviyo Email',
    'Printify (Print-on-Demand)',
    'DSers / AutoDS',
  ],
  kpis: [
    'Cart abandonment recovery rate (target: 10-30%)',
    'Email open rate (target: 15-25%)',
    'Conversion rate (target: 6-8%)',
    'Average order value',
    'Customer lifetime value',
  ],
};

// REAL ESTATE TEMPLATE
export const realEstateTemplate: WorkflowTemplate = {
  id: 'realEstate',
  vertical: 'Real Estate',
  name: '5-Minute Response & Lead Nurture',
  description: 'Instant response + 12-month nurture cycle + appointment booking',
  conversionBenchmark: '20%+ with automation | 0.4-1.2% without',
  icon: '🏡',
  color: '#4caf50',
  nodes: [
    { id: '1', type: 'trigger', data: { label: 'New Lead Inquiry' }, position: { x: 100, y: 100 } },
    { id: '2', type: 'action', data: { label: 'Send Instant Response (<5min)' }, position: { x: 100, y: 200 } },
    { id: '3', type: 'action', data: { label: 'Schedule Follow-up Call' }, position: { x: 100, y: 300 } },
    { id: '4', type: 'decision', data: { label: 'Response Received?' }, position: { x: 100, y: 400 } },
    { id: '5', type: 'sequence', data: { label: 'Long-term Nurture (12mo)' }, position: { x: 300, y: 500 } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5', label: 'No response' },
  ],
  automations: [
    {
      id: 'instant-response',
      trigger: 'New lead submits inquiry',
      action: 'Send personalized email + SMS within 5 minutes',
      timing: 'Immediate (78% of buyers choose first responder)',
    },
    {
      id: 'nurture-days-1-3',
      trigger: 'Lead enrolled in nurture',
      action: 'Send daily emails (property matches, market updates)',
      timing: 'Days 1-3',
    },
    {
      id: 'nurture-weeks-1-8',
      trigger: 'After initial contact',
      action: 'Weekly valuable content emails',
      timing: 'Weeks 1-8',
    },
    {
      id: 'nurture-months-3-6',
      trigger: 'Mid-cycle nurture',
      action: 'Bi-weekly check-ins',
      timing: 'Months 3-6',
    },
    {
      id: 'nurture-6plus',
      trigger: 'Long-term nurture',
      action: 'Monthly + quarterly 9-word emails',
      timing: '6+ months',
    },
    {
      id: 'price-drop-alert',
      trigger: 'Saved property price drops',
      action: 'Send instant alert via email + SMS',
      timing: 'Within 1 hour of price change',
    },
  ],
  integrations: [
    'Follow Up Boss CRM',
    'kvCORE',
    'LionDesk',
    'ShowingTime+ (self-booking)',
    'DocuSign Rooms',
    'MLS/IDX Feeds',
  ],
  kpis: [
    'Response time (target: < 5 minutes)',
    'Lead conversion rate (target: 20%+)',
    'Touchpoints per lead (target: 9-16)',
    'Appointment booking rate',
    'Average days to close',
  ],
};

// AUTOMOTIVE TEMPLATE
export const automotiveTemplate: WorkflowTemplate = {
  id: 'automotive',
  vertical: 'Automotive Dealership',
  name: 'Test Drive Scheduler + F&I Automation',
  description: 'Self-service test drive booking + digital F&I workflow',
  conversionBenchmark: '52% profit increase | 86% faster funding',
  icon: '🚗',
  color: '#ff9800',
  nodes: [
    { id: '1', type: 'trigger', data: { label: 'Lead Shows Interest' }, position: { x: 100, y: 100 } },
    { id: '2', type: 'action', data: { label: 'Offer Test Drive Booking' }, position: { x: 100, y: 200 } },
    { id: '3', type: 'reminder', data: { label: 'Send Reminders (48h, 24h, day-of)' }, position: { x: 100, y: 300 } },
    { id: '4', type: 'action', data: { label: 'Vehicle Prep Alert to Staff' }, position: { x: 100, y: 400 } },
    { id: '5', type: 'trigger', data: { label: 'Post Test Drive' }, position: { x: 100, y: 500 } },
    { id: '6', type: 'action', data: { label: 'F&I Application (Multi-lender)' }, position: { x: 100, y: 600 } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
    { id: 'e5-6', source: '5', target: '6' },
  ],
  automations: [
    {
      id: 'test-drive-reminder-48h',
      trigger: 'Test drive scheduled',
      action: 'Send confirmation email + calendar invite',
      timing: '48 hours before',
    },
    {
      id: 'test-drive-reminder-24h',
      trigger: 'Test drive in 24 hours',
      action: 'Send reminder SMS',
      timing: '24 hours before',
    },
    {
      id: 'test-drive-reminder-day',
      trigger: 'Test drive today',
      action: 'Send morning reminder',
      timing: 'Day of appointment',
    },
    {
      id: 'vehicle-prep',
      trigger: 'Test drive in 2 hours',
      action: 'Alert service team to prep vehicle',
      timing: '2 hours before',
    },
    {
      id: 'fi-multi-lender',
      trigger: 'Customer ready to finance',
      action: 'Submit to multiple lenders simultaneously',
      timing: 'Immediate (86% faster funding)',
    },
  ],
  integrations: [
    'vAuto (pricing)',
    'Dealertrack DMS',
    'VinSolutions CRM',
    'KBB Instant Cash Offer',
    'Carfax API',
    'AutoTrader / Cars.com',
  ],
  kpis: [
    'Test drive no-show rate (target: < 40%)',
    'Test drive to sale conversion',
    'F&I penetration rate',
    'Days to funding (target: same-day)',
    'Profit per vehicle (target: +52%)',
  ],
};

// TRADE SERVICES TEMPLATE
export const tradeServicesTemplate: WorkflowTemplate = {
  id: 'tradeServices',
  vertical: 'Trade Services',
  name: 'Quote Follow-up + Good-Better-Best Pricing',
  description: 'Tiered pricing + automated follow-ups + maintenance reminders',
  conversionBenchmark: '35% revenue increase | 15-25% quote recovery',
  icon: '🔧',
  color: '#9c27b0',
  nodes: [
    { id: '1', type: 'trigger', data: { label: 'Quote Requested' }, position: { x: 100, y: 100 } },
    { id: '2', type: 'action', data: { label: 'Generate Good-Better-Best Quote' }, position: { x: 100, y: 200 } },
    { id: '3', type: 'wait', data: { label: 'Day 3 Follow-up' }, position: { x: 100, y: 300 } },
    { id: '4', type: 'wait', data: { label: 'Day 7 Follow-up' }, position: { x: 100, y: 400 } },
    { id: '5', type: 'wait', data: { label: 'Day 14 Final Offer' }, position: { x: 100, y: 500 } },
    { id: '6', type: 'trigger', data: { label: 'Job Completed' }, position: { x: 300, y: 300 } },
    { id: '7', type: 'action', data: { label: 'Schedule Maintenance Reminder' }, position: { x: 300, y: 400 } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
    { id: 'e6-7', source: '6', target: '7' },
  ],
  automations: [
    {
      id: 'quote-day-3',
      trigger: 'Quote sent, no response',
      action: 'Send friendly check-in email',
      timing: 'Day 3',
    },
    {
      id: 'quote-day-7',
      trigger: 'Still no response',
      action: 'Send value-add content (how-to guide)',
      timing: 'Day 7',
    },
    {
      id: 'quote-day-14',
      trigger: 'Final follow-up',
      action: 'Send limited-time discount (5-10%)',
      timing: 'Day 14',
    },
    {
      id: 'invoice-reminder-day-3',
      trigger: 'Invoice unpaid',
      action: 'Send friendly reminder',
      timing: 'Day 3 past due',
    },
    {
      id: 'maintenance-6mo',
      trigger: '6 months since service',
      action: 'Send maintenance reminder (30-40% conversion)',
      timing: '6 months post-service',
    },
    {
      id: 'service-agreement-renewal',
      trigger: '30 days before expiration',
      action: 'Send renewal offer (70-80% conversion vs 40-50% manual)',
      timing: '30 days before expiration',
    },
  ],
  integrations: [
    'ServiceTitan ($5M+ revenue)',
    'Jobber ($500K-$5M)',
    'Housecall Pro (<$500K)',
    'CompanyCam (before/after photos)',
    'QuickBooks / Sage',
    'Stripe / ACH payments',
  ],
  kpis: [
    'Quote-to-job conversion (target: +15-25%)',
    'Average ticket size (target: +15-20% with tiered pricing)',
    'Days sales outstanding (target: -40% reduction)',
    'Maintenance conversion (target: 30-40%)',
    'Service agreement renewals (target: 70-80%)',
  ],
};

// DIGITAL PRODUCTS / SAAS TEMPLATE
export const digitalProductsTemplate: WorkflowTemplate = {
  id: 'digitalProducts',
  vertical: 'Digital Products / SaaS',
  name: 'Webinar Funnel + Dunning + Product Launch',
  description: 'Webinar automation + failed payment recovery + launch sequences',
  conversionBenchmark: '5-10% live webinars | 57% trial-to-paid (B2C)',
  icon: '💻',
  color: '#00bcd4',
  nodes: [
    { id: '1', type: 'trigger', data: { label: 'Webinar Registration' }, position: { x: 100, y: 100 } },
    { id: '2', type: 'sequence', data: { label: 'Pre-Webinar Reminders' }, position: { x: 100, y: 200 } },
    { id: '3', type: 'event', data: { label: 'Live Webinar' }, position: { x: 100, y: 300 } },
    { id: '4', type: 'decision', data: { label: 'Attended?' }, position: { x: 100, y: 400 } },
    { id: '5', type: 'action', data: { label: 'Send Replay + Offer' }, position: { x: 300, y: 500 } },
    { id: '6', type: 'action', data: { label: 'Send Live Offer' }, position: { x: 100, y: 500 } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5', label: 'No' },
    { id: 'e4-6', source: '4', target: '6', label: 'Yes' },
  ],
  automations: [
    {
      id: 'webinar-7d',
      trigger: 'Registration confirmed',
      action: 'Send confirmation + calendar invite',
      timing: '7 days before',
    },
    {
      id: 'webinar-3d',
      trigger: 'Webinar in 3 days',
      action: 'Send reminder + teaser content',
      timing: '3 days before',
    },
    {
      id: 'webinar-1d',
      trigger: 'Webinar tomorrow',
      action: 'Send final reminder',
      timing: '1 day before',
    },
    {
      id: 'webinar-6h',
      trigger: 'Webinar in 6 hours',
      action: 'Send "starting soon" alert',
      timing: '6 hours before',
    },
    {
      id: 'webinar-1h',
      trigger: 'Webinar in 1 hour',
      action: 'Send join link',
      timing: '1 hour before',
    },
    {
      id: 'payment-failed-immediate',
      trigger: 'Payment declined',
      action: 'Send friendly notification to update card',
      timing: 'Immediate',
    },
    {
      id: 'payment-failed-day-3',
      trigger: 'Payment fails',
      action: 'Direct request to update',
      timing: 'Day 3',
    },
    {
      id: 'payment-failed-day-7',
      trigger: 'Still failed after 7 days',
      action: 'Emotional reminder (value they will lose)',
      timing: 'Day 7',
    },
  ],
  integrations: [
    'Stripe (Smart Retries)',
    'Gumroad',
    'Teachable / Kajabi',
    'ConvertKit / ActiveCampaign',
    'Zoom',
    'ChartMogul (MRR tracking)',
  ],
  kpis: [
    'Webinar registration rate (target: 40-60%)',
    'Show-up rate (target: 25-40%)',
    'Live conversion rate (target: 5-10%)',
    'Trial-to-paid (target: 57% B2C)',
    'Churn recovery (target: 40-50% of failed payments)',
  ],
};

// PERSONAL BRAND TEMPLATE
export const personalBrandTemplate: WorkflowTemplate = {
  id: 'personalBrand',
  vertical: 'Personal Brand / Creator',
  name: 'Discovery Call + Course Launch + Coaching Funnel',
  description: 'Speaking funnel + 90-day course launch + high-ticket coaching',
  conversionBenchmark: '$10M-$20M potential | 30-50% discovery call conversion',
  icon: '⭐',
  color: '#e91e63',
  nodes: [
    { id: '1', type: 'trigger', data: { label: 'Discovery Call Booked' }, position: { x: 100, y: 100 } },
    { id: '2', type: 'action', data: { label: 'Send Pre-Call Questionnaire' }, position: { x: 100, y: 200 } },
    { id: '3', type: 'action', data: { label: 'Conduct Discovery Call' }, position: { x: 100, y: 300 } },
    { id: '4', type: 'decision', data: { label: 'Qualified?' }, position: { x: 100, y: 400 } },
    { id: '5', type: 'action', data: { label: 'Send Proposal + Contract' }, position: { x: 100, y: 500 } },
    { id: '6', type: 'action', data: { label: 'Follow-up Sequence' }, position: { x: 300, y: 500 } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5', label: 'Yes' },
    { id: 'e4-6', source: '4', target: '6', label: 'No' },
  ],
  automations: [
    {
      id: 'discovery-confirmation',
      trigger: 'Call booked',
      action: 'Send confirmation + calendar invite + questionnaire',
      timing: 'Immediate',
    },
    {
      id: 'discovery-reminder',
      trigger: 'Call in 24 hours',
      action: 'Send reminder with prep tips',
      timing: '24 hours before',
    },
    {
      id: 'course-seed-30d',
      trigger: 'Launch sequence started',
      action: 'Share valuable content, gauge interest',
      timing: 'Days 1-30 (Seed phase)',
    },
    {
      id: 'course-build-60d',
      trigger: 'After seed phase',
      action: 'Pre-sell to "First Ten" students',
      timing: 'Days 31-60 (Build phase)',
    },
    {
      id: 'course-launch-90d',
      trigger: 'Cart open',
      action: 'Daily emails with urgency, scarcity',
      timing: 'Days 61-90 (4-7 day cart open)',
    },
    {
      id: 'speaking-inquiry',
      trigger: 'Speaking request received',
      action: 'Send speaker kit + fee structure',
      timing: 'Within 24 hours',
    },
  ],
  integrations: [
    'Calendly / Acuity',
    'Dubsado / HoneyBook',
    'Kajabi / Teachable',
    'ConvertKit',
    'Stripe / PayPal',
    'Zoom',
  ],
  kpis: [
    'Discovery call conversion (target: 30-50%)',
    'Course launch conversion (target: 2-5% of email list)',
    'Average coaching package value',
    'Speaking engagement bookings',
    'MRR from recurring programs',
  ],
};

// Export all templates
export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  dropshipping: dropshippingTemplate,
  realEstate: realEstateTemplate,
  automotive: automotiveTemplate,
  tradeServices: tradeServicesTemplate,
  digitalProducts: digitalProductsTemplate,
  personalBrand: personalBrandTemplate,
};

// Helper function to get template by vertical
export const getTemplateByVertical = (vertical: string): WorkflowTemplate | null => {
  return WORKFLOW_TEMPLATES[vertical] || null;
};

// Helper function to get recommended integrations
export const getRecommendedIntegrations = (vertical: string): string[] => {
  const template = getTemplateByVertical(vertical);
  return template?.integrations || [];
};

// Helper function to get KPIs
export const getVerticalKPIs = (vertical: string): string[] => {
  const template = getTemplateByVertical(vertical);
  return template?.kpis || [];
};
