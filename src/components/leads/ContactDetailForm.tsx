
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactDetail } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContactDetailFormProps {
  contactDetails: ContactDetail[];
  onChange: (contactDetails: ContactDetail[]) => void;
}

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const ContactDetailForm: React.FC<ContactDetailFormProps> = ({ contactDetails, onChange }) => {
  const addContactDetail = () => {
    const newDetail: ContactDetail = {
      id: generateId(),
      type: 'email',
      value: '',
      label: 'Work',
      isPrimary: contactDetails.length === 0,
    };
    
    onChange([...contactDetails, newDetail]);
  };

  const updateContactDetail = (id: string, field: string, value: any) => {
    const updatedDetails = contactDetails.map(detail => 
      detail.id === id ? { ...detail, [field]: value } : detail
    );
    
    onChange(updatedDetails);
  };

  const removeContactDetail = (id: string) => {
    const updatedDetails = contactDetails.filter(detail => detail.id !== id);
    
    // If we removed the primary contact, make the first one primary
    if (contactDetails.find(d => d.id === id)?.isPrimary && updatedDetails.length > 0) {
      updatedDetails[0].isPrimary = true;
    }
    
    onChange(updatedDetails);
  };

  const setPrimaryContact = (id: string) => {
    const updatedDetails = contactDetails.map(detail => ({
      ...detail,
      isPrimary: detail.id === id
    }));
    
    onChange(updatedDetails);
  };

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return 'Mail';
      case 'phone':
        return 'Phone';
      case 'address':
        return 'MapPin';
      case 'website':
        return 'Globe';
      case 'social':
        return 'Share2';
      default:
        return 'Info';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Contact Details</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addContactDetail}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {contactDetails.length === 0 && (
        <div className="text-center p-4 border border-dashed rounded-md">
          <p className="text-muted-foreground">No contact details added yet</p>
          <Button
            type="button"
            variant="link"
            onClick={addContactDetail}
            className="mt-2"
          >
            Add your first contact detail
          </Button>
        </div>
      )}

      {contactDetails.map((detail, index) => (
        <div
          key={detail.id}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative"
        >
          {detail.isPrimary && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-primary/10">
              Primary
            </Badge>
          )}
          
          <div className="md:col-span-3">
            <Label>Contact Type</Label>
            <Select
              value={detail.type}
              onValueChange={(value) => updateContactDetail(detail.id, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="address">Address</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Label>Label</Label>
            <Select
              value={detail.label || ''}
              onValueChange={(value) => updateContactDetail(detail.id, 'label', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Main">Main</SelectItem>
                <SelectItem value="Secondary">Secondary</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {detail.type === 'social' && (
            <div className="md:col-span-3">
              <Label>Platform</Label>
              <Select
                value={detail.socialPlatform || 'other'}
                onValueChange={(value) => updateContactDetail(detail.id, 'socialPlatform', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className={`md:col-span-${detail.type === 'social' ? '6' : '9'}`}>
            <Label>Value</Label>
            <Input
              value={detail.value}
              onChange={(e) => updateContactDetail(detail.id, 'value', e.target.value)}
              placeholder={`Enter ${detail.type}`}
            />
          </div>

          <div className="md:col-span-3 flex items-end gap-2">
            {!detail.isPrimary && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setPrimaryContact(detail.id)}
              >
                Set as Primary
              </Button>
            )}
            
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeContactDetail(detail.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactDetailForm;
