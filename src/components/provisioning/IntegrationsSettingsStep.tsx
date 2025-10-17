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
  Zap, 
  Slack, 
  MessageCircle, 
  Mail, 
  Webhook,
  Shield,
  GitBranch,
  Eye,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import type { ProvisioningFormValues } from '@/types/provisioning';
import { provisioningAPI } from '@/api/provisioning';

interface IntegrationsSettingsStepProps {
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

export default function IntegrationsSettingsStep({
  form,
  onNext,
  onPrevious,
  onSubmit,
  isProvisioning,
  currentStep,
  totalSteps
}: IntegrationsSettingsStepProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { watch, setValue, formState: { errors } } = form;
  const integrations = watch('integrations') || { slack: false, discord: false, email: true, webhooks: [] };
  const settings = watch('settings') || { autoDeploy: true, branchProtection: true, codeReview: true, securityScanning: true };

  // Update integration
  const updateIntegration = (integration: string, enabled: boolean) => {
    setValue(`integrations.${integration}`, enabled);
  };

  // Update setting
  const updateSetting = (setting: string, enabled: boolean) => {
    setValue(`settings.${setting}`, enabled);
  };

  // Add webhook
  const addWebhook = async () => {
    if (webhookUrl.trim()) {
      const currentWebhooks = integrations.webhooks || [];
      if (!currentWebhooks.includes(webhookUrl.trim())) {
        setValue('integrations.webhooks', [...currentWebhooks, webhookUrl.trim()]);
        setWebhookUrl('');
      }
    }
  };

  // Remove webhook
  const removeWebhook = (webhook: string) => {
    const currentWebhooks = integrations.webhooks || [];
    setValue('integrations.webhooks', currentWebhooks.filter(w => w !== webhook));
  };

  // Test webhook
  const testWebhook = async (url: string) => {
    try {
      setIsTestingWebhook(true);
      setWebhookTestResult(null);
      
      const result = await provisioningAPI.testWebhook(url);
      setWebhookTestResult(result);
    } catch (error) {
      setWebhookTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to test webhook'
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Integrations & Settings Header */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Integrations & Settings</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Configure integrations with external services and project settings for optimal workflow.
          </p>
        </div>
      </div>

      {/* Integrations Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">External Integrations</CardTitle>
          </div>
          <CardDescription>
            Connect with external services to enhance your project workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Communication Integrations */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Communication</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: 'slack',
                  title: 'Slack',
                  description: 'Get notifications and updates in Slack channels',
                  icon: <Slack className="h-4 w-4" />,
                  color: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                },
                {
                  key: 'discord',
                  title: 'Discord',
                  description: 'Integrate with Discord servers for team communication',
                  icon: <MessageCircle className="h-4 w-4" />,
                  color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                },
                {
                  key: 'email',
                  title: 'Email Notifications',
                  description: 'Send email updates and notifications',
                  icon: <Mail className="h-4 w-4" />,
                  color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                }
              ].map((integration) => (
                <div key={integration.key} className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                  <Checkbox
                    id={integration.key}
                    checked={integrations[integration.key as keyof typeof integrations] as boolean}
                    onCheckedChange={(checked) => updateIntegration(integration.key, checked as boolean)}
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      {integration.icon}
                      <Label htmlFor={integration.key} className="font-medium">
                        {integration.title}
                      </Label>
                      <Badge variant="outline" className={integration.color}>
                        {integration.key}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                    {integrations[integration.key as keyof typeof integrations] && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <span>Configuration required after provisioning</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhooks Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Webhooks</h4>
            <p className="text-sm text-muted-foreground">
              Add webhook URLs to receive real-time notifications about project events.
            </p>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="https://your-webhook-url.com/endpoint"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addWebhook();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addWebhook}
                  disabled={!webhookUrl.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {integrations.webhooks && integrations.webhooks.length > 0 && (
                <div className="space-y-2">
                  {integrations.webhooks.map((webhook, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Webhook className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-mono truncate">{webhook}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => testWebhook(webhook)}
                          disabled={isTestingWebhook}
                        >
                          {isTestingWebhook ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWebhook(webhook)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {webhookTestResult && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                  webhookTestResult.success 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-destructive/10 border border-destructive/20'
                }`}>
                  <CheckCircle2 className={`h-4 w-4 ${
                    webhookTestResult.success ? 'text-green-600' : 'text-destructive'
                  }`} />
                  <span className={`text-sm ${
                    webhookTestResult.success ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {webhookTestResult.message}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Project Settings</CardTitle>
          </div>
          <CardDescription>
            Configure security, deployment, and development workflow settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deployment Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Deployment</h4>
            <div className="space-y-3">
              {[
                {
                  key: 'autoDeploy',
                  title: 'Auto Deploy',
                  description: 'Automatically deploy when changes are pushed to main branch',
                  icon: <Zap className="h-4 w-4" />
                }
              ].map((setting) => (
                <div key={setting.key} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    id={setting.key}
                    checked={settings[setting.key as keyof typeof settings] as boolean}
                    onCheckedChange={(checked) => updateSetting(setting.key, checked as boolean)}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {setting.icon}
                      <Label htmlFor={setting.key} className="font-medium">
                        {setting.title}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Security & Quality</h4>
            <div className="space-y-3">
              {[
                {
                  key: 'branchProtection',
                  title: 'Branch Protection',
                  description: 'Require pull request reviews before merging to main branch',
                  icon: <GitBranch className="h-4 w-4" />
                },
                {
                  key: 'codeReview',
                  title: 'Code Review Required',
                  description: 'Mandatory code review for all changes',
                  icon: <Eye className="h-4 w-4" />
                },
                {
                  key: 'securityScanning',
                  title: 'Security Scanning',
                  description: 'Automatically scan for security vulnerabilities',
                  icon: <Shield className="h-4 w-4" />
                }
              ].map((setting) => (
                <div key={setting.key} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                  <Checkbox
                    id={setting.key}
                    checked={settings[setting.key as keyof typeof settings] as boolean}
                    onCheckedChange={(checked) => updateSetting(setting.key, checked as boolean)}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {setting.icon}
                      <Label htmlFor={setting.key} className="font-medium">
                        {setting.title}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Configuration Summary</CardTitle>
          <CardDescription>
            Review your project configuration before starting the provisioning process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium">Integrations Enabled:</div>
              <div className="space-y-1">
                {integrations.slack && <div className="text-muted-foreground">• Slack notifications</div>}
                {integrations.discord && <div className="text-muted-foreground">• Discord integration</div>}
                {integrations.email && <div className="text-muted-foreground">• Email notifications</div>}
                {integrations.webhooks && integrations.webhooks.length > 0 && (
                  <div className="text-muted-foreground">• {integrations.webhooks.length} webhook(s)</div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Security Features:</div>
              <div className="space-y-1">
                {settings.autoDeploy && <div className="text-muted-foreground">• Auto deployment</div>}
                {settings.branchProtection && <div className="text-muted-foreground">• Branch protection</div>}
                {settings.codeReview && <div className="text-muted-foreground">• Code review required</div>}
                {settings.securityScanning && <div className="text-muted-foreground">• Security scanning</div>}
              </div>
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
          onClick={() => onSubmit(form.getValues())}
          disabled={isProvisioning}
          className="min-w-[120px]"
        >
          {isProvisioning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              Start Provisioning
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}