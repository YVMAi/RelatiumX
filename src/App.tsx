
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DevAuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Leads from "./pages/Leads";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";

// Create a new QueryClient instance outside the component
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DevAuthProvider>
        <TooltipProvider>
          <SidebarProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="pipeline" element={<Pipeline />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SidebarProvider>
        </TooltipProvider>
      </DevAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
