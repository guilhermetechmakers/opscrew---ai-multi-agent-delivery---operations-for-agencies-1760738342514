import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Upload, 
  Save,
  Eye,
  EyeOff,
  Download,
  Trash2
} from "lucide-react";
import { PortalSettings } from "@/types/client-portal";

interface ClientPortalSettingsProps {
  settings: PortalSettings;
  onSave: (settings: PortalSettings) => void;
  onCancel: () => void;
}

export default function ClientPortalSettings({ 
  settings, 
  onSave, 
  onCancel 
}: ClientPortalSettingsProps) {
  const [formData, setFormData] = useState<PortalSettings>(settings);
  const [showCustomCss, setShowCustomCss] = useState(false);

  const handleSave = () => {
    onSave(formData);
  };

  const handleBrandingChange = (field: keyof typeof formData.branding, value: string) => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value
      }
    }));
  };

  const handleFeatureChange = (field: keyof typeof formData.features, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (field: keyof typeof formData.notifications, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Portal Settings</h2>
          <p className="text-muted-foreground">
            Customize the client portal appearance and functionality
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branding Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Branding</span>
            </CardTitle>
            <CardDescription>
              Customize the visual appearance of the portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="logo"
                  placeholder="Logo URL or upload file"
                  value={formData.branding.logo || ""}
                  onChange={(e) => handleBrandingChange("logo", e.target.value)}
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {formData.branding.logo && (
                <div className="mt-2">
                  <img 
                    src={formData.branding.logo} 
                    alt="Logo preview"
                    className="h-16 w-16 object-contain border border-border rounded"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.branding.primaryColor}
                    onChange={(e) => handleBrandingChange("primaryColor", e.target.value)}
                    className="h-10 w-20 p-1"
                  />
                  <Input
                    value={formData.branding.primaryColor}
                    onChange={(e) => handleBrandingChange("primaryColor", e.target.value)}
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
                    value={formData.branding.secondaryColor}
                    onChange={(e) => handleBrandingChange("secondaryColor", e.target.value)}
                    className="h-10 w-20 p-1"
                  />
                  <Input
                    value={formData.branding.secondaryColor}
                    onChange={(e) => handleBrandingChange("secondaryColor", e.target.value)}
                    placeholder="#22D3EE"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomCss(!showCustomCss)}
                >
                  {showCustomCss ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {showCustomCss && (
                <textarea
                  id="customCss"
                  placeholder="/* Custom CSS styles */"
                  value={formData.branding.customCss || ""}
                  onChange={(e) => handleBrandingChange("customCss", e.target.value)}
                  className="w-full h-32 px-3 py-2 bg-input border border-border rounded-md text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Features</span>
            </CardTitle>
            <CardDescription>
              Control which features are visible to clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Budget Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Display project budget and spending details
                  </p>
                </div>
                <Switch
                  checked={formData.features.showBudget}
                  onCheckedChange={(checked) => handleFeatureChange("showBudget", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Team Members</Label>
                  <p className="text-sm text-muted-foreground">
                    Display project team information
                  </p>
                </div>
                <Switch
                  checked={formData.features.showTeam}
                  onCheckedChange={(checked) => handleFeatureChange("showTeam", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable client comments and feedback
                  </p>
                </div>
                <Switch
                  checked={formData.features.allowComments}
                  onCheckedChange={(checked) => handleFeatureChange("allowComments", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow File Upload</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable client file uploads
                  </p>
                </div>
                <Switch
                  checked={formData.features.allowFileUpload}
                  onCheckedChange={(checked) => handleFeatureChange("allowFileUpload", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Timeline</Label>
                  <p className="text-sm text-muted-foreground">
                    Display project timeline and milestones
                  </p>
                </div>
                <Switch
                  checked={formData.features.showTimeline}
                  onCheckedChange={(checked) => handleFeatureChange("showTimeline", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Configure email notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable all email notifications
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Milestone Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when milestones are completed
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.milestoneUpdates}
                  onCheckedChange={(checked) => handleNotificationChange("milestoneUpdates", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deliverable Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when deliverables are ready
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.deliverableUpdates}
                  onCheckedChange={(checked) => handleNotificationChange("deliverableUpdates", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comment Replies</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when team replies to comments
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.commentReplies}
                  onCheckedChange={(checked) => handleNotificationChange("commentReplies", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security</span>
            </CardTitle>
            <CardDescription>
              Portal security and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Portal Access</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This portal is accessible via a secure link that expires after 30 days.
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Access Link
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Revoke Access
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Data Privacy</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  All data is encrypted in transit and at rest. Client data is never shared with third parties.
                </p>
                <Button variant="outline" size="sm">
                  View Privacy Policy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}