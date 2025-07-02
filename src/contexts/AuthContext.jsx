import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, getProfile, updateProfile, resetPassword, updatePassword, hasRole, isAdmin, isEmployee, isClient } from '../lib/supabase';
import supabase from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Get initial session
    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, {
          userEmail: session?.user?.email,
          hasSession: !!session
        });
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, true); // Force refresh
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      console.log('Getting initial session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session:', {
        hasSession: !!session,
        userEmail: session?.user?.email
      });
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, true); // Force refresh
      }
    } catch (error) {
      console.error('Error getting initial session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId, forceRefresh = false) => {
    try {
      console.log('Fetching profile for user:', userId, { forceRefresh });
      
      // Force refresh by bypassing cache
      let query = supabase
        .from('user_profiles_2024')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      // Add a timestamp to force refresh
      if (forceRefresh) {
        query = query.limit(1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles_2024')
            .insert({
              user_id: userId,
              email: user?.email || '',
              full_name: user?.user_metadata?.full_name || '',
              role: 'client'
            })
            .select()
            .single();
          
          if (!createError && newProfile) {
            setProfile(newProfile);
          }
        }
        return;
      }
      
      console.log('Profile loaded:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  // Force refresh profile function
  const refreshProfile = async () => {
    if (user) {
      console.log('Force refreshing profile...');
      await fetchProfile(user.id, true);
    }
  };

  const login = async (email, password) => {
    console.log('Login attempt for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      console.log('Login successful for:', data.user?.email);
      
      // Force refresh profile after login
      setTimeout(() => {
        if (data.user) {
          fetchProfile(data.user.id, true);
        }
      }, 100);
      
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      console.error('Login exception:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, userData) => {
    console.log('Signup attempt for:', email);
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await signUp(email, password, userData);
      if (error) {
        console.error('Signup error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      console.log('Signup successful for:', data.user?.email);
      return {
        success: true,
        user: data.user,
        message: data.user?.email_confirmed_at 
          ? 'Account created successfully!' 
          : 'Please check your email to confirm your account.'
      };
    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      console.error('Signup exception:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logout attempt');
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setError(null);
      console.log('Logout successful');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      const { data, error } = await updateProfile(user.id, updates);
      if (error) {
        return { success: false, error: error.message };
      }
      
      setProfile(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const { data, error } = await resetPassword(email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const { data, error } = await updatePassword(newPassword);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Role-based access control helpers
  const checkRole = (requiredRoles) => hasRole(profile, requiredRoles);
  const checkAdmin = () => isAdmin(profile);
  const checkEmployee = () => isEmployee(profile);
  const checkClient = () => isClient(profile);

  const value = {
    // User state
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    role: profile?.role || 'client',
    
    // Auth actions
    login,
    signup,
    logout,
    updateUserProfile,
    requestPasswordReset,
    changePassword,
    refreshProfile,  // Add this new function
    
    // Role-based access
    hasRole: checkRole,
    isAdmin: checkAdmin,
    isEmployee: checkEmployee,
    isClient: checkClient,
    
    // Clear error
    clearError: () => setError(null)
  };

  // Debug logging
  useEffect(() => {
    console.log('Auth state update:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      profileRole: profile?.role,
      loading,
      error
    });
  }, [user, profile, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth Guard Component
export const AuthGuard = ({ children, roles = [] }) => {
  const { user, profile, loading, hasRole, refreshProfile } = useAuth();
  
  console.log('AuthGuard check:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasProfile: !!profile,
    profileRole: profile?.role,
    requiredRoles: roles,
    loading
  });

  // Add a refresh button for debugging
  useEffect(() => {
    if (user && !loading) {
      // Auto-refresh profile after a short delay
      const timer = setTimeout(() => {
        refreshProfile();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, refreshProfile]);

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
    console.log('AuthGuard: No user, redirecting to login');
    // Redirect to login if not authenticated
    window.location.href = '/#/login';
    return null;
  }

  if (roles.length > 0 && !hasRole(roles)) {
    console.log('AuthGuard: Access denied - insufficient role');
    // Show unauthorized message if role doesn't match
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
          <div className="space-y-2">
            <button
              onClick={() => window.location.href = '/#/'}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={refreshProfile}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors text-sm"
            >
              Refresh Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('AuthGuard: Access granted');
  return children;
};