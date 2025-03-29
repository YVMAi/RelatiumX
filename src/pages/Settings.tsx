
import { useState } from 'react';
import { 
  PlusIcon, 
  SaveIcon, 
  Edit2Icon, 
  Trash2Icon, 
  AlertCircleIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Sample lead stages
const initialLeadStages = [
  { id: '1', name: 'New Lead', color: '#6366F1', isDefault: true, order: 1 },
  { id: '2', name: 'Contacted', color: '#8B5CF6', isDefault: false, order: 2 },
  { id: '3', name: 'Demo Given', color: '#EC4899', isDefault: false, order: 3 },
  { id: '4', name: 'Proposal Sent', color: '#F59E0B', isDefault: false, order: 4 },
  { id: '5', name: 'Negotiation', color: '#10B981', isDefault: false, order: 5 },
  { id: '6', name: 'Closed (Won)', color: '#22C55E', isDefault: false, order: 6 },
  { id: '7', name: 'Closed (Loss)', color: '#EF4444', isDefault: false, order: 7 },
];

// Sample custom fields
const initialCustomFields = [
  { 
    id: '1', 
    name: 'Industry', 
    type: 'dropdown', 
    options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail'], 
    required: true,
    entity: 'lead'
  },
  { 
    id: '2', 
    name: 'Budget', 
    type: 'number', 
    options: [], 
    required: false,
    entity: 'lead'
  },
  { 
    id: '3', 
    name: 'Priority', 
    type: 'dropdown', 
    options: ['Low', 'Medium', 'High'], 
    required: true,
    entity: 'lead'
  },
  { 
    id: '4', 
    name: 'Source', 
    type: 'dropdown', 
    options: ['Website', 'Referral', 'Conference', 'Cold Call', 'Inbound'], 
    required: false,
    entity: 'lead'
  },
];

const Settings = () => {
  const [leadStages, setLeadStages] = useState(initialLeadStages);
  const [customFields, setCustomFields] = useState(initialCustomFields);
  const [editingStage, setEditingStage] = useState<typeof initialLeadStages[0] | null>(null);
  const [editingField, setEditingField] = useState<typeof initialCustomFields[0] | null>(null);
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'stage' | 'field' } | null>(null);
  
  // Company settings
  const [companySettings, setCompanySettings] = useState({
    name: 'RelatiumX Technologies',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Kolkata',
    logo: null,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
  });

  // Handle adding a new lead stage
  const handleAddStage = (stage: Omit<typeof initialLeadStages[0], 'id' | 'order'>) => {
    const newStage = {
      ...stage,
      id: String(leadStages.length + 1),
      order: leadStages.length + 1,
    };
    setLeadStages([...leadStages, newStage]);
    setIsAddStageDialogOpen(false);
    toast.success('Lead stage added successfully');
  };

  // Handle editing a lead stage
  const handleEditStage = (stage: typeof initialLeadStages[0]) => {
    setLeadStages(leadStages.map(s => s.id === stage.id ? stage : s));
    setEditingStage(null);
    toast.success('Lead stage updated successfully');
  };

  // Handle adding a new custom field
  const handleAddField = (field: Omit<typeof initialCustomFields[0], 'id'>) => {
    const newField = {
      ...field,
      id: String(customFields.length + 1),
    };
    setCustomFields([...customFields, newField]);
    setIsAddFieldDialogOpen(false);
    toast.success('Custom field added successfully');
  };

  // Handle editing a custom field
  const handleEditField = (field: typeof initialCustomFields[0]) => {
    setCustomFields(customFields.map(f => f.id === field.id ? field : f));
    setEditingField(null);
    toast.success('Custom field updated successfully');
  };

  // Handle deleting an item
  const handleDeleteItem = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'stage') {
        setLeadStages(leadStages.filter(stage => stage.id !== itemToDelete.id));
        toast.success('Lead stage deleted successfully');
      } else {
        setCustomFields(customFields.filter(field => field.id !== itemToDelete.id));
        toast.success('Custom field deleted successfully');
      }
      setItemToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Save company settings
  const saveCompanySettings = () => {
    toast.success('Company settings saved successfully');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="lead-stages">Lead Stages</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        {/* Company Settings Tab */}
        <TabsContent value="company" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Manage your company details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    value={companySettings.name} 
                    onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select 
                    id="currency" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={companySettings.currency}
                    onChange={(e) => setCompanySettings({...companySettings, currency: e.target.value})}
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <select 
                    id="date-format" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={companySettings.dateFormat}
                    onChange={(e) => setCompanySettings({...companySettings, dateFormat: e.target.value})}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <select 
                    id="timezone" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={companySettings.timeZone}
                    onChange={(e) => setCompanySettings({...companySettings, timeZone: e.target.value})}
                  >
                    <option value="Asia/Kolkata">India (GMT+5:30)</option>
                    <option value="America/New_York">Eastern Time (GMT-5)</option>
                    <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                  </select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important events
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={companySettings.enableEmailNotifications}
                      onCheckedChange={(checked) => setCompanySettings({
                        ...companySettings, 
                        enableEmailNotifications: checked
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive SMS notifications for important events
                      </p>
                    </div>
                    <Switch 
                      id="sms-notifications" 
                      checked={companySettings.enableSmsNotifications}
                      onCheckedChange={(checked) => setCompanySettings({
                        ...companySettings, 
                        enableSmsNotifications: checked
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveCompanySettings}>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Lead Stages Tab */}
        <TabsContent value="lead-stages" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle>Lead Stages</CardTitle>
                <CardDescription>
                  Configure the stages in your lead pipeline
                </CardDescription>
              </div>
              <Button onClick={() => setIsAddStageDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Stage
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Stage Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadStages.map((stage) => (
                      <TableRow key={stage.id}>
                        <TableCell className="font-medium">{stage.order}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-4 w-4 rounded-full" 
                              style={{ backgroundColor: stage.color }} 
                            />
                            {stage.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" style={{ 
                            backgroundColor: `${stage.color}30`,
                            color: stage.color,
                            borderColor: stage.color 
                          }}>
                            {stage.color}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {stage.isDefault && (
                            <Badge variant="default">Default</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingStage(stage)}
                            >
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setItemToDelete({ id: stage.id, type: 'stage' });
                                setIsDeleteDialogOpen(true);
                              }}
                              disabled={stage.isDefault}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-2 text-amber-800">
                  <AlertCircleIcon className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium">Important note</h4>
                    <p className="text-sm mt-1">
                      Changes to lead stages will affect all existing leads in the system. The default stage cannot be deleted.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Custom Fields Tab */}
        <TabsContent value="custom-fields" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>
                  Configure custom fields for different entities
                </CardDescription>
              </div>
              <Button onClick={() => setIsAddFieldDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <Accordion type="single" collapsible defaultValue="leads">
                <AccordionItem value="leads">
                  <AccordionTrigger>Lead Custom Fields</AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-md border overflow-hidden mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Field Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Required</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customFields
                            .filter(field => field.entity === 'lead')
                            .map((field) => (
                              <TableRow key={field.id}>
                                <TableCell className="font-medium">{field.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {field.required ? (
                                    <Badge variant="default">Required</Badge>
                                  ) : (
                                    <Badge variant="outline">Optional</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => setEditingField(field)}
                                    >
                                      <Edit2Icon className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {
                                        setItemToDelete({ id: field.id, type: 'field' });
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="contacts">
                  <AccordionTrigger>Contact Custom Fields</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-md">
                      <p className="text-sm text-muted-foreground">
                        No custom fields defined for contacts
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="companies">
                  <AccordionTrigger>Company Custom Fields</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-md">
                      <p className="text-sm text-muted-foreground">
                        No custom fields defined for companies
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect with other services and applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center p-4 border rounded-lg">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 4L3 9.31372L10.5 13.5M20 4L14.5 21L10.5 13.5M20 4L10.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">Gmail</h3>
                    <p className="text-sm text-muted-foreground">Connect your Gmail account for email sync</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                
                <div className="flex items-center p-4 border rounded-lg">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 bg-green-100 rounded-md flex items-center justify-center">
                      <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">Calendar</h3>
                    <p className="text-sm text-muted-foreground">Sync with Google Calendar</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                
                <div className="flex items-center p-4 border rounded-lg">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-md flex items-center justify-center">
                      <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">File Storage</h3>
                    <p className="text-sm text-muted-foreground">Connect to Google Drive or Dropbox</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                
                <div className="flex items-center p-4 border rounded-lg">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 bg-yellow-100 rounded-md flex items-center justify-center">
                      <svg className="h-6 w-6 text-yellow-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 9.5V14.5L9 18.5L16 14.5L9 10.5L16 6.5L9 2.5L2 6.5L9 10.5V18.5M16 6.5V14.5L22 10.5V2.5L16 6.5Z" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">Payment Gateway</h3>
                    <p className="text-sm text-muted-foreground">Connect to Stripe or PayPal</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Stage Dialog */}
      <Dialog open={isAddStageDialogOpen} onOpenChange={setIsAddStageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lead Stage</DialogTitle>
            <DialogDescription>
              Create a new stage for your lead pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input id="stage-name" placeholder="Enter stage name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stage-color">Color</Label>
              <Input id="stage-color" type="color" className="h-10 p-1" defaultValue="#6366F1" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="stage-default" />
              <Label htmlFor="stage-default">Set as default stage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const newStage = {
                name: 'New Stage',
                color: '#6366F1',
                isDefault: false,
              };
              handleAddStage(newStage);
            }}>
              Add Stage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={!!editingStage} onOpenChange={(open) => !open && setEditingStage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Lead Stage</DialogTitle>
            <DialogDescription>
              Update details for this lead stage
            </DialogDescription>
          </DialogHeader>
          {editingStage && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-stage-name">Stage Name</Label>
                <Input 
                  id="edit-stage-name" 
                  placeholder="Enter stage name" 
                  defaultValue={editingStage.name} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stage-color">Color</Label>
                <Input 
                  id="edit-stage-color" 
                  type="color" 
                  className="h-10 p-1" 
                  defaultValue={editingStage.color} 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-stage-default" 
                  defaultChecked={editingStage.isDefault}
                  disabled={editingStage.isDefault}
                />
                <Label htmlFor="edit-stage-default">
                  Set as default stage
                  {editingStage.isDefault && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (cannot be changed)
                    </span>
                  )}
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStage(null)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingStage) {
                const updatedStage = {
                  ...editingStage,
                  name: 'Updated Stage',
                  color: '#8B5CF6',
                };
                handleEditStage(updatedStage);
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Field Dialog */}
      <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
            <DialogDescription>
              Create a new custom field for data capture
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="field-name">Field Name</Label>
              <Input id="field-name" placeholder="Enter field name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="field-type">Field Type</Label>
              <select 
                id="field-type" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="field-entity">Apply to Entity</Label>
              <select 
                id="field-entity" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="lead">Lead</option>
                <option value="contact">Contact</option>
                <option value="company">Company</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="field-required" />
              <Label htmlFor="field-required">Required field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFieldDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const newField = {
                name: 'New Field',
                type: 'text',
                options: [],
                required: false,
                entity: 'lead',
              };
              handleAddField(newField);
            }}>
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Field Dialog */}
      <Dialog open={!!editingField} onOpenChange={(open) => !open && setEditingField(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Custom Field</DialogTitle>
            <DialogDescription>
              Update details for this custom field
            </DialogDescription>
          </DialogHeader>
          {editingField && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-field-name">Field Name</Label>
                <Input 
                  id="edit-field-name" 
                  placeholder="Enter field name" 
                  defaultValue={editingField.name} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-field-type">Field Type</Label>
                <select 
                  id="edit-field-type" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={editingField.type}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-field-entity">Apply to Entity</Label>
                <select 
                  id="edit-field-entity" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={editingField.entity}
                >
                  <option value="lead">Lead</option>
                  <option value="contact">Contact</option>
                  <option value="company">Company</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-field-required" 
                  defaultChecked={editingField.required}
                />
                <Label htmlFor="edit-field-required">Required field</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingField(null)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingField) {
                const updatedField = {
                  ...editingField,
                  name: 'Updated Field',
                  required: true,
                };
                handleEditField(updatedField);
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type === 'stage' ? 'lead stage' : 'custom field'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
