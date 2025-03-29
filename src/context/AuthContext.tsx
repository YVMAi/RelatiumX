import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { Profile } from '@/types/supabase';
import { profileService } from '@/services/api';

// Define the context type
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: AuthError | null, user: User | null }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<{ error: Error | null }>;
  hasPermission: (action: string, resource: string) => boolean;
  ensureDemoAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Check if user is admin
  const isAdmin = profile?.role_id === 1; // Assuming role_id 1 is admin

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // When auth state changes, fetch profile if user exists
        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    return { error, user: data?.user ?? null };
  };

  // Create demo account if it doesn't exist
  const ensureDemoAccount = async () => {
    // First check if the demo account exists by trying to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email: 'admin@relatiumx.com',
      password: 'password123',
    });

    // If login failed (account doesn't exist), create it
    if (error) {
      console.log('Demo account not found, creating it...');
      const { error: signupError, user } = await signup('admin@relatiumx.com', 'password123', 'Demo Admin');
      
      if (signupError) {
        console.error('Failed to create demo account:', signupError);
        return;
      }
      
      if (user) {
        // Set the user as an admin (role_id = 1)
        try {
          // Wait for the profile to be created by the Supabase function
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role_id: 1 })
            .eq('id', user.id);
          
          if (updateError) {
            console.error('Failed to set admin role:', updateError);
          } else {
            console.log('Demo admin account created successfully');
          }
        } catch (err) {
          console.error('Error setting admin role:', err);
        }
      }
    } else {
      console.log('Demo account already exists');
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Update profile
  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    try {
      const { error } = await profileService.updateProfile({
        ...profileData,
        id: user.id,
      });
      
      if (error) throw error;
      
      // Update local profile state
      if (profile) {
        setProfile({ ...profile, ...profileData });
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  };

  // Check user permissions
  const hasPermission = (action: string, resource: string): boolean => {
    // If not authenticated, no permissions
    if (!isAuthenticated || !profile) return false;
    
    // Admin has all permissions
    if (isAdmin) return true;
    
    // For regular users, implement basic permission checks
    // This is a simple implementation - you might want to expand this based on your needs
    
    // Users can always view things
    if (action === 'view') return true;
    
    // Users can create new items
    if (action === 'create') return true;
    
    // Users can update/delete their own items
    if ((action === 'update:own' || action === 'delete:own') && resource) {
      return true;
    }
    
    // Default deny
    return false;
  };

  const value = {
    user,
    profile,
    session,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    hasPermission,
    ensureDemoAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple dev auth provider for development/testing
export const DevAuthProvider = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
