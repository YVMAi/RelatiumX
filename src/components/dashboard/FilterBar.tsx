
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Checkbox
} from "@/components/ui/checkbox";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import {
  BadgeCheck,
  BadgeX,
  CalendarIcon,
  Check,
  Filter,
  RefreshCw,
  User,
  Users,
  X
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format, subDays, subMonths } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { LeadFilter } from "@/services/dashboardService";

export type FilterOption = {
  value: string;
  label: string;
};

interface FilterBarProps {
  owners: FilterOption[];
  industries: FilterOption[];
  products: FilterOption[];
  stages: FilterOption[];
  onFilterChange: (filters: LeadFilter) => void;
}

export function FilterBar({
  owners,
  industries,
  products,
  stages,
  onFilterChange
}: FilterBarProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  const applyFilters = () => {
    onFilterChange({
      owners: selectedOwners,
      industries: selectedIndustries,
      products: selectedProducts,
      stages: selectedStages.map(s => Number(s)),
      dateRange: date ? {
        startDate: date.from?.toISOString(),
        endDate: date.to?.toISOString()
      } : undefined
    });
  };

  const resetFilters = () => {
    setDate({
      from: subMonths(new Date(), 1),
      to: new Date(),
    });
    setSelectedOwners([]);
    setSelectedIndustries([]);
    setSelectedProducts([]);
    setSelectedStages([]);
    
    onFilterChange({});
  };

  const quickDateRanges = [
    { label: 'Today', value: 'today', dates: { from: new Date(), to: new Date() } },
    { label: 'Yesterday', value: 'yesterday', dates: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) } },
    { label: 'Last 7 days', value: 'week', dates: { from: subDays(new Date(), 6), to: new Date() } },
    { label: 'Last 30 days', value: 'month', dates: { from: subDays(new Date(), 29), to: new Date() } },
    { label: 'Last 90 days', value: 'quarter', dates: { from: subDays(new Date(), 89), to: new Date() } },
    { label: 'Year to date', value: 'year', dates: { from: new Date(new Date().getFullYear(), 0, 1), to: new Date() } },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="grid grid-cols-2 gap-2">
              {quickDateRanges.map((range) => (
                <Button
                  key={range.value}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDate(range.dates);
                  }}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
            <Users className="mr-2 h-4 w-4" />
            <span className="truncate">
              {selectedOwners.length
                ? `${selectedOwners.length} owner${selectedOwners.length > 1 ? 's' : ''}`
                : 'Select owners'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search owners..." />
            <CommandList>
              <CommandEmpty>No owners found.</CommandEmpty>
              <CommandGroup>
                {owners.map((owner) => (
                  <CommandItem
                    key={owner.value}
                    onSelect={() => {
                      setSelectedOwners((prev) => {
                        if (prev.includes(owner.value)) {
                          return prev.filter((item) => item !== owner.value);
                        } else {
                          return [...prev, owner.value];
                        }
                      });
                    }}
                  >
                    <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                      selectedOwners.includes(owner.value) ? 'bg-primary border-primary' : 'border-primary'
                    }`}>
                      {selectedOwners.includes(owner.value) && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span>{owner.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => setSelectedOwners([])}
                  className="justify-center text-center"
                >
                  Clear selection
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
            <Filter className="mr-2 h-4 w-4" />
            <span className="truncate">More filters</span>
            {(selectedIndustries.length > 0 || selectedProducts.length > 0 || selectedStages.length > 0) && (
              <Badge variant="secondary" className="ml-2 rounded-sm">
                {selectedIndustries.length + selectedProducts.length + selectedStages.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Industries</h4>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {industries.map(industry => (
                  <div key={industry.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`industry-${industry.value}`} 
                      checked={selectedIndustries.includes(industry.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIndustries([...selectedIndustries, industry.value]);
                        } else {
                          setSelectedIndustries(selectedIndustries.filter(i => i !== industry.value));
                        }
                      }}
                    />
                    <label
                      htmlFor={`industry-${industry.value}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {industry.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Products & Services</h4>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {products.map(product => (
                  <div key={product.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`product-${product.value}`} 
                      checked={selectedProducts.includes(product.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts([...selectedProducts, product.value]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(p => p !== product.value));
                        }
                      }}
                    />
                    <label
                      htmlFor={`product-${product.value}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {product.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Stages</h4>
              <div className="grid grid-cols-2 gap-2">
                {stages.map(stage => (
                  <div key={stage.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`stage-${stage.value}`} 
                      checked={selectedStages.includes(stage.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStages([...selectedStages, stage.value]);
                        } else {
                          setSelectedStages(selectedStages.filter(s => s !== stage.value));
                        }
                      }}
                    />
                    <label
                      htmlFor={`stage-${stage.value}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {stage.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex gap-2 ml-auto">
        <Button variant="outline" size="icon" onClick={resetFilters} title="Reset filters">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
}
