
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Plus, Search, Filter, ArrowUpDown, User, CalendarDays, X } from 'lucide-react';
import { Lead, LeadStatus } from '@/types';
import { formatInrCrores, formatDate } from '@/utils/format';
import { LEAD_STATUSES, INDUSTRY_OPTIONS } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';
import { fetchLeads, updateLead } from '@/services/leadsService';
import { GlobalSearch } from '@/components/search/GlobalSearch';

const Pipeline = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Fetch leads from the database
  useEffect(() => {
    const loadLeads = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLeads();
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: 'Error',
          description: 'Failed to load leads data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeads();
  }, [toast]);
  
  // Group leads by status
  const leadsByStatus: Record<string, any[]> = {
    '1': [], // new
    '2': [], // contacted
    '3': [], // demo
    '4': [], // proposal
    '5': [], // negotiation
    '6': [], // closed_won
    '7': []  // closed_lost
  };
  
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.client_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || lead.stage_id?.toString() === filterStatus;
    const matchesIndustry = filterIndustry === 'all' || lead.client_industry === filterIndustry;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });
  
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'valueHighToLow':
        return (b.estimated_value || 0) - (a.estimated_value || 0);
      case 'valueLowToHigh':
        return (a.estimated_value || 0) - (b.estimated_value || 0);
      case 'alphabetical':
        return a.client_company.localeCompare(b.client_company);
      default:
        return 0;
    }
  });
  
  // Group leads by stage_id
  sortedLeads.forEach(lead => {
    const stageId = lead.stage_id?.toString() || '1';
    if (leadsByStatus[stageId]) {
      leadsByStatus[stageId].push(lead);
    } else {
      leadsByStatus['1'].push(lead);
    }
  });
  
  const getStatusName = (stageId: string) => {
    const index = parseInt(stageId) - 1;
    const statuses = Object.values(LEAD_STATUSES);
    return statuses[index]?.label || 'Unknown';
  };
  
  const getStatusColor = (stageId: string) => {
    const index = parseInt(stageId) - 1;
    const statuses = Object.values(LEAD_STATUSES);
    return statuses[index]?.color || '';
  };
  
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    const leadId = parseInt(draggableId);
    const lead = leads.find(l => l.id === leadId);
    
    if (!lead) return;
    
    const newStageId = parseInt(destination.droppableId);
    
    try {
      // Update lead in the database
      await updateLead(leadId, { stage_id: newStageId });
      
      // Update local state
      const updatedLeads = leads.map(l => 
        l.id === leadId ? { ...l, stage_id: newStageId } : l
      );
      
      setLeads(updatedLeads);
      
      toast({
        title: 'Lead Updated',
        description: `${lead.client_company} moved to ${getStatusName(destination.droppableId)}`,
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive'
      });
    }
  };
  
  const openLeadDetails = (leadId: number) => {
    navigate(`/leads/${leadId}`);
  };
  
  const handleAddLead = () => {
    navigate('/leads/new');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading pipeline data...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the latest leads</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Pipeline</h1>
          <p className="text-muted-foreground">
            Manage and track leads through your sales process
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button onClick={handleAddLead}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="w-full sm:w-80">
          <GlobalSearch />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={isFilterPanelOpen ? 'bg-secondary' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 max-w-[120px] md:max-w-full">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <span>Sort</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="valueHighToLow">Value (High to Low)</SelectItem>
              <SelectItem value="valueLowToHigh">Value (Low to High)</SelectItem>
              <SelectItem value="alphabetical">Company Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isFilterPanelOpen && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterPanelOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 pb-3">
            <div className="w-full sm:w-auto">
              <p className="text-sm font-medium mb-1.5">Status</p>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.keys(leadsByStatus).map((stageId) => (
                    <SelectItem key={stageId} value={stageId}>
                      {getStatusName(stageId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <p className="text-sm font-medium mb-1.5">Industry</p>
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterStatus('all');
                setFilterIndustry('all');
              }}
            >
              Reset Filters
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className={`overflow-x-auto pb-4 ${isMobile ? 'touch-pan-x' : ''}`}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max">
            {Object.keys(leadsByStatus).map((stageId) => (
              <div key={stageId} className="kanban-column" style={{ minWidth: isMobile ? '260px' : '280px', maxWidth: '300px' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-medium ${getStatusColor(stageId)}`}>
                    {getStatusName(stageId)}
                  </h3>
                  <Badge variant="outline">
                    {leadsByStatus[stageId].length}
                  </Badge>
                </div>
                
                <Droppable droppableId={stageId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[200px]"
                    >
                      <ScrollArea className="h-[calc(70vh-100px)]">
                        <div className="pr-2">
                          {leadsByStatus[stageId].map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => openLeadDetails(lead.id)}
                                  className="kanban-card cursor-pointer"
                                >
                                  <div className="flex justify-between mb-2">
                                    <h4 className="font-medium">{lead.client_company}</h4>
                                    <Badge variant="outline">{formatInrCrores(lead.estimated_value)}</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-3">
                                    {lead.contact_name}
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center">
                                      <User className="h-3 w-3 mr-1" />
                                      <span>{lead.profiles?.name || "Unassigned"}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <CalendarDays className="h-3 w-3 mr-1" />
                                      <span>{formatDate(lead.updated_at)}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Pipeline;
