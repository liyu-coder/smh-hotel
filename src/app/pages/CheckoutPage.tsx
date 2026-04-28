import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  CreditCard,
  Landmark,
  Smartphone,
  Globe,
  Bitcoin,
  DollarSign,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { allHotels } from '../../data/hotels';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { bookingsApi } from '../lib/api';

interface WalletData {
  availableBalance: number;
  todayOrders: number;
  maxDailyOrders: number;
  tasksCompleted: boolean;
  pending: number;
  totalApproved: number;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Find hotel with better error handling
  const hotel = allHotels.find(h => h.id.toString() === id || h.id === id);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Wallet state from API
  const [walletData, setWalletData] = useState<WalletData>({
    availableBalance: 0.00,
    todayOrders: 0,
    maxDailyOrders: 25,
    tasksCompleted: false,
    pending: 0,
    totalApproved: 0.00
  });

  // Form state
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'USDT' | 'ETH'>('USDT');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Trust Wallet - USDT (TRC20)');
  const [linkCode, setLinkCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Success overlay
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedTask, setCompletedTask] = useState(0);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Insufficient balance modal
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(0);

  const currencies = [
    { code: 'USD' as const, symbol: '$', name: 'US Dollar', icon: DollarSign },
    { code: 'EUR' as const, symbol: '€', name: 'Euro', icon: DollarSign },
    { code: 'USDT' as const, symbol: '₮', name: 'Tether', icon: Bitcoin },
    { code: 'ETH' as const, symbol: 'Ξ', name: 'Ethereum', icon: Globe }
  ];

  const paymentMethods = [
    { 
      name: 'Trust Wallet - USDT (TRC20)', 
      icon: Smartphone,
      address: 'TNXpjoH6kNCSHAWw5VC8vn6tbXt9Fp1L9q',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    },
    { 
      name: 'KuCoin - USDT (TRC20)', 
      icon: Globe,
      address: 'TQgo9MgiztoPYdAdEeRiM5YLoX76ATbvN2',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    },
    { 
      name: 'MEXC - USDT (TRC20)', 
      icon: Globe,
      address: 'TH7v2jXYSeJNRkzzECEQugdTzVReffDSHC',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    },
    { 
      name: 'Bitget - USDT (TRC20)', 
      icon: Globe,
      address: 'TBvixNUGPmZt1rLgyP3fEwZCyepzSH3eDP',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    },
    { 
      name: 'OKX - USDT (TRC20)', 
      icon: Globe,
      address: 'TB8YStZmVMQWLfwLJzMvRYk7MfHQXGn7cX',
      network: 'Tron (TRC20)',
      currency: 'USDT'
    }
  ];

  const commissionRate = 0.26;

  // Handle loading and check proceed flag
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F4C444] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600" style={{ fontFamily: 'Inter' }}>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Montserrat' }}>Hotel Not Found</h2>
          <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl text-black font-bold" style={{ backgroundColor: '#F4C444', fontFamily: 'Montserrat' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const commission = hotel.price * commissionRate;
  const totalDeduction = hotel.price + commission;

  const handleCompleteReservation = () => {
    // Balance check - show recharge modal
    if (totalDeduction > walletData.availableBalance) {
      const needed = totalDeduction - walletData.availableBalance;
      setRechargeAmount(needed);
      setShowRechargeModal(true);
      return;
    }

    // Daily order limit check - show recharge modal to upgrade plan
    if (walletData.todayOrders >= walletData.maxDailyOrders) {
      setRechargeAmount(100); // Minimum recharge to continue
      setShowRechargeModal(true);
      return;
    }

    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(async () => {
      const newTaskNumber = walletData.todayOrders + 1;

      // Save booking to database via API
      try {
        await bookingsApi.createBooking({
          hotel_id: Number(hotel.id),
          check_in_date: new Date().toISOString().split('T')[0],
          check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          guests: 1,
          special_requests: `Checkout booking - Commission: $${commission}, Net: $${hotel.price}, Payment: ${selectedPaymentMethod}`
        });
      } catch (error) {
        console.error('Failed to save booking to DB:', error);
      }

      // Deduct from balance
      const newWalletData = {
        ...walletData,
        availableBalance: walletData.availableBalance - totalDeduction,
        todayOrders: newTaskNumber,
        tasksCompleted: newTaskNumber >= walletData.maxDailyOrders,
        totalApproved: walletData.totalApproved + totalDeduction
      };

      setWalletData(newWalletData);

      setIsProcessing(false);
      setCompletedTask(newTaskNumber);
      setShowSuccess(true);
      
      // Auto-redirect after cinematic success animation
      setTimeout(() => {
        navigate('/reserves');
      }, 3000);
    }, 2000);
  };

  const levelLabels: Record<number, string> = { 1: 'Standard', 2: 'Comfort', 3: 'Premium', 4: 'Luxury' };
  const levelColors: Record<number, string> = { 1: '#6b7280', 2: '#3b82f6', 3: '#8b5cf6', 4: '#D4AF37' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
              Checkout
            </h1>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>Complete your reservation</p>
          </div>
        </div>
      </motion.div>

      {/* Plans Display Section */}
      <div className="bg-gradient-to-r from-blue-50 to-yellow-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
              Current Plan: {walletData.totalApproved >= 5000 ? 'Plan 3' : walletData.totalApproved >= 1000 ? 'Plan 2' : 'Plan 1'}
            </h2>
            <button 
              onClick={() => navigate('/plans')}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ fontFamily: 'Montserrat', backgroundColor: '#F4C444', color: '#1a1a1a' }}
            >
              View All Plans
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F4C444' }}></div>
              <span className="text-sm" style={{ fontFamily: 'Inter', color: '#6b6b6b' }}>
                Balance: ${walletData.availableBalance.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm" style={{ fontFamily: 'Inter', color: '#6b6b6b' }}>
                Today's Reserves: {walletData.todayOrders}/{walletData.maxDailyOrders}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hotel Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="relative h-64 md:h-80">
                <ImageWithFallback
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: levelColors[hotel.level] || '#6b7280' }}
                    >
                      Level {hotel.level} - {levelLabels[hotel.level]}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Montserrat' }}>
                    {hotel.name}
                  </h2>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-4 h-4" />
                    <span style={{ fontFamily: 'Inter' }}>{hotel.city}, {hotel.country}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-[#F4C444] fill-[#F4C444]" />
                    <span className="font-semibold" style={{ fontFamily: 'Montserrat' }}>{hotel.rating}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                    {hotel.amenities.slice(0, 4).join(' • ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>{hotel.description}</p>
              </div>
            </motion.div>

            {/* Currency Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <h3 className="text-sm font-medium mb-3 text-gray-500" style={{ fontFamily: 'Montserrat' }}>
                Currency
              </h3>
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
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: selectedCurrency === currency.code ? '#3b82f6' : '#6b6b6b' }} />
                      <div className="text-sm font-semibold" style={{ fontFamily: 'Montserrat', color: selectedCurrency === currency.code ? '#3b82f6' : '#1a1a1a' }}>
                        {currency.symbol} {currency.code}
                      </div>
                      <div className="text-xs" style={{ fontFamily: 'Inter', color: selectedCurrency === currency.code ? '#3b82f6' : '#6b6b6b' }}>
                        {currency.name}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <h3 className="text-sm font-medium mb-3 text-gray-500" style={{ fontFamily: 'Montserrat' }}>
                Payment Method
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <motion.button
                      key={method.name}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod(method.name)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedPaymentMethod === method.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6" style={{ color: selectedPaymentMethod === method.name ? '#3b82f6' : '#6b6b6b' }} />
                      <div className="text-xs font-medium" style={{ fontFamily: 'Montserrat', color: selectedPaymentMethod === method.name ? '#3b82f6' : '#1a1a1a' }}>
                        {method.name}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Link Reservation Section */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-sm font-bold text-gray-800" style={{ fontFamily: 'Montserrat' }}>
                    Consolidate Reservation (Optional)
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-4" style={{ fontFamily: 'Inter' }}>
                  Enter a Reservation ID to link this stay with another. This will consolidate tasks and treat both as one person for progress.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value)}
                    placeholder="Enter Reservation ID (e.g., SMH-123456789)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                    style={{ fontFamily: 'Inter' }}
                  />
                  {linkCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              {selectedPaymentMethod && paymentMethods.find(m => m.name === selectedPaymentMethod)?.address && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <h4 className="text-sm font-medium mb-3 text-gray-600" style={{ fontFamily: 'Montserrat' }}>
                    Payment Details - {selectedPaymentMethod}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" style={{ fontFamily: 'Inter' }}>
                        Address
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={paymentMethods.find(m => m.name === selectedPaymentMethod)?.address || ''}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono"
                        style={{ fontFamily: 'Inter' }}
                      />
                    </div>
                    {paymentMethods.find(m => m.name === selectedPaymentMethod)?.network && (
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block" style={{ fontFamily: 'Inter' }}>
                          Network
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={paymentMethods.find(m => m.name === selectedPaymentMethod)?.network || ''}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono"
                          style={{ fontFamily: 'Inter' }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24"
            >
              <h3 className="text-lg font-bold mb-6" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                Order Summary
              </h3>

              {/* Hotel Mini Card */}
              <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-xl">
                <ImageWithFallback
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                    {hotel.name}
                  </h4>
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter' }}>
                    {hotel.city}, {hotel.country}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>Room Price</span>
                  <span className="text-sm font-semibold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                    ${Number(hotel.price).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1" style={{ fontFamily: 'Inter' }}>
                    Service Commission
                    <span className="text-xs text-[#D4AF37] font-bold">(26%)</span>
                  </span>
                  <span className="text-sm font-semibold text-red-500" style={{ fontFamily: 'Montserrat' }}>
                    ${Number(commission).toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                      Total to Pay
                    </span>
                    <span className="text-xl font-bold" style={{ fontFamily: 'Montserrat', color: '#F4C444' }}>
                      ${Number(totalDeduction).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="p-4 bg-gray-50 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter' }}>Available Balance</span>
                  <span className="text-sm font-bold" style={{ fontFamily: 'Montserrat', color: totalDeduction <= Number(walletData.availableBalance) ? '#16a34a' : '#dc2626' }}>
                    ${Number(walletData.availableBalance).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter' }}>Daily Progress</span>
                  <span className="text-sm font-bold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                    {walletData.todayOrders}/{walletData.maxDailyOrders}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(walletData.todayOrders / walletData.maxDailyOrders) * 100}%`,
                      backgroundColor: walletData.todayOrders === walletData.maxDailyOrders ? '#16a34a' : '#F4C444'
                    }}
                  />
                </div>
              </div>

              {/* Commission Notice */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700" style={{ fontFamily: 'Inter' }}>
                  A 26% service commission applies to all reservations. This fee covers platform operations, security, and customer support.
                </p>
              </div>

              {/* Complete Reservation Button */}
              <motion.button
                whileHover={{ scale: isProcessing ? 1 : 1.02, y: isProcessing ? 0 : -2 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                onClick={handleCompleteReservation}
                disabled={isProcessing}
                className="w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#F4C444', fontFamily: 'Montserrat', color: '#000' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Pay & Complete Reserve
                  </>
                )}
              </motion.button>

              <p className="text-xs text-gray-400 text-center mt-4" style={{ fontFamily: 'Inter' }}>
                By confirming, you agree to our terms of service
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-3xl p-8 md:p-12 max-w-md w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>

              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                Task Completed!
              </h2>

              <p className="text-lg mb-1" style={{ fontFamily: 'Montserrat', color: '#D4AF37' }}>
                Progress: {completedTask}/25
              </p>

              <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: 'Inter' }}>
                {hotel.name} • {hotel.city}, {hotel.country}
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600" style={{ fontFamily: 'Inter' }}>Amount Deducted</span>
                  <span className="font-bold" style={{ fontFamily: 'Montserrat' }}>${Number(totalDeduction).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600" style={{ fontFamily: 'Inter' }}>Remaining Balance</span>
                  <span className="font-bold" style={{ fontFamily: 'Montserrat', color: '#16a34a' }}>
                    ${(Number(walletData.availableBalance) - Number(totalDeduction)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600" style={{ fontFamily: 'Inter' }}>Daily Progress</span>
                  <span className="font-bold" style={{ fontFamily: 'Montserrat' }}>{completedTask}/25</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('/bookings');
                  }}
                  className="w-full py-4 rounded-xl font-bold text-black"
                  style={{ backgroundColor: '#F4C444', fontFamily: 'Montserrat' }}
                >
                  View My Reservations
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('/');
                  }}
                  className="w-full py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Continue Browsing
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
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
            <XCircle className="w-5 h-5 text-white" />
          )}
          <span className="text-white font-medium" style={{ fontFamily: 'Inter' }}>
            {toastMessage}
          </span>
        </motion.div>
      )}

      {/* Recharge Modal - Matches Screenshot Exactly */}
      <AnimatePresence>
        {showRechargeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRechargeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Message Section */}
              <div className="text-center mb-4">
                <p className="text-gray-800 text-sm leading-relaxed">
                  Hello, your account balance is insufficient, you cannot submit this order temporarily, you need to recharge 
                  <span className="text-red-600 font-semibold"> {rechargeAmount.toFixed(2)}USD</span> to submit this order.
                  <span className="text-red-500"> The commission for completing this order will be increased by 1.80 times</span>
                </p>
              </div>

              {/* Recharge Link */}
              <div className="text-center mb-4">
                <button
                  onClick={() => {
                    setShowRechargeModal(false);
                    navigate('/deposit');
                  }}
                  className="text-red-600 font-semibold text-lg hover:underline"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Recharge
                </button>
              </div>

              {/* Start Booking Button */}
              <button
                onClick={() => {
                  setShowRechargeModal(false);
                  // User wants to try booking - close modal and let them attempt
                  // The booking will check balance again and show modal if still insufficient
                  handleCompleteReservation();
                }}
                className="w-full py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                style={{ fontFamily: 'Montserrat' }}
              >
                Start booking
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
