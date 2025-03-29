
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Lead, LeadTag } from '@/types';
import { INDUSTRY_OPTIONS, LEAD_STATUSES, DEFAULT_LEAD_TAGS, LEAD_SCORE_OPTIONS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { CalendarIcon, Tag, Plus, X } from 'lucide-react';

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (lead: Lead) => void;
  onCancel: () => void;
}

const LeadForm = ({ lead, onSubmit, onCancel }: LeadFormProps) => {
  const [formData, setFormData] = useState<Partial<Lead>>(
    lead || {
      companyName: '',
      contactName: '',
      contactEmail: '',
      status: 'new',
      value: 0,
      tags: [],
    }
  );
  const [date, setDate] = useState<Date | undefined>(lead?.createdAt ? new Date(lead.createdAt) : new Date());
  const [selectedTags, setSelectedTags] = useState<LeadTag[]>(lead?.tags || []);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, value }));
  };

  const toggleTag = (tag: LeadTag) => {
    if (selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleScoreChange = (score: string) => {
    setFormData((prev) => ({ ...prev, score: parseInt(score, 10) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactName || !formData.contactEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Prepare the lead data
    const newLead: Lead = {
      id: lead?.id || `lead-${Date.now()}`,
      companyName: formData.companyName!,
      contactName: formData.contactName!,
      contactEmail: formData.contactEmail!,
      contactPhone: formData.contactPhone || '',
      industry: formData.industry,
      status: formData.status as 'new',
      value: formData.value || 0,
      tags: selectedTags,
      createdBy: lead?.createdBy || 'user-1', // Current user ID would be used in a real app
      createdAt: lead?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: formData.notes,
      score: formData.score,
      website: formData.website,
      address: formData.address,
    };

    onSubmit(newLead);
    
    toast({
      title: lead ? 'Lead Updated' : 'Lead Created',
      description: `Successfully ${lead ? 'updated' : 'created'} lead for ${formData.companyName}`,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{lead ? 'Edit Lead' : 'New Lead'}</CardTitle>
          <CardDescription>
            {lead 
              ? 'Update the information for this lead.' 
              : 'Enter the details to create a new lead.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Company name"
              value={formData.companyName || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
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
                value={formData.website || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Company address"
              value={formData.address || ''}
              onChange={handleInputChange}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                name="contactName"
                placeholder="Contact person name"
                value={formData.contactName || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="contact@example.com"
                value={formData.contactEmail || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                placeholder="+91 98765 43210"
                value={formData.contactPhone || ''}
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
                value={formData.value || ''}
                onChange={handleValueChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
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
              <Label htmlFor="score">Lead Score</Label>
              <Select
                value={formData.score?.toString()}
                onValueChange={handleScoreChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select score" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SCORE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lead Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag.id}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${tag.color} cursor-pointer`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag.name}
                  <X className="ml-1 h-3 w-3" />
                </span>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-0" align="start">
                  <div className="p-2 grid grid-cols-2 gap-1">
                    {DEFAULT_LEAD_TAGS.map((tag) => (
                      <div
                        key={tag.id}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer ${
                          selectedTags.some((t) => t.id === tag.id)
                            ? 'bg-muted'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        <span
                          className={`h-3 w-3 rounded-full ${tag.color}`}
                        ></span>
                        <span className="text-sm">{tag.name}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional information about this lead"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{lead ? 'Update Lead' : 'Create Lead'}</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default LeadForm;
