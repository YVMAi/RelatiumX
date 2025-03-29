
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { 
  Menu, 
  Bell, 
  Search,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/format';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navbar = ({ sidebarOpen, setSidebarOpen }: NavbarProps) => {
  const { user, logout, isAdmin } = useAuth();
  const [searchVisible, setSearchVisible] = useState(false);
  
  return (
    <header className="bg-background border-b h-16 shadow-sm flex items-center px-4 sticky top-0 z-30">
      <div className="flex items-center flex-1 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden"
        >
          <Menu />
        </Button>
        
        <div className={`relative ${searchVisible ? 'flex-1' : 'hidden md:block md:w-64'}`}>
          {searchVisible ? (
            <div className="relative w-full animation-fade-in">
              <Input
                type="search"
                placeholder="Search leads, contacts, tasks..."
                className="w-full pl-10"
                autoFocus
                onBlur={() => setSearchVisible(false)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <div className="relative hidden md:block w-full">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchVisible(true)}
          className={`md:hidden ${searchVisible ? 'hidden' : 'block'}`}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name || ""} />
                <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem>
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
