import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'customer' | 'mover' | 'admin' | 'super_admin';

// Manual profile type definition (profiles table not in generated types)
interface ProfileRow {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
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

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 8000): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout. Please try again.'));
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  };

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  const clearSupabaseStoredSession = () => {
    try {
      const keysToRemove: string[] = [];

      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key) continue;

        const isSupabaseAuthKey =
          key.startsWith('sb-') &&
          (key.includes('auth-token') || key.includes('code-verifier') || key.endsWith('-user'));

        if (isSupabaseAuthKey) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear Supabase local session storage:', error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        8000
      );

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }

      if (!data) {
        console.log('Profile not found, creating...');
        const { data: newProfile, error: createError } = await withTimeout(
          supabase
            .from('profiles')
            .upsert(
              {
                user_id: userId,
                email: null,
                full_name: null,
                phone_number: null,
                role: 'customer'
              },
              { onConflict: 'user_id' }
            )
            .select()
            .single(),
          8000
        );

        if (createError) {
          console.error('Failed to create profile:', createError);
          setProfile(null);
          return;
        }

        setProfile(newProfile as ProfileRow);
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
    let authResolved = false;

    const applyAuthState = (nextSession: Session | null) => {
      if (!mounted) return;

      authResolved = true;
      clearTimeout(timeoutId);

      console.log('Applying auth state:', nextSession ? 'Authenticated' : 'Not authenticated');
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      if (nextSession?.user) {
        void fetchProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    };

    // Failsafe: Force loading to false after 5 seconds
    timeoutId = setTimeout(() => {
      if (mounted && !authResolved) {
        console.warn('Auth loading timeout - forcing to false');
        setLoading(false);
      }
    }, 5000);

    // Check for existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      console.log('Auth session check:', session ? 'Authenticated' : 'Not authenticated');
      applyAuthState(session);
    }).catch((error) => {
      console.error('Session check error:', error);
      if (mounted) {
        authResolved = true;
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session ? 'Authenticated' : 'Not authenticated');
        applyAuthState(session);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('Signing out...');

    // 1) Clear React auth state immediately — UI must not wait for network
    clearAuthState();

    // 2) Force-clear any lingering auth keys in browser storage synchronously
    clearSupabaseStoredSession();

    // 3) Fire local-scope revocation without awaiting — best-effort, never blocks UI
    // NOTE: Do NOT fire global scope in the background; it resolves asynchronously and
    // can trigger onAuthStateChange(SIGNED_OUT) after a subsequent sign-in, logging the
    // new session out immediately.
    supabase.auth.signOut({ scope: 'local' }).catch((err) =>
      console.warn('Local sign out warning (non-blocking):', err)
    );

    console.log('Sign out completed (state cleared immediately)');
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