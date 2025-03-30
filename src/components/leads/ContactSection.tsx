
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ContactDetail } from '@/types/contact';
import { Plus, Trash2 } from 'lucide-react';

type ContactSectionProps = {
  contacts: ContactDetail[];
  setContacts: (contacts: ContactDetail[]) => void;
};

export const ContactSection = ({ contacts, setContacts }: ContactSectionProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const addEmptyContact = () => {
    const newContact: ContactDetail = {
      id: `contact-${Date.now()}`,
      type: 'email',
      value: '',
      label: '',
    };
    
    setContacts([...contacts, newContact]);
    setShowAddForm(true);
  };
  
  const updateContact = (index: number, field: string, value: string) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = { 
      ...updatedContacts[index],
      [field]: value 
    };
    setContacts(updatedContacts);
  };
  
  const removeContact = (index: number) => {
    const updatedContacts = [...contacts];
    updatedContacts.splice(index, 1);
    setContacts(updatedContacts);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contact Persons</CardTitle>
            <CardDescription>
              Add one or more contact persons for this lead
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addEmptyContact}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Contact
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No contacts added yet. Click "Add Contact" to add one.
          </div>
        ) : (
          contacts.map((contact, index) => (
            <div key={contact.id} className="border rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Contact #{index + 1}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeContact(index)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`contact-name-${index}`}>Name</Label>
                  <Input
                    id={`contact-name-${index}`}
                    value={contact.label || ''}
                    onChange={(e) => updateContact(index, 'label', e.target.value)}
                    placeholder="Contact name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`contact-designation-${index}`}>Designation</Label>
                  <Input
                    id={`contact-designation-${index}`}
                    value={contact.socialPlatform || ''}
                    onChange={(e) => updateContact(index, 'socialPlatform', e.target.value)}
                    placeholder="Job title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`contact-email-${index}`}>Email</Label>
                  <Input
                    id={`contact-email-${index}`}
                    type="email"
                    value={contact.value || ''}
                    onChange={(e) => updateContact(index, 'value', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`contact-phone-${index}`}>Phone</Label>
                  <Input
                    id={`contact-phone-${index}`}
                    value={contact.isPrimary ? `${contact.isPrimary}` : ''}
                    onChange={(e) => updateContact(index, 'isPrimary', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
