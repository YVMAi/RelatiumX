
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { SearchResult } from '@/types';
import { globalSearch } from '@/services/leadsService';
import { Search, Building, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult>({ leads: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults({ leads: [], users: [] });
      return;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await globalSearch(searchTerm);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  const handleLeadClick = (id: number) => {
    setOpen(false);
    navigate(`/leads/${id}`);
  };
  
  const handleUserClick = (id: string) => {
    setOpen(false);
    // Navigate to user profile if implemented
    console.log('Navigate to user profile:', id);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    setResults({ leads: [], users: [] });
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full md:w-64 justify-start text-muted-foreground flex"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4 mr-2" />
          <span>Search everything...</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-screen max-w-lg" 
        align="start" 
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
            <CommandInput 
              placeholder="Search leads, contacts, users..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex-1 border-0 outline-none focus:ring-0"
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClear}
                className="h-6 w-6 shrink-0 rounded-md"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <CommandList className="max-h-[60vh] overflow-auto">
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            
            {!isLoading && searchTerm.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}
            
            {!isLoading && searchTerm.length >= 2 && (
              <>
                <CommandEmpty>
                  No results found for "{searchTerm}"
                </CommandEmpty>
                
                {results.leads.length > 0 && (
                  <CommandGroup heading="Leads">
                    {results.leads.map((lead) => (
                      <CommandItem
                        key={`lead-${lead.id}`}
                        onSelect={() => handleLeadClick(lead.id)}
                        className="cursor-pointer"
                      >
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">{lead.client_company}</span>
                          <span className="text-xs text-muted-foreground flex gap-2">
                            <span>{lead.contact_name || 'No contact'}</span>
                            <span>•</span>
                            <span>{formatDate(lead.created_at)}</span>
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {results.users.length > 0 && (
                  <CommandGroup heading="Users">
                    {results.users.map((user) => (
                      <CommandItem
                        key={`user-${user.id}`}
                        onSelect={() => handleUserClick(user.id)}
                        className="cursor-pointer"
                      >
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
