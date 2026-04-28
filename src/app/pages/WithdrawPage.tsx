import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  Bitcoin, 
  Globe, 
  Smartphone, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle,
  Loader2,
  Target,
  Lock,
  Unlock,
  DollarSign,
  Euro,
  Plus,
  Minus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal';
  method: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'USDT';
  status: 'pending' | 'approved' | 'rejected';
  fee?: number;
}

interface WalletData {
  availableBalance: number;
  todayOrders: number;
  maxDailyOrders: number;
  tasksCompleted: boolean;
  pending: number;
  totalApproved: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  currencies: ('USD' | 'EUR' | 'USDT')[];
  type: 'card' | 'crypto' | 'wallet';
}

export function WithdrawPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const mode = searchParams.get('mode') || 'withdraw'; // 'deposit' or 'withdraw'
  
  // Wallet State with 25-order lock logic
  const [walletData, setWalletData] = useState<WalletData>({
    availableBalance: 2500.00,
    todayOrders: 0,
    maxDailyOrders: 25,
    tasksCompleted: false,
    pending: 0,
    totalApproved: 5000.00
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2024-01-15',
      type: 'deposit',
      method: 'Visa',
      amount: 1000,
      currency: 'USD',
      status: 'approved'
    },
    {
      id: '2',
      date: '2024-01-14',
      type: 'withdrawal',
      method: 'Trust Wallet',
      amount: 500,
      currency: 'USDT',
      status: 'pending',
      fee: 5
    }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD' as 'USD' | 'EUR' | 'USDT',
    method: 'Visa',
    address: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Payment methods (updated to remove Telebirr and CBE)
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'visa',
      name: 'Visa',
      icon: CreditCard,
      currencies: ['USD', 'EUR', 'USDT'],
      type: 'card'
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      icon: CreditCard,
      currencies: ['USD', 'EUR', 'USDT'],
      type: 'card'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: CreditCard,
      currencies: ['USD', 'EUR', 'USDT'],
      type: 'card'
    },
    {
      id: 'trust-wallet',
      name: 'Trust Wallet',
      icon: Smartphone,
      currencies: ['USDT', 'USD', 'EUR'],
      type: 'wallet'
    },
    {
      id: 'okx',
      name: 'OKX',
      icon: Globe,
      currencies: ['USDT', 'USD', 'EUR'],
      type: 'crypto'
    },
    {
      id: 'bybit',
      name: 'Bybit',
      icon: Globe,
      currencies: ['USDT', 'USD', 'EUR'],
      type: 'crypto'
    }
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', icon: DollarSign },
    { code: 'EUR', symbol: 'EUR', name: 'Euro', icon: Euro },
    { code: 'USDT', symbol: 'USDT', name: 'Tether', icon: Bitcoin }
  ];

  // Calculate withdrawal fee (1%)
  const calculateWithdrawalFee = (amount: number) => {
    return amount * 0.01; // 1% processing fee
  };

  // Check if user can withdraw (must have exactly 25 orders)
  const canWithdraw = walletData.todayOrders === walletData.maxDailyOrders;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'deposit',
      method: formData.method,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      status: 'pending'
    };

    setTransactions([newTransaction, ...transactions]);
    setWalletData(prev => ({
      ...prev,
      pending: prev.pending + parseFloat(formData.amount)
    }));

    setFormData({ amount: '', currency: 'USD', method: 'Visa', address: '' });
    setIsProcessing(false);
    showToastMessage('Deposit submitted successfully!', 'success');
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canWithdraw) {
      showToastMessage(`You must complete exactly ${walletData.maxDailyOrders} orders to withdraw`, 'error');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    if (!formData.address) {
      showToastMessage('Please enter your wallet address', 'error');
      return;
    }

    const amount = parseFloat(formData.amount);
    const fee = calculateWithdrawalFee(amount);
    const total = amount + fee;

    if (total > walletData.availableBalance) {
      const required = total - walletData.availableBalance;
      showToastMessage(`Insufficient balance. You need $${required.toFixed(2)} more to complete this withdrawal.`, 'error');
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'withdrawal',
      method: formData.method,
      amount: amount,
      currency: formData.currency,
      status: 'pending',
      fee: fee
    };

    setTransactions([newTransaction, ...transactions]);
    setWalletData(prev => ({
      ...prev,
      pending: prev.pending + total
    }));

    setFormData({ amount: '', currency: 'USD', method: 'Trust Wallet', address: '' });
    setIsProcessing(false);
    showToastMessage('Withdrawal submitted successfully!', 'success');
  };

  const simulateAdminApproval = () => {
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    if (pendingTransactions.length === 0) {
      showToastMessage('No pending transactions to approve', 'error');
      return;
    }

    const transactionToApprove = pendingTransactions[0];
    
    setTransactions(prev => prev.map(t => 
      t.id === transactionToApprove.id 
        ? { ...t, status: 'approved' as const }
        : t
    ));

    setWalletData(prev => {
      if (transactionToApprove.type === 'deposit') {
        return {
          ...prev,
          availableBalance: prev.availableBalance + transactionToApprove.amount,
          pending: prev.pending - transactionToApprove.amount,
          totalApproved: prev.totalApproved + transactionToApprove.amount
        };
      } else {
        const totalAmount = transactionToApprove.amount + (transactionToApprove.fee || 0);
        return {
          ...prev,
          availableBalance: prev.availableBalance - totalAmount,
          pending: prev.pending - totalAmount
        };
      }
    });

    showToastMessage('Transaction approved successfully!', 'success');
  };

  // Simulate order completion for testing
  const simulateOrderCompletion = () => {
    if (walletData.todayOrders < walletData.maxDailyOrders) {
      setWalletData(prev => ({
        ...prev,
        todayOrders: prev.todayOrders + 1,
        tasksCompleted: prev.todayOrders + 1 === prev.maxDailyOrders
      }));
      
      if (walletData.todayOrders + 1 === walletData.maxDailyOrders) {
        showToastMessage('Congratulations! You\'ve completed all 25 daily orders. Withdrawal is now unlocked!', 'success');
      }
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/wallet')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat' }}>
              {mode === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
              SMH Financial Center
            </span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* TOP: Wallet Dashboard - 4 Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {/* Available Balance */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Available</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ fontFamily: 'Inter', color: '#1a1a1a' }}>
              ${Number(walletData.availableBalance).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Current Balance</div>
          </div>

          {/* Today's Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Today's Orders</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ fontFamily: 'Inter', color: '#1a1a1a' }}>
              {walletData.todayOrders}/{walletData.maxDailyOrders}
            </div>
            <div className="text-sm text-gray-600">Daily Progress</div>
          </div>

          {/* Tasks Completed */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                {walletData.tasksCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Clock className="w-6 h-6 text-green-600" />
                )}
              </div>
              <span className="text-sm text-gray-500">Tasks Status</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ fontFamily: 'Inter', color: '#1a1a1a' }}>
              {walletData.tasksCompleted ? 'Complete' : 'In Progress'}
            </div>
            <div className="text-sm text-gray-600">
              {walletData.tasksCompleted ? 'Withdrawal Unlocked' : `${walletData.maxDailyOrders - walletData.todayOrders} remaining`}
            </div>
          </div>

          {/* Withdrawal Lock Status */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${canWithdraw ? 'bg-green-100' : 'bg-orange-100'}`}>
                {canWithdraw ? (
                  <Unlock className="w-6 h-6 text-green-600" />
                ) : (
                  <Lock className="w-6 h-6 text-orange-600" />
                )}
              </div>
              <span className="text-sm text-gray-500">Withdrawal</span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ fontFamily: 'Inter', color: '#1a1a1a' }}>
              {canWithdraw ? 'Unlocked' : 'Locked'}
            </div>
            <div className="text-sm text-gray-600">
              {canWithdraw ? 'Ready to Withdraw' : 'Complete 25 orders'}
            </div>
          </div>
        </motion.div>

        {/* MIDDLE: Daily Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat' }}>
                Daily Order Progress
              </span>
              <span className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>
                {walletData.todayOrders} of {walletData.maxDailyOrders} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(walletData.todayOrders / walletData.maxDailyOrders) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {!canWithdraw && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-sm font-medium text-orange-800" style={{ fontFamily: 'Montserrat' }}>
                      Withdrawal Locked
                    </div>
                    <div className="text-xs text-orange-600" style={{ fontFamily: 'Inter' }}>
                      Complete exactly {walletData.maxDailyOrders} orders to unlock withdrawals
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* BOTTOM: Deposit/Withdraw Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
              {mode === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </h2>
            
            {/* Lock Warning for Withdraw */}
            {mode === 'withdraw' && !canWithdraw && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-sm font-medium text-red-800" style={{ fontFamily: 'Montserrat' }}>
                      Withdrawal Locked
                    </div>
                    <div className="text-xs text-red-600" style={{ fontFamily: 'Inter' }}>
                      Complete your daily 25 orders to unlock this button.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <form onSubmit={mode === 'deposit' ? handleDeposit : handleWithdraw} className="space-y-8">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-500" style={{ fontFamily: 'Montserrat' }}>
                  Currency
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {currencies.map((currency) => {
                    const Icon = currency.icon;
                    return (
                      <motion.button
                        key={currency.code}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(prev => ({ ...prev, currency: currency.code as 'USD' | 'EUR' | 'USDT' }))}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          formData.currency === currency.code
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: formData.currency === currency.code ? '#3b82f6' : '#6b6b6b' }} />
                        <div className="text-lg font-semibold mb-1" style={{ fontFamily: 'Montserrat', color: formData.currency === currency.code ? '#3b82f6' : '#1a1a1a' }}>
                          {currency.symbol} {currency.code}
                        </div>
                        <div className="text-sm" style={{ fontFamily: 'Inter', color: formData.currency === currency.code ? '#3b82f6' : '#6b6b6b' }}>
                          {currency.name}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-500" style={{ fontFamily: 'Montserrat' }}>
                  Payment Method
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <motion.button
                        key={method.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(prev => ({ ...prev, method: method.name }))}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                          formData.method === method.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-8 h-8" style={{ color: formData.method === method.name ? '#3b82f6' : '#6b6b6b' }} />
                        <div className="text-base font-medium" style={{ fontFamily: 'Montserrat', color: formData.method === method.name ? '#3b82f6' : '#1a1a1a' }}>
                          {method.name}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Wallet Address (for withdraw) */}
              {mode === 'withdraw' && (
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-500" style={{ fontFamily: 'Montserrat' }}>
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your wallet address"
                    disabled={!canWithdraw}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-500" style={{ fontFamily: 'Montserrat' }}>
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-400" style={{ fontFamily: 'Montserrat' }}>
                    {currencies.find(c => c.code === formData.currency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter Deposit Amount"
                    disabled={mode === 'withdraw' && !canWithdraw}
                    className="w-full pl-12 pr-4 py-4 text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
                
                {/* Fee Calculation (for withdraw) */}
                {mode === 'withdraw' && formData.amount && parseFloat(formData.amount) > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600" style={{ fontFamily: 'Inter' }}>
                        Processing Fee (1%):
                      </span>
                      <span className="font-medium" style={{ fontFamily: 'Inter' }}>
                        {currencies.find(c => c.code === formData.currency)?.symbol}
                        {calculateWithdrawalFee(parseFloat(formData.amount)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium mt-1 pt-2 border-t border-gray-200">
                      <span>You will receive:</span>
                      <span className="text-green-600">
                        {currencies.find(c => c.code === formData.currency)?.symbol}
                        {(parseFloat(formData.amount) - calculateWithdrawalFee(parseFloat(formData.amount))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={mode === 'withdraw' && !canWithdraw}
                whileHover={{ scale: mode === 'withdraw' && !canWithdraw ? 1 : 1.02, y: mode === 'withdraw' && !canWithdraw ? 0 : -2 }}
                whileTap={{ scale: mode === 'withdraw' && !canWithdraw ? 1 : 0.98 }}
                className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  mode === 'withdraw' && !canWithdraw
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : mode === 'deposit'
                    ? 'text-black hover:shadow-lg'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                style={{ 
                  fontFamily: 'Montserrat',
                  backgroundColor: mode === 'deposit' ? '#F4C444' : undefined
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : mode === 'withdraw' ? (
                  canWithdraw ? (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Withdraw Funds
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Withdrawal Locked
                    </>
                  )
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Deposit Funds
                  </>
                )}
              </motion.button>

              {mode === 'withdraw' && !canWithdraw && (
                <div className="text-center text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                  Complete your daily 25 orders to unlock this button.
                </div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
              Transaction History
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat' }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat' }}>
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat' }}>
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat' }}>
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontFamily: 'Inter' }}>
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {transaction.type === 'deposit' ? (
                          <Plus className="w-4 h-4 text-green-600" />
                        ) : (
                          <Minus className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Inter' }}>
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontFamily: 'Inter' }}>
                      {transaction.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ fontFamily: 'Inter' }}>
                        {transaction.currency === 'USD' ? '$' : transaction.currency === 'EUR' ? 'EUR' : 'USDT'}{Number(transaction.amount).toFixed(2)}
                      </div>
                      {transaction.fee && (
                        <div className="text-xs text-gray-500">
                          Fee: {transaction.currency === 'USD' ? '$' : transaction.currency === 'EUR' ? 'EUR' : 'USDT'}{Number(transaction.fee).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="capitalize">{transaction.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Admin Simulation Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={simulateOrderCompletion}
          disabled={walletData.todayOrders >= walletData.maxDailyOrders}
          className="mt-8 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          style={{ fontFamily: 'Montserrat' }}
        >
          <Target className="w-4 h-4" />
          Simulate Order Completion (Test)
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={simulateAdminApproval}
          className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          style={{ fontFamily: 'Montserrat' }}
        >
          <CheckCircle className="w-4 h-4" />
          Approve Pending Transaction (Test)
        </motion.button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-lg z-50 ${
              toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`}
          >
            <div className="flex items-center gap-3">
              {toastType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span style={{ fontFamily: 'Inter' }}>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
