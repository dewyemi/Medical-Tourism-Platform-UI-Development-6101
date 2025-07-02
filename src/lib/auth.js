// Simple demo authentication without Supabase dependencies
const DEMO_USERS = {
  'admin@demo.com': {
    id: 'admin-123',
    email: 'admin@demo.com',
    password: 'demo123',
    profile: {
      user_id: 'admin-123',
      email: 'admin@demo.com',
      full_name: 'Dr. Sarah Ahmed',
      role: 'admin'
    }
  },
  'employee@demo.com': {
    id: 'employee-123',
    email: 'employee@demo.com',
    password: 'demo123',
    profile: {
      user_id: 'employee-123',
      email: 'employee@demo.com',
      full_name: 'Nurse Lisa Wilson',
      role: 'employee'
    }
  },
  'client@demo.com': {
    id: 'client-123',
    email: 'client@demo.com',
    password: 'demo123',
    profile: {
      user_id: 'client-123',
      email: 'client@demo.com',
      full_name: 'John Thompson',
      role: 'client'
    }
  },
  'patient@demo.com': {
    id: 'patient-123',
    email: 'patient@demo.com',
    password: 'demo123',
    profile: {
      user_id: 'patient-123',
      email: 'patient@demo.com',
      full_name: 'Maria Rodriguez',
      role: 'client'
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

// Authentication functions
export const demoLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
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
        resolve({ user, profile: userData.profile });
      } else {
        reject(new Error('Failed to save user data'));
      }
    }, 500);
  });
};

export const demoLogout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      clearUserData();
      resolve(true);
    }, 100);
  });
};

export const getCurrentAuth = () => {
  return getUserData();
};

export const demoSignUp = (email, password, userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userId = 'user-' + Date.now();
      const user = {
        id: userId,
        email: email,
        created_at: new Date().toISOString()
      };
      
      const profile = {
        user_id: userId,
        email: email,
        full_name: userData.full_name || '',
        role: 'client'
      };
      
      if (saveUserData(user, profile)) {
        resolve({ user, profile });
      } else {
        reject(new Error('Failed to create account'));
      }
    }, 500);
  });
};