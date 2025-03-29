
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  LucideIcon, 
  ClipboardList, 
  BarChart4, 
  Settings, 
  HelpCircle, 
  Kanban,
  X
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

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
  
  const sidebarItems: SidebarItem[] = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { title: 'Lead Pipeline', icon: Kanban, href: '/pipeline' },
    { title: 'Leads Management', icon: ClipboardList, href: '/leads' },
    { title: 'Reports', icon: BarChart4, href: '/reports' },
    { title: 'User Management', icon: Users, href: '/users', requireAdmin: true },
    { title: 'Settings', icon: Settings, href: '/settings' },
    { title: 'Help & Support', icon: HelpCircle, href: '/support' },
  ];

  const filteredItems = sidebarItems.filter(item => !item.requireAdmin || isAdmin);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}
    
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground w-64 transition-transform duration-300 shadow-lg md:shadow-none md:translate-x-0 md:relative md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary/90 text-white rounded-md p-1.5">
                <span className="text-xl font-bold">Rx</span>
              </div>
              <span className="text-xl font-semibold">RelatiumX</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <X size={20} />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 py-4">
            <nav className="px-2 space-y-1">
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon size={18} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
          
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
                  <span className="text-xs font-medium">Rx</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">RelatiumX CRM</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
