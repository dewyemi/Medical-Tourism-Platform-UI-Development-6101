import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiMessageCircle, FiFileText, FiHeart } = FiIcons;

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Hide navigation on chat page
  if (location.pathname === '/chat') {
    return null;
  }

  // Essential navigation items only for bottom nav
  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/inquiry', icon: FiFileText, label: 'Medical' },
    { path: '/chat', icon: FiMessageCircle, label: 'Chat' },
    { path: '/aftercare', icon: FiHeart, label: t('aftercare') }
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4 gap-1 py-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-3 px-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'text-blue-600 bg-blue-50 scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SafeIcon 
                icon={item.icon} 
                className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : ''}`} 
              />
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  layoutId="activeTab"
                  initial={false}
                  style={{ transform: 'translateX(-50%)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;