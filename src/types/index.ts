
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  team?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'demo' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface LeadTag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date | string;
  completed: boolean;
  assignedTo?: string;
}

export interface ContactDetail {
  id: string;
  type: 'email' | 'phone' | 'address' | 'website' | 'social';
  value: string;
  label?: string; // e.g., "Work", "Personal", "Mobile"
  isPrimary?: boolean;
  socialPlatform?: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'other';
}

export interface Lead {
  id: string;
  companyName: string;
  industry?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactDetails?: ContactDetail[];
  status: LeadStatus;
  value: number; // Value in INR crores
  tags: LeadTag[];
  createdBy: string;
  assignedTo?: string;
  teamMembers?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  notes?: string;
  tasks?: Task[];
  score?: number; // 1-10 rating
  website?: string;
  address?: string;
  products?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: Date | string;
  type: 'task' | 'lead' | 'system';
  relatedId?: string;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  type: 'currency' | 'percentage' | 'number';
  icon?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}
