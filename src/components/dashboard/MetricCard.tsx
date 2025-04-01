
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  change,
  trend,
  className,
}: MetricCardProps) {
  const trendIcon = trend === 'up' 
    ? <ArrowUpRight className="h-4 w-4 text-success" /> 
    : trend === 'down' 
      ? <ArrowDownRight className="h-4 w-4 text-destructive" /> 
      : null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || change !== undefined) && (
          <p className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
            {trendIcon}
            {change !== undefined && (
              <span className={trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : ''}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
            {description && (
              <span className="ml-1">{description}</span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
