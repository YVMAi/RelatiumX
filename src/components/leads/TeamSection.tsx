
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
import { User } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock users data
const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'admin', avatar: '/placeholder.svg' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', avatar: '/placeholder.svg' },
  { id: 'user-3', name: 'Robert Johnson', email: 'robert@example.com', role: 'user', avatar: '/placeholder.svg' },
  { id: 'user-4', name: 'Sarah Williams', email: 'sarah@example.com', role: 'user', avatar: '/placeholder.svg' },
  { id: 'user-5', name: 'Michael Brown', email: 'michael@example.com', role: 'user', avatar: '/placeholder.svg' },
];

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
  const [users, setUsers] = useState<User[]>([]);

  // In a real app, this would fetch users from an API
  useEffect(() => {
    setUsers(MOCK_USERS);
  }, []);

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
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lead owner" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
          <ScrollArea className="h-[200px] border rounded-md p-2">
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`member-${user.id}`}
                    checked={selectedMembers.includes(user.id)}
                    onCheckedChange={() => toggleTeamMember(user.id)}
                  />
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
