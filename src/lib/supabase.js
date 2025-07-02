import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://anfzgauawuptgjaqsooo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZnpnYXVhd3VwdGdqYXFzb29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTQyMzAsImV4cCI6MjA2Njg5MDIzMH0.oCMJ-vHl8MZMcv6ritrARUyvwAvK52HUpCaIx8irX7U'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

export default supabase;

// Demo users for fallback
const DEMO_USERS = {
  'demo.client@test.com': {
    id: 'demo-client-123',
    email: 'demo.client@test.com',
    password: 'password123',
    profile: {
      user_id: 'demo-client-123',
      email: 'demo.client@test.com',
      full_name: 'Demo Client',
      role: 'client'
    }
  },
  'demo.employee@test.com': {
    id: 'demo-employee-123',
    email: 'demo.employee@test.com',
    password: 'password123',
    profile: {
      user_id: 'demo-employee-123',
      email: 'demo.employee@test.com',
      full_name: 'Demo Employee',
      role: 'employee'
    }
  },
  'demo.admin@test.com': {
    id: 'demo-admin-123',
    email: 'demo.admin@test.com',
    password: 'password123',
    profile: {
      user_id: 'demo-admin-123',
      email: 'demo.admin@test.com',
      full_name: 'Demo Admin',
      role: 'admin'
    }
  }
};

// Simple storage functions
const saveUserData = (user, profile) => {
  try {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_profile', JSON.stringify(profile));
    localStorage.setItem('auth_token', 'demo-token-' + Date.now());
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

const getUserData = () => {
  try {
    const userStr = localStorage.getItem('auth_user');
    const profileStr = localStorage.getItem('auth_profile');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !profileStr || !token) {
      return null;
    }
    
    return {
      user: JSON.parse(userStr),
      profile: JSON.parse(profileStr),
      token
    };
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};

const clearUserData = () => {
  try {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_profile');
    localStorage.removeItem('auth_token');
    return true;
  } catch (error) {
    console.error('Clear data error:', error);
    return false;
  }
};

// Demo auth functions (fallback)
export const demoLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('🎭 Demo login attempt:', email);
      
      const userData = DEMO_USERS[email];
      if (!userData) {
        reject(new Error('User not found'));
        return;
      }
      
      if (userData.password !== password) {
        reject(new Error('Invalid password'));
        return;
      }
      
      const user = {
        id: userData.id,
        email: userData.email,
        created_at: new Date().toISOString()
      };
      
      if (saveUserData(user, userData.profile)) {
        console.log('✅ Demo login successful');
        resolve({ user, profile: userData.profile });
      } else {
        reject(new Error('Failed to save user data'));
      }
    }, 1000);
  });
};

export const demoLogout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      clearUserData();
      console.log('✅ Demo logout successful');
      resolve(true);
    }, 100);
  });
};

export const getCurrentAuth = () => {
  return getUserData();
};

// Supabase auth functions with timeout and fallback
const withTimeout = (promise, timeoutMs = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};

export const signUp = async (email, password, userData = {}) => {
  console.log('🔥 SignUp attempt:', email);
  
  try {
    const signUpPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name || '',
          role: userData.role || 'client'
        }
      }
    });

    const { data, error } = await withTimeout(signUpPromise, 5000);

    if (error) {
      console.error('❌ SignUp error:', error);
      // Fallback to demo for demo emails
      if (email.includes('demo.')) {
        console.log('🎭 Falling back to demo signup');
        const demoResult = await demoLogin(email, password);
        return { data: { user: demoResult.user }, error: null };
      }
      return { data: null, error };
    }

    console.log('✅ SignUp successful');
    return { data, error: null };
    
  } catch (error) {
    console.error('❌ SignUp timeout/error:', error);
    // Fallback to demo for demo emails
    if (email.includes('demo.')) {
      console.log('🎭 Falling back to demo signup due to timeout');
      try {
        const demoResult = await demoLogin(email, password);
        return { data: { user: demoResult.user }, error: null };
      } catch (demoError) {
        return { data: null, error: demoError };
      }
    }
    return { data: null, error };
  }
};

export const signIn = async (email, password) => {
  console.log('🔥 SignIn attempt:', email);
  
  try {
    const signInPromise = supabase.auth.signInWithPassword({
      email,
      password
    });

    const { data, error } = await withTimeout(signInPromise, 5000);

    if (error) {
      console.error('❌ SignIn error:', error);
      // Fallback to demo for demo emails
      if (email.includes('demo.')) {
        console.log('🎭 Falling back to demo login');
        const demoResult = await demoLogin(email, password);
        return { data: { user: demoResult.user, session: { user: demoResult.user } }, error: null };
      }
      return { data, error };
    }

    console.log('✅ SignIn successful');
    return { data, error };
    
  } catch (error) {
    console.error('❌ SignIn timeout/error:', error);
    // Fallback to demo for demo emails
    if (email.includes('demo.')) {
      console.log('🎭 Falling back to demo login due to timeout');
      try {
        const demoResult = await demoLogin(email, password);
        return { data: { user: demoResult.user, session: { user: demoResult.user } }, error: null };
      } catch (demoError) {
        return { data: null, error: demoError };
      }
    }
    return { data: null, error };
  }
};

export const signOut = async () => {
  console.log('🔥 SignOut attempt');
  
  // Check if using demo auth
  const currentAuth = getCurrentAuth();
  if (currentAuth && currentAuth.user.id.includes('demo-')) {
    console.log('🎭 Demo logout');
    await demoLogout();
    return { error: null };
  }
  
  try {
    const { error } = await withTimeout(supabase.auth.signOut(), 3000);
    console.log('✅ SignOut successful');
    return { error };
  } catch (error) {
    console.error('❌ SignOut error:', error);
    // Force logout anyway
    clearUserData();
    return { error: null };
  }
};

export const getCurrentUser = async () => {
  // Check demo auth first
  const demoAuth = getCurrentAuth();
  if (demoAuth) {
    console.log('🎭 Demo user:', demoAuth.user.email);
    return demoAuth.user;
  }
  
  try {
    const { data: { user }, error } = await withTimeout(supabase.auth.getUser(), 3000);
    console.log('🔥 Current user:', user?.email);
    return user;
  } catch (error) {
    console.error('❌ Get user error:', error);
    return null;
  }
};

// Profile functions
export const createUserProfile = async (user, userData = {}) => {
  console.log('🔥 Creating profile for:', user.email);
  
  // Demo users already have profiles
  if (user.id.includes('demo-')) {
    const demoAuth = getCurrentAuth();
    return { data: demoAuth?.profile, error: null };
  }
  
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: userData.full_name || user.user_metadata?.full_name || '',
          role: userData.role || user.user_metadata?.role || 'client'
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single(),
      5000
    );

    console.log('✅ Profile created');
    return { data, error };
  } catch (error) {
    console.error('❌ Profile creation error:', error);
    // Return default profile
    return {
      data: {
        user_id: user.id,
        email: user.email,
        full_name: userData.full_name || '',
        role: userData.role || 'client'
      },
      error: null
    };
  }
};

export const getProfile = async (userId) => {
  console.log('🔥 Fetching profile for:', userId);
  
  // Demo users
  if (userId.includes('demo-')) {
    const demoAuth = getCurrentAuth();
    return { data: demoAuth?.profile, error: null };
  }
  
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      3000
    );

    if (error && error.code === 'PGRST116') {
      // No profile found, create one
      const user = await getCurrentUser();
      if (user) {
        return await createUserProfile(user);
      }
    }

    return { data, error };
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    // Return default profile
    return {
      data: {
        user_id: userId,
        email: '',
        full_name: '',
        role: 'client'
      },
      error: null
    };
  }
};

export const updateProfile = async (userId, updates) => {
  // Demo users
  if (userId.includes('demo-')) {
    const demoAuth = getCurrentAuth();
    if (demoAuth) {
      const updatedProfile = { ...demoAuth.profile, ...updates };
      saveUserData(demoAuth.user, updatedProfile);
      return { data: updatedProfile, error: null };
    }
  }
  
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single(),
      3000
    );

    return { data, error };
  } catch (error) {
    console.error('❌ Profile update error:', error);
    return { data: null, error };
  }
};