
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { fetchLeadById } from '@/services/leadsService';
import { LEAD_STATUSES } from '@/utils/constants';
import { formatInrCrores, formatDate } from '@/utils/format';
import { ArrowLeft, Building, User, Calendar, Phone, Mail, Globe, FileText, Upload, PlusCircle } from 'lucide-react';
import { ChatPanel } from '@/components/chat/ChatPanel';

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadLead = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const leadId = parseInt(id);
        const data = await fetchLeadById(leadId);
        
        if (data) {
          console.log("Lead data loaded:", data);
          setLead(data);
        } else {
          toast({
            title: 'Lead not found',
            description: 'The requested lead could not be found',
            variant: 'destructive'
          });
          navigate('/leads');
        }
      } catch (error) {
        console.error('Error loading lead:', error);
        toast({
          title: 'Error',
          description: 'Failed to load lead data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLead();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading lead details...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  // Get lead status information
  const getLeadStatus = (stageId: number) => {
    const index = stageId - 1;
    const statuses = Object.values(LEAD_STATUSES);
    return {
      label: statuses[index]?.label || 'Unknown',
      bgColor: statuses[index]?.bgColor || '',
      color: statuses[index]?.color || ''
    };
  };

  const status = getLeadStatus(lead.stage_id || 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/leads')}
        >
          <ArrowLeft />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              {lead?.client_company}
            </h1>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate(`/leads/${id}/edit`)}
              >
                Edit Lead
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {lead?.stage_id && (
              <Badge
                variant="outline"
                className={`${getLeadStatus(lead.stage_id).bgColor} ${getLeadStatus(lead.stage_id).color}`}
              >
                {getLeadStatus(lead.stage_id).label}
              </Badge>
            )}
            {lead?.client_industry && (
              <span className="text-muted-foreground">
                {lead.client_industry}
              </span>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chat">Team Chat</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes & Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{lead.client_company}</div>
                      {lead.client_industry && (
                        <div className="text-sm text-muted-foreground">
                          {lead.client_industry}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {lead.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Website</div>
                        <a 
                          href={lead.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {lead.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Created</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(lead.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {lead.estimated_value && (
                    <div className="rounded-md bg-muted p-3 flex items-center justify-between">
                      <div className="text-sm">Estimated Value</div>
                      <div className="font-medium text-lg">
                        {formatInrCrores(lead.estimated_value)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.contact_name && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Primary Contact</div>
                      <div className="text-sm text-muted-foreground">
                        {lead.contact_name}
                      </div>
                    </div>
                  </div>
                )}
                
                {lead.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email</div>
                      <a 
                        href={`mailto:${lead.contact_email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {lead.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                
                {lead.contact_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <a 
                        href={`tel:${lead.contact_phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {lead.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {lead.contact_address && (
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mt-0.5 text-muted-foreground">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {lead.contact_address}
                      </div>
                    </div>
                  </div>
                )}
                
                {lead.lead_contacts && lead.lead_contacts.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">Additional Contacts</h4>
                    <div className="space-y-3">
                      {lead.lead_contacts.map((contact: any) => (
                        <div key={contact.id} className="border rounded-md p-3">
                          <div className="font-medium">{contact.name}</div>
                          {contact.designation && (
                            <div className="text-sm text-muted-foreground">
                              {contact.designation}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {contact.email && (
                              <a 
                                href={`mailto:${contact.email}`}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {contact.email}
                              </a>
                            )}
                            {contact.phone && (
                              <a 
                                href={`tel:${contact.phone}`}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {contact.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {lead.meeting_notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">
                    {lead.meeting_notes}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
              <CardDescription>
                Discuss this lead with your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lead && (
                <ChatPanel 
                  leadId={parseInt(id as string)} 
                  leadName={lead.client_company} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Manage tasks related to this lead
                </CardDescription>
              </div>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Tasks will be implemented here */}
                <div className="text-center py-8 text-muted-foreground">
                  No tasks yet. Add a task to get started.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notes & Documents</CardTitle>
                <CardDescription>
                  Keep track of important notes and documents
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Notes and documents will be implemented here */}
                <div className="text-center py-8 text-muted-foreground">
                  No notes or documents yet. Add some to get started.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadDetail;
