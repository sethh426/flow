/**
 * Pre-built Workflow Templates
 * 
 * Ready-to-use workflow templates for common affiliate marketing scenarios
 */

import { WorkflowTemplate, WorkflowStage } from '../types/workflow';

// ============================================================================
// TEMPLATE 1: PHYSICAL PRODUCT PROMOTION
// ============================================================================

export const physicalProductTemplate: WorkflowTemplate = {
  id: 'physical-product-standard',
  name: 'Physical Product Affiliate Flow',
  description: 'Complete automation for promoting physical products (Amazon, retail affiliates). Includes content creation, multi-platform publishing, and conversion tracking.',
  productType: 'physical',
  category: 'E-commerce',
  icon: '📦',
  estimatedSetupTime: 15, // minutes
  estimatedAutomation: 90, // percentage
  requiredIntegrations: ['amazon', 'instagram', 'pinterest'],
  popularity: 0,
  
  stages: [
    {
      id: 'stage-1',
      name: 'Product Discovery',
      description: 'Import product and generate affiliate link',
      order: 1,
      triggers: [
        {
          id: 'trigger-manual',
          type: 'manual',
          config: {
            type: 'manual',
            requireConfirmation: false
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-fetch-product',
          type: 'fetch_data',
          name: 'Fetch Product Details',
          description: 'Scrape product information from URL',
          config: {
            source: 'product_url',
            extract: ['name', 'price', 'images', 'description']
          }
        },
        {
          id: 'action-generate-link',
          type: 'generate_affiliate_link',
          name: 'Generate Affiliate Link',
          description: 'Create tracked affiliate link',
          config: {
            network: 'amazon',
            trackingParams: {
              source: 'instagram',
              campaign: 'organic'
            }
          }
        }
      ],
      conditions: [
        {
          id: 'condition-price',
          field: 'product.price',
          operator: 'greater_than',
          value: 0,
          logic: 'AND'
        }
      ],
      settings: {
        timeout: 30000,
        continueOnError: false
      }
    },
    
    {
      id: 'stage-2',
      name: 'Content Creation',
      description: 'Generate marketing content',
      order: 2,
      triggers: [
        {
          id: 'trigger-previous',
          type: 'previous_stage',
          config: {
            type: 'previous_stage',
            stageId: 'stage-1',
            condition: 'success'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-generate-images',
          type: 'generate_content',
          name: 'Generate Product Images',
          description: 'Create 3 product showcase images',
          config: {
            templateId: 'product-card',
            count: 3,
            variations: ['lifestyle', 'closeup', 'infographic']
          }
        },
        {
          id: 'action-generate-copy',
          type: 'generate_content',
          name: 'Generate Social Copy',
          description: 'Create Instagram caption',
          config: {
            type: 'instagram_caption',
            tone: 'enthusiastic',
            includeHashtags: true,
            maxLength: 2200
          }
        }
      ],
      conditions: [],
      settings: {
        parallel: true, // Generate images and copy simultaneously
        timeout: 60000
      }
    },
    
    {
      id: 'stage-3',
      name: 'Multi-Platform Publishing',
      description: 'Post to social media',
      order: 3,
      triggers: [
        {
          id: 'trigger-scheduled',
          type: 'scheduled',
          config: {
            type: 'scheduled',
            cronExpression: '0 9 * * *', // 9 AM daily
            timezone: 'America/New_York'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-post-instagram',
          type: 'post_instagram',
          name: 'Post to Instagram',
          description: 'Share to Instagram feed',
          config: {
            platform: 'instagram',
            content: {
              imageUrl: '{{stage-2.images[0]}}',
              text: '{{stage-2.caption}}'
            }
          }
        },
        {
          id: 'action-post-pinterest',
          type: 'post_pinterest',
          name: 'Pin to Pinterest',
          description: 'Create Pinterest pin',
          config: {
            platform: 'pinterest',
            boardId: 'affiliate-products',
            content: {
              imageUrl: '{{stage-2.images[1]}}',
              text: '{{stage-2.caption}}',
              link: '{{stage-1.affiliateLink}}'
            }
          }
        }
      ],
      conditions: [],
      settings: {
        parallel: true,
        continueOnError: true
      }
    },
    
    {
      id: 'stage-4',
      name: 'Track Performance',
      description: 'Monitor clicks and conversions',
      order: 4,
      triggers: [
        {
          id: 'trigger-click',
          type: 'webhook',
          config: {
            type: 'webhook',
            url: '/api/track/click',
            method: 'POST'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-record-click',
          type: 'track_click',
          name: 'Record Click',
          description: 'Save click data to analytics',
          config: {
            trackingId: '{{stage-1.trackingId}}',
            metadata: {
              source: '{{trigger.source}}',
              device: '{{trigger.device}}'
            }
          }
        },
        {
          id: 'action-calculate-commission',
          type: 'calculate_commission',
          name: 'Calculate Commission',
          description: 'Compute expected earnings',
          config: {
            rate: 0.05, // 5% commission
            productPrice: '{{stage-1.product.price}}'
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 5000
      }
    }
  ]
};

// ============================================================================
// TEMPLATE 2: DIGITAL PRODUCT FUNNEL
// ============================================================================

export const digitalProductTemplate: WorkflowTemplate = {
  id: 'digital-product-funnel',
  name: 'Digital Product Sales Funnel',
  description: 'Automated funnel for software, courses, and digital products. Includes lead magnet, email sequence, and trial optimization.',
  productType: 'digital',
  category: 'Software & SaaS',
  icon: '💻',
  estimatedSetupTime: 25,
  estimatedAutomation: 85,
  requiredIntegrations: ['sendgrid', 'stripe'],
  popularity: 0,
  
  stages: [
    {
      id: 'stage-1',
      name: 'Product Analysis',
      description: 'Analyze product features and competitors',
      order: 1,
      triggers: [
        {
          id: 'trigger-manual',
          type: 'manual',
          config: { type: 'manual' },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-fetch-features',
          type: 'fetch_data',
          name: 'Fetch Product Features',
          config: {
            source: 'product_url',
            extract: ['features', 'pricing', 'reviews']
          }
        },
        {
          id: 'action-competitor-analysis',
          type: 'call_api',
          name: 'Analyze Competitors',
          config: {
            url: '/api/analyze-competitors',
            method: 'POST',
            body: {
              productName: '{{product.name}}',
              category: '{{product.category}}'
            }
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 30000
      }
    },
    
    {
      id: 'stage-2',
      name: 'Lead Magnet Creation',
      description: 'Generate free resource to attract leads',
      order: 2,
      triggers: [
        {
          id: 'trigger-previous',
          type: 'previous_stage',
          config: {
            type: 'previous_stage',
            stageId: 'stage-1',
            condition: 'success'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-create-checklist',
          type: 'generate_content',
          name: 'Create Free Checklist',
          config: {
            type: 'lead_magnet',
            format: 'pdf',
            topic: 'Getting Started with {{product.name}}'
          }
        },
        {
          id: 'action-create-landing-page',
          type: 'generate_content',
          name: 'Generate Landing Page',
          config: {
            type: 'landing_page',
            template: 'lead-capture',
            cta: 'Download Free Guide'
          }
        }
      ],
      conditions: [],
      settings: {
        parallel: true,
        timeout: 45000
      }
    },
    
    {
      id: 'stage-3',
      name: 'Email Nurture Sequence',
      description: 'Automated email series',
      order: 3,
      triggers: [
        {
          id: 'trigger-lead-signup',
          type: 'event',
          config: {
            type: 'event',
            eventSource: 'firestore',
            collection: 'leads',
            changeType: 'create'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-email-day-0',
          type: 'send_email',
          name: 'Welcome Email',
          config: {
            to: '{{lead.email}}',
            subject: 'Your Free Guide + Quick Start Tips',
            template: 'welcome',
            variables: {
              firstName: '{{lead.firstName}}',
              downloadLink: '{{stage-2.leadMagnetUrl}}'
            }
          }
        },
        {
          id: 'action-wait-2-days',
          type: 'wait',
          name: 'Wait 2 Days',
          config: {
            duration: 172800000 // 2 days in milliseconds
          }
        },
        {
          id: 'action-email-day-2',
          type: 'send_email',
          name: 'Educational Email',
          config: {
            to: '{{lead.email}}',
            subject: 'Common Mistakes to Avoid',
            template: 'education'
          }
        },
        {
          id: 'action-wait-3-days',
          type: 'wait',
          name: 'Wait 3 Days',
          config: {
            duration: 259200000 // 3 days
          }
        },
        {
          id: 'action-email-day-5',
          type: 'send_email',
          name: 'Affiliate Offer',
          config: {
            to: '{{lead.email}}',
            subject: 'Ready to Upgrade? Special Offer Inside',
            template: 'affiliate-offer',
            variables: {
              affiliateLink: '{{stage-1.affiliateLink}}',
              discount: '20%'
            }
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 604800000 // 7 days total
      }
    },
    
    {
      id: 'stage-4',
      name: 'Conversion Tracking',
      description: 'Track trial signups and purchases',
      order: 4,
      triggers: [
        {
          id: 'trigger-purchase',
          type: 'webhook',
          config: {
            type: 'webhook',
            url: '/api/track/conversion',
            method: 'POST'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-track-conversion',
          type: 'track_conversion',
          name: 'Record Conversion',
          config: {
            leadId: '{{lead.id}}',
            amount: '{{purchase.amount}}',
            commission: '{{purchase.amount * 0.30}}' // 30% commission
          }
        },
        {
          id: 'action-thank-you-email',
          type: 'send_email',
          name: 'Thank You Email',
          config: {
            to: '{{lead.email}}',
            subject: 'Thank You for Your Purchase!',
            template: 'thank-you'
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 10000
      }
    }
  ]
};

// ============================================================================
// TEMPLATE 3: SERVICE REFERRAL PROGRAM
// ============================================================================

export const serviceReferralTemplate: WorkflowTemplate = {
  id: 'service-referral',
  name: 'Service Referral Workflow',
  description: 'Generate referrals for consulting, coaching, and professional services. Builds authority and tracks commissions.',
  productType: 'service',
  category: 'Professional Services',
  icon: '👔',
  estimatedSetupTime: 20,
  estimatedAutomation: 78,
  requiredIntegrations: ['calendly', 'linkedin'],
  popularity: 0,
  
  stages: [
    {
      id: 'stage-1',
      name: 'Authority Content Creation',
      description: 'Create case study and social proof',
      order: 1,
      triggers: [
        {
          id: 'trigger-manual',
          type: 'manual',
          config: { type: 'manual' },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-create-case-study',
          type: 'generate_content',
          name: 'Generate Case Study',
          config: {
            type: 'case_study',
            template: 'success-story',
            includeMetrics: true
          }
        },
        {
          id: 'action-create-testimonial-graphic',
          type: 'generate_content',
          name: 'Design Testimonial Graphics',
          config: {
            type: 'testimonial_image',
            count: 3
          }
        }
      ],
      conditions: [],
      settings: {
        parallel: true,
        timeout: 60000
      }
    },
    
    {
      id: 'stage-2',
      name: 'Social Media Engagement',
      description: 'Share expertise on LinkedIn',
      order: 2,
      triggers: [
        {
          id: 'trigger-scheduled',
          type: 'scheduled',
          config: {
            type: 'scheduled',
            cronExpression: '0 10 * * 1,3,5', // Mon, Wed, Fri at 10 AM
            timezone: 'America/New_York'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-post-linkedin',
          type: 'call_api',
          name: 'Post to LinkedIn',
          config: {
            url: '/api/linkedin/share',
            method: 'POST',
            body: {
              content: '{{stage-1.caseStudy}}',
              image: '{{stage-1.testimonialGraphic}}'
            }
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 15000
      }
    },
    
    {
      id: 'stage-3',
      name: 'Lead Capture',
      description: 'Handle consultation requests',
      order: 3,
      triggers: [
        {
          id: 'trigger-form-submit',
          type: 'event',
          config: {
            type: 'event',
            eventSource: 'firestore',
            collection: 'consultation_requests',
            changeType: 'create'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-send-booking-link',
          type: 'send_email',
          name: 'Send Calendly Link',
          config: {
            to: '{{request.email}}',
            subject: 'Schedule Your Free Consultation',
            template: 'consultation-booking',
            variables: {
              calendlyLink: '{{service.calendlyUrl}}',
              referralTracking: '{{service.referralId}}'
            }
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 10000
      }
    },
    
    {
      id: 'stage-4',
      name: 'Commission Tracking',
      description: 'Track successful referrals',
      order: 4,
      triggers: [
        {
          id: 'trigger-booking-confirmed',
          type: 'webhook',
          config: {
            type: 'webhook',
            url: '/api/track/service-booked',
            method: 'POST'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-calculate-commission',
          type: 'calculate_commission',
          name: 'Calculate Referral Fee',
          config: {
            rate: 0.20, // 20% commission
            serviceValue: '{{booking.amount}}'
          }
        },
        {
          id: 'action-save-commission',
          type: 'save_to_database',
          name: 'Save Commission Record',
          config: {
            collection: 'commissions',
            data: {
              referralId: '{{service.referralId}}',
              amount: '{{commission}}',
              status: 'pending',
              paidAt: null
            }
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 10000
      }
    }
  ]
};

// ============================================================================
// TEMPLATE 4: SUBSCRIPTION/SAAS TRIAL OPTIMIZATION
// ============================================================================

export const subscriptionTrialTemplate: WorkflowTemplate = {
  id: 'saas-trial-optimization',
  name: 'SaaS Trial Conversion Flow',
  description: 'Optimize free trial conversions for SaaS and subscription products. Includes onboarding, activation, and upgrade prompts.',
  productType: 'subscription',
  category: 'SaaS & Software',
  icon: '🔄',
  estimatedSetupTime: 30,
  estimatedAutomation: 92,
  requiredIntegrations: ['stripe', 'sendgrid', 'segment'],
  popularity: 0,
  
  stages: [
    {
      id: 'stage-1',
      name: 'Trial Start Onboarding',
      description: 'Welcome new trial users',
      order: 1,
      triggers: [
        {
          id: 'trigger-trial-start',
          type: 'event',
          config: {
            type: 'event',
            eventSource: 'firestore',
            collection: 'users',
            changeType: 'update',
            filter: { 'subscription.status': 'trial' }
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-welcome-email',
          type: 'send_email',
          name: 'Send Welcome Email',
          config: {
            to: '{{user.email}}',
            subject: 'Welcome to {{product.name}}! Here is How to Get Started',
            template: 'trial-welcome',
            variables: {
              firstName: '{{user.firstName}}',
              trialDays: '{{product.trialDays}}',
              quickStartGuide: '{{product.quickStartUrl}}'
            }
          }
        },
        {
          id: 'action-track-activation',
          type: 'save_to_database',
          name: 'Track Activation Milestones',
          config: {
            collection: 'trial_tracking',
            data: {
              userId: '{{user.id}}',
              trialStartDate: '{{now}}',
              activationMilestones: []
            }
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 10000
      }
    },
    
    {
      id: 'stage-2',
      name: 'Feature Activation',
      description: 'Guide users to key features',
      order: 2,
      triggers: [
        {
          id: 'trigger-day-3',
          type: 'scheduled',
          config: {
            type: 'scheduled',
            cronExpression: '0 10 * * *',
            timezone: 'UTC'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-feature-highlight-email',
          type: 'send_email',
          name: 'Highlight Pro Feature',
          config: {
            to: '{{user.email}}',
            subject: 'Pro Tip: This Feature Will Save You Hours',
            template: 'feature-highlight'
          }
        }
      ],
      conditions: [
        {
          id: 'condition-not-activated',
          field: 'user.activationScore',
          operator: 'less_than',
          value: 50,
          logic: 'AND'
        }
      ],
      settings: {
        timeout: 10000
      }
    },
    
    {
      id: 'stage-3',
      name: 'Upgrade Prompts',
      description: 'Encourage trial-to-paid conversion',
      order: 3,
      triggers: [
        {
          id: 'trigger-day-12',
          type: 'scheduled',
          config: {
            type: 'scheduled',
            cronExpression: '0 9 * * *',
            timezone: 'UTC'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-upgrade-email',
          type: 'send_email',
          name: 'Send Upgrade Offer',
          config: {
            to: '{{user.email}}',
            subject: 'Do not Lose Your Progress - Upgrade to Continue',
            template: 'upgrade-offer',
            variables: {
              daysRemaining: '{{product.trialDays - user.trialDaysUsed}}',
              affiliateLink: '{{product.affiliateLink}}',
              discount: '20%'
            }
          }
        },
        {
          id: 'action-sms-reminder',
          type: 'send_sms',
          name: 'SMS Reminder',
          config: {
            to: '{{user.phone}}',
            message: 'Your {{product.name}} trial ends in {{daysRemaining}} days. Upgrade now: {{shortLink}}'
          }
        }
      ],
      conditions: [
        {
          id: 'condition-still-trial',
          field: 'user.subscription.status',
          operator: 'equals',
          value: 'trial',
          logic: 'AND'
        }
      ],
      settings: {
        parallel: true,
        timeout: 15000
      }
    },
    
    {
      id: 'stage-4',
      name: 'Conversion Tracking',
      description: 'Track trial-to-paid conversions',
      order: 4,
      triggers: [
        {
          id: 'trigger-subscription-active',
          type: 'event',
          config: {
            type: 'event',
            eventSource: 'firestore',
            collection: 'users',
            changeType: 'update',
            filter: { 'subscription.status': 'active' }
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-track-conversion',
          type: 'track_conversion',
          name: 'Record Trial Conversion',
          config: {
            userId: '{{user.id}}',
            plan: '{{user.subscription.plan}}',
            mrr: '{{user.subscription.price}}',
            commission: '{{user.subscription.price * 0.20}}' // 20% recurring
          }
        },
        {
          id: 'action-thank-you',
          type: 'send_email',
          name: 'Thank You Email',
          config: {
            to: '{{user.email}}',
            subject: 'Thank You for Upgrading!',
            template: 'upgrade-thank-you'
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 10000
      }
    }
  ]
};

// ============================================================================
// TEMPLATE 5: SIMPLE CONTENT DISTRIBUTION
// ============================================================================

export const simpleContentTemplate: WorkflowTemplate = {
  id: 'simple-content-distribution',
  name: 'Multi-Platform Content Distribution',
  description: 'Simple workflow to post the same content across multiple social media platforms automatically.',
  productType: 'hybrid',
  category: 'Content Marketing',
  icon: '📱',
  estimatedSetupTime: 10,
  estimatedAutomation: 95,
  requiredIntegrations: ['instagram', 'tiktok', 'facebook', 'pinterest'],
  popularity: 0,
  
  stages: [
    {
      id: 'stage-1',
      name: 'Content Ready',
      description: 'Trigger when content is created',
      order: 1,
      triggers: [
        {
          id: 'trigger-content-created',
          type: 'event',
          config: {
            type: 'event',
            eventSource: 'firestore',
            collection: 'generated_content',
            changeType: 'create'
          },
          enabled: true
        }
      ],
      actions: [],
      conditions: [],
      settings: {}
    },
    
    {
      id: 'stage-2',
      name: 'Multi-Platform Publishing',
      description: 'Post to all connected platforms',
      order: 2,
      triggers: [
        {
          id: 'trigger-previous',
          type: 'previous_stage',
          config: {
            type: 'previous_stage',
            stageId: 'stage-1',
            condition: 'success'
          },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-post-instagram',
          type: 'post_instagram',
          name: 'Post to Instagram',
          config: {
            platform: 'instagram',
            content: {
              imageUrl: '{{content.imageUrl}}',
              text: '{{content.caption}}'
            }
          }
        },
        {
          id: 'action-post-tiktok',
          type: 'post_tiktok',
          name: 'Post to TikTok',
          config: {
            platform: 'tiktok',
            content: {
              videoUrl: '{{content.videoUrl}}',
              text: '{{content.caption}}'
            }
          }
        },
        {
          id: 'action-post-facebook',
          type: 'post_facebook',
          name: 'Post to Facebook',
          config: {
            platform: 'facebook',
            content: {
              imageUrl: '{{content.imageUrl}}',
              text: '{{content.caption}}'
            }
          }
        },
        {
          id: 'action-post-pinterest',
          type: 'post_pinterest',
          name: 'Pin to Pinterest',
          config: {
            platform: 'pinterest',
            boardId: 'main-board',
            content: {
              imageUrl: '{{content.imageUrl}}',
              text: '{{content.caption}}',
              link: '{{content.affiliateLink}}'
            }
          }
        }
      ],
      conditions: [],
      settings: {
        parallel: true,
        continueOnError: true,
        timeout: 30000
      }
    }
  ]
};

// ============================================================================
// EXPORT ALL TEMPLATES
// ============================================================================

export const workflowTemplates: WorkflowTemplate[] = [
  physicalProductTemplate,
  digitalProductTemplate,
  serviceReferralTemplate,
  subscriptionTrialTemplate,
  simpleContentTemplate
];

export default workflowTemplates;
