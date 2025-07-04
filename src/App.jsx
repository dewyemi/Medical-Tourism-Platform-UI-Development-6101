import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { PackageProvider } from './contexts/PackageContext';
import { AuthGuard } from './hooks/useAuth';
import AppLayout from './components/Layout/AppLayout';
import HomePage from './pages/HomePage';
import MedicalInquiryPage from './pages/MedicalInquiryPage';
import ChatPage from './pages/ChatPage';
import PackagesPage from './pages/PackagesPage';
import PaymentPage from './pages/PaymentPage';
import AftercarePage from './pages/AftercarePage';
import LoginPage from './pages/LoginPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  return (
    <AuthGuard roles={roles}>
      <AppLayout>
        {children}
      </AppLayout>
    </AuthGuard>
  );
};

// Fallback Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600">Loading EMIRAFRIK...</p>
    </div>
  </div>
);

function App() {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <LanguageProvider>
        <PackageProvider>
          <Router>
            <Routes>
              {/* Public route - Login */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes - All require authentication */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/inquiry" 
                element={
                  <ProtectedRoute>
                    <MedicalInquiryPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/packages" 
                element={
                  <ProtectedRoute>
                    <PackagesPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/payment" 
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* AftercarePage with specific patient role guard (already includes AuthGuard) */}
              <Route 
                path="/aftercare" 
                element={<AftercarePage />}
              />
              
              {/* Admin routes - Require admin or employee role */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute roles={['admin', 'employee']}>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
                      <p className="text-gray-600">Admin dashboard coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/chat" 
                element={
                  <ProtectedRoute roles={['admin', 'employee']}>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Chat Panel</h1>
                      <p className="text-gray-600">Admin chat panel coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/clients" 
                element={
                  <ProtectedRoute roles={['admin', 'employee']}>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Management</h1>
                      <p className="text-gray-600">Client management coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route - redirect to home */}
              <Route 
                path="*" 
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </PackageProvider>
      </LanguageProvider>
    </React.Suspense>
  );
}

export default App;