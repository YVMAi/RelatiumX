
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  LucideIcon, 
  ClipboardList, 
  Settings, 
  Kanban,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItem {
  title: string;
  icon: LucideIcon;
  href: string;
  requireAdmin?: boolean;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  
  const sidebarItems: SidebarItem[] = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { title: 'Lead Pipeline', icon: Kanban, href: '/pipeline' },
    { title: 'Leads Management', icon: ClipboardList, href: '/leads' },
    { title: 'User Management', icon: Users, href: '/users', requireAdmin: true },
    { title: 'Settings', icon: Settings, href: '/settings' },
  ];

  const filteredItems = sidebarItems.filter(item => !item.requireAdmin || isAdmin);

  return (
    <ShadcnSidebar>
      <SidebarHeader className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary/90 text-white rounded-md p-1.5">
            <span className="text-xl font-bold">Rx</span>
          </div>
          <span className={cn("text-xl font-semibold transition-opacity", 
            state === "collapsed" ? "opacity-0" : "opacity-100")}>
            RelatiumX
          </span>
        </Link>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
        >
          {state === "collapsed" ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link to={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
              <span className="text-xs font-medium">Rx</span>
            </div>
          </div>
          <div className={cn("flex-1 min-w-0 transition-opacity", 
            state === "collapsed" ? "opacity-0" : "opacity-100")}>
            <p className="text-sm font-medium truncate">RelatiumX CRM</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">v1.0.0</p>
          </div>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
