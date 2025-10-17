import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Bot,
  Zap
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: {
    name: string;
    avatar: string;
    initials: string;
  };
  dueDate: string;
  estimate: string;
  tags: string[];
  aiGenerated?: boolean;
  confidence?: number;
}

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Set up JWT-based authentication with role-based access control',
    status: 'in-progress',
    priority: 'high',
    assignee: {
      name: 'John Doe',
      avatar: '/avatars/01.png',
      initials: 'JD'
    },
    dueDate: '2024-12-15',
    estimate: '3 days',
    tags: ['Backend', 'Security'],
    aiGenerated: true,
    confidence: 92
  },
  {
    id: '2',
    title: 'Design product catalog UI',
    description: 'Create responsive product listing and detail pages',
    status: 'todo',
    priority: 'medium',
    assignee: {
      name: 'Jane Smith',
      avatar: '/avatars/02.png',
      initials: 'JS'
    },
    dueDate: '2024-12-20',
    estimate: '5 days',
    tags: ['Frontend', 'UI/UX']
  },
  {
    id: '3',
    title: 'Set up payment integration',
    description: 'Integrate Stripe payment gateway with webhook handling',
    status: 'review',
    priority: 'high',
    assignee: {
      name: 'Mike Johnson',
      avatar: '/avatars/03.png',
      initials: 'MJ'
    },
    dueDate: '2024-12-18',
    estimate: '2 days',
    tags: ['Backend', 'Payments'],
    aiGenerated: true,
    confidence: 88
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Create comprehensive API documentation with examples',
    status: 'done',
    priority: 'low',
    assignee: {
      name: 'Sarah Wilson',
      avatar: '/avatars/04.png',
      initials: 'SW'
    },
    dueDate: '2024-12-10',
    estimate: '1 day',
    tags: ['Documentation']
  },
  {
    id: '5',
    title: 'Optimize database queries',
    description: 'Review and optimize slow database queries for better performance',
    status: 'backlog',
    priority: 'medium',
    assignee: {
      name: 'Alex Brown',
      avatar: '/avatars/05.png',
      initials: 'AB'
    },
    dueDate: '2024-12-25',
    estimate: '2 days',
    tags: ['Backend', 'Performance']
  }
];

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-500' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'review', title: 'Review', color: 'bg-purple-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' }
];

export default function ProjectBoard() {
  const [tasks] = useState<Task[]>(sampleTasks);

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-3 w-3" />;
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Board</h1>
          <p className="text-muted-foreground">
            E-commerce Platform - Sprint 1
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Bot className="mr-2 h-4 w-4" />
            AI Sprint Planner
          </Button>
          <Button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Sprint Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sprint Progress</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <Progress value={68} className="w-16" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">12/18</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Generated</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Bot className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm text-foreground line-clamp-2">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(task.priority)}
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.estimate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {task.assignee.name}
                          </span>
                        </div>
                        {task.aiGenerated && (
                          <div className="flex items-center space-x-1">
                            <Bot className="h-3 w-3 text-primary" />
                            <Badge variant="outline" className="text-xs">
                              {task.confidence}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full h-12 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Sprint Planner Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <span>AI Sprint Planner</span>
          </CardTitle>
          <CardDescription>
            AI-powered sprint planning and task generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Zap className="h-6 w-6" />
              <span>Generate Tasks</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Bot className="h-6 w-6" />
              <span>Optimize Sprint</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Identify Blockers</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
