
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Lead, LeadTag } from '@/types';
import { INDUSTRY_OPTIONS, LEAD_STATUSES, DEFAULT_LEAD_TAGS, LEAD_SCORE_OPTIONS } from '@/utils/constants';
import { ArrowLeft, Plus, Trash2, Calendar, Users } from 'lucide-react';
import { mockLeads } from '@/data/mockData';
import { ContactSection } from '@/components/leads/ContactSection';
import { ProductServicesSection } from '@/components/leads/ProductServicesSection';
import { TeamSection } from '@/components/leads/TeamSection';
import { NextStepsSection } from '@/components/leads/NextStepsSection';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [lead, setLead] = useState<Partial<Lead>>({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    status: 'new',
    value: 0,
    tags: [],
    createdBy: user?.id || '',
  });
  
  // Fetch lead data if editing an existing lead
  useEffect(() => {
    if (id) {
      // In a real app, this would be an API call
      const existingLead = mockLeads.find(l => l.id === id);
      if (existingLead) {
        setLead(existingLead);
      }
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsLoading(true);
    
    // Validate required fields
    if (!lead.companyName || !lead.industry) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // In a real app, this would save to the database
    setTimeout(() => {
      toast({
        title: id ? "Lead updated" : "Lead created",
        description: `Successfully ${id ? 'updated' : 'created'} lead for ${lead.companyName}`,
      });
      setIsLoading(false);
      navigate('/leads');
    }, 500);
  };

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
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Company name"
                value={lead.companyName || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={lead.industry}
                onValueChange={(value) => handleSelectChange('industry', value)}
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
              <Label htmlFor="value">Deal Value (INR Crores)</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={lead.value || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={lead.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_STATUSES).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional information about this lead"
                value={lead.notes || ''}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ContactSection 
            contacts={lead.contactDetails || []} 
            setContacts={(contacts) => setLead({...lead, contactDetails: contacts})}
          />
          
          <ProductServicesSection 
            selectedProducts={lead.products || []}
            onChange={(products) => setLead({...lead, products})}
          />
        </div>

        <TeamSection 
          selectedOwner={lead.assignedTo}
          selectedMembers={lead.teamMembers || []}
          onOwnerChange={(ownerId) => setLead({...lead, assignedTo: ownerId})}
          onMembersChange={(memberIds) => setLead({...lead, teamMembers: memberIds})}
        />
        
        <NextStepsSection
          tasks={lead.tasks || []}
          onChange={(tasks) => setLead({...lead, tasks})}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/leads')}
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
