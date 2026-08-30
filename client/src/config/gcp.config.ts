/**
 * GCP Configuration
 * 
 * Central configuration for all Google Cloud Platform services
 */

export interface GCPEnvironmentConfig {
  projectId: string;
  region: string;
  bucket: string;
  credentials?: {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
  };
}

export interface GCPServiceEndpoints {
  storage: string;
  bigquery: string;
  vertexAI: string;
  vision: string;
  language: string;
  translate: string;
  secrets: string;
  pubsub: string;
  cloudRun: string;
  cloudFunctions: string;
}

/**
 * Default GCP Configuration
 */
export const defaultGCPConfig: GCPEnvironmentConfig = {
  projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'affiliateflow-abzfy',
  region: process.env.NEXT_PUBLIC_GCP_REGION || 'us-central1',
  bucket: process.env.NEXT_PUBLIC_GCP_BUCKET || 'affiliateflow-storage',
};

/**
 * GCP Service Endpoints
 */
export const gcpEndpoints: GCPServiceEndpoints = {
  storage: 'https://storage.googleapis.com',
  bigquery: 'https://bigquery.googleapis.com/bigquery/v2',
  vertexAI: `https://${defaultGCPConfig.region}-aiplatform.googleapis.com/v1`,
  vision: 'https://vision.googleapis.com/v1',
  language: 'https://language.googleapis.com/v1',
  translate: 'https://translation.googleapis.com/v3',
  secrets: 'https://secretmanager.googleapis.com/v1',
  pubsub: 'https://pubsub.googleapis.com/v1',
  cloudRun: `https://${defaultGCPConfig.region}-run.googleapis.com/v1`,
  cloudFunctions: `https://${defaultGCPConfig.region}-cloudfunctions.googleapis.com/v1`,
};

/**
 * Cloud Storage Configuration
 */
export const storageConfig = {
  bucket: defaultGCPConfig.bucket,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/json',
    'text/plain',
    'text/csv',
  ],
  uploadTimeout: 300000, // 5 minutes
  signedUrlExpiration: 3600, // 1 hour
  cacheControl: 'public, max-age=31536000', // 1 year for immutable files
};

/**
 * BigQuery Configuration
 */
export const bigQueryConfig = {
  dataset: 'affiliateflow_analytics',
  location: defaultGCPConfig.region,
  tables: {
    events: 'user_events',
    products: 'products',
    campaigns: 'campaigns',
    conversions: 'conversions',
    sessions: 'user_sessions',
  },
  queryTimeout: 60000, // 1 minute
  maxResults: 10000,
};

/**
 * Vertex AI Configuration
 */
export const vertexAIConfig = {
  location: defaultGCPConfig.region,
  models: {
    textBison: 'text-bison@002',
    chatBison: 'chat-bison@002',
    textEmbedding: 'textembedding-gecko@003',
    imagenText: 'imagetext@001',
    imagenImage: 'imagegeneration@005',
  },
  endpoints: {
    prediction: `projects/${defaultGCPConfig.projectId}/locations/${defaultGCPConfig.region}/endpoints`,
    models: `projects/${defaultGCPConfig.projectId}/locations/${defaultGCPConfig.region}/models`,
  },
  defaults: {
    temperature: 0.7,
    maxTokens: 1024,
    topP: 0.95,
    topK: 40,
  },
};

/**
 * Cloud Vision Configuration
 */
export const visionConfig = {
  features: [
    'LABEL_DETECTION',
    'TEXT_DETECTION',
    'FACE_DETECTION',
    'LANDMARK_DETECTION',
    'LOGO_DETECTION',
    'SAFE_SEARCH_DETECTION',
    'IMAGE_PROPERTIES',
    'WEB_DETECTION',
    'OBJECT_LOCALIZATION',
  ],
  maxResults: 10,
  imageContext: {
    languageHints: ['en'],
  },
};

/**
 * Cloud Natural Language Configuration
 */
export const languageConfig = {
  encodingType: 'UTF8',
  features: {
    extractSyntax: true,
    extractEntities: true,
    extractDocumentSentiment: true,
    extractEntitySentiment: true,
    classifyText: true,
  },
};

/**
 * Cloud Translation Configuration
 */
export const translationConfig = {
  defaultSourceLanguage: 'en',
  supportedLanguages: [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh',
    'ar', 'hi', 'nl', 'sv', 'pl', 'tr', 'vi', 'th', 'id', 'ms',
  ],
  mimeTypes: {
    text: 'text/plain',
    html: 'text/html',
  },
};

/**
 * Pub/Sub Configuration
 */
export const pubsubConfig = {
  topics: {
    events: 'affiliate-events',
    analytics: 'affiliate-analytics',
    notifications: 'affiliate-notifications',
    conversions: 'affiliate-conversions',
  },
  subscriptions: {
    eventProcessor: 'event-processor-sub',
    analyticsAggregator: 'analytics-aggregator-sub',
    notificationHandler: 'notification-handler-sub',
  },
  ackDeadlineSeconds: 60,
  messageRetentionDuration: 604800, // 7 days
  maxDeliveryAttempts: 5,
};

/**
 * Secret Manager Configuration
 */
export const secretsConfig = {
  secrets: {
    apiKeys: 'affiliate-api-keys',
    databaseUrl: 'database-url',
    jwtSecret: 'jwt-secret',
    encryptionKey: 'encryption-key',
  },
  version: 'latest',
};

/**
 * Cloud Run Configuration
 */
export const cloudRunConfig = {
  services: {
    api: 'affiliateflow-api',
    worker: 'affiliateflow-worker',
    webhook: 'affiliateflow-webhook',
  },
  defaults: {
    concurrency: 80,
    timeout: 300, // 5 minutes
    memory: '512Mi',
    cpu: '1',
    minInstances: 0,
    maxInstances: 10,
  },
};

/**
 * Cloud Functions Configuration
 */
export const cloudFunctionsConfig = {
  runtime: 'nodejs20',
  memory: 256,
  timeout: 60,
  maxInstances: 100,
  functions: {
    processImage: 'processImageUpload',
    sendNotification: 'sendNotification',
    aggregateAnalytics: 'aggregateAnalytics',
    webhookHandler: 'handleWebhook',
  },
};

/**
 * Rate Limiting Configuration
 */
export const rateLimits = {
  storage: {
    uploadsPerMinute: 60,
    downloadsPerMinute: 120,
  },
  bigQuery: {
    queriesPerMinute: 300,
    bytesPerMinute: 10 * 1024 * 1024 * 1024, // 10GB
  },
  vertexAI: {
    predictionsPerMinute: 60,
    tokensPerMinute: 100000,
  },
  vision: {
    requestsPerMinute: 1800,
  },
  language: {
    requestsPerMinute: 600,
  },
  translate: {
    charactersPerMinute: 500000,
  },
  pubsub: {
    publishPerSecond: 1000,
    pullPerSecond: 1000,
  },
};

/**
 * Cost Optimization Settings
 */
export const costOptimization = {
  // Use caching aggressively
  cacheEnabled: true,
  cacheTTL: {
    storage: 3600, // 1 hour
    bigQuery: 600, // 10 minutes
    vertexAI: 1800, // 30 minutes
    vision: 3600, // 1 hour
    language: 1800, // 30 minutes
    translate: 86400, // 24 hours
  },
  
  // Batch operations when possible
  batchEnabled: true,
  batchSize: {
    storage: 100,
    bigQuery: 1000,
    vertexAI: 10,
    vision: 16,
    language: 10,
    translate: 100,
  },
  
  // Use lower-cost tiers
  preferLowerCostOptions: true,
  
  // Monitor and alert
  budgetAlerts: {
    daily: 50, // $50 USD
    monthly: 1000, // $1000 USD
  },
};

/**
 * Error Handling Configuration
 */
export const errorHandling = {
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2,
  timeout: 30000, // 30 seconds
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
  },
};

/**
 * Get GCP configuration for specific environment
 */
export function getGCPConfig(env?: 'development' | 'staging' | 'production'): GCPEnvironmentConfig {
  const environment = env || process.env.NODE_ENV || 'development';
  
  const configs: Record<string, Partial<GCPEnvironmentConfig>> = {
    development: {
      projectId: 'affiliateflow-dev',
      bucket: 'affiliateflow-dev-storage',
    },
    staging: {
      projectId: 'affiliateflow-staging',
      bucket: 'affiliateflow-staging-storage',
    },
    production: {
      projectId: 'affiliateflow-abzfy',
      bucket: 'affiliateflow-storage',
    },
  };

  return {
    ...defaultGCPConfig,
    ...configs[environment],
  };
}

/**
 * Validate GCP configuration
 */
export function validateGCPConfig(config: GCPEnvironmentConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.projectId) {
    errors.push('GCP Project ID is required');
  }

  if (!config.region) {
    errors.push('GCP Region is required');
  }

  if (!config.bucket) {
    errors.push('GCP Storage Bucket is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  default: defaultGCPConfig,
  endpoints: gcpEndpoints,
  storage: storageConfig,
  bigQuery: bigQueryConfig,
  vertexAI: vertexAIConfig,
  vision: visionConfig,
  language: languageConfig,
  translation: translationConfig,
  pubsub: pubsubConfig,
  secrets: secretsConfig,
  cloudRun: cloudRunConfig,
  cloudFunctions: cloudFunctionsConfig,
  rateLimits,
  costOptimization,
  errorHandling,
  getGCPConfig,
  validateGCPConfig,
};
