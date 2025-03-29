
import { 
  User, 
  Lead, 
  LeadStatus, 
  NotificationItem, 
  DashboardMetric, 
  ChartData,
  Task
} from '@/types';
import { DEFAULT_LEAD_TAGS } from '@/utils/constants';

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@relatiumx.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
  },
  {
    id: 'user-2',
    name: 'Sales Rep',
    email: 'sales@relatiumx.com',
    role: 'user',
    avatar: 'https://ui-avatars.com/api/?name=Sales+Rep&background=3B82F6&color=fff',
    team: 'Sales'
  },
  {
    id: 'user-3',
    name: 'Marketing Manager',
    email: 'marketing@relatiumx.com',
    role: 'user',
    avatar: 'https://ui-avatars.com/api/?name=Marketing+Manager&background=F59E0B&color=fff',
    team: 'Marketing'
  }
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Follow up with TechCorp',
    description: 'Schedule a call to discuss implementation details',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    assignedTo: 'user-2'
  },
  {
    id: 'task-2',
    title: 'Send proposal to GlobalFinance',
    description: 'Include detailed pricing and feature list',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    assignedTo: 'user-2'
  },
  {
    id: 'task-3',
    title: 'Demo preparation for HealthPlus',
    description: 'Prepare custom demo environment with their branding',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    assignedTo: 'user-3'
  }
];

// Generate random date in the past 30 days
const getRandomDate = (days = 30) => {
  return new Date(Date.now() - Math.floor(Math.random() * days) * 24 * 60 * 60 * 1000).toISOString();
};

// Generate a mock list of leads
const generateMockLeads = (count: number): Lead[] => {
  const statuses: LeadStatus[] = ['new', 'contacted', 'demo', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const companies = [
    'TechCorp', 'GlobalFinance', 'HealthPlus', 'EduWorld', 'ManufactTech', 
    'RetailGiants', 'PropertyMasters', 'MediaVision', 'TelecomSolutions', 'TransGlobal',
    'EnergyWorks', 'HospitalityKings', 'AgroTech', 'BuildingInnovators', 'EntertainWorld'
  ];
  
  return Array.from({ length: count }).map((_, index) => {
    // Distribute leads across statuses somewhat realistically
    let status: LeadStatus;
    const rand = Math.random();
    if (rand < 0.2) status = 'new';
    else if (rand < 0.35) status = 'contacted';
    else if (rand < 0.5) status = 'demo';
    else if (rand < 0.65) status = 'proposal';
    else if (rand < 0.8) status = 'negotiation';
    else if (rand < 0.9) status = 'closed_won';
    else status = 'closed_lost';
    
    // Assign higher values to leads further in the pipeline
    let baseValue = 0.5 + Math.random() * 4.5; // Between 0.5 and 5 crores
    if (status === 'negotiation') baseValue *= 1.5;
    if (status === 'closed_won') baseValue *= 2;
    
    const companyIndex = index % companies.length;
    
    // Assign random tags, 1-3 per lead
    const tagCount = 1 + Math.floor(Math.random() * 3);
    const randomTags = [...DEFAULT_LEAD_TAGS]
      .sort(() => 0.5 - Math.random())
      .slice(0, tagCount);
    
    // Assign to either user 2 or 3
    const assignedTo = Math.random() > 0.5 ? 'user-2' : 'user-3';
    
    return {
      id: `lead-${index + 1}`,
      companyName: companies[companyIndex],
      industry: ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing'][Math.floor(Math.random() * 5)],
      contactName: ['Amit Sharma', 'Priya Patel', 'Rahul Singh', 'Deepa Gupta', 'Vikram Mehta'][Math.floor(Math.random() * 5)],
      contactEmail: `contact@${companies[companyIndex].toLowerCase().replace(' ', '')}.com`,
      contactPhone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      status,
      value: parseFloat(baseValue.toFixed(2)),
      tags: randomTags,
      createdBy: assignedTo,
      assignedTo,
      createdAt: getRandomDate(60),
      updatedAt: getRandomDate(30),
      notes: "Initial contact made via website inquiry. Client is interested in our enterprise solution.",
      score: Math.floor(Math.random() * 10) + 1,
      website: `https://www.${companies[companyIndex].toLowerCase().replace(' ', '')}.com`,
      tasks: status !== 'new' ? [mockTasks[index % mockTasks.length]] : []
    };
  });
};

export const mockLeads = generateMockLeads(25);

// Mock notifications
export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Task Assigned',
    message: 'You have been assigned to follow up with TechCorp',
    read: false,
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    type: 'task',
    relatedId: 'task-1'
  },
  {
    id: 'notif-2',
    title: 'Lead Status Updated',
    message: 'HealthPlus has moved to Proposal stage',
    read: true,
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    type: 'lead',
    relatedId: 'lead-3'
  },
  {
    id: 'notif-3',
    title: 'Task Due Soon',
    message: 'Prepare demo for GlobalFinance due in 2 hours',
    read: false,
    date: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    type: 'task',
    relatedId: 'task-2'
  },
  {
    id: 'notif-4',
    title: 'Lead Closed (Won)',
    message: 'RetailGiants deal has been closed successfully',
    read: true,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'lead',
    relatedId: 'lead-4'
  },
  {
    id: 'notif-5',
    title: 'System Update',
    message: 'RelatiumX has been updated to version 2.1.0',
    read: true,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'system'
  }
];

// Mock dashboard metrics
export const mockDashboardMetrics: DashboardMetric[] = [
  {
    id: 'metric-1',
    title: 'Total Pipeline Value',
    value: mockLeads.reduce((sum, lead) => sum + lead.value, 0),
    change: 12.5,
    trend: 'up',
    type: 'currency',
    icon: 'trending-up'
  },
  {
    id: 'metric-2',
    title: 'Conversion Rate',
    value: 0.28,
    change: -2.1,
    trend: 'down',
    type: 'percentage',
    icon: 'percent'
  },
  {
    id: 'metric-3',
    title: 'Active Leads',
    value: mockLeads.filter(lead => !['closed_won', 'closed_lost'].includes(lead.status)).length,
    change: 5,
    trend: 'up',
    type: 'number',
    icon: 'users'
  },
  {
    id: 'metric-4',
    title: 'Won Deals Value',
    value: mockLeads.filter(lead => lead.status === 'closed_won').reduce((sum, lead) => sum + lead.value, 0),
    change: 18.3,
    trend: 'up',
    type: 'currency',
    icon: 'badge-indian-rupee'
  }
];

// Mock chart data
export const mockPipelineChartData: ChartData = {
  labels: ['New Lead', 'Contacted', 'Demo Given', 'Proposal', 'Negotiation', 'Closed (Won)', 'Closed (Lost)'],
  datasets: [
    {
      label: 'Number of Leads',
      data: [
        mockLeads.filter(lead => lead.status === 'new').length,
        mockLeads.filter(lead => lead.status === 'contacted').length,
        mockLeads.filter(lead => lead.status === 'demo').length,
        mockLeads.filter(lead => lead.status === 'proposal').length,
        mockLeads.filter(lead => lead.status === 'negotiation').length,
        mockLeads.filter(lead => lead.status === 'closed_won').length,
        mockLeads.filter(lead => lead.status === 'closed_lost').length
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.6)',
        'rgba(139, 92, 246, 0.6)',
        'rgba(99, 102, 241, 0.6)',
        'rgba(249, 115, 22, 0.6)',
        'rgba(245, 158, 11, 0.6)',
        'rgba(16, 185, 129, 0.6)',
        'rgba(239, 68, 68, 0.6)'
      ],
      borderWidth: 0
    }
  ]
};

export const mockRevenueChartData: ChartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      label: 'Revenue (INR Cr)',
      data: [12.5, 19.3, 15.8, 25.1, 28.3, 32.9],
      borderColor: 'rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true
    },
    {
      label: 'Target (INR Cr)',
      data: [15, 20, 22, 25, 30, 35],
      borderColor: 'rgba(249, 115, 22, 0.8)',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderWidth: 2,
      borderDash: [5, 5]
    }
  ]
};

export const mockLeadSourceChartData: ChartData = {
  labels: ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Direct', 'Partner'],
  datasets: [
    {
      label: 'Leads by Source',
      data: [35, 25, 15, 10, 8, 7],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(99, 102, 241, 0.7)',
        'rgba(249, 115, 22, 0.7)'
      ],
      borderWidth: 1,
      borderColor: '#ffffff'
    }
  ]
};

export const currentUser = mockUsers[0]; // Default to admin user
