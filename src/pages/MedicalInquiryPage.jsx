import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiGlobe, FiFileText, FiSend, FiCheck } = FiIcons;

const MedicalInquiryPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    healthCondition: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const countries = [
    'Algeria', 'Benin', 'Burkina Faso', 'Cameroon', 'Chad', 'Comoros', 'Congo',
    'Côte d\'Ivoire', 'Djibouti', 'Egypt', 'Gabon', 'Guinea', 'Lebanon', 'Libya',
    'Madagascar', 'Mali', 'Mauritania', 'Morocco', 'Niger', 'Senegal', 'Tunisia'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save inquiry to Supabase
        const { error } = await supabase
          .from('inquiries')
          .insert({
            user_id: user.id,
            issue: `Name: ${formData.name}, Country: ${formData.country}, Condition: ${formData.healthCondition}`
          });

        if (error) throw error;
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Navigate to chat after submission
      setTimeout(() => {
        navigate('/chat', {
          state: {
            fromInquiry: true,
            inquiryData: formData
          }
        });
      }, 2000);

    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setIsSubmitting(false);
      
      // Still proceed to chat even if database save fails
      setIsSubmitted(true);
      setTimeout(() => {
        navigate('/chat', {
          state: {
            fromInquiry: true,
            inquiryData: formData
          }
        });
      }, 2000);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 pt-16">
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SafeIcon icon={FiCheck} className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your inquiry. Our AI assistant will help you with the next steps.
          </p>
          <motion.div
            className="w-full bg-green-100 rounded-full h-2 mb-4"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </motion.div>
          <p className="text-sm text-gray-500">Redirecting to chat assistant...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-8 pt-20 pb-24">
      <motion.div
        className="max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SafeIcon icon={FiFileText} className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Medical Inquiry
          </h1>
          <p className="text-gray-600">
            Tell us about your medical needs
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-xl space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <SafeIcon icon={FiUser} className="inline w-4 h-4 mr-2 text-blue-500" />
              {t('name')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="Enter your full name"
            />
          </div>

          {/* Country Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <SafeIcon icon={FiGlobe} className="inline w-4 h-4 mr-2 text-blue-500" />
              {t('country')} *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Health Condition Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <SafeIcon icon={FiFileText} className="inline w-4 h-4 mr-2 text-blue-500" />
              {t('healthCondition')} *
            </label>
            <textarea
              name="healthCondition"
              value={formData.healthCondition}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
              placeholder="Please describe your health condition or the medical treatment you're seeking..."
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiSend} className="w-5 h-5" />
                <span>{t('submit')}</span>
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Additional Info */}
        <motion.div
          className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">What happens next?</h3>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>AI assistant analyzes your inquiry</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Receive personalized recommendations</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Connect with Dubai specialists</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MedicalInquiryPage;