// Client Portal Types for OpsCrew

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'launch' | 'completed' | 'on-hold';
  progress: number;
  client: {
    id: string;
    name: string;
    logo?: string;
    contact: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  team: {
    pm: string;
    developers: string[];
    designers?: string[];
  };
  timeline: {
    startDate: string;
    dueDate: string;
    milestones: Milestone[];
  };
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  completedDate?: string;
  deliverables: Deliverable[];
}

export interface Deliverable {
  id: string;
  name: string;
  type: 'document' | 'design' | 'code' | 'video' | 'presentation';
  status: 'pending' | 'in-progress' | 'review' | 'approved' | 'rejected';
  url?: string;
  uploadedAt?: string;
  approvedAt?: string;
  size?: number;
  version: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'signed';
  version: string;
  totalAmount: number;
  currency: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  signedBy?: string;
  documents: ProposalDocument[];
}

export interface ProposalDocument {
  id: string;
  name: string;
  type: 'proposal' | 'sow' | 'contract' | 'addendum';
  url: string;
  status: 'draft' | 'ready-for-signature' | 'signed' | 'expired';
  uploadedAt: string;
  signedAt?: string;
  version: string;
}

export interface Comment {
  id: string;
  projectId: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    role: 'client' | 'team';
  };
  content: string;
  type: 'general' | 'feedback' | 'question' | 'approval';
  status: 'active' | 'resolved' | 'archived';
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface BillingInfo {
  projectId: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  invoices: Invoice[];
  nextPayment?: {
    amount: number;
    dueDate: string;
    description: string;
  };
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  description: string;
  items: InvoiceItem[];
  downloadUrl?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PortalSettings {
  projectId: string;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customCss?: string;
  };
  features: {
    showBudget: boolean;
    showTeam: boolean;
    allowComments: boolean;
    allowFileUpload: boolean;
    showTimeline: boolean;
  };
  notifications: {
    email: boolean;
    milestoneUpdates: boolean;
    deliverableUpdates: boolean;
    commentReplies: boolean;
  };
}

export interface ClientPortalData {
  project: Project;
  proposals: Proposal[];
  comments: Comment[];
  billing: BillingInfo;
  settings: PortalSettings;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'milestone' | 'deliverable' | 'comment' | 'proposal' | 'payment' | 'status-change';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
    role: 'client' | 'team';
  };
  metadata?: Record<string, any>;
}