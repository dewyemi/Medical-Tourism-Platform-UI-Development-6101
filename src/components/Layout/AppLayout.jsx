import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/': return t('welcome');
      case '/inquiry': return 'Medical Inquiry';
      case '/chat': return t('chat');
      case '/packages': return t('packages');
      case '/payment': return t('payment');
      case '/aftercare': return t('aftercare');
      case '/admin/dashboard': return t('dashboard');
      case '/admin/chat': return 'Chat Panel';
      case '/admin/clients': return 'Clients';
      default: return 'EMIRAFRIK';
    }
  };

  const isOnChatPage = location.pathname === '/chat';

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        <Sidebar isOpen={true} onClose={() => {}} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-white">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileHeader 
          title={getPageTitle()} 
          onMenuToggle={() => setSidebarOpen(true)} 
        />
        <main className={`pt-16 min-h-screen bg-white ${isOnChatPage ? '' : 'pb-20'}`}>
          {children}
        </main>
        <BottomNavigation />
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </div>
    </div>
  );
};

export default AppLayout;