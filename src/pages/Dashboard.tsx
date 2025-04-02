import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DatePicker } from "@/components/date-picker"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  fetchDashboardData,
  fetchLeads,
  fetchLeadStages,
  createLead as createLeadService
} from "@/services/dashboardService";
import { Lead, LeadStage } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

// Define the schema for the form
const formSchema = z.object({
  client_company: z.string().min(2, {
    message: "Client Company must be at least 2 characters.",
  }),
  contact_name: z.string().min(2, {
    message: "Contact Name must be at least 2 characters.",
  }),
  contact_email: z.string().email({
    message: "Invalid email address.",
  }),
  stage_id: z.string().min(1, {
    message: "Please select a lead stage.",
  }),
  estimated_value: z.string().refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }, {
    message: "Estimated Value must be a positive number.",
  }),
  next_activity: z.date(),
})

const Dashboard: React.FC = () => {
  const [leadsByStage, setLeadsByStage] = useState<{ name: string; value: number; }[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<{ id: string; name: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // React Hook Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_company: "",
      contact_name: "",
      contact_email: "",
      stage_id: "",
      estimated_value: "",
      next_activity: new Date(),
    },
  })

  // Function to handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Convert estimated_value to a number
      const estimatedValue = parseFloat(values.estimated_value);
      
      // Create a new lead object
      const newLead = {
        ...values,
        estimated_value: estimatedValue,
        next_activity: values.next_activity.toISOString(), // Format date as string
      };
      
      // Call the createLead service
      await createLeadService(newLead);
      
      // Show a success toast
      toast({
        title: "Success",
        description: "Lead created successfully.",
      });
      
      // Reset the form
      form.reset();
      
      // Refresh the data
      fetchData();
    } catch (error) {
      console.error("Error creating lead:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create lead. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update the stages mapping in fetchData function or wherever it's used
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch data from the API
      const { leadsByStage, totalValue, recentLeads, stageData } = await fetchDashboardData();
      
      // Format the stage data for the filter
      const formattedStages = stageData.map(stage => ({
        id: stage.id.toString(), // Convert to string
        name: stage.stage_name  // Use name instead of stage_name for the filter component
      }));
      
      // Set the state
      setLeadsByStage(leadsByStage);
      setTotalValue(totalValue);
      setRecentLeads(recentLeads);
      setStages(formattedStages);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = recentLeads.filter((lead) =>
    lead.client_company.toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center">Loading dashboard data...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Filter leads..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-md"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>
                  Create a new lead by entering the required details below.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="client_company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stage_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stages.map((stage) => (
                              <SelectItem key={stage.id} value={stage.id}>
                                {stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimated_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Value</FormLabel>
                        <FormControl>
                          <Input placeholder="1000" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="next_activity"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-3">
                        <FormLabel>Next Activity</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Create Lead</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Leads by Stage</CardTitle>
            <CardDescription>Distribution of leads across different stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={leadsByStage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Estimated Value</CardTitle>
            <CardDescription>Total value of all leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Key metrics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              <li>Average lead value: ${totalValue > 0 && leadsByStage.length > 0 ? (totalValue / leadsByStage.length).toLocaleString() : '0'}</li>
              <li>Total leads: {recentLeads.length}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Recently added leads</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Client Company</TableHead>
                <TableHead>Contact Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Estimated Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)} className="cursor-pointer hover:bg-secondary">
                  <TableCell className="font-medium">{lead.client_company}</TableCell>
                  <TableCell>{lead.contact_name}</TableCell>
                  <TableCell>{lead.contact_email}</TableCell>
                  <TableCell>{lead.lead_stages?.stage_name}</TableCell>
                  <TableCell className="text-right">${lead.estimated_value?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
