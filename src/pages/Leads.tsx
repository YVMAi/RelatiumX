
import { useState } from 'react';
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
import { mockLeads } from '@/data/mockData';
import { LEAD_STATUSES } from '@/utils/constants';
import { formatInrCrores, formatDate } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();

  const filteredLeads = leads.filter(
    (lead) =>
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteLead = () => {
    if (!selectedLead) return;

    setLeads(leads.filter((lead) => lead.id !== selectedLead.id));
    setSelectedLead(null);
    setIsDeleteDialogOpen(false);
    toast({
      title: 'Lead Deleted',
      description: `Successfully deleted lead for ${selectedLead.companyName}`,
    });
  };

  const confirmDelete = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const viewLeadDetails = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const canEditLead = (lead: Lead) => {
    return hasPermission('update', 'leads') || 
      (hasPermission('update:own', 'leads') && lead.createdBy === user?.id);
  };

  const canDeleteLead = (lead: Lead) => {
    return hasPermission('delete', 'leads') || 
      (hasPermission('delete:own', 'leads') && lead.createdBy === user?.id);
  };

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.companyName}
                        {lead.industry && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {lead.industry}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>{lead.contactName}</div>
                        <div className="text-xs text-muted-foreground">
                          {lead.contactEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${LEAD_STATUSES[lead.status].bgColor} ${LEAD_STATUSES[lead.status].color}`}
                        >
                          {LEAD_STATUSES[lead.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatInrCrores(lead.value)}
                      </TableCell>
                      <TableCell>{formatDate(lead.createdAt)}</TableCell>
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
                              <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
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
                  ))
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the lead for{' '}
              <strong>{selectedLead?.companyName}</strong>? This action cannot
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
