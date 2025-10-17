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
  Users, 
  Palette, 
  Eye, 
  Shield, 
  FileText,
  MessageSquare,
  CreditCard,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import type { ProvisioningFormValues } from '@/types/provisioning';

interface ClientPortalConfigurationStepProps {
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

export default function ClientPortalConfigurationStep({
  form,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}: ClientPortalConfigurationStepProps) {
  const [previewMode, setPreviewMode] = useState(false);

  const { watch, setValue, formState: { errors } } = form;
  const clientPortal = watch('clientPortal') || {
    branding: { primaryColor: '#53B7FF', secondaryColor: '#22D3EE', fontFamily: 'Inter' },
    features: { projectStatus: true, documents: true, communications: true, billing: false, feedback: true },
    access: { requiresAuth: true, passwordProtected: false }
  };

  // Font options
  const fontOptions = [
    { value: 'Inter', label: 'Inter', description: 'Modern, clean sans-serif' },
    { value: 'Roboto', label: 'Roboto', description: 'Google font, highly readable' },
    { value: 'Poppins', label: 'Poppins', description: 'Friendly, rounded sans-serif' },
    { value: 'Open Sans', label: 'Open Sans', description: 'Professional, versatile' },
    { value: 'Lato', label: 'Lato', description: 'Humanist, warm feeling' },
    { value: 'Montserrat', label: 'Montserrat', description: 'Geometric, modern' },
  ];

  // Update branding
  const updateBranding = (field: string, value: string) => {
    setValue(`clientPortal.branding.${field}`, value);
  };

  // Update features
  const updateFeature = (feature: string, enabled: boolean) => {
    setValue(`clientPortal.features.${feature}`, enabled);
  };

  // Update access settings
  const updateAccess = (field: string, value: any) => {
    setValue(`clientPortal.access.${field}`, value);
  };

  // Add domain to allowed domains
  const addAllowedDomain = (domain: string) => {
    if (domain.trim()) {
      const currentDomains = clientPortal.access.allowedDomains || [];
      if (!currentDomains.includes(domain.trim())) {
        setValue('clientPortal.access.allowedDomains', [...currentDomains, domain.trim()]);
      }
    }
  };

  // Remove domain from allowed domains
  const removeAllowedDomain = (domain: string) => {
    const currentDomains = clientPortal.access.allowedDomains || [];
    setValue('clientPortal.access.allowedDomains', currentDomains.filter(d => d !== domain));
  };

  return (
    <div className="space-y-6">
      {/* Client Portal Configuration Header */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Client Portal Configuration</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Customize your client portal's appearance, features, and access settings to match your brand.
          </p>
        </div>
      </div>

      {/* Branding Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Branding & Appearance</CardTitle>
          </div>
          <CardDescription>
            Customize colors, fonts, and visual elements to match your brand identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Color Scheme</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={clientPortal.branding.primaryColor}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border border-input rounded"
                  />
                  <Input
                    value={clientPortal.branding.primaryColor}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                    placeholder="#53B7FF"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={clientPortal.branding.secondaryColor}
                    onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border border-input rounded"
                  />
                  <Input
                    value={clientPortal.branding.secondaryColor}
                    onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                    placeholder="#22D3EE"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Font Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Typography</h4>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <select
                id="fontFamily"
                value={clientPortal.branding.fontFamily}
                onChange={(e) => updateBranding('fontFamily', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label} - {font.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="space-y-2">
            <Label htmlFor="customCss">Custom CSS (Optional)</Label>
            <textarea
              id="customCss"
              value={clientPortal.branding.customCss || ''}
              onChange={(e) => updateBranding('customCss', e.target.value)}
              placeholder="/* Add custom CSS styles here */&#10;.custom-header {&#10;  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);&#10;}"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground">
              Add custom CSS to further customize the portal's appearance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Portal Features</CardTitle>
          </div>
          <CardDescription>
            Choose which features to enable in your client portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'projectStatus',
                title: 'Project Status',
                description: 'Show project progress, milestones, and timeline',
                icon: <Globe className="h-4 w-4" />
              },
              {
                key: 'documents',
                title: 'Documents & Files',
                description: 'Share project documents and deliverables',
                icon: <FileText className="h-4 w-4" />
              },
              {
                key: 'communications',
                title: 'Communications',
                description: 'Enable messaging and updates',
                icon: <MessageSquare className="h-4 w-4" />
              },
              {
                key: 'billing',
                title: 'Billing & Invoices',
                description: 'Show billing information and invoices',
                icon: <CreditCard className="h-4 w-4" />
              },
              {
                key: 'feedback',
                title: 'Feedback & Reviews',
                description: 'Collect client feedback and reviews',
                icon: <MessageCircle className="h-4 w-4" />
              }
            ].map((feature) => (
              <div key={feature.key} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                <Checkbox
                  id={feature.key}
                  checked={clientPortal.features[feature.key as keyof typeof clientPortal.features]}
                  onCheckedChange={(checked) => updateFeature(feature.key, checked as boolean)}
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {feature.icon}
                    <Label htmlFor={feature.key} className="font-medium">
                      {feature.title}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Access & Security</CardTitle>
          </div>
          <CardDescription>
            Configure how clients access the portal and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication Requirements */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="requiresAuth"
                checked={clientPortal.access.requiresAuth}
                onCheckedChange={(checked) => updateAccess('requiresAuth', checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="requiresAuth" className="font-medium">
                  Require Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Clients must log in to access the portal
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="passwordProtected"
                checked={clientPortal.access.passwordProtected}
                onCheckedChange={(checked) => updateAccess('passwordProtected', checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="passwordProtected" className="font-medium">
                  Password Protected
                </Label>
                <p className="text-sm text-muted-foreground">
                  Additional password protection for the entire portal
                </p>
              </div>
            </div>
          </div>

          {/* Allowed Domains */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="allowedDomains">Allowed Domains (Optional)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Restrict access to specific domains. Leave empty to allow all domains.
              </p>
              <div className="flex space-x-2">
                <Input
                  id="allowedDomains"
                  placeholder="example.com"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAllowedDomain(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addAllowedDomain(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {clientPortal.access.allowedDomains && clientPortal.access.allowedDomains.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Allowed Domains:</p>
                <div className="flex flex-wrap gap-2">
                  {clientPortal.access.allowedDomains.map((domain, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{domain}</span>
                      <button
                        type="button"
                        onClick={() => removeAllowedDomain(domain)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Toggle */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? <Eye className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {previewMode ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      {/* Preview */}
      {previewMode && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Portal Preview</CardTitle>
            <CardDescription>
              This is how your client portal will look with the current settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border border-border rounded-lg p-6 bg-card"
              style={{
                fontFamily: clientPortal.branding.fontFamily,
                '--primary-color': clientPortal.branding.primaryColor,
                '--secondary-color': clientPortal.branding.secondaryColor,
              } as React.CSSProperties}
            >
              <div className="space-y-4">
                <div 
                  className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: clientPortal.branding.primaryColor }}
                >
                  Client Portal Header
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientPortal.features.projectStatus && (
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-2">Project Status</h3>
                      <p className="text-sm text-muted-foreground">Track your project progress</p>
                    </div>
                  )}
                  {clientPortal.features.documents && (
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-2">Documents</h3>
                      <p className="text-sm text-muted-foreground">Access project files</p>
                    </div>
                  )}
                  {clientPortal.features.communications && (
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-2">Communications</h3>
                      <p className="text-sm text-muted-foreground">Stay updated</p>
                    </div>
                  )}
                  {clientPortal.features.feedback && (
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-2">Feedback</h3>
                      <p className="text-sm text-muted-foreground">Share your thoughts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={onNext}
          className="min-w-[120px]"
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}