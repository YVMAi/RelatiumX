
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AppLayout = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Update sidebar state when mobile status changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar isCollapsed={sidebarCollapsed} isOpen={sidebarOpen} />
        
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          {/* Toggle sidebar button */}
          <button 
            onClick={toggleSidebar}
            className="absolute top-16 -left-0 z-30 p-1.5 bg-sidebar rounded-r-md text-sidebar-foreground shadow-md hover:bg-sidebar-accent transition-all"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed || !sidebarOpen ? 
              <ChevronRight size={18} /> : 
              <ChevronLeft size={18} />
            }
          </button>
          
          <main className="flex-1 overflow-y-auto p-3 md:p-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
