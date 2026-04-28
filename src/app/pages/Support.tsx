import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, MessageCircle, Mail, Phone, Send, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Support() {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const supportOptions = [
    {
      title: 'Telegram Support',
      description: 'Chat with us on Telegram for instant support',
      icon: MessageCircle,
      action: 'Open Telegram',
      available: '24/7',
      color: '#0088cc',
      link: 'https://t.me/Customer_support24hours'
    },
    {
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      icon: Mail,
      action: 'Send Email',
      available: 'Business Hours',
      color: '#3b82f6',
      link: 'mailto:support@hotelreservation.com'
    },
    {
      title: 'Phone Support',
      description: 'Call us directly for immediate assistance',
      icon: Phone,
      action: 'Call Now',
      available: '9 AM - 6 PM EST',
      color: '#8b5cf6',
      link: 'tel:+1234567890'
    }
  ];

  const faqs = [
    {
      question: 'How do I make a hotel reservation?',
      answer: 'Browse our available properties, select your dates, and follow the booking process. Payment is secure and instant confirmation is provided.'
    },
    {
      question: 'Can I cancel or modify my reservation?',
      answer: 'Yes, you can cancel or modify your reservation up to 24 hours before check-in, subject to the hotel\'s cancellation policy.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, debit cards, PayPal, and various digital payment methods.'
    },
    {
      question: 'How do I withdraw my earnings?',
      answer: 'Go to the Withdraw section, select your preferred withdrawal method, and enter the amount. Processing takes 3-5 business days.'
    }
  ];

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    setSubject('');
    setMessage('');
  };

  const handleTelegramSupport = () => {
    // Open Telegram with the specified username
    window.open('https://t.me/Customer_support24hours', '_blank');
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/home" className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              SMH
            </Link>
            <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37]">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </nav>

        <div className="flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
              Support Request Sent!
            </h2>
            <p className="text-gray-600 mb-6">
              We've received your message and will respond within 24 hours.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: '#D4AF37' }}
            >
              Send Another Message
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/home" className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
            SMH
          </Link>
          <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37]">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
            Support Center
          </h1>
          <p className="text-gray-600">We're here to help you 24/7</p>
        </motion.div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {supportOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:bg-[#F4C444] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${option.color}20` }}
                >
                  <option.icon className="w-6 h-6" style={{ color: option.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.available}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{option.description}</p>
              <button 
                onClick={() => {
                  if (option.link) {
                    if (option.link.startsWith('tel:')) {
                      window.location.href = option.link;
                    } else {
                      window.open(option.link, '_blank');
                    }
                  }
                }}
                className="w-full py-2 rounded-lg font-medium border border-gray-300 hover:border-gray-400 transition-colors"
              >
                {option.action}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1a1a1a' }}>
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmitSupport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                  />
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#D4AF37' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1a1a1a' }}>
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <h3 className="font-medium mb-2" style={{ color: '#1a1a1a' }}>
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Response Time</span>
                </div>
                <p className="text-sm text-gray-600">
                  Email: Within 24 hours<br />
                  Telegram: Usually within minutes<br />
                  Phone: Immediate during business hours
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
