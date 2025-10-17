// AI Multi-Agent Engine Types for OpsCrew

export type AgentType = 
  | 'intake'
  | 'spin-up'
  | 'pm'
  | 'comms'
  | 'research'
  | 'launch'
  | 'handover'
  | 'support';

export type AgentStatus = 
  | 'idle'
  | 'running'
  | 'waiting_approval'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type WorkflowStatus = 
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired';

export type ConfidenceLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

// Core Agent Types
export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  version: string;
  isActive: boolean;
  persona: AgentPersona;
  capabilities: AgentCapability[];
  constraints: AgentConstraint[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentPersona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number; // 0-2
  maxTokens: number;
  allowedActions: string[];
  personality: {
    tone: 'professional' | 'friendly' | 'technical' | 'casual';
    communicationStyle: 'concise' | 'detailed' | 'conversational';
    expertise: string[];
  };
  contextWindow: {
    maxMessages: number;
    maxTokens: number;
    retentionPolicy: 'sliding' | 'fixed' | 'summary';
  };
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  isAsync: boolean;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
}

export interface AgentConstraint {
  id: string;
  type: 'rate_limit' | 'token_limit' | 'time_limit' | 'approval_required' | 'human_override';
  value: number | string;
  windowMs?: number;
  description: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

// Workflow and Orchestration Types
export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  variables: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentType: AgentType;
  agentId: string;
  order: number;
  isParallel: boolean;
  dependencies: string[]; // step IDs
  inputMapping: Record<string, string>; // workflow variable -> agent input
  outputMapping: Record<string, string>; // agent output -> workflow variable
  conditions: WorkflowCondition[];
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  requiresApproval: boolean;
  approvalConfig?: ApprovalConfig;
}

export interface WorkflowTrigger {
  id: string;
  type: 'webhook' | 'schedule' | 'event' | 'manual';
  config: Record<string, any>;
  isActive: boolean;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ApprovalConfig {
  approvers: string[]; // user IDs
  minApprovals: number;
  timeoutMs: number;
  escalationConfig?: {
    escalateAfterMs: number;
    escalateTo: string[]; // user IDs
  };
}

// Execution and State Management
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  currentStepId?: string;
  context: ExecutionContext;
  variables: Record<string, any>;
  stepExecutions: StepExecution[];
  approvals: Approval[];
  logs: ExecutionLog[];
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface StepExecution {
  id: string;
  stepId: string;
  agentId: string;
  status: AgentStatus;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: ExecutionError;
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
  tokenUsage: TokenUsage;
  executionTimeMs: number;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ExecutionContext {
  projectId?: string;
  organizationId: string;
  userId: string;
  sessionId: string;
  environment: 'development' | 'staging' | 'production';
  metadata: Record<string, any>;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  retryable: boolean;
}

export interface ExecutionLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  stepId?: string;
  agentId?: string;
}

// Approval System
export interface Approval {
  id: string;
  executionId: string;
  stepId: string;
  status: ApprovalStatus;
  approvers: ApprovalUser[];
  comments: ApprovalComment[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface ApprovalUser {
  userId: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedAt?: string;
  comment?: string;
}

export interface ApprovalComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
  isInternal: boolean;
}

// OpenAI Integration
export interface OpenAIConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatCompletion {
  id: string;
  model: string;
  choices: {
    message: ChatMessage;
    finishReason: 'stop' | 'length' | 'content_filter' | 'null';
    index: number;
  }[];
  usage: TokenUsage;
  created: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number; // in USD
}

export interface Embedding {
  id: string;
  vector: number[];
  metadata: {
    text: string;
    source: string;
    sourceId: string;
    createdAt: string;
  };
}

// Memory and Context Management
export interface AgentMemory {
  id: string;
  agentId: string;
  projectId?: string;
  type: 'conversation' | 'knowledge' | 'context' | 'feedback';
  content: string;
  embeddings: Embedding[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface ContextWindow {
  agentId: string;
  messages: ChatMessage[];
  maxMessages: number;
  maxTokens: number;
  currentTokens: number;
  lastUpdated: string;
}

// Rate Limiting and Usage Tracking
export interface RateLimit {
  agentId: string;
  organizationId: string;
  windowMs: number;
  maxRequests: number;
  currentRequests: number;
  resetAt: string;
}

export interface UsageMetrics {
  organizationId: string;
  agentId: string;
  period: 'hour' | 'day' | 'month';
  tokenUsage: TokenUsage;
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTimeMs: number;
  cost: number;
  timestamp: string;
}

// API Request/Response Types
export interface ExecuteAgentRequest {
  agentId: string;
  input: Record<string, any>;
  context?: ExecutionContext;
  options?: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
    requireApproval?: boolean;
  };
}

export interface ExecuteAgentResponse {
  executionId: string;
  stepId: string;
  status: AgentStatus;
  output?: Record<string, any>;
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
  tokenUsage: TokenUsage;
  executionTimeMs: number;
  requiresApproval: boolean;
  approvalId?: string;
  error?: ExecutionError;
}

export interface ExecuteWorkflowRequest {
  workflowId: string;
  variables: Record<string, any>;
  context: ExecutionContext;
  options?: {
    timeoutMs?: number;
    requireApproval?: boolean;
  };
}

export interface ExecuteWorkflowResponse {
  executionId: string;
  status: WorkflowStatus;
  currentStepId?: string;
  variables: Record<string, any>;
  stepExecutions: StepExecution[];
  requiresApproval: boolean;
  approvalIds: string[];
  error?: ExecutionError;
}

export interface GetAgentStatusResponse {
  agent: Agent;
  status: AgentStatus;
  isHealthy: boolean;
  lastActivity: string;
  currentExecutions: number;
  queueLength: number;
  errorRate: number;
}

export interface GetWorkflowStatusResponse {
  workflow: Workflow;
  execution?: WorkflowExecution;
  status: WorkflowStatus;
  progress: number; // 0-100
  currentStep?: WorkflowStep;
  nextSteps: WorkflowStep[];
  estimatedCompletion?: string;
}

// Error Types
export interface AgentError extends Error {
  code: string;
  agentId?: string;
  executionId?: string;
  stepId?: string;
  retryable: boolean;
  details?: Record<string, any>;
}

// Configuration Types
export interface AgentEngineConfig {
  openai: OpenAIConfig;
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  database: {
    url: string;
    maxConnections: number;
  };
  rateLimiting: {
    defaultWindowMs: number;
    defaultMaxRequests: number;
  };
  approval: {
    defaultTimeoutMs: number;
    escalationTimeoutMs: number;
  };
  monitoring: {
    enableMetrics: boolean;
    enableLogging: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

// Event Types for Real-time Updates
export interface AgentEvent {
  type: 'execution_started' | 'execution_completed' | 'execution_failed' | 'approval_required' | 'approval_granted' | 'approval_rejected';
  agentId: string;
  executionId: string;
  stepId?: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface WorkflowEvent {
  type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'step_started' | 'step_completed' | 'step_failed';
  workflowId: string;
  executionId: string;
  stepId?: string;
  data: Record<string, any>;
  timestamp: string;
}