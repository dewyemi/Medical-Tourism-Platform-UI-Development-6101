import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePackageContext } from '../contexts/PackageContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiDollarSign, FiCalendar, FiMapPin, FiHeart, FiStar,
  FiCheck, FiArrowRight, FiClock
} = FiIcons;

const PackageCard = ({ pkg }) => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { selectPackage } = usePackageContext();

  const handleInquire = () => {
    selectPackage(pkg);
    navigate(`/chat?packageId=${pkg.id}`, { 
      state: { fromPackage: true, packageData: pkg } 
    });
  };

  const getTreatmentTypeColor = (type) => {
    const colors = {
      'dental care': 'bg-blue-100 text-blue-800',
      'cosmetic surgery': 'bg-purple-100 text-purple-800',
      'cardiology': 'bg-red-100 text-red-800',
      'orthopedics': 'bg-green-100 text-green-800',
      'eye care': 'bg-yellow-100 text-yellow-800',
      'fertility': 'bg-pink-100 text-pink-800',
      'oncology': 'bg-orange-100 text-orange-800',
      'general surgery': 'bg-gray-100 text-gray-800'
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const features = [
    t('medicalConsultation') || 'Medical consultation & treatment',
    t('luxuryAccommodation') || 'Luxury hotel accommodation',
    t('medicalSupport') || '24/7 medical support',
    t('airportTransfers') || 'Airport transfers included'
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={pkg.thumbnail || `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&q=80`}
          alt={pkg.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&q=80`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Duration Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiClock} className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-bold text-gray-900">
              {pkg.duration_days} {t('days') || 'days'}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <SafeIcon
              key={i}
              icon={FiStar}
              className="w-3 h-3 text-yellow-400 fill-current drop-shadow-sm"
            />
          ))}
          <span className="text-white text-xs font-medium ml-1 drop-shadow-sm">5.0</span>
        </div>

        {/* Wishlist Heart */}
        <motion.button
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SafeIcon
            icon={FiHeart}
            className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors"
          />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Treatment Type */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 mr-2">
              {pkg.title}
            </h3>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getTreatmentTypeColor(pkg.treatment_type)}`}>
              <SafeIcon icon={FiMapPin} className="w-3 h-3 mr-1" />
              {pkg.treatment_type.charAt(0).toUpperCase() + pkg.treatment_type.slice(1)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {pkg.details}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
              <SafeIcon icon={FiCheck} className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiDollarSign} className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {pkg.price_usd?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {t('startingFrom') || 'Starting from'}
            </p>
          </div>
          
          <motion.button
            onClick={handleInquire}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{t('inquire') || 'Inquire'}</span>
            <SafeIcon 
              icon={isRTL ? FiIcons.FiArrowLeft : FiArrowRight} 
              className="w-4 h-4" 
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PackageCard;