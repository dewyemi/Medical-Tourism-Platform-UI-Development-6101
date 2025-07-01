import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiSend, FiBot, FiUser, FiPackage, FiDollarSign, FiCalendar, FiMapPin, FiSettings, FiKey } = FiIcons;

const ChatPage = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [packages, setPackages] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [openAiKey, setOpenAiKey] = useState(localStorage.getItem('openai_key') || '');
  const messagesEndRef = useRef(null);

  const predefinedQuestions = [
    "What treatments are available?",
    "Show me package prices",
    "Help with visa process",
    "Hotel recommendations"
  ];

  // Fetch packages from Supabase
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('price_usd', { ascending: true });

        if (error) throw error;
        setPackages(data || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    // Initialize chat
    if (location.state?.fromInquiry) {
      const inquiryData = location.state.inquiryData;
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Hello ${inquiryData.name}! I've received your inquiry about ${inquiryData.healthCondition}. Let me help you find the best treatment options in Dubai.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } else {
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: openAiKey 
          ? "Hello! I'm your EMIRAFRIK AI assistant with OpenAI integration. How can I help you today?"
          : "Hello! I'm your EMIRAFRIK medical tourism assistant. For enhanced responses, please add your OpenAI key in settings. How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [location.state, openAiKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save OpenAI key to localStorage
  const saveOpenAiKey = (key) => {
    setOpenAiKey(key);
    if (key) {
      localStorage.setItem('openai_key', key);
    } else {
      localStorage.removeItem('openai_key');
    }
  };

  // Call OpenAI API for real responses
  const getOpenAiResponse = async (message) => {
    if (!openAiKey) return null;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful medical tourism assistant for EMIRAFRIK, specializing in Dubai healthcare services. Provide informative, professional responses about medical treatments, travel arrangements, and healthcare facilities in Dubai.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('OpenAI API error');

      const data = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return null;
    }
  };

  const handleSendMessage = async (messageContent = null) => {
    const content = messageContent || inputMessage.trim();
    if (!content) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Try OpenAI first, fallback to template response
    let botResponse;
    if (openAiKey) {
      botResponse = await getOpenAiResponse(content);
    }

    if (!botResponse) {
      botResponse = generateBotResponse(content);
    }

    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        packages: content.toLowerCase().includes('package') ? packages.slice(0, 3) : null
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, openAiKey ? 2000 : 1500);
  };

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes('package') || message.includes('price')) {
      return "Here are our most popular medical tourism packages:\n\nEach package includes:\n✓ Medical consultation & treatment\n✓ Luxury accommodation\n✓ Airport transfers\n✓ 24/7 support\n✓ Tourism activities\n\nWould you like detailed information about any specific package?";
    }

    if (message.includes('visa') || message.includes('travel')) {
      return "🛂 **Visa & Travel Support:**\n\n📋 **Medical Visa Processing:**\n• 30-day medical visa\n• Express processing (3-5 days)\n• Family member visas available\n\n✈️ **Travel Arrangements:**\n• Flight booking assistance\n• Airport pickup/dropoff\n• Travel insurance\n\n📱 **Required Documents:**\n• Passport (6+ months validity)\n• Medical reports\n• Proof of accommodation\n\nNeed help starting your visa application?";
    }

    if (message.includes('hotel') || message.includes('accommodation')) {
      return "🏨 **Premium Hotel Partners:**\n\n• **Jumeirah Emirates Towers** - Near Dubai Hospital\n• **Conrad Dubai** - Healthcare City proximity\n• **Marriott Al Jaddaf** - Medical district\n• **Four Seasons Resort** - Recovery & relaxation\n\nAll hotels offer:\n✓ Medical guest services\n✓ Healthy dining options\n✓ Hospital transportation\n✓ Wellness facilities\n\nShall I check availability for your dates?";
    }

    return "I'm here to help with your medical tourism needs! I can assist with:\n\n🏥 Treatment packages & specialists\n💰 Pricing & payment options\n🏨 Accommodation booking\n✈️ Visa & travel support\n📞 24/7 assistance\n\nWhat would you like to know more about?";
  };

  const PackageCard = ({ pkg }) => (
    <motion.div
      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100 mb-3 min-w-[280px] max-w-[300px]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-bold text-gray-900 text-sm leading-tight">
          {pkg.title}
        </h4>
        <SafeIcon icon={FiPackage} className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiDollarSign} className="w-3 h-3 text-green-600" />
          <span className="font-semibold text-green-700">
            ${pkg.price_usd?.toLocaleString() || 'N/A'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiCalendar} className="w-3 h-3 text-blue-600" />
          <span>{pkg.duration_days} days</span>
        </div>
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiMapPin} className="w-3 h-3 text-red-500" />
          <span className="capitalize">{pkg.treatment_type}</span>
        </div>
      </div>

      <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
        Get Details
      </button>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Chat Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <SafeIcon icon={FiKey} className="inline w-4 h-4 mr-2 text-blue-500" />
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={openAiKey}
                    onChange={(e) => setOpenAiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add your OpenAI key for enhanced AI responses
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      saveOpenAiKey(openAiKey);
                      setShowSettings(false);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      saveOpenAiKey('');
                      setShowSettings(false);
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Settings - Compact */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between mt-16">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${openAiKey ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {openAiKey ? 'AI Enhanced' : 'Template Mode'}
          </span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <SafeIcon icon={FiSettings} className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Quick Questions - Mobile Optimized */}
      {messages.length <= 1 && (
        <motion.div
          className="p-4 bg-white border-b border-gray-100"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-gray-600 mb-3 font-medium">Quick questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {predefinedQuestions.map((question, index) => (
              <motion.button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {question}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages Container - Fixed height calculation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}>
                  <SafeIcon icon={message.type === 'user' ? FiUser : FiBot} className="w-4 h-4 text-white" />
                </div>

                <div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                  }`}>
                    <p className="whitespace-pre-line leading-relaxed text-sm">
                      {message.content}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Package Cards */}
                  {message.packages && message.packages.length > 0 && (
                    <div className="mt-3">
                      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        {message.packages.map((pkg) => (
                          <PackageCard key={pkg.id} pkg={pkg} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start space-x-3 max-w-[85%]">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiBot} className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                  <div className="flex space-x-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <motion.div
        className="bg-white border-t border-gray-200 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '96px' }}
            />
          </div>
          <motion.button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: inputMessage.trim() ? 1.05 : 1 }}
            whileTap={{ scale: inputMessage.trim() ? 0.95 : 1 }}
          >
            <SafeIcon icon={FiSend} className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPage;