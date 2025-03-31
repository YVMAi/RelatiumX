import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lead } from '@/types';
import { LEAD_STATUSES } from '@/utils/constants';
import { formatInrCrores, formatDate } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchLeads, deleteLeadById } from '@/services/leadsService';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
} from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const filteredLeads = leads.filter(
    (lead) =>
      lead.client_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteLead = async () => {
    if (!selectedLead) return;

    try {
      await deleteLeadById(selectedLead.id);
      setLeads(leads.filter((lead) => lead.id !== selectedLead.id));
      setSelectedLead(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Lead Deleted',
        description: `Successfully deleted lead for ${selectedLead.client_company}`,
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive'
      });
    }
  };

  const confirmDelete = (lead: any) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const viewLeadDetails = (leadId: number) => {
    navigate(`/leads/${leadId}`);
  };

  const canEditLead = (lead: any) => {
    return hasPermission ? (
      hasPermission('update', 'leads') || 
      (hasPermission('update:own', 'leads') && lead.owner_id === user?.id)
    ) : true;
  };

  const canDeleteLead = (lead: any) => {
    return hasPermission ? (
      hasPermission('delete', 'leads') || 
      (hasPermission('delete:own', 'leads') && lead.owner_id === user?.id)
    ) : true;
  };

  const getLeadStatus = (stageId: number) => {
    const index = stageId - 1;
    const statuses = Object.values(LEAD_STATUSES);
    return {
      label: statuses[index]?.label || 'Unknown',
      bgColor: statuses[index]?.bgColor || '',
      color: statuses[index]?.color || ''
    };
  };

  const renderMobileLeadCards = () => {
    return filteredLeads.map(lead => {
      const status = getLeadStatus(lead.stage_id || 1);
      
      return (
        <Card key={lead.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{lead.client_company}</h3>
                <p className="text-sm text-muted-foreground">{lead.contact_name}</p>
              </div>
              <Badge
                variant="outline"
                className={`${status.bgColor} ${status.color}`}
              >
                {status.label}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm">{formatInrCrores(lead.estimated_value)}</div>
              <div className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</div>
            </div>
            
            <div className="flex justify-end gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => viewLeadDetails(lead.id)}
              >
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
              
              {canEditLead(lead) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/leads/${lead.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
              
              {canDeleteLead(lead) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive"
                  onClick={() => confirmDelete(lead)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading leads...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Management</h1>
          <p className="text-muted-foreground">
            Create, view and manage your leads
          </p>
        </div>
        <div>
          <Button onClick={() => navigate('/leads/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-md">
          <GlobalSearch />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            Showing {filteredLeads.length} leads from a total of {leads.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isMobile ? (
            <div className="p-4">
              {filteredLeads.length > 0 ? 
                renderMobileLeadCards() : 
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-3 rounded-full bg-muted p-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No leads found. Try adjusting your search.
                  </p>
                </div>
              }
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-[220px]">
                      <div className="flex items-center">
                        Company
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => {
                      const status = getLeadStatus(lead.stage_id || 1);
                      
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            {lead.client_company}
                            {lead.client_industry && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {lead.client_industry}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>{lead.contact_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {lead.contact_email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${status.bgColor} ${status.color}`}
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatInrCrores(lead.estimated_value)}
                          </TableCell>
                          <TableCell>{formatDate(lead.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => viewLeadDetails(lead.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                
                                {canEditLead(lead) && (
                                  <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}/edit`)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {canDeleteLead(lead) && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => confirmDelete(lead)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-3 rounded-full bg-muted p-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">
                            No leads found. Try adjusting your search.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the lead for{' '}
              <strong>{selectedLead?.client_company}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLead}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
