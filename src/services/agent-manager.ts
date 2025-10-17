// Agent Manager - Manages Agent Personas and Capabilities

import { 
  Agent, 
  AgentType, 
  AgentStatus, 
  AgentPersona, 
  AgentCapability, 
  AgentConstraint,
  OpenAIConfig
} from '@/types/agents';

export class AgentManager {
  private agents: Map<string, Agent> = new Map();
  private personas: Map<string, AgentPersona> = new Map();
  private capabilities: Map<string, AgentCapability> = new Map();

  constructor() {
    this.initializeDefaultAgents();
  }

  /**
   * Create a new agent
   */
  async createAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    const newAgent: Agent = {
      ...agent,
      id: this.generateAgentId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.agents.set(newAgent.id, newAgent);
    return newAgent;
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<Agent | null> {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get agents by type
   */
  async getAgentsByType(type: AgentType): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  /**
   * Update agent
   */
  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent | null> {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.agents.set(agentId, updatedAgent);
    return updatedAgent;
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    return this.agents.delete(agentId);
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  /**
   * Get active agents
   */
  async getActiveAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.isActive);
  }

  /**
   * Create agent persona
   */
  async createPersona(persona: Omit<AgentPersona, 'id'>): Promise<AgentPersona> {
    const newPersona: AgentPersona = {
      ...persona,
      id: this.generatePersonaId()
    };

    this.personas.set(newPersona.id, newPersona);
    return newPersona;
  }

  /**
   * Get persona by ID
   */
  async getPersona(personaId: string): Promise<AgentPersona | null> {
    return this.personas.get(personaId) || null;
  }

  /**
   * Update persona
   */
  async updatePersona(personaId: string, updates: Partial<AgentPersona>): Promise<AgentPersona | null> {
    const persona = this.personas.get(personaId);
    if (!persona) return null;

    const updatedPersona = {
      ...persona,
      ...updates
    };

    this.personas.set(personaId, updatedPersona);
    return updatedPersona;
  }

  /**
   * Create agent capability
   */
  async createCapability(capability: Omit<AgentCapability, 'id'>): Promise<AgentCapability> {
    const newCapability: AgentCapability = {
      ...capability,
      id: this.generateCapabilityId()
    };

    this.capabilities.set(newCapability.id, newCapability);
    return newCapability;
  }

  /**
   * Get capability by ID
   */
  async getCapability(capabilityId: string): Promise<AgentCapability | null> {
    return this.capabilities.get(capabilityId) || null;
  }

  /**
   * Get capabilities by agent ID
   */
  async getCapabilitiesByAgent(agentId: string): Promise<AgentCapability[]> {
    const agent = await this.getAgent(agentId);
    if (!agent) return [];

    return agent.capabilities.map(capId => this.capabilities.get(capId)).filter(Boolean) as AgentCapability[];
  }

  /**
   * Validate agent configuration
   */
  async validateAgent(agent: Agent): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check required fields
    if (!agent.name) errors.push('Agent name is required');
    if (!agent.type) errors.push('Agent type is required');
    if (!agent.persona) errors.push('Agent persona is required');

    // Validate persona
    if (agent.persona) {
      const personaErrors = this.validatePersona(agent.persona);
      errors.push(...personaErrors);
    }

    // Validate capabilities
    if (agent.capabilities) {
      for (const capId of agent.capabilities) {
        const capability = this.capabilities.get(capId);
        if (!capability) {
          errors.push(`Capability ${capId} not found`);
        }
      }
    }

    // Validate constraints
    if (agent.constraints) {
      for (const constraint of agent.constraints) {
        const constraintErrors = this.validateConstraint(constraint);
        errors.push(...constraintErrors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate persona configuration
   */
  private validatePersona(persona: AgentPersona): string[] {
    const errors: string[] = [];

    if (!persona.name) errors.push('Persona name is required');
    if (!persona.systemPrompt) errors.push('Persona system prompt is required');
    if (persona.temperature < 0 || persona.temperature > 2) {
      errors.push('Persona temperature must be between 0 and 2');
    }
    if (persona.maxTokens <= 0) {
      errors.push('Persona max tokens must be positive');
    }
    if (persona.contextWindow.maxMessages <= 0) {
      errors.push('Persona context window max messages must be positive');
    }
    if (persona.contextWindow.maxTokens <= 0) {
      errors.push('Persona context window max tokens must be positive');
    }

    return errors;
  }

  /**
   * Validate constraint configuration
   */
  private validateConstraint(constraint: AgentConstraint): string[] {
    const errors: string[] = [];

    if (!constraint.type) errors.push('Constraint type is required');
    if (constraint.value === undefined || constraint.value === null) {
      errors.push('Constraint value is required');
    }

    switch (constraint.type) {
      case 'rate_limit':
        if (typeof constraint.value !== 'number' || constraint.value <= 0) {
          errors.push('Rate limit value must be a positive number');
        }
        if (!constraint.windowMs || constraint.windowMs <= 0) {
          errors.push('Rate limit window must be a positive number');
        }
        break;
      case 'token_limit':
        if (typeof constraint.value !== 'number' || constraint.value <= 0) {
          errors.push('Token limit value must be a positive number');
        }
        break;
      case 'time_limit':
        if (typeof constraint.value !== 'number' || constraint.value <= 0) {
          errors.push('Time limit value must be a positive number');
        }
        break;
    }

    return errors;
  }

  /**
   * Get agent status and health
   */
  async getAgentStatus(agentId: string): Promise<{
    agent: Agent | null;
    status: AgentStatus;
    isHealthy: boolean;
    lastActivity: string;
    currentExecutions: number;
    queueLength: number;
    errorRate: number;
  }> {
    const agent = await this.getAgent(agentId);
    if (!agent) {
      return {
        agent: null,
        status: 'idle',
        isHealthy: false,
        lastActivity: '',
        currentExecutions: 0,
        queueLength: 0,
        errorRate: 0
      };
    }

    // In a real implementation, these would come from monitoring/metrics
    return {
      agent,
      status: agent.isActive ? 'idle' : 'paused',
      isHealthy: agent.isActive,
      lastActivity: agent.updatedAt,
      currentExecutions: 0,
      queueLength: 0,
      errorRate: 0
    };
  }

  /**
   * Initialize default agents for OpsCrew
   */
  private initializeDefaultAgents(): void {
    // Intake Agent
    const intakePersona: AgentPersona = {
      id: 'intake-persona',
      name: 'Lead Intake Specialist',
      description: 'Expert at qualifying leads and generating proposals',
      systemPrompt: `You are an AI Lead Intake Specialist for OpsCrew, an AI-driven multi-agent operations platform for agencies.

Your role is to:
1. Qualify incoming leads through intelligent conversation
2. Gather detailed project requirements and constraints
3. Assess budget, timeline, and scope feasibility
4. Generate professional proposals and Statements of Work (SoW)
5. Identify decision makers and stakeholders
6. Determine project complexity and resource requirements

Key capabilities:
- Lead qualification and scoring
- Requirements gathering and analysis
- Proposal and SoW generation
- Budget and timeline estimation
- Stakeholder identification
- Project complexity assessment

Always maintain a professional, consultative tone while being thorough in your qualification process. Ask follow-up questions to ensure you have complete information before generating proposals.`,
      temperature: 0.7,
      maxTokens: 4000,
      allowedActions: [
        'qualify_lead',
        'gather_requirements',
        'generate_proposal',
        'generate_sow',
        'estimate_budget',
        'assess_timeline',
        'identify_stakeholders'
      ],
      personality: {
        tone: 'professional',
        communicationStyle: 'consultative',
        expertise: ['lead qualification', 'proposal writing', 'requirements analysis', 'sales process']
      },
      contextWindow: {
        maxMessages: 50,
        maxTokens: 8000,
        retentionPolicy: 'sliding'
      }
    };

    const intakeAgent: Agent = {
      id: 'intake-agent',
      type: 'intake',
      name: 'Lead Intake Agent',
      description: 'Automated lead qualification and proposal generation',
      version: '1.0.0',
      isActive: true,
      persona: intakePersona,
      capabilities: [
        'qualify-lead',
        'generate-proposal',
        'estimate-budget',
        'assess-timeline'
      ],
      constraints: [
        {
          id: 'rate-limit',
          type: 'rate_limit',
          value: 100,
          windowMs: 3600000, // 1 hour
          description: 'Maximum 100 requests per hour'
        },
        {
          id: 'token-limit',
          type: 'token_limit',
          value: 10000,
          description: 'Maximum 10,000 tokens per request'
        },
        {
          id: 'approval-required',
          type: 'approval_required',
          value: 'proposal_generation',
          description: 'Proposal generation requires human approval'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Spin-Up Agent
    const spinUpPersona: AgentPersona = {
      id: 'spin-up-persona',
      name: 'Project Spin-Up Specialist',
      description: 'Expert at provisioning projects and setting up infrastructure',
      systemPrompt: `You are an AI Project Spin-Up Specialist for OpsCrew.

Your role is to:
1. Analyze project requirements and recommend optimal tech stacks
2. Provision repositories and development environments
3. Set up CI/CD pipelines and deployment infrastructure
4. Configure project templates and boilerplate code
5. Create branded client portals
6. Manage secrets and environment variables
7. Set up monitoring and logging

Key capabilities:
- Tech stack analysis and recommendation
- Repository provisioning and configuration
- Infrastructure setup and automation
- Environment management
- Client portal creation
- Security and compliance setup

Always prioritize security, scalability, and maintainability in your recommendations. Follow industry best practices and ensure all setups are production-ready.`,
      temperature: 0.5,
      maxTokens: 3000,
      allowedActions: [
        'analyze_requirements',
        'recommend_stack',
        'provision_repo',
        'setup_infrastructure',
        'create_environments',
        'configure_ci_cd',
        'create_client_portal'
      ],
      personality: {
        tone: 'technical',
        communicationStyle: 'detailed',
        expertise: ['devops', 'infrastructure', 'cloud platforms', 'ci/cd', 'security']
      },
      contextWindow: {
        maxMessages: 30,
        maxTokens: 6000,
        retentionPolicy: 'fixed'
      }
    };

    const spinUpAgent: Agent = {
      id: 'spin-up-agent',
      type: 'spin-up',
      name: 'Project Spin-Up Agent',
      description: 'Automated project provisioning and infrastructure setup',
      version: '1.0.0',
      isActive: true,
      persona: spinUpPersona,
      capabilities: [
        'analyze-requirements',
        'provision-repo',
        'setup-infrastructure',
        'create-environments'
      ],
      constraints: [
        {
          id: 'rate-limit',
          type: 'rate_limit',
          value: 50,
          windowMs: 3600000,
          description: 'Maximum 50 requests per hour'
        },
        {
          id: 'time-limit',
          type: 'time_limit',
          value: 300000, // 5 minutes
          description: 'Maximum 5 minutes per execution'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // PM Agent
    const pmPersona: AgentPersona = {
      id: 'pm-persona',
      name: 'Project Management Specialist',
      description: 'Expert at sprint planning and task management',
      systemPrompt: `You are an AI Project Management Specialist for OpsCrew.

Your role is to:
1. Analyze project backlogs and prioritize tasks
2. Create detailed sprint plans with realistic timelines
3. Generate user stories with acceptance criteria
4. Assign tasks to team members based on skills and availability
5. Track progress and identify blockers
6. Generate project reports and status updates
7. Manage dependencies and critical path

Key capabilities:
- Sprint planning and estimation
- Task breakdown and prioritization
- Resource allocation and assignment
- Progress tracking and reporting
- Blocker identification and resolution
- Risk assessment and mitigation

Always consider team capacity, dependencies, and business priorities when planning. Use agile methodologies and ensure all tasks have clear acceptance criteria.`,
      temperature: 0.6,
      maxTokens: 5000,
      allowedActions: [
        'analyze_backlog',
        'create_sprint',
        'generate_tasks',
        'assign_tasks',
        'track_progress',
        'identify_blockers',
        'generate_reports'
      ],
      personality: {
        tone: 'professional',
        communicationStyle: 'detailed',
        expertise: ['project management', 'agile methodologies', 'team coordination', 'risk management']
      },
      contextWindow: {
        maxMessages: 40,
        maxTokens: 10000,
        retentionPolicy: 'sliding'
      }
    };

    const pmAgent: Agent = {
      id: 'pm-agent',
      type: 'pm',
      name: 'Project Management Agent',
      description: 'Automated sprint planning and task management',
      version: '1.0.0',
      isActive: true,
      persona: pmPersona,
      capabilities: [
        'analyze-backlog',
        'create-sprint',
        'generate-tasks',
        'track-progress'
      ],
      constraints: [
        {
          id: 'rate-limit',
          type: 'rate_limit',
          value: 200,
          windowMs: 3600000,
          description: 'Maximum 200 requests per hour'
        },
        {
          id: 'approval-required',
          type: 'approval_required',
          value: 'sprint_creation',
          description: 'Sprint creation requires PM approval'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Comms Agent
    const commsPersona: AgentPersona = {
      id: 'comms-persona',
      name: 'Communications Specialist',
      description: 'Expert at meeting summaries and stakeholder communication',
      systemPrompt: `You are an AI Communications Specialist for OpsCrew.

Your role is to:
1. Summarize meetings and extract key action items
2. Generate client updates and status reports
3. Draft emails and communications
4. Convert meeting notes into actionable tasks
5. Maintain stakeholder engagement
6. Handle client feedback and concerns

Key capabilities:
- Meeting transcription and summarization
- Action item extraction and task creation
- Client communication drafting
- Status report generation
- Stakeholder management
- Feedback processing

Always maintain a professional, clear communication style. Ensure all action items are specific, measurable, and assigned to appropriate team members.`,
      temperature: 0.8,
      maxTokens: 3000,
      allowedActions: [
        'summarize_meeting',
        'extract_action_items',
        'draft_communication',
        'generate_status_report',
        'process_feedback'
      ],
      personality: {
        tone: 'friendly',
        communicationStyle: 'conversational',
        expertise: ['communication', 'meeting facilitation', 'stakeholder management', 'content creation']
      },
      contextWindow: {
        maxMessages: 60,
        maxTokens: 8000,
        retentionPolicy: 'sliding'
      }
    };

    const commsAgent: Agent = {
      id: 'comms-agent',
      type: 'comms',
      name: 'Communications Agent',
      description: 'Automated meeting summaries and stakeholder communication',
      version: '1.0.0',
      isActive: true,
      persona: commsPersona,
      capabilities: [
        'summarize-meeting',
        'extract-action-items',
        'draft-communication'
      ],
      constraints: [
        {
          id: 'rate-limit',
          type: 'rate_limit',
          value: 150,
          windowMs: 3600000,
          description: 'Maximum 150 requests per hour'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Research Agent
    const researchPersona: AgentPersona = {
      id: 'research-persona',
      name: 'Research & Copilot Specialist',
      description: 'Expert at technical research and code generation',
      systemPrompt: `You are an AI Research & Copilot Specialist for OpsCrew.

Your role is to:
1. Research technical solutions and best practices
2. Generate technical specifications and documentation
3. Create user stories and acceptance criteria
4. Draft code snippets and implementation guides
5. Generate test plans and QA strategies
6. Provide technical recommendations

Key capabilities:
- Technical research and analysis
- Specification generation
- Code generation and review
- Documentation creation
- Test planning
- Architecture recommendations

Always provide accurate, up-to-date technical information. Follow coding best practices and ensure all generated code is production-ready and well-documented.`,
      temperature: 0.3,
      maxTokens: 6000,
      allowedActions: [
        'research_technology',
        'generate_specs',
        'create_user_stories',
        'generate_code',
        'create_test_plans',
        'review_code'
      ],
      personality: {
        tone: 'technical',
        communicationStyle: 'detailed',
        expertise: ['software development', 'architecture', 'testing', 'documentation', 'research']
      },
      contextWindow: {
        maxMessages: 20,
        maxTokens: 12000,
        retentionPolicy: 'fixed'
      }
    };

    const researchAgent: Agent = {
      id: 'research-agent',
      type: 'research',
      name: 'Research & Copilot Agent',
      description: 'Automated technical research and code generation',
      version: '1.0.0',
      isActive: true,
      persona: researchPersona,
      capabilities: [
        'research-technology',
        'generate-specs',
        'create-user-stories',
        'generate-code'
      ],
      constraints: [
        {
          id: 'rate-limit',
          type: 'rate_limit',
          value: 100,
          windowMs: 3600000,
          description: 'Maximum 100 requests per hour'
        },
        {
          id: 'approval-required',
          type: 'approval_required',
          value: 'code_generation',
          description: 'Code generation requires developer approval'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Launch Agent
    const launchPersona: AgentPersona = {
      id: 'launch-persona',
      name: 'Launch & Release Specialist',
      description: 'Expert at deployment coordination and release management',
      systemPrompt: `You are an AI Launch & Release Specialist for OpsCrew.

Your role is to:
1. Run pre-launch checklists and quality gates
2. Coordinate deployments across environments
3. Generate release notes and documentation
4. Schedule stakeholder communications
5. Monitor deployment health and rollback if needed
6. Manage release timelines and dependencies

Key capabilities:
- Pre-launch validation
- Deployment coordination
- Release note generation
- Stakeholder communication
- Health monitoring
- Rollback management

Always prioritize stability and user experience. Ensure all deployments are thoroughly tested and have proper rollback procedures in place.`,
      temperature: 0.4,
      maxTokens: 4000,
      allowedActions: [
        'run_checklist',
        'coordinate_deployment',
        'generate_release_notes',
        'schedule_communications',
        'monitor_health',
        'execute_rollback'
      ],
      personality: {
        tone: 'professional',
        communicationStyle: 'concise',
        expertise: ['deployment', 'release management', 'quality assurance', 'monitoring']
      },
      contextWindow: {
        maxMessages: 25,
        maxTokens: 6000,
        retentionPolicy: 'sliding'
      }
    };

    const launchAgent: Agent = {
      id: 'launch-agent',
      type: 'launch',
      name: 'Launch & Release Agent',
      description: 'Automated deployment coordination and release management',
      version: '1.0.0',
      isActive: true,
      persona: launchPersona,
      capabilities: [
        'run-checklist',
        'coordinate-deployment',
        'generate-release-notes'
      ],
      constraints: [
        {
          id: 'rate-limit',
          type: 'rate_limit',
          value: 30,
          windowMs: 3600000,
          description: 'Maximum 30 requests per hour'
        },
        {
          id: 'approval-required',
          type: 'approval_required',
          value: 'production_deployment',
          description: 'Production deployments require approval'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Handover Agent
    const handoverPersona: AgentPersona = {
      id: 'handover-persona',
      name: 'Handover & Knowledge Specialist',
      description: 'Expert at knowledge transfer and project handover',
      systemPrompt: `You are an AI Handover & Knowledge Specialist for OpsCrew.

Your role is to:
1. Compile project documentation and deliverables
2. Create knowledge base articles and tutorials
3. Generate handover packages for clients
4. Schedule renewal and maintenance workflows
5. Create training materials and guides
6. Manage project closure and transition

Key capabilities:
- Documentation compilation
- Knowledge base creation
- Handover package generation
- Training material creation
- Renewal workflow management
- Project closure coordination

Always ensure comprehensive documentation and smooth knowledge transfer. Create materials that enable clients to maintain and extend their projects independently.`,
      temperature: 0.6,
      maxTokens: 5000,
      allowedActions: [
        'compile_documentation',
        'create_knowledge_base',
        'generate_handover_package',
        'create_training_materials',
        'schedule_renewals'
      ],
      personality: {
        tone: 'professional',
        communicationStyle: 'detailed',
        expertise: ['documentation', 'knowledge management', 'training', 'project closure']
      },
      contextWindow: {
        maxMessages: 35,
        maxTokens: 8000,
        retentionPolicy: 'fixed'
      }
    };

    const handoverAgent: Agent = {
      id: 'handover-agent',
      type: 'handover',
      name: 'Handover & Knowledge Agent',
      description: 'Automated knowledge transfer and project handover',
      version: '1.0.0',
      isActive: true,
      persona: handoverPersona,
      capabilities: [
        'compile-documentation',
        'create-knowledge-base',
        'generate-handover-package'
      ],
      constraints: [
        {
          id: 'rate-limit',
          type: 'rate_limit',
          value: 50,
          windowMs: 3600000,
          description: 'Maximum 50 requests per hour'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Support Agent
    const supportPersona: AgentPersona = {
      id: 'support-persona',
      name: 'Support & SLA Specialist',
      description: 'Expert at ticket triage and SLA management',
      systemPrompt: `You are an AI Support & SLA Specialist for OpsCrew.

Your role is to:
1. Triage incoming support tickets and prioritize by SLA
2. Suggest responses and solutions based on knowledge base
3. Escalate complex issues to appropriate team members
4. Monitor SLA compliance and trigger escalations
5. Generate support reports and metrics
6. Maintain customer satisfaction

Key capabilities:
- Ticket triage and prioritization
- Solution suggestion and routing
- SLA monitoring and escalation
- Customer communication
- Knowledge base management
- Metrics and reporting

Always prioritize customer satisfaction and SLA compliance. Provide accurate, helpful responses and escalate when necessary to ensure timely resolution.`,
      temperature: 0.7,
      maxTokens: 3000,
      allowedActions: [
        'triage_ticket',
        'suggest_solution',
        'escalate_issue',
        'monitor_sla',
        'generate_response',
        'update_knowledge_base'
      ],
      personality: {
        tone: 'friendly',
        communicationStyle: 'conversational',
        expertise: ['customer support', 'troubleshooting', 'sla management', 'knowledge base']
      },
      contextWindow: {
        maxMessages: 50,
        maxTokens: 6000,
        retentionPolicy: 'sliding'
      }
    };

    const supportAgent: Agent = {
      id: 'support-agent',
      type: 'support',
      name: 'Support & SLA Agent',
      description: 'Automated ticket triage and SLA management',
      version: '1.0.0',
      isActive: true,
      persona: supportPersona,
      capabilities: [
        'triage-ticket',
        'suggest-solution',
        'monitor-sla'
      ],
      constraints: [
        {
          id: 'rate-limit',
          type: 'rate_limit',
          value: 300,
          windowMs: 3600000,
          description: 'Maximum 300 requests per hour'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store personas
    this.personas.set(intakePersona.id, intakePersona);
    this.personas.set(spinUpPersona.id, spinUpPersona);
    this.personas.set(pmPersona.id, pmPersona);
    this.personas.set(commsPersona.id, commsPersona);
    this.personas.set(researchPersona.id, researchPersona);
    this.personas.set(launchPersona.id, launchPersona);
    this.personas.set(handoverPersona.id, handoverPersona);
    this.personas.set(supportPersona.id, supportPersona);

    // Store agents
    this.agents.set(intakeAgent.id, intakeAgent);
    this.agents.set(spinUpAgent.id, spinUpAgent);
    this.agents.set(pmAgent.id, pmAgent);
    this.agents.set(commsAgent.id, commsAgent);
    this.agents.set(researchAgent.id, researchAgent);
    this.agents.set(launchAgent.id, launchAgent);
    this.agents.set(handoverAgent.id, handoverAgent);
    this.agents.set(supportAgent.id, supportAgent);

    // Create capabilities
    this.createDefaultCapabilities();
  }

  /**
   * Create default capabilities for all agents
   */
  private createDefaultCapabilities(): void {
    const capabilities = [
      {
        name: 'qualify-lead',
        description: 'Qualify incoming leads and assess project fit',
        inputSchema: {
          leadData: { type: 'object', required: true },
          context: { type: 'object', required: false }
        },
        outputSchema: {
          qualification: { type: 'object', required: true },
          score: { type: 'number', required: true }
        },
        isAsync: false,
        timeoutMs: 30000,
        retryPolicy: {
          maxAttempts: 3,
          backoffMs: 1000,
          backoffMultiplier: 2,
          maxBackoffMs: 10000
        }
      },
      {
        name: 'generate-proposal',
        description: 'Generate professional proposals and SoWs',
        inputSchema: {
          requirements: { type: 'object', required: true },
          templates: { type: 'array', required: false }
        },
        outputSchema: {
          proposal: { type: 'object', required: true },
          sow: { type: 'object', required: true }
        },
        isAsync: true,
        timeoutMs: 120000,
        retryPolicy: {
          maxAttempts: 2,
          backoffMs: 5000,
          backoffMultiplier: 2,
          maxBackoffMs: 20000
        }
      },
      {
        name: 'provision-repo',
        description: 'Provision Git repository with project structure',
        inputSchema: {
          projectName: { type: 'string', required: true },
          stack: { type: 'string', required: true }
        },
        outputSchema: {
          repoUrl: { type: 'string', required: true },
          repoId: { type: 'string', required: true }
        },
        isAsync: true,
        timeoutMs: 180000,
        retryPolicy: {
          maxAttempts: 3,
          backoffMs: 10000,
          backoffMultiplier: 2,
          maxBackoffMs: 60000
        }
      },
      {
        name: 'create-sprint',
        description: 'Create sprint plan with tasks and assignments',
        inputSchema: {
          backlog: { type: 'array', required: true },
          teamCapacity: { type: 'object', required: true }
        },
        outputSchema: {
          sprint: { type: 'object', required: true },
          tasks: { type: 'array', required: true }
        },
        isAsync: false,
        timeoutMs: 90000,
        retryPolicy: {
          maxAttempts: 2,
          backoffMs: 5000,
          backoffMultiplier: 2,
          maxBackoffMs: 20000
        }
      }
    ];

    capabilities.forEach(cap => {
      this.createCapability(cap);
    });
  }

  /**
   * Generate unique agent ID
   */
  private generateAgentId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique persona ID
   */
  private generatePersonaId(): string {
    return `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique capability ID
   */
  private generateCapabilityId(): string {
    return `capability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get agent statistics
   */
  async getAgentStats(): Promise<{
    totalAgents: number;
    activeAgents: number;
    agentsByType: Record<AgentType, number>;
    totalPersonas: number;
    totalCapabilities: number;
  }> {
    const agents = Array.from(this.agents.values());
    const personas = Array.from(this.personas.values());
    const capabilities = Array.from(this.capabilities.values());

    const agentsByType = agents.reduce((acc, agent) => {
      acc[agent.type] = (acc[agent.type] || 0) + 1;
      return acc;
    }, {} as Record<AgentType, number>);

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.isActive).length,
      agentsByType,
      totalPersonas: personas.length,
      totalCapabilities: capabilities.length
    };
  }
}