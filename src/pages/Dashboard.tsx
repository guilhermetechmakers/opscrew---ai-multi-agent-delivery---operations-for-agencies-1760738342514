import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Bot,
  Zap,
  MessageSquare,
  Rocket
} from "lucide-react";

const metrics = [
  {
    title: "Active Projects",
    value: "12",
    change: "+2 this week",
    trend: "up",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-green-500"
  },
  {
    title: "Pending Proposals",
    value: "5",
    change: "3 awaiting approval",
    trend: "neutral",
    icon: <FileText className="h-4 w-4" />,
    color: "text-yellow-500"
  },
  {
    title: "Open Tickets",
    value: "8",
    change: "-3 from yesterday",
    trend: "down",
    icon: <Users className="h-4 w-4" />,
    color: "text-blue-500"
  },
  {
    title: "SLA Health",
    value: "98%",
    change: "All green",
    trend: "up",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "text-green-500"
  }
];

const recentProjects = [
  {
    id: 1,
    name: "E-commerce Platform",
    status: "In Progress",
    progress: 75,
    client: "TechCorp Inc.",
    dueDate: "Dec 15, 2024",
    agent: "PM Agent"
  },
  {
    id: 2,
    name: "Mobile App Redesign",
    status: "Review",
    progress: 90,
    client: "StartupXYZ",
    dueDate: "Dec 10, 2024",
    agent: "Launch Agent"
  },
  {
    id: 3,
    name: "API Integration",
    status: "Planning",
    progress: 25,
    client: "DataFlow Ltd.",
    dueDate: "Dec 20, 2024",
    agent: "Research Agent"
  }
];

const agentActivity = [
  {
    id: 1,
    agent: "Intake Agent",
    action: "Generated proposal for new lead",
    confidence: 95,
    timestamp: "2 minutes ago",
    status: "completed"
  },
  {
    id: 2,
    agent: "PM Agent",
    action: "Identified blocker in task #1234",
    confidence: 88,
    timestamp: "15 minutes ago",
    status: "needs_attention"
  },
  {
    id: 3,
    agent: "Launch Agent",
    action: "Completed pre-launch checklist",
    confidence: 92,
    timestamp: "1 hour ago",
    status: "completed"
  },
  {
    id: 4,
    agent: "Support Agent",
    action: "Triaged 3 support tickets",
    confidence: 90,
    timestamp: "2 hours ago",
    status: "completed"
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Start Intake
          </Button>
          <Button className="btn-primary">
            <Zap className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`${metric.color}`}>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your active projects and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{project.name}</h3>
                        <Badge variant={project.status === "In Progress" ? "default" : project.status === "Review" ? "secondary" : "outline"}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{project.client}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Due: {project.dueDate}</span>
                        <span>•</span>
                        <span>{project.agent}</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Activity Feed */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Agent Activity</CardTitle>
              <CardDescription>
                Recent AI agent actions and their confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{activity.agent}</p>
                        <Badge 
                          variant={activity.status === "completed" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {activity.confidence}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts to get things done faster
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <MessageSquare className="h-6 w-6" />
              <span>Start Intake</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Create Proposal</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Zap className="h-6 w-6" />
              <span>Provision Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Rocket className="h-6 w-6" />
              <span>Launch Project</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
