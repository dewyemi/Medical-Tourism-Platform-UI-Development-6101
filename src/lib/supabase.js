import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://anfzgauawuptgjaqsooo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZnpnYXVhd3VwdGdqYXFzb29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTQyMzAsImV4cCI6MjA2Njg5MDIzMH0.oCMJ-vHl8MZMcv6ritrARUyvwAvK52HUpCaIx8irX7U'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Auth helpers
export const signUp = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;

    // Create user profile after successful signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles_2024')
        .insert({
          user_id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name || '',
          role: userData.role || 'client',
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw error here, let user proceed
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('SignUp error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('SignIn error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('SignOut error:', error);
    return { error };
  }
};

export const getProfile = async (userId) => {
  try {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('No authenticated user') };
      userId = user.id;
    }

    // Simple query to avoid recursion
    const { data, error } = await supabase
      .from('user_profiles_2024')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles_2024')
            .insert({
              user_id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              role: 'client',
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
            // Return default profile if creation fails
            return {
              data: {
                user_id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
                role: 'client'
              },
              error: null
            };
          }
          return { data: newProfile, error: null };
        }
      }
      
      // Return default profile for authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          data: {
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            role: 'client'
          },
          error: null
        };
      }
      
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('GetProfile error:', error);
    
    // Fallback to basic user info if profile fetch fails
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          data: {
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            role: 'client'
          },
          error: null
        };
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }
    
    return { data: null, error };
  }
};

export default supabase;