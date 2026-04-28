import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { CreditCard, Landmark, Smartphone, Globe, Bitcoin, ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, Copy, Check, Lock, Unlock, Target, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { walletApi, transactionsApi } from '../lib/api';

interface Transaction {
  id: number;
  date: string;
  type: 'deposit' | 'withdrawal';
  method: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'USDT' | 'ETH'>('USDT');

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Visa');

  // Copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Amount state
  const [amount, setAmount] = useState<string>('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

  // Transaction state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Load wallet data from backend
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const walletResponse = await walletApi.getSummary();
      if (walletResponse.success && walletResponse.wallet) {
        setWalletData({
          availableBalance: walletResponse.wallet.available_balance,
          todayOrders: walletResponse.todayOrders || 0,
          maxDailyOrders: walletResponse.wallet.max_daily_orders || 25,
          tasksCompleted: walletResponse.wallet.tasks_completed || false,
          pending: walletResponse.wallet.pending_amount || 0,
          totalApproved: walletResponse.wallet.total_approved || 0,
          isLocked: walletResponse.wallet.is_locked || false
        });
      }

      if (walletResponse.success && walletResponse.recentTransactions) {
        setTransactions(walletResponse.recentTransactions.map((t: any) => ({
          id: t.id,
          date: t.created_at,
          type: t.type,
          method: t.method,
          amount: t.amount,
          currency: t.currency,
          status: t.status
        })));
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', icon: CreditCard },
    { code: 'EUR', symbol: '€', name: 'Euro', icon: CreditCard },
    { code: 'USDT', symbol: '₮', name: 'Tether', icon: Bitcoin },
    { code: 'ETH', symbol: 'Ξ', name: 'Ethereum', icon: Globe }
  ];

  const paymentMethods = [
    { 
      name: 'Visa', 
      icon: CreditCard,
      currency: 'USD'
    },
    { 
      name: 'Mastercard', 
      icon: CreditCard,
      currency: 'USD'
    },
    { 
      name: 'Trust Wallet - USDT (TRC20)', 
      icon: Smartphone,
      accountName: 'Hotel Reservation',
      address: 'TNXpjoH6kNCSHAWw5VC8vn6tbXt9Fp1L9q',
      accountID: 'TW-84736291',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    },
    { 
      name: 'KuCoin - USDT (TRC20)', 
      icon: Globe,
      accountName: 'Hotel Reservation',
      address: 'TQgo9MgiztoPYdAdEeRiM5YLoX76ATbvN2',
      accountID: 'KC-28473956',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    },
    { 
      name: 'MEXC - USDT (TRC20)', 
      icon: Globe,
      accountName: 'Hotel Reservation',
      address: 'TH7v2jXYSeJNRkzzECEQugdTzVReffDSHC',
      accountID: 'MX-39485721',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    },
    { 
      name: 'Bitget - USDT (TRC20)', 
      icon: Globe,
      accountName: 'Hotel Reservation',
      address: 'TBvixNUGPmZt1rLgyP3fEwZCyepzSH3eDP',
      accountID: 'BG-58273914',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    },
    { 
      name: 'OKX - USDT (TRC20)', 
      icon: Globe,
      accountName: 'Hotel Reservation',
      address: 'TB8YStZmVMQWLfwLJzMvRYk7MfHQXGn7cX',
      accountID: 'OKX-62839471',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    },
  ];

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      showToastMessage('Please enter a valid deposit amount', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // Get payment method details
      const paymentMethod = paymentMethods.find(pm => pm.name === selectedPaymentMethod);
      
      const depositData = {
        amount: parseFloat(amount),
        currency: selectedCurrency,
        method: selectedPaymentMethod,
        address: paymentMethod?.address,
        network: paymentMethod?.network
      };

      const response = await walletApi.createDeposit(depositData);

      if (response.success) {
        showToastMessage(`Successfully created deposit request for ${selectedCurrency} ${amount} via ${selectedPaymentMethod}`, 'success');
        setAmount('');
        setSelectedCurrency('USD');
        setSelectedPaymentMethod('Visa');
        
        // Reload wallet data
        await loadWalletData();
      } else {
        showToastMessage(response.message || 'Deposit failed', 'error');
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Deposit failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
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
              onClick={() => navigate('/home')}
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

      {/* Wallet Data Cards */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
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
      </div>

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          {/* Payment Method Details - Only for crypto methods */}
          {selectedPaymentMethod && paymentMethods.find(m => m.name === selectedPaymentMethod)?.address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-white rounded-2xl border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                Payment Details - {selectedPaymentMethod}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block" style={{ fontFamily: 'Inter' }}>
                    Address / Wallet Address
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={paymentMethods.find(m => m.name === selectedPaymentMethod)?.address || ''}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                      style={{ fontFamily: 'Inter' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentMethods.find(m => m.name === selectedPaymentMethod)?.address || '', 'address')}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      {copiedField === 'address' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
                {paymentMethods.find(m => m.name === selectedPaymentMethod)?.network && (
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block" style={{ fontFamily: 'Inter' }}>
                      Network
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={paymentMethods.find(m => m.name === selectedPaymentMethod)?.network || ''}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                        style={{ fontFamily: 'Inter' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentMethods.find(m => m.name === selectedPaymentMethod)?.network || '', 'network')}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        {copiedField === 'network' ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

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

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-2xl border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                Transaction History
              </h3>
            </div>
            <div className="p-6">
              {/* Filter Buttons */}
              <div className="flex gap-2 mb-4">
                {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTransactionFilter(filter as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      transactionFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{ fontFamily: 'Inter' }}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {transactions
                  .filter(t => transactionFilter === 'all' || t.status === transactionFilter)
                  .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-green-100`}>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                          Deposit - {transaction.method}
                        </div>
                        <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                          {transaction.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600" style={{ fontFamily: 'Montserrat' }}>
                        +{transaction.currency === 'USD' ? '$' : ''}{Number(transaction.amount).toFixed(2)}
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span style={{ fontFamily: 'Inter' }}>{transaction.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {transactions.filter(t => transactionFilter === 'all' || t.status === transactionFilter).length === 0 && (
                  <div className="text-center py-8 text-gray-500" style={{ fontFamily: 'Inter' }}>
                    {transactionFilter === 'all' ? 'No transactions yet' : `No ${transactionFilter} transactions`}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
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
