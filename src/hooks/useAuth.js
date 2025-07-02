import { useState, useEffect } from 'react';
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  getProfile, 
  createUserProfile,
  getCurrentAuth
} from '../lib/supabase';
import supabase from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🚀 useAuth: Initializing...');
    
    // Check demo auth first
    const demoAuth = getCurrentAuth();
    if (demoAuth) {
      console.log('🎭 Found demo auth:', demoAuth.user.email);
      setUser(demoAuth.user);
      setProfile(demoAuth.profile);
      setLoading(false);
      return;
    }
    
    // Get initial session
    getInitialSession();

    // Listen for auth changes (only for real Supabase auth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🚀 Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          // Check if we have demo auth
          const demoAuth = getCurrentAuth();
          if (demoAuth) {
            setUser(demoAuth.user);
            setProfile(demoAuth.profile);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log('🚀 useAuth: Cleanup');
      subscription.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      console.log('🚀 Getting initial session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('🚀 Found existing session:', session.user.email);
        setUser(session.user);
        await loadProfile(session.user.id);
      }
    } catch (error) {
      console.error('🚀 Error getting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId) => {
    try {
      console.log('🚀 Loading profile for:', userId);
      const { data, error } = await getProfile(userId);
      
      if (data) {
        console.log('🚀 Profile loaded:', data);
        setProfile(data);
      } else {
        console.error('🚀 Profile load error:', error);
      }
    } catch (error) {
      console.error('🚀 Profile load exception:', error);
    }
  };

  const login = async (email, password) => {
    console.log('🔥 Login attempt for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ Login failed:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Login successful');
      
      // Handle demo auth
      if (email.includes('demo.')) {
        const demoAuth = getCurrentAuth();
        if (demoAuth) {
          setUser(demoAuth.user);
          setProfile(demoAuth.profile);
        }
      } else {
        setUser(data.user);
        await loadProfile(data.user.id);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      console.error('❌ Login exception:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, userData) => {
    console.log('🔥 Signup attempt for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await signUp(email, password, userData);
      
      if (error) {
        console.error('❌ Signup failed:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Signup successful');
      
      // For demo accounts, auto-login
      if (email.includes('demo.')) {
        return await login(email, password);
      }
      
      // For real accounts, the user will be set by auth state change
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      console.error('❌ Signup exception:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🔥 Logout attempt');
    setLoading(true);
    
    try {
      await signOut();
      setUser(null);
      setProfile(null);
      setError(null);
      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Role helpers
  const hasRole = (roles) => {
    if (!profile) return false;
    if (typeof roles === 'string') return profile.role === roles;
    return roles.includes(profile.role);
  };

  return {
    user,
    profile,
    loading,
    error,
    role: profile?.role || 'client',
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    hasRole,
    isAdmin: () => hasRole('admin'),
    isEmployee: () => hasRole(['admin', 'employee']),
    clearError: () => setError(null)
  };
};

// AuthGuard Component
export const AuthGuard = ({ children, roles = [] }) => {
  const { user, profile, loading, hasRole } = useAuth();

  console.log('🛡️ AuthGuard check:', {
    hasUser: !!user,
    userEmail: user?.email,
    profileRole: profile?.role,
    requiredRoles: roles,
    loading
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🛡️ No user, redirecting to login');
    window.location.href = '/#/login';
    return null;
  }

  if (roles.length > 0 && !hasRole(roles)) {
    console.log('🛡️ Access denied - insufficient role');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this area.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Required roles: {roles.join(', ')}
            <br />
            Your role: {profile?.role || 'none'}
          </p>
          <button
            onClick={() => window.location.href = '/#/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  console.log('🛡️ Access granted');
  return children;
};