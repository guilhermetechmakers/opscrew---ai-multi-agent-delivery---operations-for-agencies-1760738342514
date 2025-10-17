// Workflow Engine - State Machine for Agent Orchestration

import { 
  Workflow, 
  WorkflowStep, 
  WorkflowStatus, 
  WorkflowExecution, 
  StepExecution,
  WorkflowCondition,
  WorkflowTrigger,
  ApprovalConfig,
  AgentType
} from '@/types/agents';

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflow,
      id: this.generateWorkflowId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    return newWorkflow;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.workflows.set(workflowId, updatedWorkflow);
    return updatedWorkflow;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<boolean> {
    return this.workflows.delete(workflowId);
  }

  /**
   * List all workflows
   */
  async listWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  /**
   * Validate workflow definition
   */
  async validateWorkflow(workflow: Workflow): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check required fields
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Validate steps
    if (workflow.steps) {
      const stepIds = new Set<string>();
      const stepOrders = new Set<number>();

      for (const step of workflow.steps) {
        // Check for duplicate step IDs
        if (stepIds.has(step.id)) {
          errors.push(`Duplicate step ID: ${step.id}`);
        }
        stepIds.add(step.id);

        // Check for duplicate step orders
        if (stepOrders.has(step.order)) {
          errors.push(`Duplicate step order: ${step.order}`);
        }
        stepOrders.add(step.order);

        // Validate step dependencies
        for (const depId of step.dependencies) {
          if (!stepIds.has(depId)) {
            errors.push(`Step ${step.id} depends on non-existent step: ${depId}`);
          }
        }

        // Validate step configuration
        if (!step.agentId) {
          errors.push(`Step ${step.id} must have an agentId`);
        }
        if (step.timeoutMs <= 0) {
          errors.push(`Step ${step.id} must have a positive timeout`);
        }
      }
    }

    // Validate triggers
    if (workflow.triggers) {
      for (const trigger of workflow.triggers) {
        if (!trigger.type) {
          errors.push('All triggers must have a type');
        }
        if (!trigger.config) {
          errors.push('All triggers must have configuration');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Execute workflow step conditions
   */
  async evaluateConditions(conditions: WorkflowCondition[], variables: Record<string, any>): Promise<boolean> {
    if (!conditions || conditions.length === 0) return true;

    let result = true;
    let logicalOperator: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, variables);
      
      if (logicalOperator === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      logicalOperator = condition.logicalOperator || 'AND';
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: WorkflowCondition, variables: Record<string, any>): boolean {
    const fieldValue = this.getNestedValue(variables, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get next executable steps for a workflow execution
   */
  async getNextSteps(execution: WorkflowExecution): Promise<WorkflowStep[]> {
    const workflow = await this.getWorkflow(execution.workflowId);
    if (!workflow) return [];

    const completedStepIds = new Set(
      execution.stepExecutions
        .filter(step => step.status === 'completed')
        .map(step => step.stepId)
    );

    const nextSteps: WorkflowStep[] = [];

    for (const step of workflow.steps) {
      // Skip if already completed
      if (completedStepIds.has(step.id)) continue;

      // Check if dependencies are met
      const dependenciesMet = step.dependencies.every(depId => completedStepIds.has(depId));
      if (!dependenciesMet) continue;

      // Check if conditions are met
      const conditionsMet = await this.evaluateConditions(step.conditions, execution.variables);
      if (!conditionsMet) continue;

      nextSteps.push(step);
    }

    return nextSteps.sort((a, b) => a.order - b.order);
  }

  /**
   * Check if workflow execution is complete
   */
  async isExecutionComplete(execution: WorkflowExecution): Promise<boolean> {
    const workflow = await this.getWorkflow(execution.workflowId);
    if (!workflow) return true;

    const completedSteps = execution.stepExecutions.filter(step => step.status === 'completed');
    const failedSteps = execution.stepExecutions.filter(step => step.status === 'failed');
    const waitingSteps = execution.stepExecutions.filter(step => step.status === 'waiting_approval');

    // Execution is complete if all steps are completed or if any step failed
    return completedSteps.length === workflow.steps.length || failedSteps.length > 0;
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(execution: WorkflowExecution): Promise<WorkflowStatus> {
    if (execution.status === 'cancelled') return 'cancelled';
    if (execution.status === 'completed') return 'completed';
    if (execution.status === 'failed') return 'failed';

    const isComplete = await this.isExecutionComplete(execution);
    if (isComplete) {
      const hasFailures = execution.stepExecutions.some(step => step.status === 'failed');
      return hasFailures ? 'failed' : 'completed';
    }

    const hasWaitingApprovals = execution.stepExecutions.some(step => step.status === 'waiting_approval');
    if (hasWaitingApprovals) return 'paused';

    return 'running';
  }

  /**
   * Calculate workflow execution progress
   */
  async getExecutionProgress(execution: WorkflowExecution): Promise<number> {
    const workflow = await this.getWorkflow(execution.workflowId);
    if (!workflow) return 0;

    const totalSteps = workflow.steps.length;
    const completedSteps = execution.stepExecutions.filter(step => step.status === 'completed').length;
    
    return Math.round((completedSteps / totalSteps) * 100);
  }

  /**
   * Initialize default workflows for OpsCrew
   */
  private initializeDefaultWorkflows(): void {
    // Intake Workflow
    const intakeWorkflow: Workflow = {
      id: 'intake-workflow',
      name: 'Lead Intake & Qualification',
      description: 'Automated lead qualification and proposal generation',
      version: '1.0.0',
      status: 'pending',
      steps: [
        {
          id: 'qualify-lead',
          name: 'Qualify Lead',
          agentType: 'intake',
          agentId: 'intake-agent',
          order: 1,
          isParallel: false,
          dependencies: [],
          inputMapping: {
            leadData: 'leadData',
            context: 'context'
          },
          outputMapping: {
            qualification: 'qualification',
            requirements: 'requirements'
          },
          conditions: [],
          timeoutMs: 30000,
          retryPolicy: {
            maxAttempts: 3,
            backoffMs: 1000,
            backoffMultiplier: 2,
            maxBackoffMs: 10000
          },
          requiresApproval: false
        },
        {
          id: 'generate-proposal',
          name: 'Generate Proposal',
          agentType: 'intake',
          agentId: 'intake-agent',
          order: 2,
          isParallel: false,
          dependencies: ['qualify-lead'],
          inputMapping: {
            qualification: 'qualification',
            requirements: 'requirements',
            templates: 'templates'
          },
          outputMapping: {
            proposal: 'proposal',
            sow: 'sow'
          },
          conditions: [
            {
              id: 'qualified-condition',
              field: 'qualification.isQualified',
              operator: 'equals',
              value: true
            }
          ],
          timeoutMs: 60000,
          retryPolicy: {
            maxAttempts: 2,
            backoffMs: 2000,
            backoffMultiplier: 2,
            maxBackoffMs: 15000
          },
          requiresApproval: true,
          approvalConfig: {
            approvers: ['sales-manager'],
            minApprovals: 1,
            timeoutMs: 3600000, // 1 hour
            escalationConfig: {
              escalateAfterMs: 1800000, // 30 minutes
              escalateTo: ['sales-director']
            }
          }
        }
      ],
      triggers: [
        {
          id: 'webhook-trigger',
          type: 'webhook',
          config: {
            path: '/webhooks/intake',
            method: 'POST'
          },
          isActive: true
        }
      ],
      variables: {
        leadData: null,
        context: null,
        templates: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Project Spin-Up Workflow
    const spinUpWorkflow: Workflow = {
      id: 'spin-up-workflow',
      name: 'Project Spin-Up & Provisioning',
      description: 'Automated project setup and infrastructure provisioning',
      version: '1.0.0',
      status: 'pending',
      steps: [
        {
          id: 'analyze-requirements',
          name: 'Analyze Requirements',
          agentType: 'spin-up',
          agentId: 'spin-up-agent',
          order: 1,
          isParallel: false,
          dependencies: [],
          inputMapping: {
            projectData: 'projectData',
            requirements: 'requirements'
          },
          outputMapping: {
            stackRecommendation: 'stackRecommendation',
            infraRequirements: 'infraRequirements'
          },
          conditions: [],
          timeoutMs: 45000,
          retryPolicy: {
            maxAttempts: 2,
            backoffMs: 2000,
            backoffMultiplier: 2,
            maxBackoffMs: 10000
          },
          requiresApproval: false
        },
        {
          id: 'provision-repo',
          name: 'Provision Repository',
          agentType: 'spin-up',
          agentId: 'spin-up-agent',
          order: 2,
          isParallel: false,
          dependencies: ['analyze-requirements'],
          inputMapping: {
            stackRecommendation: 'stackRecommendation',
            projectName: 'projectName'
          },
          outputMapping: {
            repoUrl: 'repoUrl',
            repoId: 'repoId'
          },
          conditions: [],
          timeoutMs: 120000,
          retryPolicy: {
            maxAttempts: 3,
            backoffMs: 5000,
            backoffMultiplier: 2,
            maxBackoffMs: 30000
          },
          requiresApproval: false
        },
        {
          id: 'setup-environments',
          name: 'Setup Environments',
          agentType: 'spin-up',
          agentId: 'spin-up-agent',
          order: 3,
          isParallel: true,
          dependencies: ['provision-repo'],
          inputMapping: {
            infraRequirements: 'infraRequirements',
            repoId: 'repoId'
          },
          outputMapping: {
            environments: 'environments',
            deploymentUrls: 'deploymentUrls'
          },
          conditions: [],
          timeoutMs: 180000,
          retryPolicy: {
            maxAttempts: 2,
            backoffMs: 10000,
            backoffMultiplier: 2,
            maxBackoffMs: 60000
          },
          requiresApproval: false
        },
        {
          id: 'create-client-portal',
          name: 'Create Client Portal',
          agentType: 'spin-up',
          agentId: 'spin-up-agent',
          order: 4,
          isParallel: true,
          dependencies: ['provision-repo'],
          inputMapping: {
            projectData: 'projectData',
            branding: 'branding'
          },
          outputMapping: {
            portalUrl: 'portalUrl',
            portalId: 'portalId'
          },
          conditions: [],
          timeoutMs: 90000,
          retryPolicy: {
            maxAttempts: 2,
            backoffMs: 5000,
            backoffMultiplier: 2,
            maxBackoffMs: 20000
          },
          requiresApproval: false
        }
      ],
      triggers: [
        {
          id: 'project-created-trigger',
          type: 'event',
          config: {
            event: 'project.created'
          },
          isActive: true
        }
      ],
      variables: {
        projectData: null,
        requirements: null,
        projectName: null,
        branding: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // PM Workflow
    const pmWorkflow: Workflow = {
      id: 'pm-workflow',
      name: 'Project Management & Sprint Planning',
      description: 'Automated sprint planning and task management',
      version: '1.0.0',
      status: 'pending',
      steps: [
        {
          id: 'analyze-backlog',
          name: 'Analyze Backlog',
          agentType: 'pm',
          agentId: 'pm-agent',
          order: 1,
          isParallel: false,
          dependencies: [],
          inputMapping: {
            backlog: 'backlog',
            requirements: 'requirements'
          },
          outputMapping: {
            prioritizedBacklog: 'prioritizedBacklog',
            sprintRecommendation: 'sprintRecommendation'
          },
          conditions: [],
          timeoutMs: 60000,
          retryPolicy: {
            maxAttempts: 2,
            backoffMs: 3000,
            backoffMultiplier: 2,
            maxBackoffMs: 15000
          },
          requiresApproval: false
        },
        {
          id: 'create-sprint',
          name: 'Create Sprint',
          agentType: 'pm',
          agentId: 'pm-agent',
          order: 2,
          isParallel: false,
          dependencies: ['analyze-backlog'],
          inputMapping: {
            sprintRecommendation: 'sprintRecommendation',
            teamCapacity: 'teamCapacity'
          },
          outputMapping: {
            sprint: 'sprint',
            tasks: 'tasks'
          },
          conditions: [],
          timeoutMs: 90000,
          retryPolicy: {
            maxAttempts: 2,
            backoffMs: 5000,
            backoffMultiplier: 2,
            maxBackoffMs: 20000
          },
          requiresApproval: true,
          approvalConfig: {
            approvers: ['project-manager'],
            minApprovals: 1,
            timeoutMs: 1800000, // 30 minutes
          }
        }
      ],
      triggers: [
        {
          id: 'sprint-planning-trigger',
          type: 'schedule',
          config: {
            cron: '0 9 * * MON' // Every Monday at 9 AM
          },
          isActive: true
        }
      ],
      variables: {
        backlog: null,
        requirements: null,
        teamCapacity: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store default workflows
    this.workflows.set(intakeWorkflow.id, intakeWorkflow);
    this.workflows.set(spinUpWorkflow.id, spinUpWorkflow);
    this.workflows.set(pmWorkflow.id, pmWorkflow);
  }

  /**
   * Generate unique workflow ID
   */
  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get workflows by agent type
   */
  async getWorkflowsByAgentType(agentType: AgentType): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(workflow =>
      workflow.steps.some(step => step.agentType === agentType)
    );
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(): Promise<{
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
  }> {
    const workflows = Array.from(this.workflows.values());
    const executions = Array.from(this.executions.values());

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'running').length,
      totalExecutions: executions.length,
      successfulExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length
    };
  }
}