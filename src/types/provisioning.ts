// Project Provisioning Types for OpsCrew

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'api' | 'fullstack' | 'ai' | 'custom';
  stack: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    deployment?: string[];
    tools?: string[];
  };
  features: string[];
  estimatedDuration: string;
  complexity: 'simple' | 'medium' | 'complex';
  icon: string;
  preview?: string;
}

export interface GitProvider {
  id: string;
  name: string;
  type: 'github' | 'gitlab' | 'bitbucket';
  isConnected: boolean;
  username?: string;
  avatar?: string;
  repositories?: GitRepository[];
}

export interface GitRepository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  isPrivate: boolean;
  language?: string;
  updatedAt: string;
  cloneUrl: string;
  sshUrl: string;
}

export interface DeploymentProvider {
  id: string;
  name: string;
  type: 'vercel' | 'cloudflare' | 'netlify' | 'aws' | 'custom';
  isConnected: boolean;
  regions?: string[];
  plans?: DeploymentPlan[];
}

export interface DeploymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: {
    bandwidth: string;
    storage: string;
    builds: string;
    domains: string;
  };
}

export interface EnvironmentConfig {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  domain?: string;
  variables: EnvironmentVariable[];
  secrets: Secret[];
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
}

export interface Secret {
  key: string;
  description: string;
  isRequired: boolean;
  value?: string;
}

export interface ClientPortalConfig {
  id: string;
  projectId: string;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    customCss?: string;
  };
  features: {
    projectStatus: boolean;
    documents: boolean;
    communications: boolean;
    billing: boolean;
    feedback: boolean;
  };
  access: {
    requiresAuth: boolean;
    allowedDomains?: string[];
    passwordProtected?: boolean;
  };
}

export interface ProvisioningStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  error?: string;
  logs?: ProvisioningLog[];
}

export interface ProvisioningLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: any;
}

export interface ProvisioningRequest {
  id: string;
  projectName: string;
  description?: string;
  template: ProjectTemplate;
  gitProvider: GitProvider;
  repository: {
    name: string;
    description?: string;
    isPrivate: boolean;
    initializeReadme: boolean;
    initializeGitignore: boolean;
  };
  deployment: {
    provider: DeploymentProvider;
    plan?: DeploymentPlan;
    region?: string;
    customDomain?: string;
  };
  environments: EnvironmentConfig[];
  clientPortal: ClientPortalConfig;
  integrations: {
    slack?: boolean;
    discord?: boolean;
    email?: boolean;
    webhooks?: string[];
  };
  settings: {
    autoDeploy: boolean;
    branchProtection: boolean;
    codeReview: boolean;
    securityScanning: boolean;
  };
  status: 'draft' | 'provisioning' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  steps: ProvisioningStep[];
  createdBy: string;
  organizationId: string;
}

export interface ProvisioningResponse {
  success: boolean;
  requestId: string;
  projectId?: string;
  repositoryUrl?: string;
  deploymentUrl?: string;
  clientPortalUrl?: string;
  message: string;
  steps: ProvisioningStep[];
}

export interface ProvisioningError {
  code: string;
  message: string;
  step?: string;
  details?: any;
}

export interface ProvisioningStatus {
  requestId: string;
  status: 'draft' | 'provisioning' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep?: string;
  steps: ProvisioningStep[];
  estimatedTimeRemaining?: number; // in minutes
  logs: ProvisioningLog[];
}

// Form validation schemas
export interface ProvisioningFormData {
  // Step 1: Project Details
  projectName: string;
  description: string;
  templateId: string;
  
  // Step 2: Git Configuration
  gitProviderId: string;
  repositoryName: string;
  repositoryDescription: string;
  isPrivate: boolean;
  initializeReadme: boolean;
  initializeGitignore: boolean;
  
  // Step 3: Deployment Configuration
  deploymentProviderId: string;
  deploymentPlanId?: string;
  region?: string;
  customDomain?: string;
  
  // Step 4: Environment Configuration
  environments: Array<{
    name: string;
    type: 'development' | 'staging' | 'production';
    domain?: string;
    variables: Array<{
      key: string;
      value: string;
      isSecret: boolean;
    }>;
  }>;
  
  // Step 5: Client Portal Configuration
  clientPortal: {
    branding: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      customCss?: string;
    };
    features: {
      projectStatus: boolean;
      documents: boolean;
      communications: boolean;
      billing: boolean;
      feedback: boolean;
    };
    access: {
      requiresAuth: boolean;
      allowedDomains?: string[];
      passwordProtected?: boolean;
    };
  };
  
  // Step 6: Integrations & Settings
  integrations: {
    slack: boolean;
    discord: boolean;
    email: boolean;
    webhooks: string[];
  };
  settings: {
    autoDeploy: boolean;
    branchProtection: boolean;
    codeReview: boolean;
    securityScanning: boolean;
  };
}

// API Response types
export interface TemplatesResponse {
  templates: ProjectTemplate[];
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

export interface ProvidersResponse {
  gitProviders: GitProvider[];
  deploymentProviders: DeploymentProvider[];
}

export interface ProvisioningCreateRequest {
  projectName: string;
  description?: string;
  templateId: string;
  gitProviderId: string;
  repositoryName: string;
  repositoryDescription?: string;
  isPrivate: boolean;
  initializeReadme: boolean;
  initializeGitignore: boolean;
  deploymentProviderId: string;
  deploymentPlanId?: string;
  region?: string;
  customDomain?: string;
  environments: Omit<EnvironmentConfig, 'id'>[];
  clientPortal: Omit<ClientPortalConfig, 'id' | 'projectId'>;
  integrations: ProvisioningRequest['integrations'];
  settings: ProvisioningRequest['settings'];
}