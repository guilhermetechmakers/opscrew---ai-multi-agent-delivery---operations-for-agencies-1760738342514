import React, { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Star, 
  Clock, 
  Zap, 
  Code, 
  Database, 
  Cloud,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import type { ProvisioningFormValues, ProjectTemplate } from '@/types/provisioning';

interface ProjectDetailsStepProps {
  form: UseFormReturn<ProvisioningFormValues>;
  templates: ProjectTemplate[];
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

export default function ProjectDetailsStep({
  form,
  templates,
  onNext,
  currentStep,
  totalSteps
}: ProjectDetailsStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const { register, watch, setValue, formState: { errors } } = form;
  const watchedTemplateId = watch('templateId');

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(templates.map(t => t.category)));

  // Handle template selection
  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setValue('templateId', template.id);
    setValue('projectName', template.name.toLowerCase().replace(/\s+/g, '-'));
  };

  // Get complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'complex': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web': return <Code className="h-4 w-4" />;
      case 'mobile': return <Zap className="h-4 w-4" />;
      case 'api': return <Database className="h-4 w-4" />;
      case 'fullstack': return <Cloud className="h-4 w-4" />;
      case 'ai': return <Zap className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Project Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                {...register('projectName')}
                className={errors.projectName ? 'border-destructive' : ''}
              />
              {errors.projectName && (
                <p className="text-sm text-destructive">{errors.projectName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief project description"
                {...register('description')}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Template Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Choose Project Template</h3>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1">{category}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  watchedTemplateId === template.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getCategoryIcon(template.category)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.category}
                        </CardDescription>
                      </div>
                    </div>
                    {watchedTemplateId === template.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getComplexityColor(template.complexity)}>
                        {template.complexity}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.estimatedDuration}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">Tech Stack:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.values(template.stack).flat().slice(0, 3).map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {Object.values(template.stack).flat().length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{Object.values(template.stack).flat().length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No templates found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" disabled>
          Previous
        </Button>
        <Button 
          onClick={onNext}
          disabled={!watchedTemplateId}
          className="min-w-[120px]"
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}