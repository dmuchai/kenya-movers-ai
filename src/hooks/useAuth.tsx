import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'customer' | 'mover' | 'admin' | 'super_admin';

// Manual profile type definition (profiles table not in generated types)
interface ProfileRow {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              email: null,
              full_name: null,
              phone: null,
              role: 'customer'
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Failed to create profile:', createError);
            setProfile(null);
          } else {
            setProfile(newProfile as ProfileRow);
          }
        } else {
          throw error;
        }
      } else {
        setProfile(data as ProfileRow);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Failsafe: Force loading to false after 5 seconds
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth loading timeout - forcing to false');
        setLoading(false);
      }
    }, 5000);

    // Check for existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Auth session check:', session ? 'Authenticated' : 'Not authenticated');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
      clearTimeout(timeoutId);
    }).catch((error) => {
      console.error('Session check error:', error);
      if (mounted) {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session ? 'Authenticated' : 'Not authenticated');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      console.log('Sign out successful');
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
      // Force clear local state even if API call fails
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      throw error;
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, signOut, refreshProfile }}>
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