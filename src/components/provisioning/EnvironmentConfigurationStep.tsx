import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Server, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Code,
  Database,
  Key,
  Globe
} from 'lucide-react';
import type { ProvisioningFormValues } from '@/types/provisioning';

interface EnvironmentConfigurationStepProps {
  form: UseFormReturn<ProvisioningFormValues>;
  templates: any[];
  gitProviders: any[];
  deploymentProviders: any[];
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: (data: ProvisioningFormValues) => void;
  onProvisioningComplete: () => void;
  onProvisioningFailure: () => void;
  isProvisioning: boolean;
  provisioningRequestId: string | null;
  currentStep: number;
  totalSteps: number;
}

export default function EnvironmentConfigurationStep({
  form,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}: EnvironmentConfigurationStepProps) {
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  const { watch, setValue, formState: { errors } } = form;
  const environments = watch('environments') || [];

  // Get environment type color
  const getEnvironmentTypeColor = (type: string) => {
    switch (type) {
      case 'development': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'staging': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'production': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // Get environment type icon
  const getEnvironmentTypeIcon = (type: string) => {
    switch (type) {
      case 'development': return <Code className="h-4 w-4" />;
      case 'staging': return <Database className="h-4 w-4" />;
      case 'production': return <Globe className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  // Add new environment
  const addEnvironment = () => {
    const newEnvironment = {
      name: '',
      type: 'development' as const,
      domain: '',
      variables: []
    };
    setValue('environments', [...environments, newEnvironment]);
  };

  // Remove environment
  const removeEnvironment = (index: number) => {
    if (environments.length > 1) {
      const newEnvironments = environments.filter((_, i) => i !== index);
      setValue('environments', newEnvironments);
    }
  };

  // Update environment
  const updateEnvironment = (index: number, field: string, value: any) => {
    const newEnvironments = [...environments];
    newEnvironments[index] = { ...newEnvironments[index], [field]: value };
    setValue('environments', newEnvironments);
  };

  // Add variable to environment
  const addVariable = (envIndex: number) => {
    const newEnvironments = [...environments];
    newEnvironments[envIndex].variables.push({
      key: '',
      value: '',
      isSecret: false
    });
    setValue('environments', newEnvironments);
  };

  // Remove variable from environment
  const removeVariable = (envIndex: number, varIndex: number) => {
    const newEnvironments = [...environments];
    newEnvironments[envIndex].variables = newEnvironments[envIndex].variables.filter((_, i) => i !== varIndex);
    setValue('environments', newEnvironments);
  };

  // Update variable
  const updateVariable = (envIndex: number, varIndex: number, field: string, value: any) => {
    const newEnvironments = [...environments];
    newEnvironments[envIndex].variables[varIndex] = {
      ...newEnvironments[envIndex].variables[varIndex],
      [field]: value
    };
    setValue('environments', newEnvironments);
  };

  // Toggle secret visibility
  const toggleSecretVisibility = (envIndex: number, varIndex: number) => {
    const key = `${envIndex}-${varIndex}`;
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Environment Configuration Header */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Environment Configuration</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Configure your development, staging, and production environments with their specific variables and settings.
          </p>
        </div>
      </div>

      {/* Environments List */}
      <div className="space-y-6">
        {environments.map((environment, envIndex) => (
          <Card key={envIndex} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getEnvironmentTypeIcon(environment.type)}
                  </div>
                  <div>
                    <CardTitle className="text-base">Environment {envIndex + 1}</CardTitle>
                    <CardDescription>
                      {environment.name || 'Unnamed environment'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getEnvironmentTypeColor(environment.type)}>
                    {environment.type}
                  </Badge>
                  {environments.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEnvironment(envIndex)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Environment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`env-${envIndex}-name`}>Environment Name *</Label>
                  <Input
                    id={`env-${envIndex}-name`}
                    placeholder="e.g., Development, Staging, Production"
                    value={environment.name}
                    onChange={(e) => updateEnvironment(envIndex, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`env-${envIndex}-type`}>Environment Type *</Label>
                  <select
                    id={`env-${envIndex}-type`}
                    value={environment.type}
                    onChange={(e) => updateEnvironment(envIndex, 'type', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`env-${envIndex}-domain`}>Domain (Optional)</Label>
                <Input
                  id={`env-${envIndex}-domain`}
                  placeholder="e.g., dev.example.com, staging.example.com"
                  value={environment.domain || ''}
                  onChange={(e) => updateEnvironment(envIndex, 'domain', e.target.value)}
                />
              </div>

              {/* Environment Variables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Environment Variables</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addVariable(envIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>

                {environment.variables.length > 0 ? (
                  <div className="space-y-3">
                    {environment.variables.map((variable, varIndex) => (
                      <div key={varIndex} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-border rounded-lg">
                        <div className="space-y-1">
                          <Label htmlFor={`env-${envIndex}-var-${varIndex}-key`}>Key</Label>
                          <Input
                            id={`env-${envIndex}-var-${varIndex}-key`}
                            placeholder="VARIABLE_NAME"
                            value={variable.key}
                            onChange={(e) => updateVariable(envIndex, varIndex, 'key', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`env-${envIndex}-var-${varIndex}-value`}>Value</Label>
                          <div className="relative">
                            <Input
                              id={`env-${envIndex}-var-${varIndex}-value`}
                              type={showSecrets[`${envIndex}-${varIndex}`] ? 'text' : 'password'}
                              placeholder="variable value"
                              value={variable.value}
                              onChange={(e) => updateVariable(envIndex, varIndex, 'value', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => toggleSecretVisibility(envIndex, varIndex)}
                            >
                              {showSecrets[`${envIndex}-${varIndex}`] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`env-${envIndex}-var-${varIndex}-secret`}
                              checked={variable.isSecret}
                              onCheckedChange={(checked) => updateVariable(envIndex, varIndex, 'isSecret', checked)}
                            />
                            <Label htmlFor={`env-${envIndex}-var-${varIndex}-secret`} className="text-sm">
                              Secret
                            </Label>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariable(envIndex, varIndex)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                    <Key className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No environment variables configured</p>
                    <p className="text-xs text-muted-foreground">Add variables like API keys, database URLs, etc.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Environment Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addEnvironment}
          className="border-dashed border-2 border-border hover:border-primary/50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Environment
        </Button>
      </div>

      {/* Common Variables Suggestion */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Common Environment Variables</CardTitle>
          <CardDescription>
            Here are some common variables you might want to add to your environments:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="space-y-1">
              <div className="font-medium">Database</div>
              <div className="text-muted-foreground">DATABASE_URL, DB_HOST, DB_PORT, DB_NAME</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">API Keys</div>
              <div className="text-muted-foreground">API_KEY, SECRET_KEY, JWT_SECRET</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">External Services</div>
              <div className="text-muted-foreground">STRIPE_KEY, SENDGRID_API_KEY, AWS_ACCESS_KEY</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">App Settings</div>
              <div className="text-muted-foreground">NODE_ENV, PORT, CORS_ORIGIN, LOG_LEVEL</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={onNext}
          disabled={environments.length === 0 || environments.some(env => !env.name)}
          className="min-w-[120px]"
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}