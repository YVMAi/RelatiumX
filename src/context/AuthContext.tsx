
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers, currentUser as defaultUser } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (action: string, resource: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('relatiumx_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user', error);
        localStorage.removeItem('relatiumx_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For this mock version, we're using the mock data
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUser(foundUser);
      localStorage.setItem('relatiumx_user', JSON.stringify(foundUser));
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${foundUser.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('relatiumx_user');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // For regular users, we can implement more granular permissions
    // This is a simplified version
    const permissions: Record<string, string[]> = {
      user: [
        'read:leads',
        'create:leads',
        'update:own:leads',
        'delete:own:leads',
        'read:tasks',
        'create:tasks',
        'update:own:tasks',
        'delete:own:tasks',
      ]
    };
    
    const rolePermissions = permissions[user.role] || [];
    return rolePermissions.includes(`${action}:${resource}`) || 
           rolePermissions.includes(`${action}:own:${resource}`);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      hasPermission,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// For development purposes, we'll auto-login as admin
export const DevAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUser(foundUser);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${foundUser.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const permissions: Record<string, string[]> = {
      user: [
        'read:leads',
        'create:leads',
        'update:own:leads',
        'delete:own:leads',
        'read:tasks',
        'create:tasks',
        'update:own:tasks',
        'delete:own:tasks',
      ]
    };
    
    const rolePermissions = permissions[user.role] || [];
    return rolePermissions.includes(`${action}:${resource}`) || 
           rolePermissions.includes(`${action}:own:${resource}`);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      hasPermission,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
