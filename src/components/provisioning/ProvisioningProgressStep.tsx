import React, { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  RefreshCw,
  X,
  Eye,
  Download,
  ArrowRight
} from 'lucide-react';
import type { ProvisioningFormValues, ProvisioningStatus, ProvisioningStep } from '@/types/provisioning';
import { provisioningAPI } from '@/api/provisioning';

interface ProvisioningProgressStepProps {
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

export default function ProvisioningProgressStep({
  form,
  onProvisioningComplete,
  onProvisioningFailure,
  isProvisioning,
  provisioningRequestId
}: ProvisioningProgressStepProps) {
  const [provisioningStatus, setProvisioningStatus] = useState<ProvisioningStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  // Poll for status updates
  useEffect(() => {
    if (!provisioningRequestId) return;

    const pollStatus = async () => {
      try {
        setIsLoading(true);
        const status = await provisioningAPI.getProvisioningStatus(provisioningRequestId);
        setProvisioningStatus(status);
        setError(null);

        // Check if provisioning is complete
        if (status.status === 'completed') {
          onProvisioningComplete();
        } else if (status.status === 'failed') {
          onProvisioningFailure();
        }
      } catch (err) {
        console.error('Failed to fetch provisioning status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    pollStatus();

    // Poll every 5 seconds if still in progress
    const interval = setInterval(() => {
      if (provisioningStatus?.status === 'provisioning') {
        pollStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [provisioningRequestId, provisioningStatus?.status, onProvisioningComplete, onProvisioningFailure]);

  // Retry failed step
  const retryStep = async (stepId: string) => {
    if (!provisioningRequestId) return;

    try {
      setIsLoading(true);
      await provisioningAPI.retryProvisioningStep(provisioningRequestId, stepId);
      // Status will be updated by the polling effect
    } catch (err) {
      console.error('Failed to retry step:', err);
      setError(err instanceof Error ? err.message : 'Failed to retry step');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel provisioning
  const cancelProvisioning = async () => {
    if (!provisioningRequestId) return;

    try {
      setIsLoading(true);
      await provisioningAPI.cancelProvisioningRequest(provisioningRequestId);
      onProvisioningFailure();
    } catch (err) {
      console.error('Failed to cancel provisioning:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel provisioning');
    } finally {
      setIsLoading(false);
    }
  };

  // Get step status icon
  const getStepStatusIcon = (step: ProvisioningStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'skipped':
        return <X className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Get step status color
  const getStepStatusColor = (step: ProvisioningStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'in_progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'skipped':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  // Get overall status
  const getOverallStatus = () => {
    if (!provisioningStatus) return 'Starting...';
    
    switch (provisioningStatus.status) {
      case 'provisioning':
        return 'Provisioning in progress...';
      case 'completed':
        return 'Provisioning completed successfully!';
      case 'failed':
        return 'Provisioning failed';
      case 'cancelled':
        return 'Provisioning cancelled';
      default:
        return 'Starting...';
    }
  };

  // Get overall progress
  const getOverallProgress = () => {
    if (!provisioningStatus) return 0;
    
    if (provisioningStatus.status === 'completed') return 100;
    if (provisioningStatus.status === 'failed') return provisioningStatus.progress;
    
    return provisioningStatus.progress;
  };

  if (!provisioningRequestId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Provisioning Request</h3>
        <p className="text-muted-foreground">Please start the provisioning process first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {isProvisioning ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : provisioningStatus?.status === 'completed' ? (
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          ) : provisioningStatus?.status === 'failed' ? (
            <AlertCircle className="h-12 w-12 text-destructive" />
          ) : (
            <Clock className="h-12 w-12 text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            {getOverallStatus()}
          </h3>
          <p className="text-muted-foreground">
            {provisioningStatus?.currentStep 
              ? `Currently: ${provisioningStatus.currentStep}`
              : 'Setting up your project infrastructure...'
            }
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{getOverallProgress()}%</span>
        </div>
        <Progress value={getOverallProgress()} className="h-3" />
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps List */}
      {provisioningStatus?.steps && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Provisioning Steps</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogs(!showLogs)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showLogs ? 'Hide' : 'Show'} Logs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {provisioningStatus.steps.map((step, index) => (
              <div key={step.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStepStatusIcon(step)}
                    <div>
                      <div className="font-medium text-foreground">{step.name}</div>
                      <div className="text-sm text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStepStatusColor(step)}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                    {step.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryStep(step.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>

                {/* Step Progress */}
                {step.status === 'in_progress' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{step.progress}%</span>
                    </div>
                    <Progress value={step.progress} className="h-2" />
                  </div>
                )}

                {/* Step Error */}
                {step.error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="text-sm text-destructive">{step.error}</div>
                    </div>
                  </div>
                )}

                {/* Step Logs */}
                {showLogs && step.logs && step.logs.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-foreground mb-2">Logs:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {step.logs.slice(-10).map((log, logIndex) => (
                        <div key={logIndex} className="text-xs font-mono">
                          <span className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className={`ml-2 ${
                            log.level === 'error' ? 'text-destructive' :
                            log.level === 'warn' ? 'text-yellow-600' :
                            log.level === 'success' ? 'text-green-600' :
                            'text-foreground'
                          }`}>
                            [{log.level.toUpperCase()}]
                          </span>
                          <span className="ml-2">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Separator between steps */}
                {index < provisioningStatus.steps.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Estimated Time */}
      {provisioningStatus?.estimatedTimeRemaining && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Estimated time remaining: {provisioningStatus.estimatedTimeRemaining} minutes
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {provisioningStatus?.status === 'provisioning' && (
          <Button
            variant="outline"
            onClick={cancelProvisioning}
            disabled={isLoading}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Provisioning
          </Button>
        )}

        {provisioningStatus?.status === 'completed' && (
          <Button onClick={onProvisioningComplete}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        )}

        {provisioningStatus?.status === 'failed' && (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>

      {/* Project URLs (when completed) */}
      {provisioningStatus?.status === 'completed' && (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-base text-green-600">Provisioning Complete!</CardTitle>
            <CardDescription>
              Your project has been successfully provisioned. Here are the important URLs:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Repository:</span>
                <a 
                  href="#" 
                  className="text-sm text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Deployment:</span>
                <a 
                  href="#" 
                  className="text-sm text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Live Site
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Client Portal:</span>
                <a 
                  href="#" 
                  className="text-sm text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Access Portal
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}