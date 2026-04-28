import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  CreditCard, 
  Smartphone, 
  Globe, 
  Bitcoin, 
  DollarSign, 
  Euro,
  Plus,
  Minus,
  Lock,
  Unlock,
  Target,
  Calendar
} from 'lucide-react';

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

export function AdvancedWallet() {
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

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositData, setDepositData] = useState({
    amount: '',
    currency: 'USD' as 'USD' | 'EUR' | 'USDT',
    method: 'Visa'
  });

  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    currency: 'USD' as 'USD' | 'EUR' | 'USDT',
    method: 'Trust Wallet',
    address: ''
  });

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

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!depositData.amount || parseFloat(depositData.amount) <= 0) {
      showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'deposit',
      method: depositData.method,
      amount: parseFloat(depositData.amount),
      currency: depositData.currency,
      status: 'pending'
    };

    setTransactions([newTransaction, ...transactions]);
    setWalletData(prev => ({
      ...prev,
      pending: prev.pending + parseFloat(depositData.amount)
    }));

    setDepositData({ amount: '', currency: 'USD', method: 'Visa' });
    showToastMessage('Deposit submitted successfully!', 'success');
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canWithdraw) {
      showToastMessage(`You must complete exactly ${walletData.maxDailyOrders} orders to withdraw`, 'error');
      return;
    }

    if (!withdrawData.amount || parseFloat(withdrawData.amount) <= 0) {
      showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    if (!withdrawData.address) {
      showToastMessage('Please enter your wallet address', 'error');
      return;
    }

    const amount = parseFloat(withdrawData.amount);
    const fee = calculateWithdrawalFee(amount);
    const total = amount + fee;

    if (total > walletData.availableBalance) {
      const required = total - walletData.availableBalance;
      showToastMessage(`Insufficient balance. You need $${required.toFixed(2)} more to complete this withdrawal.`, 'error');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'withdrawal',
      method: withdrawData.method,
      amount: amount,
      currency: withdrawData.currency,
      status: 'pending',
      fee: fee
    };

    setTransactions([newTransaction, ...transactions]);
    setWalletData(prev => ({
      ...prev,
      pending: prev.pending + total
    }));

    setWithdrawData({ amount: '', currency: 'USD', method: 'Trust Wallet', address: '' });
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

  // Simulate order completion
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
          SMH Global Wallet
        </h1>
        <p className="text-gray-600" style={{ fontFamily: 'Inter' }}>
          Advanced Financial System with 25-Order Lock
        </p>
      </div>

      {/* Wallet Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Available Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Available</span>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ fontFamily: 'Inter', color: '#1a1a1a' }}>
            ${walletData.availableBalance.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Current Balance</div>
        </motion.div>

        {/* Today's Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
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
        </motion.div>

        {/* Tasks Completed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
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
        </motion.div>

        {/* Withdrawal Lock Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              {canWithdraw ? (
                <Unlock className="w-6 h-6 text-orange-600" />
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
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat' }}>
              Daily Order Progress
            </span>
            <span className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>
              {walletData.todayOrders} of {walletData.maxDailyOrders} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(walletData.todayOrders / walletData.maxDailyOrders) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-4">
        <button
          onClick={simulateOrderCompletion}
          disabled={walletData.todayOrders >= walletData.maxDailyOrders}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          style={{ fontFamily: 'Montserrat' }}
        >
          <Plus className="w-4 h-4" />
          Simulate Order Completion
        </button>
        
        <button
          onClick={simulateAdminApproval}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          style={{ fontFamily: 'Montserrat' }}
        >
          <CheckCircle className="w-4 h-4" />
          Approve Pending Transaction
        </button>
      </div>

      {/* Deposit/Withdraw Forms */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Deposit Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
              Deposit Funds
            </h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleDeposit} className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                  Currency
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {currencies.map((currency) => {
                    const Icon = currency.icon;
                    return (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => setDepositData(prev => ({ ...prev, currency: currency.code as 'USD' | 'EUR' | 'USDT' }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          depositData.currency === currency.code
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{currency.code}</div>
                        <div className="text-xs text-gray-500">{currency.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setDepositData(prev => ({ ...prev, method: method.name }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          depositData.method === method.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{method.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {currencies.find(c => c.code === depositData.currency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={depositData.amount}
                    onChange={(e) => setDepositData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                style={{ fontFamily: 'Montserrat' }}
              >
                Deposit Funds
              </button>
            </form>
          </div>
        </motion.div>

        {/* Withdraw Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
              Withdraw Funds
            </h2>
            
            {/* Lock Warning */}
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
          
          <div className="p-6">
            <form onSubmit={handleWithdraw} className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                  Currency
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {currencies.map((currency) => {
                    const Icon = currency.icon;
                    return (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => setWithdrawData(prev => ({ ...prev, currency: currency.code as 'USD' | 'EUR' | 'USDT' }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          withdrawData.currency === currency.code
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{currency.code}</div>
                        <div className="text-xs text-gray-500">{currency.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setWithdrawData(prev => ({ ...prev, method: method.name }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          withdrawData.method === method.name
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{method.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={withdrawData.address}
                  onChange={(e) => setWithdrawData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your wallet address"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {currencies.find(c => c.code === withdrawData.currency)?.symbol}
                  </span>
                  <input
                    type="number"
                    value={withdrawData.amount}
                    onChange={(e) => setWithdrawData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    disabled={!canWithdraw}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
                
                {/* Fee Calculation */}
                {withdrawData.amount && parseFloat(withdrawData.amount) > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600" style={{ fontFamily: 'Inter' }}>
                        Processing Fee (1%):
                      </span>
                      <span className="font-medium" style={{ fontFamily: 'Inter' }}>
                        {currencies.find(c => c.code === withdrawData.currency)?.symbol}
                        {calculateWithdrawalFee(parseFloat(withdrawData.amount)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium mt-1 pt-2 border-t border-gray-200">
                      <span>You will receive:</span>
                      <span className="text-green-600">
                        {currencies.find(c => c.code === withdrawData.currency)?.symbol}
                        {(parseFloat(withdrawData.amount) - calculateWithdrawalFee(parseFloat(withdrawData.amount))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!canWithdraw}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                style={{ fontFamily: 'Montserrat' }}
              >
                {canWithdraw ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Withdraw Funds
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Withdrawal Locked
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
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
                        {transaction.currency === 'USD' ? '$' : transaction.currency === 'EUR' ? 'EUR' : 'USDT'}{transaction.amount.toFixed(2)}
                      </div>
                      {transaction.fee && (
                        <div className="text-xs text-gray-500">
                          Fee: {transaction.currency === 'USD' ? '$' : transaction.currency === 'EUR' ? 'EUR' : 'USDT'}{transaction.fee.toFixed(2)}
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
