/**
 * Workflow System Type Definitions
 * 
 * Complete type system for the visual workflow builder and execution engine.
 * Supports multiple product types: physical, digital, service, subscription
 */

// ============================================================================
// CORE WORKFLOW TYPES
// ============================================================================

/**
 * Product/business model types that workflows can be optimized for
 */
export type ProductType = 'physical' | 'digital' | 'service' | 'subscription' | 'hybrid';

/**
 * Workflow execution status
 */
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

/**
 * Main workflow definition
 */
export interface WorkflowDefinition {
  id: string;
  userId: string;
  name: string;
  description?: string;
  productType: ProductType;
  status: WorkflowStatus;
  stages: WorkflowStage[];
  metadata: WorkflowMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Metadata for analytics and organization
 */
export interface WorkflowMetadata {
  tags?: string[];
  category?: string;
  automationLevel?: number; // 0-100 percentage
  estimatedTimesSavings?: number; // hours per week
  lastExecuted?: Date;
  executionCount?: number;
  successRate?: number; // 0-100 percentage
  averageExecutionTime?: number; // milliseconds
}

// ============================================================================
// WORKFLOW STAGES
// ============================================================================

/**
 * Individual stage within a workflow
 */
export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  triggers: Trigger[];
  actions: Action[];
  conditions: Condition[];
  settings: StageSettings;
}

/**
 * Stage-specific settings
 */
export interface StageSettings {
  timeout?: number; // milliseconds
  retryPolicy?: RetryPolicy;
  continueOnError?: boolean;
  parallel?: boolean; // Execute actions in parallel vs sequential
}

/**
 * Retry configuration for failed actions
 */
export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  initialDelay: number; // milliseconds
  maxDelay?: number; // milliseconds
}

// ============================================================================
// TRIGGERS
// ============================================================================

/**
 * Event that initiates a stage
 */
export type TriggerType = 
  | 'manual'           // User-initiated
  | 'scheduled'        // Time-based (cron)
  | 'event'            // Firestore/database change
  | 'webhook'          // External HTTP call
  | 'api'              // Programmatic trigger
  | 'previous_stage';  // Previous stage completion

export interface Trigger {
  id: string;
  type: TriggerType;
  config: TriggerConfig;
  enabled: boolean;
}

/**
 * Type-specific trigger configuration
 */
export type TriggerConfig = 
  | ManualTriggerConfig
  | ScheduledTriggerConfig
  | EventTriggerConfig
  | WebhookTriggerConfig
  | ApiTriggerConfig
  | PreviousStageTriggerConfig;

export interface ManualTriggerConfig {
  type: 'manual';
  requireConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface ScheduledTriggerConfig {
  type: 'scheduled';
  cronExpression: string;
  timezone?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface EventTriggerConfig {
  type: 'event';
  eventSource: 'firestore' | 'pubsub' | 'custom';
  collection?: string; // For Firestore
  documentId?: string;
  changeType?: 'create' | 'update' | 'delete';
  filter?: Record<string, any>;
}

export interface WebhookTriggerConfig {
  type: 'webhook';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api_key';
    credentials?: Record<string, string>;
  };
}

export interface ApiTriggerConfig {
  type: 'api';
  endpoint: string;
  requireAuth: boolean;
}

export interface PreviousStageTriggerConfig {
  type: 'previous_stage';
  stageId: string;
  condition?: 'success' | 'failure' | 'always';
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Operations to execute within a stage
 */
export type ActionType =
  // Content Actions
  | 'generate_content'
  | 'edit_image'
  | 'create_video'
  | 'optimize_seo'
  
  // Publishing Actions
  | 'post_instagram'
  | 'post_tiktok'
  | 'post_facebook'
  | 'post_pinterest'
  | 'publish_blog'
  | 'send_email'
  | 'send_sms'
  
  // Affiliate Actions
  | 'generate_affiliate_link'
  | 'track_click'
  | 'track_conversion'
  | 'calculate_commission'
  
  // Data Actions
  | 'fetch_data'
  | 'save_to_database'
  | 'update_record'
  | 'delete_record'
  
  // External Actions
  | 'call_api'
  | 'webhook_post'
  
  // Utility Actions
  | 'wait'
  | 'conditional_branch'
  | 'loop'
  | 'notification';

export interface Action {
  id: string;
  type: ActionType;
  name: string;
  description?: string;
  config: ActionConfig;
  retryPolicy?: RetryPolicy;
  timeout?: number;
}

/**
 * Type-specific action configuration
 */
export type ActionConfig = Record<string, any>; // Flexible for different action types

// Common action configs
export interface GenerateContentConfig {
  templateId: string;
  prompt: string;
  customization?: Record<string, any>;
  saveToDatabase?: boolean;
}

export interface PostSocialMediaConfig {
  platform: 'instagram' | 'tiktok' | 'facebook' | 'pinterest';
  accountId: string;
  content: {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
  };
  scheduledTime?: Date;
}

export interface GenerateAffiliateLinkConfig {
  network: 'amazon' | 'cj' | 'rakuten' | 'shareasale';
  productUrl: string;
  trackingParams?: Record<string, string>;
}

export interface SendEmailConfig {
  to: string | string[];
  subject: string;
  template: string;
  variables?: Record<string, any>;
  fromName?: string;
}

export interface CallApiConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api_key';
    credentials?: Record<string, string>;
  };
}

// ============================================================================
// CONDITIONS
// ============================================================================

/**
 * Conditional logic for flow control
 */
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'matches_regex'
  | 'is_empty'
  | 'is_not_empty';

export interface Condition {
  id: string;
  field: string; // JSON path to field (e.g., "product.price")
  operator: ConditionOperator;
  value: any;
  logic?: 'AND' | 'OR'; // How to combine with next condition
}

/**
 * Group of conditions with combined logic
 */
export interface ConditionGroup {
  conditions: Condition[];
  logic: 'AND' | 'OR' | 'NOT';
  nested?: ConditionGroup[]; // Support nested logic
}

// ============================================================================
// WORKFLOW EXECUTION
// ============================================================================

/**
 * Runtime execution context
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  status: ExecutionStatus;
  currentStageId?: string;
  context: ExecutionContext;
  startedAt: Date;
  completedAt?: Date;
  error?: ExecutionError;
}

export type ExecutionStatus = 
  | 'pending'
  | 'running'
  | 'waiting'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Data available during execution
 */
export interface ExecutionContext {
  input?: Record<string, any>; // Initial input data
  variables: Record<string, any>; // Runtime variables
  stageResults: Record<string, any>; // Results from each stage
  errors: ExecutionError[];
}

export interface ExecutionError {
  stageId: string;
  actionId?: string;
  message: string;
  stack?: string;
  timestamp: Date;
  retryCount?: number;
}

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

/**
 * Pre-built workflow templates for common use cases
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  productType: ProductType;
  category: string;
  icon?: string;
  estimatedSetupTime: number; // minutes
  estimatedAutomation: number; // percentage
  stages: WorkflowStage[];
  requiredIntegrations?: string[]; // e.g., ['instagram', 'amazon']
  popularity?: number; // Usage count
}

// ============================================================================
// VISUAL BUILDER TYPES
// ============================================================================

/**
 * Node types for ReactFlow visual builder
 */
export type NodeType = 'trigger' | 'action' | 'condition' | 'group';

/**
 * Visual node in the workflow builder
 */
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface NodeData {
  label: string;
  config: Trigger | Action | Condition;
  isValid?: boolean;
  errors?: string[];
}

/**
 * Connection between nodes
 */
export interface WorkflowEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  label?: string;
  type?: 'default' | 'conditional' | 'error'; // Edge type
}

// ============================================================================
// PRODUCT-TYPE SPECIFIC WORKFLOWS
// ============================================================================

/**
 * Physical Product Workflow Context
 */
export interface PhysicalProductContext {
  productUrl: string;
  productName: string;
  price: number;
  imageUrls: string[];
  affiliateNetwork: string;
  category?: string;
  brand?: string;
}

/**
 * Digital Product Workflow Context
 */
export interface DigitalProductContext {
  productUrl: string;
  productName: string;
  price: number;
  features: string[];
  trialPeriod?: number; // days
  demoUrl?: string;
  downloadUrl?: string;
}

/**
 * Service Workflow Context
 */
export interface ServiceContext {
  serviceName: string;
  provider: string;
  pricing: {
    type: 'hourly' | 'project' | 'retainer';
    amount: number;
  };
  bookingUrl?: string;
  calendlyUrl?: string;
}

/**
 * Subscription Workflow Context
 */
export interface SubscriptionContext {
  productName: string;
  tiers: PricingTier[];
  trialDays: number;
  features: Record<string, boolean>; // Feature flags
  billingCycle: 'monthly' | 'yearly' | 'both';
}

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
  limits?: Record<string, number>;
}

// ============================================================================
// ANALYTICS & METRICS
// ============================================================================

/**
 * Workflow performance metrics
 */
export interface WorkflowMetrics {
  workflowId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number; // milliseconds
  lastExecuted?: Date;
  successRate: number; // percentage
  stageMetrics: Record<string, StageMetrics>;
}

export interface StageMetrics {
  stageId: string;
  executionCount: number;
  averageTime: number; // milliseconds
  errorRate: number; // percentage
  mostCommonErrors?: string[];
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

/**
 * External service integrations
 */
export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  status: 'connected' | 'disconnected' | 'error';
  credentials?: Record<string, string>; // Encrypted
  config?: Record<string, any>;
  connectedAt?: Date;
  lastUsed?: Date;
}

export type IntegrationType =
  | 'affiliate_network'
  | 'social_media'
  | 'email_provider'
  | 'sms_provider'
  | 'ecommerce'
  | 'analytics'
  | 'payment'
  | 'webhook';

// ============================================================================
// WORKFLOW BUILDER STATE
// ============================================================================

/**
 * State management for workflow builder UI
 */
export interface WorkflowBuilderState {
  workflow: WorkflowDefinition | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: string | null;
  selectedEdge: string | null;
  isValid: boolean;
  validationErrors: ValidationError[];
  isDirty: boolean; // Unsaved changes
}

export interface ValidationError {
  nodeId?: string;
  stageId?: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

/**
 * Helper type for workflow context based on product type
 */
export type ProductWorkflowContext<T extends ProductType> = 
  T extends 'physical' ? PhysicalProductContext :
  T extends 'digital' ? DigitalProductContext :
  T extends 'service' ? ServiceContext :
  T extends 'subscription' ? SubscriptionContext :
  Record<string, any>; // hybrid or unknown

/**
 * Type guard to check if workflow is valid
 */
export function isValidWorkflow(workflow: Partial<WorkflowDefinition>): workflow is WorkflowDefinition {
  return !!(
    workflow.id &&
    workflow.userId &&
    workflow.name &&
    workflow.productType &&
    workflow.status &&
    workflow.stages &&
    workflow.stages.length > 0
  );
}

/**
 * Type guard for execution status
 */
export function isExecutionComplete(status: ExecutionStatus): boolean {
  return ['completed', 'failed', 'cancelled'].includes(status);
}
