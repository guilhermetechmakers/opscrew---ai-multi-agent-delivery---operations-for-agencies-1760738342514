import React, { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GitBranch, 
  Github, 
  Gitlab, 
  Code,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Loader2
} from 'lucide-react';
import type { ProvisioningFormValues, GitProvider } from '@/types/provisioning';
import { provisioningAPI } from '@/api/provisioning';

interface GitConfigurationStepProps {
  form: UseFormReturn<ProvisioningFormValues>;
  templates: any[];
  gitProviders: GitProvider[];
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

export default function GitConfigurationStep({
  form,
  gitProviders,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}: GitConfigurationStepProps) {
  const [selectedProvider, setSelectedProvider] = useState<GitProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  const { register, watch, setValue, formState: { errors } } = form;
  const watchedGitProviderId = watch('gitProviderId');
  const watchedRepositoryName = watch('repositoryName');

  // Get provider icon
  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'github': return <Github className="h-5 w-5" />;
      case 'gitlab': return <Gitlab className="h-5 w-5" />;
      case 'bitbucket': return <Code className="h-5 w-5" />;
      default: return <GitBranch className="h-5 w-5" />;
    }
  };

  // Handle provider selection
  const handleProviderSelect = (provider: GitProvider) => {
    setSelectedProvider(provider);
    setValue('gitProviderId', provider.id);
    setConnectionError(null);
    
    // Auto-generate repository name based on project name
    const projectName = watch('projectName');
    if (projectName) {
      setValue('repositoryName', projectName.toLowerCase().replace(/\s+/g, '-'));
    }
  };

  // Handle provider connection
  const handleConnectProvider = async (provider: GitProvider) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      // In a real implementation, this would open OAuth flow
      // For now, we'll simulate the connection
      const response = await provisioningAPI.connectGitProvider(provider.id, {});
      
      if (response.success) {
        // Update provider status
        provider.isConnected = true;
        setSelectedProvider(provider);
        
        // Load repositories
        await loadRepositories(provider.id);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to connect provider:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect provider');
    } finally {
      setIsConnecting(false);
    }
  };

  // Load repositories for connected provider
  const loadRepositories = async (providerId: string) => {
    try {
      setIsLoadingRepos(true);
      const provider = await provisioningAPI.getGitRepositories(providerId);
      setRepositories(provider.repositories || []);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // Validate repository name
  const validateRepositoryName = async (name: string) => {
    if (!selectedProvider || !name) return;
    
    try {
      const response = await provisioningAPI.validateRepositoryName(selectedProvider.id, name);
      return response.available;
    } catch (error) {
      console.error('Failed to validate repository name:', error);
      return false;
    }
  };

  // Load repositories when provider is selected and connected
  useEffect(() => {
    if (selectedProvider?.isConnected) {
      loadRepositories(selectedProvider.id);
    }
  }, [selectedProvider?.isConnected]);

  return (
    <div className="space-y-6">
      {/* Git Provider Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Git Provider</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Choose your preferred Git hosting provider to create and manage your repository.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gitProviders.map((provider) => (
              <Card
                key={provider.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  watchedGitProviderId === provider.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleProviderSelect(provider)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getProviderIcon(provider.type)}
                      <div>
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {provider.type}
                        </CardDescription>
                      </div>
                    </div>
                    {watchedGitProviderId === provider.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {provider.isConnected ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectProvider(provider);
                        }}
                        disabled={isConnecting}
                        className="w-full"
                      >
                        {isConnecting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ExternalLink className="h-4 w-4 mr-2" />
                        )}
                        Connect
                      </Button>
                    )}
                    
                    {provider.username && (
                      <div className="text-xs text-muted-foreground">
                        Connected as: {provider.username}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {connectionError && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{connectionError}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Repository Configuration */}
      {selectedProvider && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Repository Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repositoryName">Repository Name *</Label>
                <Input
                  id="repositoryName"
                  placeholder="Enter repository name"
                  {...register('repositoryName')}
                  className={errors.repositoryName ? 'border-destructive' : ''}
                />
                {errors.repositoryName && (
                  <p className="text-sm text-destructive">{errors.repositoryName.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Repository will be created as: {selectedProvider.username}/{watchedRepositoryName || 'repository-name'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="repositoryDescription">Description</Label>
                <Input
                  id="repositoryDescription"
                  placeholder="Brief repository description"
                  {...register('repositoryDescription')}
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrivate"
                  checked={watch('isPrivate')}
                  onCheckedChange={(checked) => setValue('isPrivate', checked as boolean)}
                />
                <Label htmlFor="isPrivate" className="text-sm">
                  Make this repository private
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="initializeReadme"
                  checked={watch('initializeReadme')}
                  onCheckedChange={(checked) => setValue('initializeReadme', checked as boolean)}
                />
                <Label htmlFor="initializeReadme" className="text-sm">
                  Initialize with README
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="initializeGitignore"
                  checked={watch('initializeGitignore')}
                  onCheckedChange={(checked) => setValue('initializeGitignore', checked as boolean)}
                />
                <Label htmlFor="initializeGitignore" className="text-sm">
                  Initialize with .gitignore
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Repositories */}
      {selectedProvider?.isConnected && repositories.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Existing Repositories</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can also choose to use an existing repository instead of creating a new one.
            </p>
            
            {isLoadingRepos ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading repositories...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {repositories.slice(0, 6).map((repo) => (
                  <Card
                    key={repo.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => setValue('repositoryName', repo.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{repo.name}</span>
                          {repo.isPrivate && (
                            <Badge variant="secondary" className="text-xs">Private</Badge>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={onNext}
          disabled={!watchedGitProviderId || !selectedProvider?.isConnected}
          className="min-w-[120px]"
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}