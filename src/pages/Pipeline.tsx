
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  User, 
  CalendarDays,
  Building,
  Mail,
  Phone,
  CreditCard,
  Tag,
  X
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types';
import { mockLeads } from '@/data/mockData';
import { formatInrCrores, formatDate } from '@/utils/format';
import { LEAD_STATUSES, INDUSTRY_OPTIONS } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';

const Pipeline = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const { toast } = useToast();
  
  // Group leads by status
  const leadsByStatus: Record<LeadStatus, Lead[]> = {
    new: [],
    contacted: [],
    demo: [],
    proposal: [],
    negotiation: [],
    closed_won: [],
    closed_lost: []
  };
  
  // Filter and sort leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesIndustry = filterIndustry === 'all' || lead.industry === filterIndustry;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });
  
  // Sort leads
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
  
  // Group the filtered & sorted leads by status
  sortedLeads.forEach(lead => {
    leadsByStatus[lead.status].push(lead);
  });
  
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Find the lead that was dragged
    const leadId = draggableId;
    const lead = leads.find(l => l.id === leadId);
    
    if (!lead) return;
    
    // Update the lead's status
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
  
  const openLeadPreview = (lead: Lead) => {
    setSelectedLead(lead);
    setIsPreviewOpen(true);
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
          <Button>
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
            <SelectTrigger className="w-36">
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
      
      <div className="overflow-x-auto pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max">
            {Object.entries(LEAD_STATUSES).map(([status, { label, color }]) => (
              <div key={status} className="kanban-column">
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
                                  onClick={() => openLeadPreview(lead)}
                                  className="kanban-card"
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
      
      {selectedLead && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedLead.companyName}</DialogTitle>
              <DialogDescription>Lead details and information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LEAD_STATUSES[selectedLead.status].bgColor} ${LEAD_STATUSES[selectedLead.status].color}`}>
                    {LEAD_STATUSES[selectedLead.status].label}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Deal Value</p>
                  <p className="font-medium">{formatInrCrores(selectedLead.value)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="font-medium">Company Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-muted-foreground">{selectedLead.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Industry</p>
                      <p className="text-sm text-muted-foreground">{selectedLead.industry || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="font-medium">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Contact Name</p>
                      <p className="text-sm text-muted-foreground">{selectedLead.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{selectedLead.contactEmail}</p>
                    </div>
                  </div>
                  {selectedLead.contactPhone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{selectedLead.contactPhone}</p>
                      </div>
                    </div>
                  )}
                  {selectedLead.website && (
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Website</p>
                        <p className="text-sm text-muted-foreground">{selectedLead.website}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedLead.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium">Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedLead.notes}</p>
                  </div>
                </>
              )}
              
              {selectedLead.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedLead.tags.map(tag => (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${tag.color}`}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="font-medium">Tasks</h3>
                {selectedLead.tasks && selectedLead.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.tasks.map(task => (
                      <div key={task.id} className="bg-muted p-3 rounded-md">
                        <div className="flex justify-between">
                          <p className="font-medium">{task.title}</p>
                          <Badge variant={task.completed ? "success" : "outline"}>
                            {task.completed ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tasks associated with this lead.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Pipeline;
