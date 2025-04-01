
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { formatInrCrores } from "@/utils/format";
import { LeadsByIndustry, LeadsByOwner, LeadsByStage, LeadTrendData } from "@/services/dashboardService";

interface PipelineChartProps {
  data: LeadsByStage[];
}

export function PipelineChart({ data }: PipelineChartProps) {
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#4db7bf", "#7158e2", "#3ae374", "#ff3838"
  ];

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Pipeline by Stage</CardTitle>
        <CardDescription>Number of leads and value at each stage</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stageName" angle={-45} textAnchor="end" height={70} />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === "count") return [value, "Lead Count"];
                return [formatInrCrores(value as number), "Value (Cr)"];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="count" name="Lead Count" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="value" name="Value (Cr)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface IndustryChartProps {
  data: LeadsByIndustry[];
}

export function IndustryChart({ data }: IndustryChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Process data for the pie chart
  const preparedData = data.map(item => ({
    name: item.industry,
    value: item.count,
    actualValue: item.value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by Industry</CardTitle>
        <CardDescription>Distribution of leads across industries</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={preparedData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {preparedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => {
                if (name === "value") {
                  return [`${value} leads`, "Count"];
                }
                return [`₹${formatInrCrores(props.payload.actualValue)} Cr`, "Value"];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TeamPerformanceChartProps {
  data: LeadsByOwner[];
}

export function TeamPerformanceChart({ data }: TeamPerformanceChartProps) {
  // Sort data by count in descending order
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>Leads managed by team members</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="ownerName"
              width={70}
              tickFormatter={(value) => {
                return value.length > 10 ? value.substring(0, 10) + '...' : value;
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "count") return [value, "Leads"];
                return [formatInrCrores(value as number), "Value (Cr)"];
              }}
            />
            <Legend />
            <Bar dataKey="count" name="Leads" fill="#8884d8" />
            <Bar dataKey="value" name="Value (Cr)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TrendChartProps {
  data: LeadTrendData[];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Lead Trends</CardTitle>
        <CardDescription>Monthly trends of new, converted, and lost leads</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="newLeads" name="New Leads" stroke="#8884d8" />
            <Line type="monotone" dataKey="convertedLeads" name="Converted" stroke="#82ca9d" />
            <Line type="monotone" dataKey="lostLeads" name="Lost" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
