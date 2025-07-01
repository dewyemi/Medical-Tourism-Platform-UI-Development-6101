import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiHeart, FiGlobe, FiShield, FiStar, FiArrowRight, 
  FiPhone, FiMail, FiMapPin, FiMessageCircle 
} = FiIcons;

const HomePage = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const features = [
    {
      icon: FiHeart,
      title: 'World-Class Healthcare',
      description: 'Access to top-tier medical facilities in Dubai with internationally certified doctors.',
      color: 'from-gray-600 to-gray-800'
    },
    {
      icon: FiGlobe,
      title: 'Seamless Experience',
      description: 'End-to-end support from consultation to recovery with multilingual assistance.',
      color: 'from-gray-700 to-gray-900'
    },
    {
      icon: FiShield,
      title: 'Trusted Partner',
      description: 'Comprehensive insurance coverage and guaranteed quality care throughout your journey.',
      color: 'from-gray-600 to-gray-800'
    },
    {
      icon: FiStar,
      title: 'Premium Tourism',
      description: 'Combine your medical treatment with luxury tourism experiences in Dubai.',
      color: 'from-gray-700 to-gray-900'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Patients Served' },
    { number: '50+', label: 'Partner Hospitals' },
    { number: '25+', label: 'Countries Served' },
    { number: '98%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section
        className="px-4 py-8 lg:py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-blue-600 rounded-2xl mb-6 shadow-lg">
              <SafeIcon icon={FiHeart} className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {t('welcome')}
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              onClick={() => navigate('/inquiry')}
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>{t('startInquiry')}</span>
              <SafeIcon 
                icon={isRTL ? FiIcons.FiArrowLeft : FiArrowRight} 
                className="w-5 h-5" 
              />
            </button>
            <button
              onClick={() => navigate('/packages')}
              className="w-full sm:w-auto bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>{t('viewPackages')}</span>
              <SafeIcon 
                icon={isRTL ? FiIcons.FiArrowLeft : FiArrowRight} 
                className="w-5 h-5" 
              />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="px-4 py-12 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="px-4 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Why Choose EMIRAFRIK?
            </h2>
            <p className="text-gray-600 lg:text-lg max-w-2xl mx-auto">
              Experience world-class healthcare combined with luxury tourism in the heart of Dubai
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl mb-4`}>
                  <SafeIcon icon={feature.icon} className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="px-4 py-16 bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-300 lg:text-lg mb-8 max-w-2xl mx-auto">
            Our team is available 24/7 to assist you with your medical tourism needs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center space-x-3 text-white">
              <SafeIcon icon={FiPhone} className="w-5 h-5 text-blue-400" />
              <span>+971 4 123 4567</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white">
              <SafeIcon icon={FiMail} className="w-5 h-5 text-blue-400" />
              <span>info@emirafrik.com</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white">
              <SafeIcon icon={FiMapPin} className="w-5 h-5 text-blue-400" />
              <span>Dubai, UAE</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/chat')}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
          >
            <SafeIcon icon={FiMessageCircle} className="w-5 h-5" />
            <span>Start Chat Now</span>
          </button>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;