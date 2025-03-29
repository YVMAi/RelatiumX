
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatInrCrores, formatPercentage } from '@/utils/format';
import { ArrowUpRight, ArrowDownRight, BarChart4, IndianRupee, Users, BadgeIndianRupee, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { mockDashboardMetrics, mockLeads, mockPipelineChartData, mockRevenueChartData, mockLeadSourceChartData } from '@/data/mockData';
import { DashboardMetric } from '@/types';
import { TIME_PERIOD_OPTIONS } from '@/utils/constants';
import { Bar, Line, Pie } from 'recharts';

const DashboardMetricCard = ({ metric }: { metric: DashboardMetric }) => {
  const trendIcon = metric.trend === 'up' ? 
    <ArrowUpRight className="h-4 w-4 text-success" /> : 
    metric.trend === 'down' ? 
      <ArrowDownRight className="h-4 w-4 text-destructive" /> : 
      null;
  
  const getIcon = () => {
    switch (metric.icon) {
      case 'trending-up': return <TrendingUp className="h-5 w-5" />;
      case 'percent': return <Percent className="h-5 w-5" />;
      case 'users': return <Users className="h-5 w-5" />;
      case 'badge-indian-rupee': return <BadgeIndianRupee className="h-5 w-5" />;
      default: return <BarChart4 className="h-5 w-5" />;
    }
  };
  
  const formatValue = () => {
    switch (metric.type) {
      case 'currency': return formatInrCrores(metric.value as number);
      case 'percentage': return formatPercentage(metric.value as number);
      default: return metric.value.toString();
    }
  };
  
  return (
    <Card className="stat-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>
        {metric.change !== undefined && (
          <p className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
            {trendIcon}
            <span className={metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-destructive' : ''}>
              {metric.change > 0 ? '+' : ''}{metric.change}%
            </span> from previous period
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { profile } = useAuth();
  const [timePeriod, setTimePeriod] = useState('thisMonth');
  
  // Calculate some basic metrics for the dashboard
  const totalLeads = mockLeads.length;
  const newLeads = mockLeads.filter(lead => lead.status === 'new').length;
  const activeLeads = mockLeads.filter(lead => !['closed_won', 'closed_lost'].includes(lead.status)).length;
  const closedWonLeads = mockLeads.filter(lead => lead.status === 'closed_won').length;
  const closedLostLeads = mockLeads.filter(lead => lead.status === 'closed_lost').length;
  const conversionRate = totalLeads > 0 ? closedWonLeads / totalLeads : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name || 'User'}!</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIOD_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockDashboardMetrics.map(metric => (
          <DashboardMetricCard key={metric.id} metric={metric} />
        ))}
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="dashboard-card md:col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue in INR crores</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  Interactive Chart Placeholder
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card md:col-span-3">
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Distribution by acquisition channel</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  Pie Chart Placeholder
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>New leads added recently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lead.companyName}</p>
                        <p className="text-sm text-muted-foreground truncate">{lead.contactName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatInrCrores(lead.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Lead Pipeline</CardTitle>
                <CardDescription>Current distribution across stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Bar Chart Placeholder
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks due soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Placeholder for upcoming tasks */}
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No upcoming tasks
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pipeline" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Lead Pipeline Analysis</CardTitle>
              <CardDescription>Detailed view of leads in each stage</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                Interactive Pipeline Chart Placeholder
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue with projections</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                Interactive Revenue Chart Placeholder
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
