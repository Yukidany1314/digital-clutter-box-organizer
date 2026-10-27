import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  isCloudConfigured: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;
  updateProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'clutterbox_auth_session_v2';

const DEMO_USER: UserProfile = {
  id: 'demo-user-1234',
  email: 'alex.rivera@example.com',
  displayName: 'Alex Rivera',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              displayName: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
              createdAt: data.session.user.created_at,
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session load error:', e);
        }
      }

      // Check local session
      try {
        const stored = localStorage.getItem(LOCAL_AUTH_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setIsDemoMode(Boolean(parsed.isDemoMode));
        }
      } catch (e) {
        console.warn('Failed to parse local auth session:', e);
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          displayName: data.user.user_metadata?.full_name || email.split('@')[0],
          createdAt: data.user.created_at,
        };
        setUser(profile);
        setIsDemoMode(false);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: profile, isDemoMode: false }));
        setIsLoading(false);
        return { success: true };
      }
    }

    // Local / Demo Login fallback
    const localUser: UserProfile = {
      id: 'usr-' + Math.abs(email.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)),
      email,
      displayName: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    setUser(localUser);
    setIsDemoMode(false);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: localUser, isDemoMode: false }));
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (email: string, password?: string, displayName?: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: displayName || email.split('@')[0] },
        },
      });
      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          displayName: displayName || email.split('@')[0],
          createdAt: data.user.created_at,
        };
        setUser(profile);
        setIsDemoMode(false);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: profile, isDemoMode: false }));
        setIsLoading(false);
        return { success: true };
      }
    }

    // Local Signup fallback
    const localUser: UserProfile = {
      id: 'usr-' + Date.now(),
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    setUser(localUser);
    setIsDemoMode(false);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: localUser, isDemoMode: false }));
    setIsLoading(false);
    return { success: true };
  };

  const enterDemoMode = () => {
    setUser(DEMO_USER);
    setIsDemoMode(true);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: DEMO_USER, isDemoMode: true }));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout failed:', e);
      }
    }
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem(LOCAL_AUTH_KEY);
  };

  const updateProfile = async (displayName: string) => {
    if (!user) return;
    const updated = { ...user, displayName };
    setUser(updated);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: updated, isDemoMode }));

    if (isSupabaseConfigured && supabase) {
      await supabase.auth.updateUser({
        data: { full_name: displayName },
      });
      await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isDemoMode,
        isCloudConfigured: isSupabaseConfigured,
        login,
        signup,
        logout,
        enterDemoMode,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
