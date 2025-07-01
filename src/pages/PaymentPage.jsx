import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiCreditCard, FiSmartphone, FiCheck, FiLoader, FiAlertCircle } = FiIcons;

const PaymentPage = () => {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    phone: '',
    provider: 'mtn',
    description: 'Medical tourism payment'
  });

  const momoProviders = [
    { id: 'mtn', name: 'MTN Mobile Money', color: 'bg-yellow-500', flag: '📱' },
    { id: 'orange', name: 'Orange Money', color: 'bg-orange-500', flag: '🍊' },
    { id: 'airtel', name: 'Airtel Money', color: 'bg-red-500', flag: '📡' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMoMoPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('mobile-money', {
        body: {
          amount: parseFloat(formData.amount),
          currency: 'USD',
          phone: formData.phone,
          provider: formData.provider,
          reference: `EMIRAFRIK_${Date.now()}`,
          description: formData.description
        }
      });

      if (error) throw error;

      setPaymentStatus({
        type: 'success',
        message: data.message,
        transaction: data.transaction
      });

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({
        type: 'error',
        message: 'Payment failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus?.type === 'success') {
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
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Initiated!</h2>
          <p className="text-gray-600 mb-4">
            {paymentStatus.message}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between py-1">
                <span>Transaction ID:</span>
                <span className="font-mono text-xs">
                  {paymentStatus.transaction?.transaction_id}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Status:</span>
                <span className="capitalize font-semibold text-orange-600">
                  {paymentStatus.transaction?.status}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Please complete the payment on your mobile device
          </p>
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
            <SafeIcon icon={FiCreditCard} className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('payment')}
          </h1>
          <p className="text-gray-600">
            Choose your preferred payment method
          </p>
        </div>

        {/* Payment Method Selection */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="momo"
                checked={paymentMethod === 'momo'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-blue-600"
              />
              <SafeIcon icon={FiSmartphone} className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Mobile Money</span>
            </label>
            
            <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors opacity-50">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                disabled
                className="text-blue-600"
              />
              <SafeIcon icon={FiCreditCard} className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-500">Credit Card (Coming Soon)</span>
            </label>
          </div>
        </motion.div>

        {/* Mobile Money Form */}
        {paymentMethod === 'momo' && (
          <motion.form
            onSubmit={handleMoMoPayment}
            className="bg-white rounded-2xl p-6 shadow-xl space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="font-semibold text-gray-900 mb-4">Mobile Money Payment</h3>
            
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Provider
              </label>
              <div className="grid grid-cols-1 gap-2">
                {momoProviders.map((provider) => (
                  <label
                    key={provider.id}
                    className={`flex items-center space-x-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                      formData.provider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value={provider.id}
                      checked={formData.provider === provider.id}
                      onChange={handleInputChange}
                      className="text-blue-600"
                    />
                    <span className="text-lg">{provider.flag}</span>
                    <span className="font-medium text-gray-900">{provider.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="1"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="+237 6XX XXX XXX"
              />
            </div>

            {/* Error Display */}
            {paymentStatus?.type === 'error' && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-700">{paymentStatus.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isProcessing || !formData.amount || !formData.phone}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              whileHover={{ scale: isProcessing ? 1 : 1.02 }}
              whileTap={{ scale: isProcessing ? 1 : 0.98 }}
            >
              {isProcessing ? (
                <>
                  <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSmartphone} className="w-5 h-5" />
                  <span>Pay ${formData.amount || '0.00'}</span>
                </>
              )}
            </motion.button>
          </motion.form>
        )}

        {/* Info Box */}
        <motion.div
          className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">Payment Information</h3>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Secure mobile money integration</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Instant payment confirmation</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>24/7 customer support</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;