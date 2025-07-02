import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const {
  FiCreditCard,
  FiSmartphone,
  FiCheck,
  FiLoader,
  FiAlertCircle,
  FiExternalLink,
  FiRefreshCw,
  FiX
} = FiIcons;

const PaymentPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentRef, setPaymentRef] = useState(null);
  const [checkoutUri, setCheckoutUri] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
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

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMoMoPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus(null);

    try {
      // Get user session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Authentication required');
      }

      // Call mobile money function
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/mobile-money/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify({
          userId: user.id,
          amount: parseFloat(formData.amount),
          provider: formData.provider,
          phone: formData.phone,
          currency: 'USD',
          description: formData.description
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment initiation failed');
      }

      if (result.success) {
        setPaymentRef(result.payment_ref);
        setCheckoutUri(result.checkout_uri);
        setPaymentStatus({
          type: 'initiated',
          message: result.message,
          payment_ref: result.payment_ref
        });

        // Start polling for payment status
        startPolling(result.payment_ref);
      } else {
        throw new Error(result.error || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({
        type: 'error',
        message: error.message || 'Payment failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startPolling = (paymentRef) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${supabase.supabaseUrl}/functions/v1/mobile-money/status?payment_ref=${paymentRef}&user_id=${user.id}`,
          {
            headers: {
              'apikey': supabase.supabaseKey
            }
          }
        );

        const result = await response.json();

        if (response.ok && result.status) {
          if (result.status === 'paid') {
            setPaymentStatus({
              type: 'success',
              message: 'Payment completed successfully!',
              transaction: result
            });
            clearInterval(interval);
            setPollingInterval(null);
          } else if (result.status === 'failed' || result.status === 'cancelled') {
            setPaymentStatus({
              type: 'error',
              message: `Payment ${result.status}. Please try again.`
            });
            clearInterval(interval);
            setPollingInterval(null);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      setPollingInterval(null);
    }, 600000);
  };

  const handleOpenCheckout = () => {
    if (checkoutUri) {
      // Try to open the deep link
      window.open(checkoutUri, '_blank');
    }
  };

  const handleRetry = () => {
    setPaymentStatus(null);
    setPaymentRef(null);
    setCheckoutUri(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Success screen
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
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">{paymentStatus.message}</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between py-1">
                <span>Transaction ID:</span>
                <span className="font-mono text-xs">
                  {paymentStatus.transaction?.transaction_id || paymentRef}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Amount:</span>
                <span className="font-semibold">
                  ${paymentStatus.transaction?.amount || formData.amount}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Provider:</span>
                <span className="capitalize">
                  {paymentStatus.transaction?.provider || formData.provider}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/#/'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue to Dashboard
          </button>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('payment')}</h1>
          <p className="text-gray-600">Choose your preferred payment method</p>
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
              <input type="radio" name="paymentMethod" value="card" disabled className="text-blue-600" />
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

            {/* Status Display */}
            <AnimatePresence>
              {paymentStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg border ${
                    paymentStatus.type === 'error'
                      ? 'bg-red-50 border-red-200'
                      : paymentStatus.type === 'initiated'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <SafeIcon
                      icon={
                        paymentStatus.type === 'error'
                          ? FiAlertCircle
                          : paymentStatus.type === 'initiated'
                          ? FiLoader
                          : FiCheck
                      }
                      className={`w-5 h-5 mt-0.5 ${
                        paymentStatus.type === 'error'
                          ? 'text-red-500'
                          : paymentStatus.type === 'initiated'
                          ? 'text-blue-500 animate-spin'
                          : 'text-green-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          paymentStatus.type === 'error'
                            ? 'text-red-700'
                            : paymentStatus.type === 'initiated'
                            ? 'text-blue-700'
                            : 'text-green-700'
                        }`}
                      >
                        {paymentStatus.message}
                      </p>
                      {paymentStatus.payment_ref && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          Ref: {paymentStatus.payment_ref}
                        </p>
                      )}
                    </div>
                    {paymentStatus.type === 'error' && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="text-red-600 hover:text-red-700"
                      >
                        <SafeIcon icon={FiX} className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Checkout Button */}
                  {paymentStatus.type === 'initiated' && checkoutUri && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleOpenCheckout}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                        <span>Complete Payment on Mobile</span>
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Waiting for payment confirmation...
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            {!paymentStatus?.type === 'initiated' && (
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
            )}
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
              <span>Real-time payment confirmation</span>
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