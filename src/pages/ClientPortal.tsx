import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  Settings, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Eye,
  Edit,
  Send,
  Star,
  TrendingUp,
  BarChart3,
  FolderOpen,
  Shield,
  Bell
} from "lucide-react";
import { ClientPortalData, Project, Proposal, Comment, BillingInfo, Activity, PortalSettings } from "@/types/client-portal";
import ClientPortalSettings from "@/components/client-portal-settings";

// Mock data - in real app, this would come from API
const mockProjectData: ClientPortalData = {
  project: {
    id: "proj-001",
    name: "E-commerce Platform Redesign",
    description: "Complete redesign of the client's e-commerce platform with modern UI/UX and enhanced functionality.",
    status: "in-progress",
    progress: 75,
    client: {
      id: "client-001",
      name: "TechCorp Inc.",
      logo: "/api/placeholder/40/40",
      contact: {
        name: "Sarah Johnson",
        email: "sarah.johnson@techcorp.com",
        phone: "+1 (555) 123-4567"
      }
    },
    team: {
      pm: "Alex Chen",
      developers: ["Mike Rodriguez", "Emma Wilson"],
      designers: ["Lisa Park"]
    },
    timeline: {
      startDate: "2024-10-01",
      dueDate: "2024-12-15",
      milestones: [
        {
          id: "milestone-1",
          name: "Discovery & Planning",
          description: "Requirements gathering and project planning",
          status: "completed",
          dueDate: "2024-10-15",
          completedDate: "2024-10-14",
          deliverables: []
        },
        {
          id: "milestone-2",
          name: "Design Phase",
          description: "UI/UX design and prototyping",
          status: "completed",
          dueDate: "2024-11-01",
          completedDate: "2024-10-30",
          deliverables: []
        },
        {
          id: "milestone-3",
          name: "Development Phase",
          description: "Frontend and backend development",
          status: "in-progress",
          dueDate: "2024-12-01",
          deliverables: []
        },
        {
          id: "milestone-4",
          name: "Testing & Launch",
          description: "QA testing and production deployment",
          status: "pending",
          dueDate: "2024-12-15",
          deliverables: []
        }
      ]
    },
    budget: {
      total: 50000,
      spent: 37500,
      currency: "USD"
    },
    createdAt: "2024-10-01T00:00:00Z",
    updatedAt: "2024-11-15T10:30:00Z"
  },
  proposals: [
    {
      id: "prop-001",
      projectId: "proj-001",
      title: "E-commerce Platform Redesign Proposal",
      description: "Comprehensive proposal for the e-commerce platform redesign project",
      status: "signed",
      version: "1.0",
      totalAmount: 50000,
      currency: "USD",
      validUntil: "2024-12-31",
      createdAt: "2024-09-25T00:00:00Z",
      updatedAt: "2024-10-01T00:00:00Z",
      signedAt: "2024-10-01T14:30:00Z",
      signedBy: "Sarah Johnson",
      documents: [
        {
          id: "doc-001",
          name: "Project Proposal v1.0.pdf",
          type: "proposal",
          url: "/documents/proposal-v1.pdf",
          status: "signed",
          uploadedAt: "2024-09-25T00:00:00Z",
          signedAt: "2024-10-01T14:30:00Z",
          version: "1.0"
        }
      ]
    }
  ],
  comments: [
    {
      id: "comment-001",
      projectId: "proj-001",
      author: {
        name: "Sarah Johnson",
        email: "sarah.johnson@techcorp.com",
        role: "client"
      },
      content: "The new design looks fantastic! I love the color scheme and the improved user flow.",
      type: "feedback",
      status: "active",
      createdAt: "2024-11-14T09:15:00Z",
      updatedAt: "2024-11-14T09:15:00Z"
    },
    {
      id: "comment-002",
      projectId: "proj-001",
      author: {
        name: "Alex Chen",
        email: "alex.chen@opscrew.com",
        role: "team"
      },
      content: "Thanks Sarah! We're excited about the progress. The development phase is on track for the December 1st milestone.",
      type: "general",
      status: "active",
      createdAt: "2024-11-14T10:30:00Z",
      updatedAt: "2024-11-14T10:30:00Z",
      replies: []
    }
  ],
  billing: {
    projectId: "proj-001",
    totalAmount: 50000,
    paidAmount: 25000,
    currency: "USD",
    status: "partial",
    invoices: [
      {
        id: "inv-001",
        number: "INV-2024-001",
        amount: 25000,
        currency: "USD",
        status: "paid",
        issueDate: "2024-10-01",
        dueDate: "2024-10-15",
        paidDate: "2024-10-12",
        description: "Initial payment for E-commerce Platform Redesign",
        items: [
          {
            id: "item-001",
            description: "Project Setup & Discovery",
            quantity: 1,
            unitPrice: 25000,
            total: 25000
          }
        ],
        downloadUrl: "/invoices/inv-2024-001.pdf"
      }
    ],
    nextPayment: {
      amount: 25000,
      dueDate: "2024-12-01",
      description: "Final payment upon project completion"
    }
  },
  settings: {
    projectId: "proj-001",
    branding: {
      primaryColor: "#53B7FF",
      secondaryColor: "#22D3EE"
    },
    features: {
      showBudget: true,
      showTeam: true,
      allowComments: true,
      allowFileUpload: true,
      showTimeline: true
    },
    notifications: {
      email: true,
      milestoneUpdates: true,
      deliverableUpdates: true,
      commentReplies: true
    }
  },
  recentActivity: [
    {
      id: "activity-001",
      type: "milestone",
      title: "Design Phase Completed",
      description: "UI/UX design and prototyping phase has been completed ahead of schedule",
      timestamp: "2024-10-30T16:45:00Z",
      user: {
        name: "Alex Chen",
        role: "team"
      }
    },
    {
      id: "activity-002",
      type: "comment",
      title: "New Comment from Sarah Johnson",
      description: "Sarah provided feedback on the new design mockups",
      timestamp: "2024-11-14T09:15:00Z",
      user: {
        name: "Sarah Johnson",
        role: "client"
      }
    },
    {
      id: "activity-003",
      type: "deliverable",
      title: "Design Mockups Uploaded",
      description: "High-fidelity design mockups for the homepage and product pages",
      timestamp: "2024-11-13T14:20:00Z",
      user: {
        name: "Lisa Park",
        role: "team"
      }
    }
  ]
};

export default function ClientPortal() {
  const { projectId } = useParams<{ projectId: string }>();
  const [data, setData] = useState<ClientPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchProjectData = async () => {
      setLoading(true);
      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockProjectData);
      setLoading(false);
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { project, proposals, comments, billing, settings, recentActivity } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      case 'signed': return 'bg-green-500';
      case 'paid': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                {project.client.logo && (
                  <img 
                    src={project.client.logo} 
                    alt={project.client.name}
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
                  <p className="text-sm text-muted-foreground">{project.client.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                className={`${getStatusColor(project.status)} text-white`}
                variant="default"
              >
                {getStatusText(project.status)}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettings ? (
          <ClientPortalSettings
            settings={settings}
            onSave={(newSettings) => {
              setData(prev => prev ? { ...prev, settings: newSettings } : null);
              setShowSettings(false);
            }}
            onCancel={() => setShowSettings(false)}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Project Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="metric-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Project Progress
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{project.progress}%</div>
                  <Progress value={project.progress} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Budget Used
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ${project.budget.spent.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of ${project.budget.total.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Days Remaining
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.ceil((new Date(project.timeline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    until {new Date(project.timeline.dueDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Team Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {1 + project.team.developers.length + (project.team.designers?.length || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    working on this project
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Project Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Key milestones and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.timeline.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'in-progress' ? 'bg-blue-500' :
                          milestone.status === 'overdue' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                          {milestone.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-white text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-foreground">{milestone.name}</h3>
                          <Badge 
                            variant={milestone.status === 'completed' ? 'default' : 
                                   milestone.status === 'in-progress' ? 'secondary' : 'outline'}
                          >
                            {getStatusText(milestone.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          {milestone.completedDate && (
                            <span>Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates and changes to the project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {activity.user.name} • {activity.user.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Proposals</CardTitle>
                <CardDescription>
                  All proposals and contracts for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border border-border rounded-lg p-6 hover:bg-card/50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-foreground">{proposal.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`${getStatusColor(proposal.status)} text-white`}
                            variant="default"
                          >
                            {getStatusText(proposal.status)}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">
                            ${proposal.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Version:</span> {proposal.version}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(proposal.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Valid Until:</span> {new Date(proposal.validUntil).toLocaleDateString()}
                        </div>
                      </div>

                      {proposal.signedAt && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                              Signed by {proposal.signedBy} on {new Date(proposal.signedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 mt-4">
                        {proposal.documents.map((doc) => (
                          <Button key={doc.id} variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            {doc.name}
                            <Download className="h-4 w-4 ml-2" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Deliverables</CardTitle>
                <CardDescription>
                  All deliverables and documents for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Deliverables Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Deliverables will appear here as they are completed and uploaded.
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Billing Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Summary</CardTitle>
                  <CardDescription>
                    Payment status and financial overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="font-medium text-foreground">
                        ${billing.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount Paid</span>
                      <span className="font-medium text-foreground">
                        ${billing.paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount Due</span>
                      <span className="font-medium text-foreground">
                        ${(billing.totalAmount - billing.paidAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Status</span>
                        <Badge 
                          className={`${getStatusColor(billing.status)} text-white`}
                          variant="default"
                        >
                          {getStatusText(billing.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Payment */}
              {billing.nextPayment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Next Payment</CardTitle>
                    <CardDescription>
                      Upcoming payment information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="font-medium text-foreground">
                          ${billing.nextPayment.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Due Date</span>
                        <span className="font-medium text-foreground">
                          {new Date(billing.nextPayment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="pt-4">
                        <p className="text-sm text-muted-foreground">
                          {billing.nextPayment.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  All invoices for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billing.invoices.map((invoice) => (
                    <div key={invoice.id} className="border border-border rounded-lg p-4 hover:bg-card/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-foreground">{invoice.number}</h3>
                          <p className="text-sm text-muted-foreground">{invoice.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">
                            ${invoice.amount.toLocaleString()}
                          </span>
                          <Badge 
                            className={`${getStatusColor(invoice.status)} text-white`}
                            variant="default"
                          >
                            {getStatusText(invoice.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                        {invoice.paidDate && (
                          <div>
                            <span className="font-medium">Paid Date:</span> {new Date(invoice.paidDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {invoice.downloadUrl && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download Invoice
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle>Comments & Feedback</CardTitle>
                  <CardDescription>
                    Project discussions and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {comment.author.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-foreground">{comment.author.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {comment.author.role}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mt-2">{comment.content}</p>
                            <div className="flex items-center space-x-2 mt-3">
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Star className="h-4 w-4 mr-1" />
                                Like
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 border-t border-border pt-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Contact</CardTitle>
                  <CardDescription>
                    Get in touch with the project team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {project.team.pm.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{project.team.pm}</h4>
                        <p className="text-sm text-muted-foreground">Project Manager</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground">Development Team</h5>
                      {project.team.developers.map((dev, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-foreground">
                              {dev.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-foreground">{dev}</span>
                        </div>
                      ))}
                    </div>

                    {project.team.designers && project.team.designers.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-foreground">Design Team</h5>
                        {project.team.designers.map((designer, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-foreground">
                                {designer.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm text-foreground">{designer}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-border">
                      <Button className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Team
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}
