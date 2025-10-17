// PM Workspace Type Definitions

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  role: 'admin' | 'pm' | 'developer' | 'designer' | 'qa';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: User;
  dueDate: string;
  estimate: string; // e.g., "3 days", "1 week"
  tags: string[];
  acceptanceCriteria: string[];
  attachments: Attachment[];
  aiGenerated?: boolean;
  confidence?: number;
  aiComments?: AIComment[];
  createdAt: string;
  updatedAt: string;
  sprintId?: string;
  epicId?: string;
  storyPoints?: number;
  dependencies: string[]; // Task IDs
  blockers: Blocker[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video' | 'other';
  size: number;
  uploadedAt: string;
  uploadedBy: User;
}

export interface AIComment {
  id: string;
  content: string;
  confidence: number;
  type: 'suggestion' | 'analysis' | 'recommendation';
  createdAt: string;
  agent: 'pm' | 'research' | 'comms' | 'launch' | 'support';
}

export interface Blocker {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  assignedTo?: User;
  createdAt: string;
  resolvedAt?: string;
  slaDeadline: string;
  escalationLevel: number;
  dependencies: string[];
}

export interface Sprint {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  goal: string;
  capacity: number; // story points
  velocity: number; // story points completed
  tasks: string[]; // Task IDs
  createdAt: string;
  updatedAt: string;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: User;
  dueDate: string;
  tasks: string[]; // Task IDs
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_moved' | 'task_assigned' | 'task_completed' | 
        'sprint_created' | 'sprint_started' | 'sprint_completed' | 'blocker_created' | 
        'blocker_resolved' | 'ai_action' | 'comment_added' | 'attachment_added';
  title: string;
  description: string;
  actor: User;
  target?: {
    type: 'task' | 'sprint' | 'epic' | 'blocker';
    id: string;
    title: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  client: {
    name: string;
    contact: string;
    email: string;
  };
  team: User[];
  sprints: Sprint[];
  epics: Epic[];
  tasks: Task[];
  activities: Activity[];
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSettings {
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
    timezone: string;
  };
  sprintDuration: number; // days
  storyPointScale: 'fibonacci' | 'linear' | 'custom';
  autoAssignTasks: boolean;
  aiAssistance: {
    enabled: boolean;
    confidenceThreshold: number;
    autoGenerateTasks: boolean;
    autoAssignTasks: boolean;
  };
  notifications: {
    email: boolean;
    slack: boolean;
    inApp: boolean;
  };
}

export interface FilterOptions {
  status?: string[];
  priority?: string[];
  assignee?: string[];
  tags?: string[];
  aiGenerated?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ViewOptions {
  type: 'kanban' | 'list' | 'timeline' | 'calendar';
  groupBy: 'status' | 'assignee' | 'priority' | 'epic' | 'sprint';
  sortBy: 'priority' | 'dueDate' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
  showCompleted: boolean;
  showAI: boolean;
}

export interface AISprintPlan {
  id: string;
  sprintId: string;
  tasks: {
    taskId: string;
    estimatedDays: number;
    storyPoints: number;
    dependencies: string[];
    reasoning: string;
  }[];
  totalStoryPoints: number;
  estimatedDuration: number;
  confidence: number;
  risks: {
    description: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
  recommendations: string[];
  createdAt: string;
}

export interface SLAMetrics {
  taskId: string;
  taskTitle: string;
  assignedTo: User;
  dueDate: string;
  daysOverdue: number;
  slaStatus: 'on-time' | 'at-risk' | 'overdue' | 'breached';
  escalationLevel: number;
  lastActivity: string;
}

// API Response Types
export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface SprintsResponse {
  sprints: Sprint[];
  currentSprint?: Sprint;
  upcomingSprints: Sprint[];
}

export interface ActivitiesResponse {
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
}

// Form Types
export interface CreateTaskForm {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  dueDate: string;
  estimate: string;
  tags: string[];
  acceptanceCriteria: string[];
  epicId?: string;
  sprintId?: string;
  storyPoints?: number;
}

export interface CreateSprintForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  goal: string;
  capacity: number;
}

export interface UpdateTaskForm {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assigneeId?: string;
  dueDate?: string;
  estimate?: string;
  tags?: string[];
  acceptanceCriteria?: string[];
  storyPoints?: number;
}

// Drag and Drop Types
export interface DragItem {
  type: 'task' | 'sprint';
  id: string;
  index: number;
  sourceColumn: string;
}

export interface DropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
  reason: 'DROP' | 'CANCEL';
}