import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2, 
  Settings, 
  GitBranch, 
  Cloud, 
  Server, 
  Users, 
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  X
} from "lucide-react";

// Types and API
import type { ProvisioningFormData, ProjectTemplate, GitProvider, DeploymentProvider } from '@/types/provisioning';
import { provisioningAPI } from '@/api/provisioning';

// Step Components
import ProjectDetailsStep from '@/components/provisioning/ProjectDetailsStep';
import GitConfigurationStep from '@/components/provisioning/GitConfigurationStep';
import DeploymentConfigurationStep from '@/components/provisioning/DeploymentConfigurationStep';
import EnvironmentConfigurationStep from '@/components/provisioning/EnvironmentConfigurationStep';
import ClientPortalConfigurationStep from '@/components/provisioning/ClientPortalConfigurationStep';
import IntegrationsSettingsStep from '@/components/provisioning/IntegrationsSettingsStep';
import ProvisioningProgressStep from '@/components/provisioning/ProvisioningProgressStep';

// Form validation schema
const provisioningSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(50, 'Project name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  templateId: z.string().min(1, 'Template selection is required'),
  gitProviderId: z.string().min(1, 'Git provider is required'),
  repositoryName: z.string().min(1, 'Repository name is required').max(50, 'Repository name must be less than 50 characters'),
  repositoryDescription: z.string().max(200, 'Repository description must be less than 200 characters').optional(),
  isPrivate: z.boolean().default(false),
  initializeReadme: z.boolean().default(true),
  initializeGitignore: z.boolean().default(true),
  deploymentProviderId: z.string().min(1, 'Deployment provider is required'),
  deploymentPlanId: z.string().optional(),
  region: z.string().optional(),
  customDomain: z.string().optional(),
  environments: z.array(z.object({
    name: z.string().min(1, 'Environment name is required'),
    type: z.enum(['development', 'staging', 'production']),
    domain: z.string().optional(),
    variables: z.array(z.object({
      key: z.string().min(1, 'Variable key is required'),
      value: z.string().min(1, 'Variable value is required'),
      isSecret: z.boolean().default(false),
    })).default([]),
  })).min(1, 'At least one environment is required'),
  clientPortal: z.object({
    branding: z.object({
      primaryColor: z.string().min(1, 'Primary color is required'),
      secondaryColor: z.string().min(1, 'Secondary color is required'),
      fontFamily: z.string().min(1, 'Font family is required'),
      customCss: z.string().optional(),
    }),
    features: z.object({
      projectStatus: z.boolean().default(true),
      documents: z.boolean().default(true),
      communications: z.boolean().default(true),
      billing: z.boolean().default(false),
      feedback: z.boolean().default(true),
    }),
    access: z.object({
      requiresAuth: z.boolean().default(true),
      allowedDomains: z.array(z.string()).optional(),
      passwordProtected: z.boolean().default(false),
    }),
  }),
  integrations: z.object({
    slack: z.boolean().default(false),
    discord: z.boolean().default(false),
    email: z.boolean().default(true),
    webhooks: z.array(z.string()).default([]),
  }),
  settings: z.object({
    autoDeploy: z.boolean().default(true),
    branchProtection: z.boolean().default(true),
    codeReview: z.boolean().default(true),
    securityScanning: z.boolean().default(true),
  }),
});

type ProvisioningFormValues = z.infer<typeof provisioningSchema>;

// Wizard steps configuration
const WIZARD_STEPS = [
  {
    id: 'project-details',
    title: 'Project Details',
    description: 'Choose template and basic project information',
    icon: Settings,
    component: ProjectDetailsStep,
  },
  {
    id: 'git-configuration',
    title: 'Git Configuration',
    description: 'Connect Git provider and configure repository',
    icon: GitBranch,
    component: GitConfigurationStep,
  },
  {
    id: 'deployment-configuration',
    title: 'Deployment Configuration',
    description: 'Set up deployment and hosting options',
    icon: Cloud,
    component: DeploymentConfigurationStep,
  },
  {
    id: 'environment-configuration',
    title: 'Environment Configuration',
    description: 'Configure environments and variables',
    icon: Server,
    component: EnvironmentConfigurationStep,
  },
  {
    id: 'client-portal-configuration',
    title: 'Client Portal Configuration',
    description: 'Customize client portal branding and features',
    icon: Users,
    component: ClientPortalConfigurationStep,
  },
  {
    id: 'integrations-settings',
    title: 'Integrations & Settings',
    description: 'Configure integrations and project settings',
    icon: Zap,
    component: IntegrationsSettingsStep,
  },
  {
    id: 'provisioning-progress',
    title: 'Provisioning Progress',
    description: 'Monitor the provisioning process',
    icon: Loader2,
    component: ProvisioningProgressStep,
  },
];

export default function ProjectProvisioning() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningRequestId, setProvisioningRequestId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [gitProviders, setGitProviders] = useState<GitProvider[]>([]);
  const [deploymentProviders, setDeploymentProviders] = useState<DeploymentProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form setup
  const form = useForm<ProvisioningFormValues>({
    resolver: zodResolver(provisioningSchema),
    defaultValues: {
      projectName: '',
      description: '',
      templateId: '',
      gitProviderId: '',
      repositoryName: '',
      repositoryDescription: '',
      isPrivate: false,
      initializeReadme: true,
      initializeGitignore: true,
      deploymentProviderId: '',
      deploymentPlanId: '',
      region: '',
      customDomain: '',
      environments: [
        {
          name: 'Development',
          type: 'development',
          variables: [],
        },
        {
          name: 'Staging',
          type: 'staging',
          variables: [],
        },
        {
          name: 'Production',
          type: 'production',
          variables: [],
        },
      ],
      clientPortal: {
        branding: {
          primaryColor: '#53B7FF',
          secondaryColor: '#22D3EE',
          fontFamily: 'Inter',
        },
        features: {
          projectStatus: true,
          documents: true,
          communications: true,
          billing: false,
          feedback: true,
        },
        access: {
          requiresAuth: true,
          passwordProtected: false,
        },
      },
      integrations: {
        slack: false,
        discord: false,
        email: true,
        webhooks: [],
      },
      settings: {
        autoDeploy: true,
        branchProtection: true,
        codeReview: true,
        securityScanning: true,
      },
    },
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [templatesResponse, providersResponse] = await Promise.all([
          provisioningAPI.getTemplates(),
          provisioningAPI.getProviders(),
        ]);
        
        setTemplates(templatesResponse.templates);
        setGitProviders(providersResponse.gitProviders);
        setDeploymentProviders(providersResponse.deploymentProviders);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load provisioning data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle step navigation
  const goToNextStep = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < WIZARD_STEPS.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Handle form submission
  const handleSubmit = async (data: ProvisioningFormValues) => {
    try {
      setIsProvisioning(true);
      setCurrentStep(WIZARD_STEPS.length - 1); // Go to progress step
      
      const response = await provisioningAPI.createProvisioningRequest(data);
      
      if (response.success) {
        setProvisioningRequestId(response.requestId);
        toast.success('Provisioning started successfully!');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Provisioning failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start provisioning');
      setCurrentStep(WIZARD_STEPS.length - 2); // Go back to previous step
    } finally {
      setIsProvisioning(false);
    }
  };

  // Handle provisioning completion
  const handleProvisioningComplete = () => {
    toast.success('Project provisioned successfully!');
    navigate('/dashboard');
  };

  // Handle provisioning failure
  const handleProvisioningFailure = () => {
    toast.error('Provisioning failed. Please check the logs and try again.');
    setCurrentStep(WIZARD_STEPS.length - 2); // Go back to previous step
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading provisioning data...</p>
        </div>
      </div>
    );
  }

  const currentStepConfig = WIZARD_STEPS[currentStep];
  const CurrentStepComponent = currentStepConfig.component;
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Project Provisioning</h1>
                <p className="text-sm text-muted-foreground">Set up your new project infrastructure</p>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {WIZARD_STEPS.length}
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Step Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Setup Steps</CardTitle>
                <CardDescription>
                  Complete each step to provision your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {WIZARD_STEPS.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isAccessible = index <= currentStep || isCompleted;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => isAccessible && goToStep(index)}
                      disabled={!isAccessible}
                      className={`
                        w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200
                        ${isCurrent 
                          ? 'bg-primary text-primary-foreground' 
                          : isCompleted 
                            ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                            : isAccessible
                              ? 'hover:bg-secondary text-foreground'
                              : 'text-muted-foreground cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : isCurrent ? (
                          <step.icon className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isCurrent ? 'text-primary-foreground' : ''}`}>
                          {step.title}
                        </p>
                        <p className={`text-xs ${isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {step.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <currentStepConfig.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{currentStepConfig.title}</CardTitle>
                    <CardDescription className="text-base">
                      {currentStepConfig.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CurrentStepComponent
                  form={form}
                  templates={templates}
                  gitProviders={gitProviders}
                  deploymentProviders={deploymentProviders}
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                  onSubmit={handleSubmit}
                  onProvisioningComplete={handleProvisioningComplete}
                  onProvisioningFailure={handleProvisioningFailure}
                  isProvisioning={isProvisioning}
                  provisioningRequestId={provisioningRequestId}
                  currentStep={currentStep}
                  totalSteps={WIZARD_STEPS.length}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
