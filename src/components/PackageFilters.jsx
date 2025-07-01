import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { usePackageContext } from '../contexts/PackageContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFilter, FiSearch, FiX, FiSliders } = FiIcons;

const PackageFilters = () => {
  const { t } = useLanguage();
  const { packageFilters, updateFilters, clearFilters } = usePackageContext();
  const [showFilters, setShowFilters] = useState(false);

  const treatmentTypes = [
    { value: '', label: t('allTreatments') || 'All Treatments' },
    { value: 'cosmetic surgery', label: t('cosmeticSurgery') || 'Cosmetic Surgery' },
    { value: 'dental care', label: t('dentalCare') || 'Dental Care' },
    { value: 'cardiology', label: t('cardiology') || 'Cardiology' },
    { value: 'orthopedics', label: t('orthopedics') || 'Orthopedics' },
    { value: 'oncology', label: t('oncology') || 'Oncology' },
    { value: 'fertility', label: t('fertility') || 'Fertility' },
    { value: 'eye care', label: t('eyeCare') || 'Eye Care' },
    { value: 'general surgery', label: t('generalSurgery') || 'General Surgery' }
  ];

  const handleSearchChange = (e) => {
    updateFilters({ search: e.target.value });
  };

  const handleTreatmentTypeChange = (e) => {
    updateFilters({ treatment_type: e.target.value });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    updateFilters({ [name]: parseInt(value) });
  };

  const hasActiveFilters = 
    packageFilters.treatment_type || 
    packageFilters.search || 
    packageFilters.price_min > 0 || 
    packageFilters.price_max < 50000;

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <SafeIcon
              icon={FiSearch}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              type="text"
              placeholder={t('searchPackages') || 'Search packages, treatments...'}
              value={packageFilters.search}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 border ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiSliders} className="w-5 h-5" />
              <span className="font-medium">{t('filters') || 'Filters'}</span>
              {hasActiveFilters && (
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {Object.values(packageFilters).filter(Boolean).length}
                </span>
              )}
            </motion.button>

            {hasActiveFilters && (
              <motion.button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={FiX} className="w-4 h-4" />
                <span className="text-sm font-medium">{t('clear') || 'Clear'}</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="border-t border-gray-100 pt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Treatment Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('treatmentType') || 'Treatment Type'}
                  </label>
                  <select
                    value={packageFilters.treatment_type}
                    onChange={handleTreatmentTypeChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    {treatmentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('priceRange') || 'Price Range'} (USD)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="price_min"
                      placeholder={t('min') || 'Min'}
                      value={packageFilters.price_min}
                      onChange={handlePriceChange}
                      min="0"
                      className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <input
                      type="number"
                      name="price_max"
                      placeholder={t('max') || 'Max'}
                      value={packageFilters.price_max}
                      onChange={handlePriceChange}
                      min="0"
                      className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    ${packageFilters.price_min?.toLocaleString() || 0} - ${packageFilters.price_max?.toLocaleString() || 50000}
                  </div>
                </div>

                {/* Price Range Slider */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('quickFilters') || 'Quick Filters'}
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateFilters({ price_min: 0, price_max: 5000 })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border transition-colors ${
                        packageFilters.price_min === 0 && packageFilters.price_max === 5000
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {t('under5k') || 'Under $5,000'}
                    </button>
                    <button
                      onClick={() => updateFilters({ price_min: 5000, price_max: 15000 })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border transition-colors ${
                        packageFilters.price_min === 5000 && packageFilters.price_max === 15000
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {t('5kTo15k') || '$5,000 - $15,000'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PackageFilters;