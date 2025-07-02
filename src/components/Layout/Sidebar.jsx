import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiHome, FiMessageCircle, FiPackage, FiCreditCard, FiHeart, 
  FiSettings, FiBarChart3, FiUsers, FiFileText, FiLogOut, 
  FiShield 
} = FiIcons;

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user, profile, role, logout } = useAuth();

  const clientNavItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/inquiry', icon: FiFileText, label: 'Medical Inquiry' },
    { path: '/chat', icon: FiMessageCircle, label: t('chat') },
    { path: '/packages', icon: FiPackage, label: t('packages') },
    { path: '/payment', icon: FiCreditCard, label: t('payment') },
    { path: '/aftercare', icon: FiHeart, label: t('aftercare') },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: FiBarChart3, label: t('dashboard') },
    { path: '/admin/chat', icon: FiMessageCircle, label: 'Chat Panel' },
    { path: '/admin/clients', icon: FiUsers, label: 'Clients' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  const isAdmin = location.pathname.startsWith('/admin');
  const navItems = isAdmin ? adminNavItems : clientNavItems;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:relative lg:shadow-none lg:border-r lg:border-gray-200 flex flex-col"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">EMIRAFRIK</h2>
                  <p className="text-sm text-gray-500">Medical Tourism</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiUsers} className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile?.full_name || user.email}
                    </p>
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiShield} className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500 capitalize">{role}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <SafeIcon icon={item.icon} className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              {/* Role-based navigation switch */}
              {(role === 'admin' || role === 'employee') && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const targetPath = isAdmin ? '/' : '/admin/dashboard';
                      navigate(targetPath);
                      onClose();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                  >
                    <SafeIcon icon={isAdmin ? FiHome : FiBarChart3} className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">
                      {isAdmin ? 'Client View' : 'Admin Panel'}
                    </span>
                  </button>
                </div>
              )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 space-y-4">
              {/* Help Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">Contact our support team</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Get Support
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              >
                <SafeIcon icon={FiLogOut} className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;