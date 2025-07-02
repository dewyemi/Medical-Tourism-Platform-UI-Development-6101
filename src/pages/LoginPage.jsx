import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiHeart, FiAlertCircle } = FiIcons;

const LoginPage = () => {
  const { user, login, signup, loading, error, clearError } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('✅ User authenticated, redirecting...');
      window.location.hash = '#/';
    }
  }, [user]);

  // Clear errors when switching modes
  useEffect(() => {
    clearError();
    setLocalError('');
    setSuccess('');
  }, [mode, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (mode === 'signup' && !formData.fullName) {
      setLocalError('Please enter your full name');
      return;
    }

    console.log(`🔥 ${mode} attempt:`, formData.email);

    try {
      let result;
      
      if (mode === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.email, formData.password, {
          full_name: formData.fullName,
          role: 'client'
        });
      }

      if (result.success) {
        setSuccess(`${mode} successful! Redirecting...`);
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1000);
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      console.error(`${mode} error:`, err);
      setLocalError('An unexpected error occurred');
    }
  };

  // Demo login functions
  const demoLogin = async (email, password, role = 'client') => {
    console.log('🎭 Demo login:', email);
    
    // First try to login
    const loginResult = await login(email, password);
    
    if (!loginResult.success) {
      // If login fails, try to create the demo account
      console.log('🎭 Creating demo account:', email);
      const signupResult = await signup(email, password, {
        full_name: role === 'admin' ? 'Demo Admin' : role === 'employee' ? 'Demo Employee' : 'Demo Client',
        role: role
      });
      
      if (signupResult.success) {
        setSuccess('Demo account created and logged in!');
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1000);
      } else {
        setLocalError('Failed to create demo account');
      }
    } else {
      setSuccess('Demo login successful!');
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1000);
    }
  };

  const currentError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-8 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SafeIcon icon={FiHeart} className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">EMIRAFRIK</h1>
          <p className="text-blue-100">
            {mode === 'login' ? 'Welcome back to your medical journey' : 'Join our medical tourism family'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-sm">
              {mode === 'login' ? 'Enter your credentials to continue' : 'Fill in your details to get started'}
            </p>
          </div>

          {/* Error Display */}
          {currentError && (
            <motion.div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{currentError}</p>
            </motion.div>
          )}

          {/* Success Display */}
          {success && (
            <motion.div
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-green-700 text-sm">{success}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name - Only for signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <SafeIcon icon={FiMail} className="inline w-4 h-4 mr-2 text-blue-500" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <SafeIcon icon={FiLock} className="inline w-4 h-4 mr-2 text-blue-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </motion.button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">🎭 Demo Accounts:</h4>
            <div className="space-y-2">
              <button
                onClick={() => demoLogin('demo.client@test.com', 'password123', 'client')}
                className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-blue-100 transition-colors text-sm"
                disabled={loading}
              >
                <span className="font-medium">👤 Client:</span> demo.client@test.com
              </button>
              <button
                onClick={() => demoLogin('demo.employee@test.com', 'password123', 'employee')}
                className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-blue-100 transition-colors text-sm"
                disabled={loading}
              >
                <span className="font-medium">👨‍⚕️ Employee:</span> demo.employee@test.com
              </button>
              <button
                onClick={() => demoLogin('demo.admin@test.com', 'password123', 'admin')}
                className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-blue-100 transition-colors text-sm"
                disabled={loading}
              >
                <span className="font-medium">👑 Admin:</span> demo.admin@test.com
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Click any demo account to auto-login or create your own account!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;