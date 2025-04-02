import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  RefreshCw, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Percent,
  Award,
  Package
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { DatePicker } from "@/components/date-picker";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useToast } from "@/hooks/use-toast";
import { formatInrCrores } from "@/utils/format";
import { 
  fetchDashboardMetrics, 
  fetchLeadsByStage, 
  fetchLeadsByIndustry, 
  fetchLeadsByOwner, 
  fetchLeadTrends 
} from "@/services/dashboardService";
import { 
  PipelineChart, 
  IndustryChart, 
  TeamPerformanceChart, 
  TrendChart 
} from "@/components/dashboard/DashboardCharts";
import { DashboardStats, DateRange, IndustryData, TeamPerformanceData, StageData, TrendData } from '@/types/dashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipelineData, setPipelineData] = useState<StageData[]>([]);
  const [industryData, setIndustryData] = useState<IndustryData[]>([]);
  const [teamData, setTeamData] = useState<TeamPerformanceData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const industryColors = [
    "#4361EE", "#3A86FF", "#4CC9F0", "#4895EF", "#560BAD", 
    "#F72585", "#7209B7", "#B5179E", "#480CA8", "#3F37C9"
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, selectedOwners]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const filters = {
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        owners: selectedOwners.length > 0 ? selectedOwners : undefined
      };

      const metrics = await fetchDashboardMetrics(filters);
      const stageData = await fetchLeadsByStage(filters);
      const industryData = await fetchLeadsByIndustry(filters);
      const teamData = await fetchLeadsByOwner(filters);
      const trendData = await fetchLeadTrends(filters);

      const totalLeads = metrics.newLeads + metrics.pipelineLeads + metrics.convertedLeads + metrics.lostLeads;
      const averageDealSize = totalLeads > 0 ? metrics.totalLeadValue / totalLeads : 0;
      
      let topIndustry = { name: 'None', count: 0 };
      if (industryData.length > 0) {
        const sortedIndustries = [...industryData].sort((a, b) => b.count - a.count);
        topIndustry = { name: sortedIndustries[0].industry, count: sortedIndustries[0].count };
      }

      let topPerformer = { name: 'None', leads: 0 };
      if (teamData.length > 0) {
        const sortedTeam = [...teamData].sort((a, b) => b.count - a.count);
        topPerformer = { name: sortedTeam[0].ownerName, leads: sortedTeam[0].count };
      }

      const popularProduct = { name: 'Enterprise Solution', count: 10 };

      setStats({
        newLeads: metrics.newLeads,
        pipelineLeads: metrics.pipelineLeads,
        convertedLeads: metrics.convertedLeads,
        lostLeads: metrics.lostLeads,
        totalValue: metrics.totalLeadValue,
        conversionRate: metrics.conversionRate,
        averageDealSize,
        topIndustry,
        topPerformer,
        popularProduct
      });

      setPipelineData(stageData.map(stage => ({
        name: stage.stageName,
        leadCount: stage.count,
        value: stage.value
      })));

      const totalCount = industryData.reduce((sum, item) => sum + item.count, 0);
      setIndustryData(
        industryData.map((industry, index) => ({
          name: industry.industry,
          value: industry.count,
          percentage: totalCount > 0 ? (industry.count / totalCount) * 100 : 0,
          color: industryColors[index % industryColors.length]
        }))
      );

      setTeamData(teamData.map(owner => ({
        name: owner.ownerName,
        leads: owner.count,
        value: owner.value
      })));

      setTrendData(trendData.map(item => ({
        date: item.date,
        newLeads: item.newLeads,
        convertedLeads: item.convertedLeads,
        lostLeads: item.lostLeads
      })));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast({
      title: "Dashboard Refreshed",
      description: "The dashboard data has been updated."
    });
  };

  const formatDateRange = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  if (isLoading && !stats) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Loading dashboard data...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Yeah!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="outline" 
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 pt-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
              <div className="w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-[280px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateRange()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col sm:flex-row">
                      <div className="p-2 border-b sm:border-b-0 sm:border-r">
                        <h4 className="mb-2 font-semibold">Start Date</h4>
                        <DatePicker
                          date={new Date(dateRange.startDate)}
                          setDate={(date) => 
                            setDateRange(prev => ({ 
                              ...prev, 
                              startDate: format(date || new Date(), 'yyyy-MM-dd') 
                            }))
                          }
                        />
                      </div>
                      <div className="p-2">
                        <h4 className="mb-2 font-semibold">End Date</h4>
                        <DatePicker
                          date={new Date(dateRange.endDate)}
                          setDate={(date) => 
                            setDateRange(prev => ({ 
                              ...prev, 
                              endDate: format(date || new Date(), 'yyyy-MM-dd') 
                            }))
                          }
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="jane">Jane Smith</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="h-10 w-full sm:w-auto">
                More Filters
              </Button>
            </div>

            <Button className="h-10 w-full sm:w-auto" variant="default">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="New Leads"
          value={stats?.newLeads || 0}
          icon={Users}
          className="shadow-sm"
        />
        <MetricCard
          title="Pipeline Leads"
          value={stats?.pipelineLeads || 0}
          icon={TrendingUp}
          className="shadow-sm"
        />
        <MetricCard
          title="Converted Leads"
          value={stats?.convertedLeads || 0}
          icon={CheckCircle}
          className="shadow-sm"
        />
        <MetricCard
          title="Lost Leads"
          value={stats?.lostLeads || 0}
          icon={XCircle}
          className="shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Pipeline Value"
          value={`₹ ${formatInrCrores(stats?.totalValue || 0)} Cr`}
          icon={DollarSign}
          className="shadow-sm"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${stats?.conversionRate.toFixed(1) || 0}%`}
          change={-0.5}
          trend="down"
          description="from previous period"
          icon={Percent}
          className="shadow-sm"
        />
        <MetricCard
          title="Average Deal Size"
          value={`₹ ${formatInrCrores(stats?.averageDealSize || 0)} Cr`}
          icon={BarChart3}
          className="shadow-sm"
        />
        <MetricCard
          title="Top Industry"
          value={stats?.topIndustry?.name || "None"}
          description={`${stats?.topIndustry?.count || 0} leads`}
          icon={PieChart}
          className="shadow-sm"
        />
      </div>

      <div className="mb-6">
        <PipelineChart data={pipelineData.map(d => ({
          stageId: 0,
          stageName: d.name,
          count: d.leadCount,
          value: d.value
        }))} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <IndustryChart data={industryData.map(d => ({
          industry: d.name,
          count: d.value,
          value: 0
        }))} />

        <TeamPerformanceChart data={teamData.map(d => ({
          ownerId: '',
          ownerName: d.name,
          count: d.leads,
          value: d.value
        }))} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Top Performing Team Member</CardTitle>
            </div>
            <Award className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.topPerformer.name}</div>
            <p className="text-sm text-muted-foreground">{stats?.topPerformer.leads} leads managed</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Most Popular Product</CardTitle>
            </div>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.popularProduct.name}</div>
            <p className="text-sm text-muted-foreground">Selected in {stats?.popularProduct.count} leads</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <TrendChart data={trendData.map(d => ({
          date: d.date,
          newLeads: d.newLeads,
          convertedLeads: d.convertedLeads,
          lostLeads: d.lostLeads
        }))} />
      </div>
    </div>
  );
};

export default Dashboard;
