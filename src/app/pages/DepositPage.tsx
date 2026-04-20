import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { CreditCard, Landmark, Smartphone, Globe, Bitcoin, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function DepositPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'USDT'>('USD');

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Visa');

  // Amount state
  const [amount, setAmount] = useState<string>('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', icon: CreditCard },
    { code: 'EUR', symbol: '€', name: 'Euro', icon: CreditCard },
    { code: 'USDT', symbol: '₮', name: 'Tether', icon: Bitcoin }
  ];

  const paymentMethods = [
    { name: 'Visa', icon: CreditCard },
    { name: 'Mastercard', icon: CreditCard },
    { name: 'Stripe', icon: Landmark },
    { name: 'Trust Wallet', icon: Smartphone },
    { name: 'OKX', icon: Globe },
    { name: 'Bybit', icon: Globe }
  ];

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      showToastMessage('Please enter a valid deposit amount', 'error');
      return;
    }

    setIsProcessing(true);

    // Simulate deposit processing
    setTimeout(() => {
      setIsProcessing(false);
      showToastMessage(`Successfully deposited ${selectedCurrency} ${amount} via ${selectedPaymentMethod}`, 'success');
      setAmount('');
      setSelectedCurrency('USD');
      setSelectedPaymentMethod('Visa');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/wallet')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
              Deposit Funds
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
              Welcome, {user?.name}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Currency Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Montserrat', color: '#6b6b6b' }}>
              Currency
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currencies.map((currency) => {
                const Icon = currency.icon;
                return (
                  <motion.button
                    key={currency.code}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCurrency(currency.code as any)}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      selectedCurrency === currency.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-3" style={{ 
                      color: selectedCurrency === currency.code ? '#3b82f6' : '#6b6b6b' 
                    }} />
                    <div className="text-2xl font-bold mb-1" style={{ 
                      fontFamily: 'Montserrat',
                      color: selectedCurrency === currency.code ? '#3b82f6' : '#1a1a1a'
                    }}>
                      {currency.symbol}
                    </div>
                    <div className="text-sm" style={{ 
                      fontFamily: 'Inter',
                      color: selectedCurrency === currency.code ? '#3b82f6' : '#6b6b6b'
                    }}>
                      {currency.name}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Montserrat', color: '#6b6b6b' }}>
              Payment Method
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <motion.button
                    key={method.name}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPaymentMethod(method.name)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedPaymentMethod === method.name
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" style={{ 
                      color: selectedPaymentMethod === method.name ? '#ffffff' : '#6b6b6b' 
                    }} />
                    <div className="text-xs font-medium" style={{ 
                      fontFamily: 'Montserrat',
                      color: selectedPaymentMethod === method.name ? '#ffffff' : '#1a1a1a'
                    }}>
                      {method.name}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Montserrat', color: '#6b6b6b' }}>
              Deposit Amount
            </h2>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400" style={{ fontFamily: 'Montserrat' }}>
                {currencies.find(c => c.code === selectedCurrency)?.symbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Deposit Amount"
                className="w-full pl-16 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                style={{ fontFamily: 'Montserrat' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeposit}
            disabled={isProcessing}
            className="w-full py-5 rounded-2xl font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{ 
              backgroundColor: '#F4C444',
              fontFamily: 'Montserrat',
              fontSize: '1.125rem'
            }}
          >
            {isProcessing ? (
              <>
                <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                Processing Deposit...
              </>
            ) : (
              <>
                Confirm Deposit
              </>
            )}
          </motion.button>

          {/* Summary */}
          <div className="mt-6 p-6 bg-white rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
              Deposit Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600" style={{ fontFamily: 'Inter' }}>Currency</span>
                <span className="font-medium" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                  {selectedCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600" style={{ fontFamily: 'Inter' }}>Payment Method</span>
                <span className="font-medium" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                  {selectedPaymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600" style={{ fontFamily: 'Inter' }}>Amount</span>
                <span className="font-medium" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                  {amount ? `${currencies.find(c => c.code === selectedCurrency)?.symbol}${amount}` : '-'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 ${
            toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <CheckCircle className="w-5 h-5 text-white" />
          )}
          <span className="text-white font-medium" style={{ fontFamily: 'Inter' }}>
            {toastMessage}
          </span>
        </motion.div>
      )}
    </div>
  );
}
