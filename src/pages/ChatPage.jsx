import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const {
  FiSend,
  FiBot,
  FiUser,
  FiArrowLeft,
  FiMoreVertical,
  FiSettings,
  FiKey,
  FiAlertTriangle,
  FiLoader,
  FiX
} = FiIcons;

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [openAiKey, setOpenAiKey] = useState(localStorage.getItem('oa_key') || '');
  const [packageContext, setPackageContext] = useState(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get package context from URL or state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const packageId = urlParams.get('packageId');
    
    if (packageId || location.state?.packageData) {
      setPackageContext(location.state?.packageData || { id: packageId });
    }
  }, [location]);

  // Initialize chat
  useEffect(() => {
    initializeChat();
  }, [location.state, packageContext]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    let welcomeMessage = {
      id: Date.now(),
      role: 'assistant',
      content: openAiKey 
        ? "Hello! I'm your EMIRAFRIK AI medical tourism assistant. How can I help you today?"
        : "Hello! I'm your EMIRAFRIK assistant. I'm currently in demo mode with static responses. Add your OpenAI key for enhanced AI responses.",
      timestamp: new Date(),
    };

    // Customize welcome based on context
    if (location.state?.fromInquiry) {
      const inquiryData = location.state.inquiryData;
      welcomeMessage.content = `Hello ${inquiryData.name}! I've received your inquiry about ${inquiryData.healthCondition}. Let me help you find the best treatment options in Dubai.`;
    } else if (packageContext) {
      welcomeMessage.content = `I see you're interested in our medical packages. Let me help you with detailed information and answer any questions you might have.`;
    }

    setMessages([welcomeMessage]);
    
    // Save welcome message to database
    if (user) {
      await saveChatMessage(welcomeMessage.role, welcomeMessage.content);
    }
  };

  const saveChatMessage = async (role, content) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          role: role,
          content: content,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error saving chat message:', error);
      }
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const createChatCompletion = async (userMessage) => {
    if (!openAiKey) return null;

    const systemPrompt = `You are EMIRAFRIK, a professional medical tourism concierge assistant specializing in Dubai healthcare services. You provide informative, helpful, and professional responses about medical treatments, travel arrangements, healthcare facilities, and tourism experiences in Dubai.

Key responsibilities:
- Help patients find suitable medical treatments and specialists in Dubai
- Provide information about medical packages, costs, and procedures
- Assist with travel arrangements, accommodation, and logistics
- Offer guidance on visa requirements and documentation
- Support patients throughout their medical tourism journey
- Maintain a caring, professional, and knowledgeable tone

Current conversation language: ${currentLanguage === 'ar' ? 'Arabic' : currentLanguage === 'fr' ? 'French' : 'English'}
${currentLanguage !== 'en' ? `Please respond in ${currentLanguage === 'ar' ? 'Arabic' : 'French'} when appropriate.` : ''}

${packageContext ? `
Current package context: ${JSON.stringify(packageContext)}
The user is inquiring about this specific medical package. Use this information to provide targeted assistance.
` : ''}

Provide helpful, accurate information while being empathetic to patients' medical and travel concerns.`;

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10).map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          max_tokens: 800,
          temperature: 0.7,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        return null;
      }
      console.error('OpenAI API Error:', error);
      throw error;
    }
  };

  const handleSendMessage = async (messageContent = null) => {
    const content = messageContent || inputMessage.trim();
    if (!content) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Save user message
    await saveChatMessage(userMessage.role, userMessage.content);

    try {
      if (openAiKey) {
        // Try OpenAI streaming
        setIsStreaming(true);
        const response = await createChatCompletion(content);
        
        if (response) {
          await handleStreamingResponse(response);
        } else {
          // Fallback to template
          await handleTemplateResponse(content);
        }
      } else {
        // Use template response
        await handleTemplateResponse(content);
      }
    } catch (error) {
      console.error('Chat error:', error);
      await handleTemplateResponse(content);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleStreamingResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    const botMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    // Add empty message that we'll update
    setMessages(prev => [...prev, botMessage]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              
              if (delta) {
                botMessage.content += delta;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === botMessage.id 
                      ? { ...msg, content: botMessage.content }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Save final message
      await saveChatMessage('assistant', botMessage.content);
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  };

  const handleTemplateResponse = async (userMessage) => {
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const botResponse = generateTemplateResponse(userMessage);
    const botMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: botResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    await saveChatMessage(botMessage.role, botMessage.content);
  };

  const generateTemplateResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('package') || message.includes('price') || message.includes('cost')) {
      return `🏥 **Medical Tourism Packages**

Our comprehensive packages include:
✓ Medical consultation & treatment
✓ Luxury accommodation in Dubai
✓ Airport transfers & transportation
✓ 24/7 medical support
✓ Tourism activities & city tours

**Popular packages:**
• Dental Care Package - Starting from $3,500
• Cosmetic Surgery - Starting from $8,500  
• Cardiology Assessment - Starting from $4,200
• Orthopedic Treatment - Starting from $6,800

Would you like detailed information about any specific treatment?`;
    }

    if (message.includes('visa') || message.includes('travel') || message.includes('document')) {
      return `📋 **Visa & Travel Support**

**Medical Visa Processing:**
• 30-day medical visa for UAE
• Express processing (3-5 days)
• Family member visas available
• Multiple entry options

**Required Documents:**
✓ Valid passport (6+ months)
✓ Medical reports/referrals
✓ Proof of accommodation
✓ Travel insurance

**Our Travel Services:**
• Flight booking assistance
• Airport pickup/dropoff
• Hotel reservations
• Local transportation

Need help with your visa application?`;
    }

    if (message.includes('hotel') || message.includes('accommodation') || message.includes('stay')) {
      return `🏨 **Premium Accommodation Partners**

**Medical District Hotels:**
• **Jumeirah Emirates Towers** - Near Dubai Hospital
• **Conrad Dubai** - Healthcare City proximity  
• **Marriott Al Jaddaf** - Medical facilities nearby
• **Four Seasons Resort** - Recovery & wellness focus

**Amenities for Medical Guests:**
✓ Medical guest services
✓ Healthy dining options
✓ Hospital transportation
✓ Wellness & spa facilities
✓ 24/7 concierge support

Shall I check availability for your treatment dates?`;
    }

    if (message.includes('doctor') || message.includes('specialist') || message.includes('physician')) {
      return `👨‍⚕️ **World-Class Medical Specialists**

**Our Partner Hospitals:**
• Dubai Hospital - Multi-specialty care
• Emirates Hospital - Advanced treatments
• American Hospital Dubai - International standards
• Mediclinic Dubai Mall - Comprehensive services

**Specialist Areas:**
🫀 Cardiology & Heart Surgery
🦴 Orthopedics & Joint Replacement
😁 Dental & Oral Surgery
👁️ Ophthalmology & Eye Care
🤱 Fertility & Reproductive Health
🎭 Cosmetic & Plastic Surgery

All our doctors are internationally certified with extensive experience. Would you like to connect with a specific specialist?`;
    }

    // Default response
    return `Hello! I'm here to help with your medical tourism needs in Dubai.

**I can assist you with:**
🏥 Medical treatments & specialists
💰 Package pricing & options
✈️ Visa & travel arrangements
🏨 Accommodation booking
📞 24/7 support services

What would you like to know more about?

${!openAiKey ? '\n💡 *Tip: Add your OpenAI API key in settings for personalized AI responses.*' : ''}`;
  };

  const saveOpenAiKey = (key) => {
    setOpenAiKey(key);
    if (key) {
      localStorage.setItem('oa_key', key);
    } else {
      localStorage.removeItem('oa_key');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Translucent Top Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">EMIRAFRIK Assistant</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${openAiKey ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className="text-xs text-gray-500">
                {openAiKey ? 'AI Enhanced' : 'Demo Mode'}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <SafeIcon icon={FiMoreVertical} className="w-5 h-5 text-gray-700" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[160px] z-50"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm flex items-center space-x-3"
                >
                  <SafeIcon icon={FiSettings} className="w-4 h-4 text-gray-500" />
                  <span>Settings</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {!openAiKey && (
        <motion.div
          className="bg-orange-50 border-b border-orange-200 px-4 py-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Demo mode - responses are static</p>
              <p className="text-xs text-orange-600">Add your OpenAI key for AI-powered responses</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
            >
              Add Key
            </button>
          </div>
        </motion.div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-br from-gray-600 to-gray-800'
                  }`}>
                    <SafeIcon 
                      icon={message.role === 'user' ? FiUser : FiBot} 
                      className="w-4 h-4 text-white" 
                    />
                  </div>
                  <div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed text-sm">
                        {message.content}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-right text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {(isTyping || isStreaming) && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start space-x-3 max-w-[80%]">
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
      </div>

      {/* Input Area - Sticky to bottom with safe area */}
      <div 
        className="bg-white border-t border-gray-200 px-4 py-4"
        style={{ 
          paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` 
        }}
      >
        <div className="max-w-4xl mx-auto">
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
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isStreaming}
              />
            </div>
            <motion.button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isStreaming}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: inputMessage.trim() && !isStreaming ? 1.05 : 1 }}
              whileTap={{ scale: inputMessage.trim() && !isStreaming ? 0.95 : 1 }}
            >
              {isStreaming ? (
                <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
              ) : (
                <SafeIcon icon={FiSend} className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
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
                  <SafeIcon icon={FiX} className="w-4 h-4" />
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      saveOpenAiKey('');
                      setShowSettings(false);
                    }}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;