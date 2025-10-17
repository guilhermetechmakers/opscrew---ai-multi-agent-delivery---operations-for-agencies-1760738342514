// Audit Logger - Tracks Agent Outputs and Confidence Scoring

import { 
  AgentExecutionLog,
  TokenUsage,
  ExecutionError,
  ConfidenceLevel,
  AgentEvent,
  WorkflowEvent
} from '@/types/agents';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'agent_execution' | 'workflow_execution' | 'approval' | 'error' | 'system';
  agentId?: string;
  executionId?: string;
  stepId?: string;
  workflowId?: string;
  organizationId?: string;
  userId?: string;
  message: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AgentExecutionAudit {
  agentId: string;
  executionId: string;
  stepId: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
  tokenUsage: TokenUsage;
  executionTimeMs: number;
  status: 'started' | 'completed' | 'failed' | 'cancelled';
  error?: ExecutionError;
  metadata?: Record<string, any>;
}

export interface WorkflowExecutionAudit {
  workflowId: string;
  executionId: string;
  status: 'started' | 'completed' | 'failed' | 'cancelled';
  stepExecutions: AgentExecutionAudit[];
  totalExecutionTimeMs: number;
  totalTokenUsage: TokenUsage;
  organizationId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface ApprovalAudit {
  approvalId: string;
  executionId: string;
  stepId: string;
  agentId: string;
  status: 'requested' | 'approved' | 'rejected' | 'expired';
  approverId?: string;
  approverName?: string;
  comment?: string;
  requestedAt: string;
  respondedAt?: string;
  metadata?: Record<string, any>;
}

export interface UsageMetrics {
  organizationId: string;
  agentId: string;
  period: 'hour' | 'day' | 'month';
  timestamp: string;
  tokenUsage: TokenUsage;
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTimeMs: number;
  averageConfidence: number;
  cost: number;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  private logs: Map<string, AuditLogEntry> = new Map();
  private agentExecutions: Map<string, AgentExecutionAudit> = new Map();
  private workflowExecutions: Map<string, WorkflowExecutionAudit> = new Map();
  private approvals: Map<string, ApprovalAudit> = new Map();
  private usageMetrics: Map<string, UsageMetrics> = new Map();
  private eventListeners: Map<string, ((entry: AuditLogEntry) => void)[]> = new Map();

  constructor() {
    // Initialize with empty state
  }

  /**
   * Log agent execution
   */
  async logAgentExecution(audit: AgentExecutionAudit): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level: audit.status === 'failed' ? 'error' : 'info',
      category: 'agent_execution',
      agentId: audit.agentId,
      executionId: audit.executionId,
      stepId: audit.stepId,
      message: `Agent ${audit.agentId} execution ${audit.status}`,
      data: {
        input: audit.input,
        output: audit.output,
        confidence: audit.confidence,
        confidenceLevel: audit.confidenceLevel,
        tokenUsage: audit.tokenUsage,
        executionTimeMs: audit.executionTimeMs,
        status: audit.status,
        error: audit.error
      },
      metadata: audit.metadata
    };

    this.logs.set(logEntry.id, logEntry);
    this.agentExecutions.set(audit.executionId, audit);

    // Emit event
    this.emitEvent(logEntry);

    // Update usage metrics
    await this.updateUsageMetrics(audit);
  }

  /**
   * Log workflow execution
   */
  async logWorkflowExecution(audit: WorkflowExecutionAudit): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level: audit.status === 'failed' ? 'error' : 'info',
      category: 'workflow_execution',
      workflowId: audit.workflowId,
      executionId: audit.executionId,
      organizationId: audit.organizationId,
      userId: audit.userId,
      message: `Workflow ${audit.workflowId} execution ${audit.status}`,
      data: {
        status: audit.status,
        stepCount: audit.stepExecutions.length,
        totalExecutionTimeMs: audit.totalExecutionTimeMs,
        totalTokenUsage: audit.totalTokenUsage
      },
      metadata: audit.metadata
    };

    this.logs.set(logEntry.id, logEntry);
    this.workflowExecutions.set(audit.executionId, audit);

    // Emit event
    this.emitEvent(logEntry);
  }

  /**
   * Log approval event
   */
  async logApproval(audit: ApprovalAudit): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'approval',
      agentId: audit.agentId,
      executionId: audit.executionId,
      stepId: audit.stepId,
      message: `Approval ${audit.approvalId} ${audit.status}`,
      data: {
        approvalId: audit.approvalId,
        status: audit.status,
        approverId: audit.approverId,
        approverName: audit.approverName,
        comment: audit.comment,
        requestedAt: audit.requestedAt,
        respondedAt: audit.respondedAt
      },
      metadata: audit.metadata
    };

    this.logs.set(logEntry.id, logEntry);
    this.approvals.set(audit.approvalId, audit);

    // Emit event
    this.emitEvent(logEntry);
  }

  /**
   * Log system event
   */
  async logSystemEvent(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      category: 'system',
      message,
      data,
      metadata
    };

    this.logs.set(logEntry.id, logEntry);

    // Emit event
    this.emitEvent(logEntry);
  }

  /**
   * Log error
   */
  async logError(
    error: Error,
    context?: {
      agentId?: string;
      executionId?: string;
      stepId?: string;
      workflowId?: string;
      organizationId?: string;
      userId?: string;
    }
  ): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      category: 'error',
      agentId: context?.agentId,
      executionId: context?.executionId,
      stepId: context?.stepId,
      workflowId: context?.workflowId,
      organizationId: context?.organizationId,
      userId: context?.userId,
      message: error.message,
      data: {
        name: error.name,
        stack: error.stack,
        context
      }
    };

    this.logs.set(logEntry.id, logEntry);

    // Emit event
    this.emitEvent(logEntry);
  }

  /**
   * Get logs by criteria
   */
  async getLogs(criteria: {
    agentId?: string;
    executionId?: string;
    workflowId?: string;
    organizationId?: string;
    userId?: string;
    category?: string;
    level?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogEntry[]> {
    let filteredLogs = Array.from(this.logs.values());

    // Apply filters
    if (criteria.agentId) {
      filteredLogs = filteredLogs.filter(log => log.agentId === criteria.agentId);
    }
    if (criteria.executionId) {
      filteredLogs = filteredLogs.filter(log => log.executionId === criteria.executionId);
    }
    if (criteria.workflowId) {
      filteredLogs = filteredLogs.filter(log => log.workflowId === criteria.workflowId);
    }
    if (criteria.organizationId) {
      filteredLogs = filteredLogs.filter(log => log.organizationId === criteria.organizationId);
    }
    if (criteria.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === criteria.userId);
    }
    if (criteria.category) {
      filteredLogs = filteredLogs.filter(log => log.category === criteria.category);
    }
    if (criteria.level) {
      filteredLogs = filteredLogs.filter(log => log.level === criteria.level);
    }
    if (criteria.startTime) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= criteria.startTime!);
    }
    if (criteria.endTime) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= criteria.endTime!);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 100;
    return filteredLogs.slice(offset, offset + limit);
  }

  /**
   * Get agent execution by ID
   */
  async getAgentExecution(executionId: string): Promise<AgentExecutionAudit | null> {
    return this.agentExecutions.get(executionId) || null;
  }

  /**
   * Get workflow execution by ID
   */
  async getWorkflowExecution(executionId: string): Promise<WorkflowExecutionAudit | null> {
    return this.workflowExecutions.get(executionId) || null;
  }

  /**
   * Get approval by ID
   */
  async getApproval(approvalId: string): Promise<ApprovalAudit | null> {
    return this.approvals.get(approvalId) || null;
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(criteria: {
    organizationId?: string;
    agentId?: string;
    period?: 'hour' | 'day' | 'month';
    startTime?: string;
    endTime?: string;
  }): Promise<UsageMetrics[]> {
    let filteredMetrics = Array.from(this.usageMetrics.values());

    if (criteria.organizationId) {
      filteredMetrics = filteredMetrics.filter(m => m.organizationId === criteria.organizationId);
    }
    if (criteria.agentId) {
      filteredMetrics = filteredMetrics.filter(m => m.agentId === criteria.agentId);
    }
    if (criteria.period) {
      filteredMetrics = filteredMetrics.filter(m => m.period === criteria.period);
    }
    if (criteria.startTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= criteria.startTime!);
    }
    if (criteria.endTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp <= criteria.endTime!);
    }

    return filteredMetrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Calculate confidence score statistics
   */
  async getConfidenceStats(criteria: {
    agentId?: string;
    organizationId?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<{
    averageConfidence: number;
    confidenceDistribution: Record<ConfidenceLevel, number>;
    totalExecutions: number;
    highConfidenceRate: number;
  }> {
    const executions = Array.from(this.agentExecutions.values())
      .filter(exec => {
        if (criteria.agentId && exec.agentId !== criteria.agentId) return false;
        if (criteria.startTime && exec.executionId < criteria.startTime) return false;
        if (criteria.endTime && exec.executionId > criteria.endTime) return false;
        return true;
      })
      .filter(exec => exec.confidence !== undefined);

    if (executions.length === 0) {
      return {
        averageConfidence: 0,
        confidenceDistribution: { low: 0, medium: 0, high: 0, very_high: 0 },
        totalExecutions: 0,
        highConfidenceRate: 0
      };
    }

    const confidences = executions.map(exec => exec.confidence!);
    const averageConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;

    const confidenceDistribution = executions.reduce((acc, exec) => {
      const level = exec.confidenceLevel || 'low';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<ConfidenceLevel, number>);

    const highConfidenceCount = (confidenceDistribution.high || 0) + (confidenceDistribution.very_high || 0);
    const highConfidenceRate = highConfidenceCount / executions.length;

    return {
      averageConfidence,
      confidenceDistribution,
      totalExecutions: executions.length,
      highConfidenceRate
    };
  }

  /**
   * Get error statistics
   */
  async getErrorStats(criteria: {
    agentId?: string;
    organizationId?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<{
    totalErrors: number;
    errorRate: number;
    errorTypes: Record<string, number>;
    averageResolutionTimeMs: number;
  }> {
    const errorLogs = await this.getLogs({
      ...criteria,
      level: 'error'
    });

    const totalExecutions = Array.from(this.agentExecutions.values())
      .filter(exec => {
        if (criteria.agentId && exec.agentId !== criteria.agentId) return false;
        if (criteria.startTime && exec.executionId < criteria.startTime) return false;
        if (criteria.endTime && exec.executionId > criteria.endTime) return false;
        return true;
      }).length;

    const errorTypes = errorLogs.reduce((acc, log) => {
      const errorType = log.data?.name || 'Unknown';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorRate = totalExecutions > 0 ? errorLogs.length / totalExecutions : 0;

    return {
      totalErrors: errorLogs.length,
      errorRate,
      errorTypes,
      averageResolutionTimeMs: 0 // Would need additional tracking
    };
  }

  /**
   * Update usage metrics
   */
  private async updateUsageMetrics(audit: AgentExecutionAudit): Promise<void> {
    const now = new Date();
    const hourKey = `${audit.agentId}_${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
    const dayKey = `${audit.agentId}_${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const monthKey = `${audit.agentId}_${now.getFullYear()}-${now.getMonth()}`;

    // Update hourly metrics
    await this.updateMetric(hourKey, audit, 'hour');
    await this.updateMetric(dayKey, audit, 'day');
    await this.updateMetric(monthKey, audit, 'month');
  }

  /**
   * Update specific metric
   */
  private async updateMetric(
    key: string,
    audit: AgentExecutionAudit,
    period: 'hour' | 'day' | 'month'
  ): Promise<void> {
    const existing = this.usageMetrics.get(key);
    const now = new Date().toISOString();

    if (existing) {
      existing.requestCount += 1;
      existing.successCount += audit.status === 'completed' ? 1 : 0;
      existing.errorCount += audit.status === 'failed' ? 1 : 0;
      existing.tokenUsage.promptTokens += audit.tokenUsage.promptTokens;
      existing.tokenUsage.completionTokens += audit.tokenUsage.completionTokens;
      existing.tokenUsage.totalTokens += audit.tokenUsage.totalTokens;
      existing.averageResponseTimeMs = 
        (existing.averageResponseTimeMs * (existing.requestCount - 1) + audit.executionTimeMs) / existing.requestCount;
      existing.averageConfidence = 
        (existing.averageConfidence * (existing.requestCount - 1) + (audit.confidence || 0)) / existing.requestCount;
      existing.cost += audit.tokenUsage.cost || 0;
    } else {
      const newMetric: UsageMetrics = {
        organizationId: 'default', // Would come from context
        agentId: audit.agentId,
        period,
        timestamp: now,
        tokenUsage: { ...audit.tokenUsage },
        requestCount: 1,
        successCount: audit.status === 'completed' ? 1 : 0,
        errorCount: audit.status === 'failed' ? 1 : 0,
        averageResponseTimeMs: audit.executionTimeMs,
        averageConfidence: audit.confidence || 0,
        cost: audit.tokenUsage.cost || 0
      };
      this.usageMetrics.set(key, newMetric);
    }
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (entry: AuditLogEntry) => void): void {
    const listeners = this.eventListeners.get('*') || [];
    listeners.push(listener);
    this.eventListeners.set('*', listeners);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (entry: AuditLogEntry) => void): void {
    const listeners = this.eventListeners.get('*') || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(entry: AuditLogEntry): void {
    const listeners = this.eventListeners.get('*') || [];
    listeners.forEach(listener => listener(entry));
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export logs for compliance
   */
  async exportLogs(criteria: {
    organizationId: string;
    startTime: string;
    endTime: string;
    format: 'json' | 'csv';
  }): Promise<string> {
    const logs = await this.getLogs({
      organizationId: criteria.organizationId,
      startTime: criteria.startTime,
      endTime: criteria.endTime,
      limit: 10000 // Large limit for export
    });

    if (criteria.format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV format
      const headers = [
        'id', 'timestamp', 'level', 'category', 'agentId', 'executionId', 'stepId',
        'workflowId', 'organizationId', 'userId', 'message'
      ];
      
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.id,
          log.timestamp,
          log.level,
          log.category,
          log.agentId || '',
          log.executionId || '',
          log.stepId || '',
          log.workflowId || '',
          log.organizationId || '',
          log.userId || '',
          `"${log.message.replace(/"/g, '""')}"`
        ].join(','))
      ];

      return csvRows.join('\n');
    }
  }

  /**
   * Clean up old logs (retention policy)
   */
  async cleanupLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTime = cutoffDate.toISOString();

    let deletedCount = 0;
    const logsToDelete: string[] = [];

    for (const [id, log] of this.logs.entries()) {
      if (log.timestamp < cutoffTime) {
        logsToDelete.push(id);
      }
    }

    logsToDelete.forEach(id => {
      this.logs.delete(id);
      deletedCount++;
    });

    return deletedCount;
  }
}