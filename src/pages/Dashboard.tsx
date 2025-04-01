
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  BadgeIndianRupee, 
  BarChart4, 
  Building, 
  Package, 
  RefreshCw, 
  Percent, 
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { formatInrCrores, formatPercentage } from '@/utils/format';

import { FilterBar, FilterOption } from '@/components/dashboard/FilterBar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { 
  PipelineChart, 
  IndustryChart, 
  TeamPerformanceChart,
  TrendChart 
} from '@/components/dashboard/DashboardCharts';
import { DashboardSkeleton } from '@/components/dashboard/DashboardLoader';

import { 
  DashboardMetrics, 
  LeadFilter, 
  LeadsByIndustry, 
  LeadsByOwner, 
  LeadsByStage, 
  LeadTrendData,
  fetchDashboardMetrics,
  fetchFilterOptions,
  fetchLeadsByIndustry,
  fetchLeadsByOwner,
  fetchLeadsByStage,
  fetchLeadTrends
} from '@/services/dashboardService';

// Function to map raw data to FilterOption format
const mapToFilterOptions = (items: string[] | { id: string | number, name: string }[]): FilterOption[] => {
  return items.map(item => {
    if (typeof item === 'string') {
      return { value: item, label: item };
    } else {
      return { value: String(item.id), label: item.name };
    }
  });
};

const Dashboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilter>({});
  
  // Filter options
  const [ownerOptions, setOwnerOptions] = useState<FilterOption[]>([]);
  const [industryOptions, setIndustryOptions] = useState<FilterOption[]>([]);
  const [productOptions, setProductOptions] = useState<FilterOption[]>([]);
  const [stageOptions, setStageOptions] = useState<FilterOption[]>([]);
  
  // Dashboard data
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    newLeads: 0,
    pipelineLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    totalLeadValue: 0,
    conversionRate: 0
  });
  
  const [stageData, setStageData] = useState<LeadsByStage[]>([]);
  const [industryData, setIndustryData] = useState<LeadsByIndustry[]>([]);
  const [ownerData, setOwnerData] = useState<LeadsByOwner[]>([]);
  const [trendData, setTrendData] = useState<LeadTrendData[]>([]);
  
  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await fetchFilterOptions();
        
        setOwnerOptions(mapToFilterOptions(options.owners));
        setIndustryOptions(mapToFilterOptions(options.industries));
        setProductOptions(mapToFilterOptions(options.products));
        setStageOptions(mapToFilterOptions(options.stages));
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };
    
    loadFilterOptions();
  }, []);
  
  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch all dashboard data in parallel
        const [
          metricsData,
          stagesData,
          industriesData,
          ownersData,
          trendsData
        ] = await Promise.all([
          fetchDashboardMetrics(filters),
          fetchLeadsByStage(filters),
          fetchLeadsByIndustry(filters),
          fetchLeadsByOwner(filters),
          fetchLeadTrends(filters)
        ]);
        
        setMetrics(metricsData);
        setStageData(stagesData);
        setIndustryData(industriesData);
        setOwnerData(ownersData);
        setTrendData(trendsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: LeadFilter) => {
    setFilters(newFilters);
  };
  
  // Show loading state while data is being fetched
  if (loading && (!stageData.length || !industryData.length)) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name || 'User'}!</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilters({})}
            className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-accent-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <FilterBar
        owners={ownerOptions}
        industries={industryOptions}
        products={productOptions}
        stages={stageOptions}
        onFilterChange={handleFilterChange}
      />
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="New Leads"
          value={metrics.newLeads}
          icon={Users}
          trend="neutral"
        />
        <MetricCard
          title="Pipeline Leads"
          value={metrics.pipelineLeads}
          icon={TrendingUp}
          trend="neutral"
        />
        <MetricCard
          title="Converted Leads"
          value={metrics.convertedLeads}
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Lost Leads"
          value={metrics.lostLeads}
          icon={TrendingDown}
          trend="down"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pipeline Value"
          value={formatInrCrores(metrics.totalLeadValue)}
          icon={BadgeIndianRupee}
          trend="neutral"
        />
        <MetricCard
          title="Conversion Rate"
          value={formatPercentage(metrics.conversionRate)}
          icon={Percent}
          trend={metrics.conversionRate > 20 ? 'up' : 'down'}
          change={metrics.conversionRate > 20 ? 5.2 : -3.1}
          description="from previous period"
        />
        <MetricCard
          title="Average Deal Size"
          value={formatInrCrores(metrics.totalLeadValue / (metrics.newLeads + metrics.pipelineLeads + metrics.convertedLeads || 1))}
          icon={BarChart4}
          trend="neutral"
        />
        <MetricCard
          title="Top Industry"
          value={industryData.length > 0 ? industryData[0].industry : 'N/A'}
          icon={Building}
          trend="neutral"
          description={industryData.length > 0 ? `${industryData[0].count} leads` : ''}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PipelineChart data={stageData} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <IndustryChart data={industryData} />
        <TeamPerformanceChart data={ownerData} />
        <div className="grid gap-4">
          <MetricCard
            title="Top Performing Team Member"
            value={ownerData.length > 0 ? ownerData[0].ownerName : 'N/A'}
            icon={Users}
            trend="up"
            description={ownerData.length > 0 ? 
              `₹${formatInrCrores(ownerData[0].value)} Cr - ${ownerData[0].count} leads` 
              : ''}
            className="h-[calc(50%-0.5rem)]"
          />
          <MetricCard
            title="Most Popular Product"
            value="Enterprise Solution"
            icon={Package}
            trend="up"
            description="11 active deals"
            className="h-[calc(50%-0.5rem)]"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrendChart data={trendData} />
      </div>
    </div>
  );
};

export default Dashboard;
