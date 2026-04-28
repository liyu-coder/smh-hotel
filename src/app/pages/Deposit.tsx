import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, DollarSign, CheckCircle, Globe, Smartphone, Copy } from 'lucide-react';
import { ResponsiveNav } from '../components/ResponsiveNav';
import { walletApi } from '../lib/api';

const paymentMethods = [
  {
    id: 'trust',
    name: 'Trust Wallet - USDT (TRC20)',
    icon: Smartphone,
    address: 'TNXpjoH6kNCSHAWw5VC8vn6tbXt9Fp1L9q',
    network: 'Tron (TRC20)'
  },
  {
    id: 'kucoin',
    name: 'KuCoin - USDT (TRC20)',
    icon: Globe,
    address: 'TQgo9MgiztoPYdAdEeRiM5YLoX76ATbvN2',
    network: 'Tron (TRC20)'
  },
  {
    id: 'mexc',
    name: 'MEXC - USDT (TRC20)',
    icon: Globe,
    address: 'TH7v2jXYSeJNRkzzECEQugdTzVReffDSHC',
    network: 'Tron (TRC20)'
  },
  {
    id: 'bitget',
    name: 'Bitget - USDT (TRC20)',
    icon: Globe,
    address: 'TBvixNUGPmZt1rLgyP3fEwZCyepzSH3eDP',
    network: 'Tron (TRC20)'
  },
  {
    id: 'okx',
    name: 'OKX - USDT (TRC20)',
    icon: Globe,
    address: 'TB8YStZmVMQWLfwLJzMvRYk7MfHQXGn7cX',
    network: 'Tron (TRC20)'
  }
];

export function Deposit() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedMethod = paymentMethods.find(m => m.id === selectedPayment) || paymentMethods[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use walletApi to create deposit
      const response = await walletApi.createDeposit({
        amount: parseFloat(amount),
        currency: selectedCurrency,
        method: selectedMethod.name,
        address: selectedMethod.address,
        network: selectedMethod.network
      });

      console.log('Deposit response:', response);

      if (response.success) {
        setIsSubmitting(false);
        setShowSuccess(true);
        console.log('✅ Deposit submitted via API:', response);
      } else {
        setIsSubmitting(false);
        alert(response.message || 'Failed to submit deposit. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ API error:', error);
      setIsSubmitting(false);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit deposit. Please try again.';
      alert(errorMessage);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-md mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
              Deposit Submitted
            </h2>
            <p className="text-gray-600 mb-6">
              Your deposit of {selectedCurrency} {amount} has been submitted successfully. 
              <span className="block mt-2 text-amber-600 font-semibold">
                ⏳ Pending Admin Approval
              </span>
              <span className="block mt-1 text-sm text-gray-500">
                Your balance will be updated once approved by admin.
              </span>
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
              style={{ fontFamily: 'Montserrat' }}
            >
              Back to Dashboard
            </button>
          </motion.div>
        </div>
        <ResponsiveNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
            Deposit
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <form onSubmit={handleSubmit}>
            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  min="10"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
            </div>

            {/* Currency Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                Currency
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Inter' }}
              >
                <option value="USDT">USDT</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ETH">ETH</option>
              </select>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                Payment Method
              </label>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        selectedPayment === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium" style={{ fontFamily: 'Inter' }}>
                        {method.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Payment Address */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                Deposit Address ({selectedMethod.network})
              </label>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-800 font-mono break-all" style={{ fontFamily: 'Inter' }}>
                  {selectedMethod.address}
                </p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(selectedMethod.address)}
                  className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy Address
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Network: <span className="font-semibold">{selectedMethod.network}</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="w-full py-4 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Montserrat' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Deposit'}
            </button>
          </form>

          {/* Notice */}
          <div className="mt-6 bg-yellow-50 rounded-xl p-4">
            <p className="text-sm text-yellow-800" style={{ fontFamily: 'Inter' }}>
              <strong>Notice:</strong> Your deposit will be reviewed by admin. 
              Once approved, the amount will be added to your balance along with your task limit and commission rate.
            </p>
          </div>
        </motion.div>
      </div>

      <ResponsiveNav />
    </div>
  );
}
