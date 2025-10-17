// AI Multi-Agent Orchestration Service for OpsCrew

import { 
  Agent, 
  AgentType, 
  AgentStatus, 
  Workflow, 
  WorkflowExecution, 
  WorkflowStatus,
  StepExecution,
  ExecutionContext,
  ExecuteAgentRequest,
  ExecuteAgentResponse,
  ExecuteWorkflowRequest,
  ExecuteWorkflowResponse,
  AgentError,
  AgentEvent,
  WorkflowEvent,
  TokenUsage,
  ExecutionError,
  ConfidenceLevel
} from '@/types/agents';

import { OpenAIService } from './openai-service';
import { WorkflowEngine } from './workflow-engine';
import { AgentManager } from './agent-manager';
import { AuditLogger } from './audit-logger';
import { RateLimiter } from './rate-limiter';
import { MemoryManager } from './memory-manager';

export class AgentOrchestrator {
  private openaiService: OpenAIService;
  private workflowEngine: WorkflowEngine;
  private agentManager: AgentManager;
  private auditLogger: AuditLogger;
  private rateLimiter: RateLimiter;
  private memoryManager: MemoryManager;
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private eventListeners: Map<string, ((event: AgentEvent | WorkflowEvent) => void)[]> = new Map();

  constructor(
    openaiService: OpenAIService,
    workflowEngine: WorkflowEngine,
    agentManager: AgentManager,
    auditLogger: AuditLogger,
    rateLimiter: RateLimiter,
    memoryManager: MemoryManager
  ) {
    this.openaiService = openaiService;
    this.workflowEngine = workflowEngine;
    this.agentManager = agentManager;
    this.auditLogger = auditLogger;
    this.rateLimiter = rateLimiter;
    this.memoryManager = memoryManager;
  }

  /**
   * Execute a single agent with given input
   */
  async executeAgent(request: ExecuteAgentRequest): Promise<ExecuteAgentResponse> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId();
    
    try {
      // Validate agent exists and is active
      const agent = await this.agentManager.getAgent(request.agentId);
      if (!agent || !agent.isActive) {
        throw new AgentError(`Agent ${request.agentId} not found or inactive`, 'AGENT_NOT_FOUND');
      }

      // Check rate limits
      await this.rateLimiter.checkLimit(request.agentId, request.context?.organizationId || 'default');

      // Create step execution
      const stepExecution: StepExecution = {
        id: this.generateStepId(),
        stepId: 'single-agent',
        agentId: request.agentId,
        status: 'running',
        input: request.input,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        executionTimeMs: 0,
        retryCount: 0,
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString()
      };

      // Get agent context and memory
      const context = await this.memoryManager.getContext(request.agentId, request.context);
      const messages = await this.buildMessages(agent, request.input, context);

      // Execute agent with OpenAI
      const completion = await this.openaiService.createChatCompletion({
        model: agent.persona.model || 'gpt-4',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: request.options?.temperature ?? agent.persona.temperature,
        maxTokens: request.options?.maxTokens ?? agent.persona.maxTokens,
        timeout: request.options?.timeoutMs ?? 30000
      });

      // Calculate confidence score
      const confidence = this.calculateConfidence(completion, agent);
      const confidenceLevel = this.getConfidenceLevel(confidence);

      // Update step execution
      stepExecution.status = 'completed';
      stepExecution.output = this.parseAgentOutput(completion.choices[0].message.content);
      stepExecution.confidence = confidence;
      stepExecution.confidenceLevel = confidenceLevel;
      stepExecution.tokenUsage = completion.usage;
      stepExecution.executionTimeMs = Date.now() - startTime;
      stepExecution.completedAt = new Date().toISOString();

      // Store execution in memory
      await this.memoryManager.storeExecution(stepExecution, request.context);

      // Log audit trail
      await this.auditLogger.logAgentExecution({
        agentId: request.agentId,
        executionId,
        stepId: stepExecution.id,
        input: request.input,
        output: stepExecution.output,
        confidence,
        tokenUsage: completion.usage,
        executionTimeMs: stepExecution.executionTimeMs,
        status: 'completed'
      });

      // Emit event
      this.emitEvent({
        type: 'execution_completed',
        agentId: request.agentId,
        executionId,
        data: { confidence, tokenUsage: completion.usage },
        timestamp: new Date().toISOString()
      });

      return {
        executionId,
        stepId: stepExecution.id,
        status: 'completed',
        output: stepExecution.output,
        confidence,
        confidenceLevel,
        tokenUsage: completion.usage,
        executionTimeMs: stepExecution.executionTimeMs,
        requiresApproval: false
      };

    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      
      // Log error
      await this.auditLogger.logAgentExecution({
        agentId: request.agentId,
        executionId,
        stepId: 'single-agent',
        input: request.input,
        error: error as ExecutionError,
        executionTimeMs,
        status: 'failed'
      });

      // Emit error event
      this.emitEvent({
        type: 'execution_failed',
        agentId: request.agentId,
        executionId,
        data: { error: (error as Error).message },
        timestamp: new Date().toISOString()
      });

      throw new AgentError(
        `Agent execution failed: ${(error as Error).message}`,
        'AGENT_EXECUTION_FAILED',
        request.agentId,
        executionId,
        true
      );
    }
  }

  /**
   * Execute a workflow with multiple agents
   */
  async executeWorkflow(request: ExecuteWorkflowRequest): Promise<ExecuteWorkflowResponse> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId();

    try {
      // Get workflow definition
      const workflow = await this.workflowEngine.getWorkflow(request.workflowId);
      if (!workflow) {
        throw new AgentError(`Workflow ${request.workflowId} not found`, 'WORKFLOW_NOT_FOUND');
      }

      // Create workflow execution
      const execution: WorkflowExecution = {
        id: executionId,
        workflowId: request.workflowId,
        status: 'running',
        context: request.context,
        variables: { ...workflow.variables, ...request.variables },
        stepExecutions: [],
        approvals: [],
        logs: [],
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString()
      };

      this.activeExecutions.set(executionId, execution);

      // Emit workflow started event
      this.emitEvent({
        type: 'workflow_started',
        workflowId: request.workflowId,
        executionId,
        data: { variables: request.variables },
        timestamp: new Date().toISOString()
      });

      // Execute workflow steps
      const stepExecutions = await this.executeWorkflowSteps(execution, workflow);
      execution.stepExecutions = stepExecutions;

      // Determine final status
      const hasFailures = stepExecutions.some(step => step.status === 'failed');
      const hasPendingApprovals = stepExecutions.some(step => step.status === 'waiting_approval');
      
      if (hasFailures) {
        execution.status = 'failed';
      } else if (hasPendingApprovals) {
        execution.status = 'paused';
      } else {
        execution.status = 'completed';
        execution.completedAt = new Date().toISOString();
      }

      execution.updatedAt = new Date().toISOString();
      this.activeExecutions.set(executionId, execution);

      // Emit completion event
      this.emitEvent({
        type: execution.status === 'completed' ? 'workflow_completed' : 'workflow_failed',
        workflowId: request.workflowId,
        executionId,
        data: { status: execution.status, stepCount: stepExecutions.length },
        timestamp: new Date().toISOString()
      });

      return {
        executionId,
        status: execution.status,
        currentStepId: execution.currentStepId,
        variables: execution.variables,
        stepExecutions,
        requiresApproval: hasPendingApprovals,
        approvalIds: execution.approvals.map(a => a.id)
      };

    } catch (error) {
      // Clean up active execution
      this.activeExecutions.delete(executionId);

      throw new AgentError(
        `Workflow execution failed: ${(error as Error).message}`,
        'WORKFLOW_EXECUTION_FAILED',
        undefined,
        executionId,
        true
      );
    }
  }

  /**
   * Execute workflow steps in order
   */
  private async executeWorkflowSteps(execution: WorkflowExecution, workflow: Workflow): Promise<StepExecution[]> {
    const stepExecutions: StepExecution[] = [];
    const completedSteps = new Set<string>();

    // Sort steps by order
    const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order);

    for (const step of sortedSteps) {
      // Check dependencies
      const dependenciesMet = step.dependencies.every(depId => completedSteps.has(depId));
      if (!dependenciesMet) {
        continue;
      }

      // Execute step
      const stepExecution = await this.executeWorkflowStep(execution, step);
      stepExecutions.push(stepExecution);
      
      if (stepExecution.status === 'completed') {
        completedSteps.add(step.id);
        execution.currentStepId = step.id;
      } else if (stepExecution.status === 'failed') {
        break; // Stop execution on failure
      }
    }

    return stepExecutions;
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(execution: WorkflowExecution, step: WorkflowStep): Promise<StepExecution> {
    const startTime = Date.now();
    const stepExecution: StepExecution = {
      id: this.generateStepId(),
      stepId: step.id,
      agentId: step.agentId,
      status: 'running',
      input: this.mapStepInput(step, execution.variables),
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      executionTimeMs: 0,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString()
    };

    try {
      // Emit step started event
      this.emitEvent({
        type: 'step_started',
        workflowId: execution.workflowId,
        executionId: execution.id,
        stepId: step.id,
        data: { agentId: step.agentId },
        timestamp: new Date().toISOString()
      });

      // Execute agent
      const agentResponse = await this.executeAgent({
        agentId: step.agentId,
        input: stepExecution.input,
        context: execution.context,
        options: {
          timeoutMs: step.timeoutMs
        }
      });

      // Update step execution
      stepExecution.status = agentResponse.status;
      stepExecution.output = agentResponse.output;
      stepExecution.confidence = agentResponse.confidence;
      stepExecution.confidenceLevel = agentResponse.confidenceLevel;
      stepExecution.tokenUsage = agentResponse.tokenUsage;
      stepExecution.executionTimeMs = Date.now() - startTime;
      stepExecution.completedAt = new Date().toISOString();

      // Map output back to workflow variables
      if (stepExecution.output) {
        Object.entries(step.outputMapping).forEach(([outputKey, variableKey]) => {
          if (stepExecution.output![outputKey] !== undefined) {
            execution.variables[variableKey] = stepExecution.output![outputKey];
          }
        });
      }

      // Emit step completed event
      this.emitEvent({
        type: 'step_completed',
        workflowId: execution.workflowId,
        executionId: execution.id,
        stepId: step.id,
        data: { 
          status: stepExecution.status,
          confidence: stepExecution.confidence,
          tokenUsage: stepExecution.tokenUsage
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      stepExecution.status = 'failed';
      stepExecution.error = {
        code: 'STEP_EXECUTION_FAILED',
        message: (error as Error).message,
        retryable: true
      };
      stepExecution.executionTimeMs = Date.now() - startTime;
      stepExecution.completedAt = new Date().toISOString();

      // Emit step failed event
      this.emitEvent({
        type: 'step_failed',
        workflowId: execution.workflowId,
        executionId: execution.id,
        stepId: step.id,
        data: { error: (error as Error).message },
        timestamp: new Date().toISOString()
      });
    }

    return stepExecution;
  }

  /**
   * Build chat messages for agent execution
   */
  private async buildMessages(agent: Agent, input: Record<string, any>, context: any[]): Promise<any[]> {
    const messages = [
      {
        role: 'system' as const,
        content: agent.persona.systemPrompt
      }
    ];

    // Add context from memory
    if (context && context.length > 0) {
      const contextContent = context.map(ctx => ctx.content).join('\n\n');
      messages.push({
        role: 'system' as const,
        content: `Previous context:\n${contextContent}`
      });
    }

    // Add current input
    messages.push({
      role: 'user' as const,
      content: JSON.stringify(input)
    });

    return messages;
  }

  /**
   * Calculate confidence score based on response characteristics
   */
  private calculateConfidence(completion: any, agent: Agent): number {
    // Base confidence on response length, token usage, and model confidence
    const responseLength = completion.choices[0].message.content.length;
    const tokenUsage = completion.usage.totalTokens;
    const maxTokens = agent.persona.maxTokens;
    
    // Simple confidence calculation (can be enhanced with more sophisticated logic)
    let confidence = 0.5; // Base confidence
    
    // Adjust based on response completeness
    if (responseLength > 100) confidence += 0.2;
    if (responseLength > 500) confidence += 0.1;
    
    // Adjust based on token efficiency
    const tokenEfficiency = tokenUsage / maxTokens;
    if (tokenEfficiency > 0.8) confidence += 0.1;
    if (tokenEfficiency < 0.3) confidence -= 0.1;
    
    // Adjust based on finish reason
    if (completion.choices[0].finishReason === 'stop') confidence += 0.1;
    if (completion.choices[0].finishReason === 'length') confidence -= 0.2;
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get confidence level from score
   */
  private getConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence >= 0.8) return 'very_high';
    if (confidence >= 0.6) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Parse agent output from completion
   */
  private parseAgentOutput(content: string): Record<string, any> {
    try {
      // Try to parse as JSON first
      return JSON.parse(content);
    } catch {
      // Fallback to text output
      return { text: content };
    }
  }

  /**
   * Map step input from workflow variables
   */
  private mapStepInput(step: any, variables: Record<string, any>): Record<string, any> {
    const input: Record<string, any> = {};
    
    Object.entries(step.inputMapping).forEach(([inputKey, variableKey]) => {
      if (variables[variableKey] !== undefined) {
        input[inputKey] = variables[variableKey];
      }
    });
    
    return input;
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique step ID
   */
  private generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: AgentEvent | WorkflowEvent): void {
    const listeners = this.eventListeners.get('*') || [];
    listeners.forEach(listener => listener(event));
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: AgentEvent | WorkflowEvent) => void): void {
    const listeners = this.eventListeners.get('*') || [];
    listeners.push(listener);
    this.eventListeners.set('*', listeners);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: AgentEvent | WorkflowEvent) => void): void {
    const listeners = this.eventListeners.get('*') || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Get active execution by ID
   */
  getActiveExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  /**
   * Get all active executions
   */
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.status = 'cancelled';
      execution.updatedAt = new Date().toISOString();
      
      this.emitEvent({
        type: 'workflow_failed',
        workflowId: execution.workflowId,
        executionId,
        data: { reason: 'cancelled' },
        timestamp: new Date().toISOString()
      });
    }
  }
}