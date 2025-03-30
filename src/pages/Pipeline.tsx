import { useState } from 'react';
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
import { mockLeads } from '@/data/mockData';
import { formatInrCrores, formatDate } from '@/utils/format';
import { LEAD_STATUSES, INDUSTRY_OPTIONS } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';

const Pipeline = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const leadsByStatus: Record<LeadStatus, Lead[]> = {
    new: [],
    contacted: [],
    demo: [],
    proposal: [],
    negotiation: [],
    closed_won: [],
    closed_lost: []
  };
  
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesIndustry = filterIndustry === 'all' || lead.industry === filterIndustry;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });
  
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'valueHighToLow':
        return b.value - a.value;
      case 'valueLowToHigh':
        return a.value - b.value;
      case 'alphabetical':
        return a.companyName.localeCompare(b.companyName);
      default:
        return 0;
    }
  });
  
  sortedLeads.forEach(lead => {
    leadsByStatus[lead.status].push(lead);
  });
  
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    const leadId = draggableId;
    const lead = leads.find(l => l.id === leadId);
    
    if (!lead) return;
    
    const newStatus = destination.droppableId as LeadStatus;
    
    const updatedLeads = leads.map(l => 
      l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } : l
    );
    
    setLeads(updatedLeads);
    
    toast({
      title: 'Lead Updated',
      description: `${lead.companyName} moved to ${LEAD_STATUSES[newStatus].label}`,
    });
  };
  
  const openLeadDetails = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };
  
  const handleAddLead = () => {
    navigate('/leads/new');
  };
  
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
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search leads..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  {Object.entries(LEAD_STATUSES).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
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
            {Object.entries(LEAD_STATUSES).map(([status, { label, color }]) => (
              <div key={status} className="kanban-column" style={{ minWidth: isMobile ? '260px' : '280px', maxWidth: '300px' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-medium ${color}`}>{label}</h3>
                  <Badge variant="outline">
                    {leadsByStatus[status as LeadStatus].length}
                  </Badge>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[200px]"
                    >
                      <ScrollArea className="h-[calc(70vh-100px)]">
                        <div className="pr-2">
                          {leadsByStatus[status as LeadStatus].map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => openLeadDetails(lead.id)}
                                  className="kanban-card cursor-pointer"
                                >
                                  <div className="flex justify-between mb-2">
                                    <h4 className="font-medium">{lead.companyName}</h4>
                                    <Badge variant="outline">{formatInrCrores(lead.value)}</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-3">
                                    {lead.contactName}
                                  </div>
                                  {lead.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {lead.tags.slice(0, 2).map(tag => (
                                        <span
                                          key={tag.id}
                                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${tag.color}`}
                                        >
                                          {tag.name}
                                        </span>
                                      ))}
                                      {lead.tags.length > 2 && (
                                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted">
                                          +{lead.tags.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center">
                                      <User className="h-3 w-3 mr-1" />
                                      <span>Assigned</span>
                                    </div>
                                    <div className="flex items-center">
                                      <CalendarDays className="h-3 w-3 mr-1" />
                                      <span>{formatDate(lead.updatedAt)}</span>
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
