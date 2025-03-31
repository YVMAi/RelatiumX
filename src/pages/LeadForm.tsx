
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Lead, LeadTag, LeadContact, LeadInsert, Task } from '@/types';
import { INDUSTRY_OPTIONS, LEAD_STATUSES, DEFAULT_LEAD_TAGS, LEAD_SCORE_OPTIONS } from '@/utils/constants';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { ContactSection } from '@/components/leads/ContactSection';
import { ProductServicesSection } from '@/components/leads/ProductServicesSection';
import { TeamSection } from '@/components/leads/TeamSection';
import { NextStepsSection } from '@/components/leads/NextStepsSection';
import { useIsMobile } from '@/hooks/use-mobile';
import { createLead, fetchLeadById, updateLead, saveLeadContacts, fetchLeadTeamMembers } from '@/services/leadsService';
import { leadService } from '@/services/api';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [isLoading, setIsLoading] = useState(false);
  const [lead, setLead] = useState<Partial<LeadInsert>>({
    client_company: '',
    client_industry: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    owner_id: user?.id || '',
  });
  const [leadContacts, setLeadContacts] = useState<Partial<LeadContact>[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>(user?.id || '');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Fetch lead data if editing an existing lead
  useEffect(() => {
    const fetchLead = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const numericId = parseInt(id, 10);
          if (!isNaN(numericId)) {
            const leadData = await fetchLeadById(numericId);
            
            if (leadData) {
              // Set the form data from the fetched lead
              setLead({
                client_company: leadData.client_company,
                client_industry: leadData.client_industry,
                contact_name: leadData.contact_name,
                contact_email: leadData.contact_email,
                contact_phone: leadData.contact_phone,
                contact_address: leadData.contact_address,
                website: leadData.website,
                products: leadData.products,
                estimated_value: leadData.estimated_value,
                owner_id: leadData.owner_id,
                stage_id: leadData.stage_id,
                meeting_notes: leadData.meeting_notes,
                next_activity: leadData.next_activity,
              });
              
              setSelectedOwner(leadData.owner_id || '');
              setSelectedProducts(leadData.products || []);
              
              // Set contacts if available
              if (leadData.lead_contacts) {
                setLeadContacts(leadData.lead_contacts);
              }
              
              // Fetch team members for this lead
              const teamMembers = await fetchLeadTeamMembers(numericId);
              if (teamMembers && teamMembers.length > 0) {
                const teamMemberIds = teamMembers.map((member: any) => member.user_id);
                setSelectedMembers(teamMemberIds);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching lead:', error);
          toast({
            title: "Error",
            description: "Failed to load lead data",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchLead();
  }, [id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Validate required fields
    if (!lead.client_company) {
      toast({
        title: "Missing required fields",
        description: "Company name is required",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    try {
      // Prepare lead data
      const leadData: LeadInsert = {
        ...lead as LeadInsert,
        owner_id: selectedOwner,
        products: selectedProducts
      };
      
      let savedLeadId: number;
      
      if (id) {
        // Update existing lead
        const numericId = parseInt(id, 10);
        const updatedLead = await updateLead(numericId, leadData);
        savedLeadId = updatedLead.id;
        
        // Save lead contacts
        if (leadContacts.length > 0) {
          await saveLeadContacts(savedLeadId, leadContacts);
        }
        
        toast({
          title: "Lead updated",
          description: `Successfully updated lead for ${lead.client_company}`,
        });
      } else {
        // Create new lead
        const newLead = await createLead(leadData);
        savedLeadId = newLead.id;
        
        // Save lead contacts
        if (leadContacts.length > 0) {
          await saveLeadContacts(savedLeadId, leadContacts);
        }
        
        toast({
          title: "Lead created",
          description: `Successfully created lead for ${lead.client_company}`,
        });
      }
      
      // Navigate back to leads list
      navigate('/leads');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: "Error",
        description: "Failed to save lead data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? 'Edit Lead' : 'Create New Lead'}
          </h1>
          <p className="text-muted-foreground">
            {id ? 'Update the information for this lead' : 'Enter the details to create a new lead'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
            <CardDescription>
              Basic information about the company and opportunity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_company">Company Name *</Label>
              <Input
                id="client_company"
                name="client_company"
                placeholder="Company name"
                value={lead.client_company || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_industry">Industry</Label>
              <Select
                value={lead.client_industry}
                onValueChange={(value) => handleSelectChange('client_industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                placeholder="https://www.example.com"
                value={lead.website || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_value">Deal Value (INR Crores)</Label>
              <Input
                id="estimated_value"
                name="estimated_value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={lead.estimated_value || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage_id">Status</Label>
              <Select
                value={lead.stage_id?.toString()}
                onValueChange={(value) => handleSelectChange('stage_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_STATUSES).map(([key, { label }]) => (
                    <SelectItem key={key} value={(parseInt(key) + 1).toString()}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_notes">Notes</Label>
              <Textarea
                id="meeting_notes"
                name="meeting_notes"
                placeholder="Additional information about this lead"
                value={lead.meeting_notes || ''}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Primary contact details for this lead
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  placeholder="Contact person name"
                  value={lead.contact_name || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="contact@example.com"
                  value={lead.contact_email || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  placeholder="+91 98765 43210"
                  value={lead.contact_phone || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_address">Contact Address</Label>
                <Textarea
                  id="contact_address"
                  name="contact_address"
                  placeholder="Contact address"
                  value={lead.contact_address || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          <ContactSection 
            contacts={leadContacts} 
            setContacts={setLeadContacts}
          />
          
          <ProductServicesSection 
            selectedProducts={selectedProducts}
            onChange={setSelectedProducts}
          />
        </div>

        <TeamSection 
          selectedOwner={selectedOwner}
          selectedMembers={selectedMembers}
          onOwnerChange={setSelectedOwner}
          onMembersChange={setSelectedMembers}
        />

        <NextStepsSection 
          tasks={tasks}
          onChange={setTasks}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (id ? 'Update Lead' : 'Create Lead')}
        </Button>
      </div>
    </div>
  );
};

export default LeadForm;
