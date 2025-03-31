
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchUsers } from '@/services/leadsService';
import { useToast } from '@/hooks/use-toast';

type TeamSectionProps = {
  selectedOwner?: string;
  selectedMembers: string[];
  onOwnerChange: (ownerId: string) => void;
  onMembersChange: (memberIds: string[]) => void;
};

export const TeamSection = ({
  selectedOwner,
  selectedMembers,
  onOwnerChange,
  onMembersChange,
}: TeamSectionProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const userData = await fetchUsers();
        console.log('Fetched users:', userData);
        setUsers(userData);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error loading users",
          description: "Please try again or contact support if the issue persists.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, [toast]);

  const toggleTeamMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      onMembersChange(selectedMembers.filter(id => id !== userId));
    } else {
      onMembersChange([...selectedMembers, userId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Team</CardTitle>
        <CardDescription>
          Assign an owner and team members for this lead
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="owner">Lead Owner</Label>
          <Select
            value={selectedOwner}
            onValueChange={onOwnerChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : "Select lead owner"} />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{user.name ? user.name.charAt(0) : '?'}</AvatarFallback>
                    </Avatar>
                    {user.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Team Members</Label>
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px] border rounded-md p-2">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {users.length > 0 ? (
                  users.map(user => (
                    <div key={user.id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`member-${user.id}`}
                        checked={selectedMembers.includes(user.id)}
                        onCheckedChange={() => toggleTeamMember(user.id)}
                      />
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{user.name ? user.name.charAt(0) : '?'}</AvatarFallback>
                        </Avatar>
                        <Label
                          htmlFor={`member-${user.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {user.name}
                          <span className="text-xs text-muted-foreground block">
                            {user.email}
                          </span>
                        </Label>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
