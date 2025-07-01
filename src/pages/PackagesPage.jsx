import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePackageContext } from '../contexts/PackageContext';
import { usePackages } from '../hooks/usePackages';
import SafeIcon from '../common/SafeIcon';
import PackageCard from '../components/PackageCard';
import PackageSkeleton from '../components/PackageSkeleton';
import PackageFilters from '../components/PackageFilters';
import * as FiIcons from 'react-icons/fi';

const {
  FiPackage, FiArrowRight, FiPlus, FiAlertCircle, FiRefreshCw
} = FiIcons;

const PackagesPage = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { packageFilters, clearFilters } = usePackageContext();
  const { packages, isLoading, error, mutate } = usePackages(packageFilters);

  const handleRefresh = () => {
    mutate();
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex items-center space-x-3 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SafeIcon icon={FiPackage} className="w-8 h-8" />
            <h1 className="text-3xl lg:text-4xl font-bold">
              {t('medicalPackages') || 'Medical Packages'}
            </h1>
          </motion.div>
          <motion.p
            className="text-blue-100 lg:text-lg max-w-2xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t('packagesSubtitle') || 'Discover our comprehensive medical tourism packages designed for your health and comfort in Dubai'}
          </motion.p>
        </div>
      </motion.div>

      {/* Filters */}
      <PackageFilters />

      {/* Main Content */}
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Results Header */}
          {!isLoading && (
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">
                  {t('foundPackages') || 'Found'}{' '}
                  <span className="font-semibold text-blue-600">{packages.length}</span>{' '}
                  {t('packages') || 'packages'}
                </p>
                {error && (
                  <button
                    onClick={handleRefresh}
                    className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                    <span>{t('refresh') || 'Refresh'}</span>
                  </button>
                )}
              </div>
              
              {error && (
                <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
                  <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
                  <span className="text-sm">{t('usingOfflineData') || 'Using offline data'}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <PackageSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && packages.length === 0 && (
            <motion.div
              className="text-center py-16 bg-white rounded-2xl shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <SafeIcon icon={FiPackage} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('noPackagesFound') || 'No packages found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('noPackagesDescription') || 'Try adjusting your search or filters to find what you\'re looking for'}
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('clearFilters') || 'Clear Filters'}
              </button>
            </motion.div>
          )}

          {/* Packages Grid */}
          {!isLoading && packages.length > 0 && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <PackageCard pkg={pkg} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        className="bg-white border-t border-gray-100 px-4 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            {t('cantFindPackage') || "Can't Find What You're Looking For?"}
          </h2>
          <p className="text-gray-600 lg:text-lg mb-8 max-w-2xl mx-auto">
            {t('customPackageDescription') || 'Our medical tourism specialists can create a custom package tailored to your specific needs and budget.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => navigate('/chat')}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{t('chatWithSpecialist') || 'Chat with Specialist'}</span>
              <SafeIcon icon={isRTL ? FiIcons.FiArrowLeft : FiArrowRight} className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => navigate('/inquiry')}
              className="bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
              <span>{t('customRequest') || 'Custom Request'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PackagesPage;