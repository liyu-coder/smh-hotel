import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Smartphone, Globe, Bitcoin, AlertCircle, Check, Copy, Lock, Unlock, Target, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { walletApi } from '../lib/api';

export function Withdraw() {
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'USDT' | 'ETH'>('USDT');
  const [selectedMethod, setSelectedMethod] = useState('Visa');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wallet Data State
  const [walletData, setWalletData] = useState({
    availableBalance: 0,
    todayOrders: 0,
    maxDailyOrders: 25,
    tasksCompleted: false,
    pending: 0,
    totalApproved: 0,
    isLocked: false
  });

  // Recent withdrawals state
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);

  // Load wallet data from backend
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const response = await walletApi.getSummary();
      if (response.success && response.wallet) {
        setWalletData({
          availableBalance: response.wallet.available_balance,
          todayOrders: response.todayOrders || 0,
          maxDailyOrders: response.wallet.max_daily_orders || 25,
          tasksCompleted: response.wallet.tasks_completed || false,
          pending: response.wallet.pending_amount || 0,
          totalApproved: response.wallet.total_approved || 0,
          isLocked: response.wallet.is_locked || false
        });
      }

      if (response.success && response.recentTransactions) {
        setRecentWithdrawals(
          response.recentTransactions
            .filter((t: any) => t.type === 'withdrawal')
            .map((t: any) => ({
              id: t.id,
              amount: t.amount,
              method: t.method,
              status: t.status,
              date: t.created_at
            }))
        );
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  const currencies = [
    { code: 'USD' as const, symbol: '$', name: 'US Dollar', icon: CreditCard },
    { code: 'EUR' as const, symbol: '€', name: 'Euro', icon: CreditCard },
    { code: 'USDT' as const, symbol: '₮', name: 'Tether', icon: Bitcoin },
    { code: 'ETH' as const, symbol: 'Ξ', name: 'Ethereum', icon: Globe }
  ];

  const withdrawalMethods = [
    { 
      id: 'visa', 
      name: 'Visa', 
      icon: CreditCard, 
      fee: '2%', 
      time: '3-5 business days'
    },
    { 
      id: 'mastercard', 
      name: 'Mastercard', 
      icon: CreditCard, 
      fee: '2%', 
      time: '3-5 business days'
    },
    { 
      id: 'trustwallet', 
      name: 'Trust Wallet - USDT (TRC20)', 
      icon: Smartphone, 
      fee: '0.5%', 
      time: '1-2 hours',
      network: 'Tron (TRC20)'
    },
    { 
      id: 'kucoin', 
      name: 'KuCoin - USDT (TRC20)', 
      icon: Globe, 
      fee: '0.5%', 
      time: '1-2 hours',
      network: 'Tron (TRC20)'
    },
    { 
      id: 'mexc', 
      name: 'MEXC - USDT (TRC20)', 
      icon: Globe, 
      fee: '0.5%', 
      time: '1-2 hours',
      network: 'Tron (TRC20)'
    },
    { 
      id: 'bitget', 
      name: 'Bitget - USDT (TRC20)', 
      icon: Globe, 
      fee: '0.5%', 
      time: '1-2 hours',
      network: 'Tron (TRC20)'
    },
    { 
      id: 'okx', 
      name: 'OKX - USDT (TRC20)', 
      icon: Globe, 
      fee: '0.5%', 
      time: '1-2 hours',
      network: 'Tron (TRC20)'
    }
  ];

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) < 10) {
      alert(`Minimum withdrawal amount is 10 ${selectedCurrency}`);
      return;
    }

    // Only require address for crypto methods
    const selectedMethodObj = withdrawalMethods.find(m => m.name === selectedMethod);
    if (selectedMethodObj?.network && (!withdrawalAddress || withdrawalAddress.trim() === '')) {
      alert('Please enter your withdrawal address');
      return;
    }

    if (parseFloat(amount) > walletData.availableBalance) {
      alert('Insufficient balance');
      return;
    }

    setIsProcessing(true);

    try {
      const withdrawalData = {
        amount: parseFloat(amount),
        currency: selectedCurrency,
        method: selectedMethod,
        address: selectedMethodObj?.network ? withdrawalAddress : undefined,
        network: selectedMethodObj?.network
      };

      const response = await walletApi.createWithdrawal(withdrawalData);

      if (response.success) {
        setShowSuccess(true);
        setAmount('');
        setWithdrawalAddress('');
        
        // Reload wallet data
        await loadWalletData();
      } else {
        alert(response.message || 'Withdrawal failed');
      }
    } catch (error: any) {
      alert(error.message || 'Withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
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
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
              Withdrawal Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your withdrawal request has been processed successfully.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: '#D4AF37' }}
            >
              Make Another Withdrawal
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
            Withdraw Funds
          </h1>
          <p className="text-gray-600">Withdraw your earnings securely and quickly</p>
        </motion.div>

        {/* Wallet Data Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm text-gray-600">Balance</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              ${Number(walletData.availableBalance).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm text-gray-600">Today Orders</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              {walletData.todayOrders}/{walletData.maxDailyOrders}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Task Status</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: walletData.tasksCompleted ? '#10b981' : '#f59e0b' }}>
              {walletData.tasksCompleted ? 'Done' : 'Pending'}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              {walletData.isLocked ? <Lock className="w-5 h-5 text-red-600" /> : <Unlock className="w-5 h-5 text-green-600" />}
              <span className="text-sm text-gray-600">Status</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: walletData.isLocked ? '#ef4444' : '#10b981' }}>
              {walletData.isLocked ? 'Locked' : 'Active'}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1a1a1a' }}>
                Withdrawal Details
              </h2>

              {/* Currency Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Currency
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {currencies.map((currency) => {
                    const Icon = currency.icon;
                    return (
                      <motion.button
                        key={currency.code}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCurrency(currency.code)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedCurrency === currency.code
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" style={{ 
                          color: selectedCurrency === currency.code ? '#D4AF37' : '#6b6b6b' 
                        }} />
                        <div className="text-lg font-bold" style={{ 
                          color: selectedCurrency === currency.code ? '#D4AF37' : '#1a1a1a'
                        }}>
                          {currency.symbol}
                        </div>
                        <div className="text-xs" style={{ 
                          color: selectedCurrency === currency.code ? '#D4AF37' : '#6b6b6b'
                        }}>
                          {currency.name}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({selectedCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                    {currencies.find(c => c.code === selectedCurrency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    min="10"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Minimum withdrawal: 10 {selectedCurrency}</p>
              </div>

              {/* Withdrawal Methods */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {withdrawalMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMethod(method.name)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedMethod === method.name
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <method.icon className="w-6 h-6" style={{ 
                        color: selectedMethod === method.name ? '#ffffff' : '#6b6b6b' 
                      }} />
                      <div className="text-xs font-medium text-center" style={{ 
                        fontFamily: 'Montserrat',
                        color: selectedMethod === method.name ? '#ffffff' : '#1a1a1a'
                      }}>
                        {method.name}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Withdrawal Address Input - Only for crypto methods */}
              {withdrawalMethods.find(m => m.name === selectedMethod)?.network && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Address
                  </label>
                  <input
                    type="text"
                    value={withdrawalAddress}
                    onChange={(e) => setWithdrawalAddress(e.target.value)}
                    placeholder={`Enter your ${selectedMethod} address`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Network: {withdrawalMethods.find(m => m.name === selectedMethod)?.network || 'Tron (TRC20)'}
                  </p>
                </div>
              )}

              {/* Summary */}
              {amount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Withdrawal Amount:</span>
                    <span className="font-medium">{currencies.find(c => c.code === selectedCurrency)?.symbol}{amount}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-medium">
                      {currencies.find(c => c.code === selectedCurrency)?.symbol}{(parseFloat(amount) * 0.005).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>You'll Receive:</span>
                    <span style={{ color: '#D4AF37' }}>
                      {currencies.find(c => c.code === selectedCurrency)?.symbol}{(parseFloat(amount) * 0.995).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWithdraw}
                disabled={isProcessing || !amount || Boolean(withdrawalMethods.find(m => m.name === selectedMethod)?.network && !withdrawalAddress)}
                className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#D4AF37' }}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Withdraw Funds'
                )}
              </motion.button>

              {/* Alert */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Security Notice:</p>
                  <p>All withdrawals are processed securely and may take 24-48 hours for verification.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Withdrawals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1a1a1a' }}>
                Recent Withdrawals
              </h3>
              <div className="space-y-3">
                {recentWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{withdrawal.amount} {withdrawal.method.includes('USDT') ? 'USDT' : withdrawal.method.includes('ETH') ? 'ETH' : '$'}</p>
                        <p className="text-sm text-gray-500">{withdrawal.method}</p>
                        <p className="text-xs text-gray-400">{withdrawal.date}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          withdrawal.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Balance Info */}
              <div className="mt-6 p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                  ${Number(walletData.availableBalance).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
