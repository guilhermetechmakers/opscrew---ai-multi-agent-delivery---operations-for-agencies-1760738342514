import React, { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Cloud, 
  Zap, 
  Globe, 
  Server,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Loader2,
  DollarSign
} from 'lucide-react';
import type { ProvisioningFormValues, DeploymentProvider } from '@/types/provisioning';
import { provisioningAPI } from '@/api/provisioning';

interface DeploymentConfigurationStepProps {
  form: UseFormReturn<ProvisioningFormValues>;
  templates: any[];
  gitProviders: any[];
  deploymentProviders: DeploymentProvider[];
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

export default function DeploymentConfigurationStep({
  form,
  deploymentProviders,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}: DeploymentConfigurationStepProps) {
  const [selectedProvider, setSelectedProvider] = useState<DeploymentProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const { register, watch, setValue, formState: { errors } } = form;
  const watchedDeploymentProviderId = watch('deploymentProviderId');
  const watchedDeploymentPlanId = watch('deploymentPlanId');
  const watchedRegion = watch('region');
  const watchedCustomDomain = watch('customDomain');

  // Get provider icon
  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'vercel': return <Zap className="h-5 w-5" />;
      case 'cloudflare': return <Cloud className="h-5 w-5" />;
      case 'netlify': return <Globe className="h-5 w-5" />;
      case 'aws': return <Server className="h-5 w-5" />;
      default: return <Cloud className="h-5 w-5" />;
    }
  };

  // Handle provider selection
  const handleProviderSelect = (provider: DeploymentProvider) => {
    setSelectedProvider(provider);
    setValue('deploymentProviderId', provider.id);
    setConnectionError(null);
    loadProviderData(provider.id);
  };

  // Handle provider connection
  const handleConnectProvider = async (provider: DeploymentProvider) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      // In a real implementation, this would open OAuth flow
      const response = await provisioningAPI.connectDeploymentProvider(provider.id, {});
      
      if (response.success) {
        provider.isConnected = true;
        setSelectedProvider(provider);
        loadProviderData(provider.id);
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

  // Load provider data (regions, plans)
  const loadProviderData = async (providerId: string) => {
    try {
      setIsLoadingData(true);
      const [regionsResponse, plansResponse] = await Promise.all([
        provisioningAPI.getDeploymentRegions(providerId),
        provisioningAPI.getDeploymentPlans(providerId)
      ]);
      
      setRegions(regionsResponse.regions);
      setPlans(plansResponse.plans);
    } catch (error) {
      console.error('Failed to load provider data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Validate domain
  const validateDomain = async (domain: string) => {
    if (!domain) return true;
    
    try {
      const response = await provisioningAPI.validateDomain(domain);
      return response.available;
    } catch (error) {
      console.error('Failed to validate domain:', error);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Deployment Provider Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Deployment Provider</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Choose where you want to deploy and host your application.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deploymentProviders.map((provider) => (
              <Card
                key={provider.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  watchedDeploymentProviderId === provider.id 
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
                    {watchedDeploymentProviderId === provider.id && (
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
                    
                    <div className="text-xs text-muted-foreground">
                      {provider.type === 'vercel' && 'Zero-config deployments'}
                      {provider.type === 'cloudflare' && 'Global edge network'}
                      {provider.type === 'netlify' && 'JAMstack hosting'}
                      {provider.type === 'aws' && 'Enterprise cloud platform'}
                    </div>
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

      {/* Deployment Configuration */}
      {selectedProvider && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Deployment Configuration</h3>
            
            {/* Region Selection */}
            {regions.length > 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="region">Deployment Region</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {regions.map((region) => (
                      <Card
                        key={region.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 ${
                          watchedRegion === region.id ? 'ring-2 ring-primary border-primary' : ''
                        }`}
                        onClick={() => setValue('region', region.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{region.name}</p>
                              <p className="text-xs text-muted-foreground">{region.location}</p>
                            </div>
                            {watchedRegion === region.id && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Plan Selection */}
            {plans.length > 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plan">Deployment Plan</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {plans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                          watchedDeploymentPlanId === plan.id ? 'ring-2 ring-primary border-primary' : ''
                        }`}
                        onClick={() => setValue('deploymentPlanId', plan.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{plan.name}</CardTitle>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{plan.price === 0 ? 'Free' : `$${plan.price}/mo`}</span>
                            </div>
                          </div>
                          <CardDescription className="text-sm">
                            {plan.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-foreground">Features:</div>
                            <div className="space-y-1">
                              {plan.features.slice(0, 3).map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <Zap className="h-3 w-3" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                              {plan.features.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{plan.features.length - 3} more features
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Domain */}
            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
              <Input
                id="customDomain"
                placeholder="example.com"
                {...register('customDomain')}
                className={errors.customDomain ? 'border-destructive' : ''}
              />
              {errors.customDomain && (
                <p className="text-sm text-destructive">{errors.customDomain.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Leave empty to use the default domain provided by the platform
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoadingData && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading deployment options...</span>
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
          disabled={!watchedDeploymentProviderId || !selectedProvider?.isConnected}
          className="min-w-[120px]"
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}