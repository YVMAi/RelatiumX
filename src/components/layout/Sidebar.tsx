
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
  LogOut,
  MessageCircle,
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
  useSidebar,
} from '@/components/ui/sidebar';

interface SidebarItem {
  title: string;
  icon: LucideIcon;
  href: string;
  requireAdmin?: boolean;
  badge?: number;
  category?: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  isOpen: boolean;
}

export const Sidebar = ({ isCollapsed, isOpen }: SidebarProps) => {
  const location = useLocation();
  const { isAdmin, logout } = useAuth();
  const { state } = useSidebar();
  
  const sidebarItems: SidebarItem[] = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/', category: 'OVERVIEW' },
    { title: 'Lead Pipeline', icon: Kanban, href: '/pipeline', category: 'OVERVIEW' },
    { title: 'Leads Management', icon: ClipboardList, href: '/leads', category: 'OVERVIEW', badge: 3 },
    { title: 'User Management', icon: Users, href: '/users', requireAdmin: true, category: 'OVERVIEW' },
    { title: 'Chat', icon: MessageCircle, href: '/chat', category: 'ACCOUNT' },
    { title: 'Settings', icon: Settings, href: '/settings', category: 'ACCOUNT' },
  ];

  const filteredItems = sidebarItems.filter(item => !item.requireAdmin || isAdmin);
  
  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  // If sidebar is not open on mobile, don't render
  if (!isOpen && window.innerWidth <= 768) {
    return null;
  }

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  
  return (
    <div className={cn(
      "h-screen bg-sidebar text-sidebar-foreground flex-shrink-0 transition-all duration-300 z-20",
      sidebarWidth,
      !isOpen && window.innerWidth <= 768 && "hidden"
    )}>
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header with logo */}
        <div className="flex items-center justify-center h-16 border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/90 text-white rounded-md p-1.5 flex items-center justify-center">
              <span className="text-xl font-bold">Rx</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-semibold">RelatiumX</span>
            )}
          </Link>
        </div>
        
        {/* Sidebar content with categories */}
        <div className="flex-1 py-4 overflow-y-auto">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              {!isCollapsed && (
                <div className="px-4 mb-2">
                  <span className="text-xs font-medium text-sidebar-category tracking-wider">
                    {category}
                  </span>
                </div>
              )}
              
              <ul className="space-y-1">
                {items.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href));
                  
                  return (
                    <li key={item.title} className="px-2">
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 px-2 py-2 rounded-md transition-colors relative group",
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                            : "hover:bg-sidebar-accent/50 text-sidebar-foreground/90"
                        )}
                      >
                        <item.icon size={20} className="flex-shrink-0" />
                        
                        {!isCollapsed && (
                          <>
                            <span className="truncate">{item.title}</span>
                            
                            {/* Badge if present */}
                            {item.badge && (
                              <span className="absolute right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {item.badge}
                              </span>
                            )}
                            
                            {/* Chevron for active item */}
                            {isActive && (
                              <ChevronRight size={16} className="absolute right-2" />
                            )}
                          </>
                        )}
                        
                        {/* Show badge on collapsed view */}
                        {isCollapsed && item.badge && (
                          <span className="absolute -right-1 -top-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent/50 text-sidebar-foreground/90 transition-colors"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
