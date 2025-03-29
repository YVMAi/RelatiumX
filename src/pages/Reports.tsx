
import { useState } from 'react';
import { 
  DownloadIcon, 
  FilterIcon, 
  RefreshCwIcon, 
  SearchIcon, 
  SlidersHorizontal 
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockTransactions } from '@/data/mockData';

// Sample report data
const reportData = mockTransactions.map((transaction) => ({
  id: transaction.id,
  client: transaction.client,
  amount: transaction.amount,
  date: transaction.date,
  salesperson: transaction.salesperson,
  status: transaction.status,
  type: Math.random() > 0.5 ? 'Product' : 'Service'
}));

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'client' | 'amount' | 'date' | 'salesperson' | 'status' | 'type';

const Reports = () => {
  const [data, setData] = useState(reportData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedReportType, setSelectedReportType] = useState('sales');
  const [groupBy, setGroupBy] = useState<string | null>(null);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter data based on search term
  const filteredData = data.filter(item => 
    item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.salesperson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    
    if (sortField === 'amount') {
      return sortDirection === 'asc' 
        ? a[sortField] - b[sortField] 
        : b[sortField] - a[sortField];
    }
    
    return sortDirection === 'asc' 
      ? a[sortField].localeCompare(b[sortField]) 
      : b[sortField].localeCompare(a[sortField]);
  });

  // Group data if groupBy is set
  const groupedData = () => {
    if (!groupBy) return { ungrouped: sortedData };
    
    return sortedData.reduce((acc, item) => {
      const groupValue = item[groupBy as keyof typeof item];
      if (!acc[groupValue]) {
        acc[groupValue] = [];
      }
      acc[groupValue].push(item);
      return acc;
    }, {} as Record<string, typeof sortedData>);
  };

  // Download as Excel
  const downloadExcel = () => {
    // In a real implementation, this would convert data to Excel format
    // For demo purposes, we're just showing an alert
    alert('Downloading report as Excel...');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and analyze business reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={downloadExcel}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" value={selectedReportType} onValueChange={setSelectedReportType}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="leads">Lead Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>
                View and analyze your sales data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters and controls */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search reports..."
                      className="pl-8 w-full max-w-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={groupBy || ''} onValueChange={(value) => setGroupBy(value || null)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="">No grouping</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="salesperson">Salesperson</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />
              
              {/* Excel-like table interface */}
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('client')}
                      >
                        Client
                        {sortField === 'client' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('amount')}
                      >
                        Amount (₹)
                        {sortField === 'amount' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        Date
                        {sortField === 'date' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('salesperson')}
                      >
                        Salesperson
                        {sortField === 'salesperson' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortField === 'status' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('type')}
                      >
                        Type
                        {sortField === 'type' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  {!groupBy ? (
                    <TableBody>
                      {sortedData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.client}</TableCell>
                          <TableCell>₹{row.amount.toLocaleString('en-IN')} Cr</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.salesperson}</TableCell>
                          <TableCell>
                            <Badge variant={row.status === 'Complete' ? 'success' : 'default'}>
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.type}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  ) : (
                    Object.entries(groupedData()).map(([group, items]) => (
                      <TableBody key={group} className="border-t-2 border-muted">
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={6} className="font-semibold">
                            {group} ({items.length} items)
                          </TableCell>
                        </TableRow>
                        {items.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.client}</TableCell>
                            <TableCell>₹{row.amount.toLocaleString('en-IN')} Cr</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.salesperson}</TableCell>
                            <TableCell>
                              <Badge variant={row.status === 'Complete' ? 'success' : 'default'}>
                                {row.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{row.type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    ))
                  )}
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leads" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Reports</CardTitle>
              <CardDescription>
                Analyze lead conversion and pipeline metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center border-2 border-dashed rounded-md">
              <p className="text-muted-foreground">Lead reports will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reports</CardTitle>
              <CardDescription>
                Analyze team and individual performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center border-2 border-dashed rounded-md">
              <p className="text-muted-foreground">Performance reports will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
