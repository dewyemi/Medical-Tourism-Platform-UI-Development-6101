import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiGlobe, FiHome, FiMenu } = FiIcons;

const MobileHeader = ({ title, showBack = false, onBack, onMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' }
  ];

  const isOnChatPage = location.pathname === '/chat';

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-4 h-16">
        <div className="flex items-center space-x-3">
          {isOnChatPage ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <SafeIcon 
                icon={isRTL ? FiIcons.FiArrowRight : FiArrowLeft} 
                className="w-5 h-5 text-gray-700" 
              />
            </button>
          ) : showBack ? (
            <button
              onClick={onBack || (() => navigate(-1))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <SafeIcon 
                icon={isRTL ? FiIcons.FiArrowRight : FiArrowLeft} 
                className="w-5 h-5 text-gray-700" 
              />
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <SafeIcon icon={FiHome} className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[180px]">
              {title}
            </h1>
            <div className="text-xs text-blue-600 font-semibold">
              EMIRAFRIK
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <div className="relative group">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <SafeIcon icon={FiGlobe} className="w-5 h-5 text-gray-700" />
            </button>
            <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[140px] z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm flex items-center space-x-3 ${
                    currentLanguage === lang.code 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Button - Only show when not on chat page */}
          {!isOnChatPage && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <SafeIcon icon={FiMenu} className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default MobileHeader;