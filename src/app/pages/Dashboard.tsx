import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router';
import { Wallet, CheckCircle, Clock, TrendingUp, Snowflake, DollarSign, ArrowLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { ResponsiveNav } from '../components/ResponsiveNav';
import { walletApi, transactionsApi, hotelsApi, Hotel } from '../lib/api';

interface DashboardData {
  accountBalance: number;
  numberOfTasks: number;
  yesterdayCommission: number;
  commissionToday: number;
  frozenBalance: number;
  totalProfit: number;
  tasksCompleted: number; // Tasks completed today
  maxDailyTasks: number; // Daily limit (25 max)
  commissionRate: number;
  // New fields for task limit system
  taskLimit: number; // Total tasks allowed (set by admin)
  tasksUsed: number; // Tasks used in current cycle
  currentPlan: number; // Current plan (1, 2, 3, or 4)
  planTasksCompleted: number; // Tasks completed in current plan
  requiresRecharge: boolean; // Need to recharge for more tasks
  rechargeCount: number; // Number of recharges done
  // Plan completion tracking
  plan1Completed: boolean;
  plan2Completed: boolean;
  plan3Completed: boolean;
  plan4Completed: boolean;
}

interface TaskRecord {
  id: number;
  taskNumber: number;
  planLevel: number;
  hotelName: string;
  hotelPrice: number;
  commissionEarned: number;
  createdAt: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeReason, setRechargeReason] = useState<'balance' | 'task_limit'>('balance');
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [taskRecords, setTaskRecords] = useState<TaskRecord[]>([]);
  const [showPlanUpgradeModal, setShowPlanUpgradeModal] = useState(false);
  const [planUpgradeMessage, setPlanUpgradeMessage] = useState('');
  const [showBookingConfirmModal, setShowBookingConfirmModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const [bookingProgressText, setBookingProgressText] = useState('');
  const [showBookingProgressModal, setShowBookingProgressModal] = useState(false);
  const [showPlanUpgradeConfirmModal, setShowPlanUpgradeConfirmModal] = useState(false);
  const [nextPlanNumber, setNextPlanNumber] = useState(2);
  const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
  const [tasksCompletedForCongratulations, setTasksCompletedForCongratulations] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  
  // Dashboard data state - ALL values start from ZERO for new users
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    accountBalance: 0.00,
    numberOfTasks: 0,
    yesterdayCommission: 0.00,
    commissionToday: 0.00,
    frozenBalance: 0.00,
    totalProfit: 0.00,
    tasksCompleted: 0,
    maxDailyTasks: 25,
    commissionRate: 0.04,
    // Task limit system - all start at zero
    taskLimit: 0, // Will be set by admin after deposit approval
    tasksUsed: 0,
    currentPlan: 1,
    planTasksCompleted: 0,
    requiresRecharge: false,
    rechargeCount: 0,
    // Plan completion tracking
    plan1Completed: false,
    plan2Completed: false,
    plan3Completed: false,
    plan4Completed: false
  });

  // Fetch hotels from database
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const response = await hotelsApi.getHotels();
        if (response.success && response.hotels) {
          setAllHotels(response.hotels);
          console.log('✅ Loaded hotels from database:', response.hotels.length);
        }
      } catch (error) {
        console.error('Error loading hotels:', error);
      }
    };
    loadHotels();
  }, []);

  // Load dashboard data from API - always fetch fresh data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('🔄 Fetching fresh dashboard data from API...');
        const response = await walletApi.getSummary();
        if (response.success && response.wallet) {
          console.log('✅ Loaded wallet from API:', response.wallet);

          const totalCompleted = Number(response.wallet.total_completed_tasks) || Number(response.totalCompletedTasks) || 0;
          const newTaskLimit = Number(response.wallet.max_daily_orders) || 0;
          const rechargeAmount = Number(response.recharge_amount) || 0;
          const requiresRecharge = Boolean(response.requires_recharge);

          // Set recharge amount from backend
          setRechargeAmount(rechargeAmount);

          // Check if task limit has changed (new deposit approved)
          const oldTaskLimit = dashboardData.taskLimit;
          const taskLimitChanged = newTaskLimit !== oldTaskLimit;

          setDashboardData(prev => ({
            ...prev,
            accountBalance: Number(response.wallet.available_balance) || 0.00,
            numberOfTasks: totalCompleted, // Total completed tasks from user_tasks table
            maxDailyTasks: 25, // Always 25 for daily tasks
            frozenBalance: Number(response.wallet.frozen_balance) || 0.00,
            totalProfit: Number(response.wallet.total_profit) || 0.00,
            taskLimit: newTaskLimit, // Admin-set (1-25)
            tasksUsed: taskLimitChanged ? 0 : Math.min(totalCompleted, newTaskLimit), // Reset if new deposit, otherwise track against taskLimit
            tasksCompleted: Number(response.wallet.today_orders) || 0, // Today's completed tasks from DB
            commissionToday: Number(response.wallet.commission_today) || 0, // From DB
            yesterdayCommission: Number(response.wallet.commission_yesterday) || 0, // From DB
            commissionRate: Number(response.wallet.commission_rate) || 0.04, // From DB
            requiresRecharge: taskLimitChanged ? false : requiresRecharge, // Use backend value
            currentPlan: Number(response.wallet.current_plan) || 1, // From DB
            planTasksCompleted: Number(response.wallet.plan_tasks_completed) || 0, // From DB
            plan1Completed: Boolean(response.wallet.plan_1_completed), // From DB
            plan2Completed: Boolean(response.wallet.plan_2_completed), // From DB
            plan3Completed: Boolean(response.wallet.plan_3_completed), // From DB
            plan4Completed: Boolean(response.wallet.plan_4_completed) // From DB
          }));
          
          // Clear any localStorage data to ensure fresh data
          localStorage.removeItem('dashboardData');
          localStorage.removeItem('walletData');
        } else {
          console.error('❌ API returned unsuccessful response:', response);
        }
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
      }
    };
    
    loadDashboardData();
    
    // Load transaction history
    const loadTransactions = async () => {
      try {
        const response = await transactionsApi.getTransactions({ limit: 10 });
        if (response.success && response.transactions) {
          setTransactions(response.transactions);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };
    loadTransactions();
  }, [navigate]);

  // Refresh data when window gains focus (user returns from booking)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused - refreshing dashboard data');
      const refreshData = async () => {
        try {
          const response = await walletApi.getSummary();
          if (response.success && response.wallet) {
            const totalCompleted = Number(response.wallet.total_completed_tasks) || Number(response.totalCompletedTasks) || 0;
            const newTaskLimit = Number(response.wallet.max_daily_orders) || 0;
            const rechargeAmount = Number(response.recharge_amount) || 0;
            const requiresRecharge = Boolean(response.requires_recharge);
            setRechargeAmount(rechargeAmount);
            setDashboardData(prev => ({
              ...prev,
              accountBalance: Number(response.wallet.available_balance) || 0.00,
              numberOfTasks: totalCompleted,
              tasksCompleted: Number(response.wallet.today_orders) || 0,
              taskLimit: newTaskLimit,
              commissionToday: Number(response.wallet.commission_today) || 0,
              yesterdayCommission: Number(response.wallet.commission_yesterday) || 0,
              requiresRecharge: requiresRecharge,
            }));
          }
          
          // Refresh transactions
          const txResponse = await transactionsApi.getTransactions({ limit: 10 });
          if (txResponse.success && txResponse.transactions) {
            setTransactions(txResponse.transactions);
          }
        } catch (error) {
          console.error('Error refreshing dashboard:', error);
        }
      };
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [navigate]);

  // Periodic refresh every 30 seconds to ensure fresh data after admin approval
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('🔄 Periodic refresh - fetching fresh data');
      try {
        const response = await walletApi.getSummary();
        if (response.success && response.wallet) {
          const totalCompleted = Number(response.wallet.total_completed_tasks) || Number(response.totalCompletedTasks) || 0;
          const newTaskLimit = Number(response.wallet.max_daily_orders) || 0;
          const rechargeAmount = Number(response.recharge_amount) || 0;
          const requiresRecharge = Boolean(response.requires_recharge);
          const todayProfit = Number(response.wallet.commission_today) || 0;
          
          setRechargeAmount(rechargeAmount);
          setDashboardData(prev => ({
            ...prev,
            accountBalance: Number(response.wallet.available_balance) || 0.00,
            numberOfTasks: totalCompleted,
            tasksCompleted: Number(response.wallet.today_orders) || 0,
            taskLimit: newTaskLimit,
            commissionToday: todayProfit,
            yesterdayCommission: Number(response.wallet.commission_yesterday) || 0,
            requiresRecharge: requiresRecharge,
          }));

          // Check if user just completed 25 tasks and show congratulations
          if (totalCompleted === 25 && !showCongratulationsModal) {
            setTasksCompletedForCongratulations(25);
            setShowCongratulationsModal(true);
          }
        }
      } catch (error) {
        console.error('Error in periodic refresh:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [showCongratulationsModal]);

  // Only save to localStorage after successful API load (not automatically)
  // This prevents new users from seeing cached/incorrect data

  // Check if user can book (task limit check)
  const canBook = () => {
    const { taskLimit, tasksUsed, tasksCompleted, maxDailyTasks, requiresRecharge, accountBalance, commissionRate } = dashboardData;

    // Check if user has positive balance (deposit must be approved)
    if (accountBalance <= 0) {
      console.log('❌ User cannot book: no balance (deposit not approved)');
      setRechargeReason('balance');
      setShowRechargeModal(true);
      return false;
    }

    // Check if requires recharge first (admin-set task limit reached)
    if (requiresRecharge) {
      console.log('❌ User requires recharge - pending deposit approval');
      setRechargeReason('task_limit');
      setShowRechargeModal(true);
      return false;
    }

    // Check admin-set task limit (must be finished exactly)
    if (taskLimit > 0 && tasksUsed >= taskLimit) {
      console.log('❌ Task limit reached:', tasksUsed, '/', taskLimit, '- requires deposit approval');
      setDashboardData(prev => ({ ...prev, requiresRecharge: true }));
      setRechargeReason('task_limit');
      setShowRechargeModal(true);
      return false;
    }

    // Check daily limit (always 25 per day)
    if (tasksCompleted >= 25) {
      console.log('❌ Daily task limit reached (25)');
      setShowLimitModal(true);
      return false;
    }

    return true;
  };

  // Get available hotels based on current plan level
  const getAvailableHotels = () => {
    const { currentPlan } = dashboardData;
    // Filter hotels by level based on current plan
    // Plan 1: Level 1 hotels, Plan 2: Level 1-2, Plan 3: Level 1-3, Plan 4: Level 1-4
    const maxLevel = currentPlan;
    return allHotels.filter(hotel => hotel.level <= maxLevel);
  };

  // Handle plan progression after completing tasks
  // Plan progression is now handled by the backend database
  const checkPlanProgression = (planTasks: number) => {
    // This function is now handled by the backend
    // The frontend will refresh data from API after each booking
    return false;
  };

  const handleStartBooking = async () => {
    console.log('🚀 handleStartBooking called');
    console.log('Current state:', dashboardData);
    console.log('Available hotels count:', allHotels.length);
    
    // Step 1: Check all task limits
    if (!canBook()) {
      return;
    }

    setIsBooking(true);
    console.log('✅ Starting booking process...');
    
    try {
      const availableHotels = getAvailableHotels();
      console.log('🏨 Available hotels for current plan:', availableHotels.length);
      
      if (availableHotels.length === 0) {
        console.error('❌ No available hotels for current plan');
        alert('No hotels available for your current plan level. Please contact support.');
        setIsBooking(false);
        return;
      }
      
      // Select a random hotel from available hotels
      const randomIndex = Math.floor(Math.random() * availableHotels.length);
      const randomHotel = availableHotels[randomIndex];
      const hotelPrice = randomHotel.price;
      
      console.log('🏨 Selected hotel:', randomHotel.name, 'Index:', randomIndex, 'Total available:', availableHotels.length);
      console.log('🏨 Hotel details:', { name: randomHotel.name, price: hotelPrice, image: randomHotel.image, country: randomHotel.country });
      console.log('💰 Current balance:', dashboardData.accountBalance);
      
      // Check balance
      if (dashboardData.accountBalance < hotelPrice) {
        console.log('❌ Insufficient balance');
        const requiredAmount = hotelPrice - dashboardData.accountBalance;
        setSelectedHotel(randomHotel);
        setRechargeReason('balance');
        setRechargeAmount(requiredAmount);
        setShowRechargeModal(true);
        setIsBooking(false);
        return;
      }

      // Calculate commission using admin-set rate
      const commissionRate = dashboardData.commissionRate || 0.04;
      const commission = hotelPrice * commissionRate;
      
      // Show confirmation modal instead of proceeding directly
      setPendingBooking({
        hotel: randomHotel,
        price: hotelPrice,
        commission
      });
      setShowBookingConfirmModal(true);
      setIsBooking(false);
    } catch (error) {
      console.error('❌ Error in handleStartBooking:', error);
      setIsBooking(false);
    }
  };

  const confirmBooking = async () => {
    if (!pendingBooking) return;

    setIsBooking(true);
    setShowBookingConfirmModal(false);
    setShowBookingProgressModal(true);

    try {
      const { hotel: randomHotel, price: hotelPrice, commission } = pendingBooking;

      console.log('✅ Booking confirmed! Commission:', commission);

      // Show processing state
      setBookingProgressText('Processing your reservation...');

      // Wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show fetching state
      setBookingProgressText('Fetching hotel details...');

      // Wait another 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show final processing state
      setBookingProgressText('Completing reservation...');

      // Wait another 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call backend API to update database
      const response = await fetch('http://localhost:5000/api/reservation/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          hotelPrice,
          hotelId: randomHotel.id,
          commission
        })
      });

      const data = await response.json();

      if (!data.success) {
        console.error('❌ Booking API error:', data.message);
        setIsBooking(false);
        setBookingProgressText('');
        return;
      }

      console.log('✅ Booking saved to database:', data);

      // Show success state
      setBookingProgressText('Successfully Reserved!');
      
      // Refresh dashboard data from API to get accurate values
      try {
        const refreshResponse = await walletApi.getSummary();
        if (refreshResponse.success && refreshResponse.wallet) {
          const totalCompleted = Number(refreshResponse.wallet.total_completed_tasks) || Number(refreshResponse.totalCompletedTasks) || 0;
          const newTaskLimit = Number(refreshResponse.wallet.max_daily_orders) || 0;
          const currentPlan = Number(refreshResponse.wallet.current_plan) || 1;
          const planTasksCompleted = Number(refreshResponse.wallet.plan_tasks_completed) || 0;
          const todayOrders = Number(refreshResponse.wallet.today_orders) || 0;
          const rechargeAmount = Number(refreshResponse.recharge_amount) || 0;
          const requiresRecharge = Boolean(refreshResponse.requires_recharge);
          setRechargeAmount(rechargeAmount);

          setDashboardData(prev => ({
            ...prev,
            accountBalance: Number(refreshResponse.wallet.available_balance) || prev.accountBalance,
            numberOfTasks: totalCompleted,
            tasksCompleted: todayOrders, // Today's orders from DB
            tasksUsed: Math.min(totalCompleted, newTaskLimit),
            taskLimit: newTaskLimit,
            commissionToday: Number(refreshResponse.wallet.commission_today) || 0,
            yesterdayCommission: Number(refreshResponse.wallet.commission_yesterday) || 0,
            totalProfit: Number(refreshResponse.wallet.total_profit) || prev.totalProfit,
            requiresRecharge: requiresRecharge,
            currentPlan: currentPlan,
            planTasksCompleted: planTasksCompleted
          }));

          // Check if plan is completed (25 tasks) and show upgrade modal
          if (planTasksCompleted >= 25 && currentPlan < 4) {
            setNextPlanNumber(currentPlan + 1);
            setShowPlanUpgradeConfirmModal(true);
          }
        }
      } catch (error) {
        console.error('Error refreshing dashboard data, using local update:', error);
        // Fallback: update local state if API fails
        setDashboardData(prev => {
          const newTasksCompleted = Number(prev.tasksCompleted) + 1;
          const newTasksUsed = Number(prev.tasksUsed) + 1;
          const newPlanTasks = Number(prev.planTasksCompleted) + 1;
          const newTotalProfit = Number(data.newTotalProfit) || Number(prev.totalProfit) + Number(commission);

          return {
            ...prev,
            accountBalance: Number(data.newBalance) || Number(prev.accountBalance) - Number(hotelPrice),
            numberOfTasks: newTasksCompleted,
            tasksCompleted: newTasksCompleted, // Increment today's count
            tasksUsed: newTasksUsed,
            planTasksCompleted: newPlanTasks,
            commissionToday: Number(prev.commissionToday) + Number(commission),
            totalProfit: newTotalProfit
          };
        });
      }

      // Save task record
      const newTaskRecord: TaskRecord = {
        id: Date.now(),
        taskNumber: Number(data.taskNumber) || 0,
        planLevel: dashboardData.currentPlan,
        hotelName: randomHotel.name,
        hotelPrice: hotelPrice,
        commissionEarned: commission,
        createdAt: new Date().toISOString()
      };
      setTaskRecords(records => [...records, newTaskRecord]);
      
      // Check plan progression
      const newPlanTasks = Number(dashboardData.planTasksCompleted) + 1;
      setTimeout(() => checkPlanProgression(newPlanTasks), 100);

      setSelectedHotel(randomHotel);
      setCompletedBookings(prev => prev + 1);
      setShowSuccessModal(true);
      console.log('✅ Task completed successfully!');
    } catch (error) {
      console.error('❌ Error in confirmBooking:', error);
    } finally {
      setIsBooking(false);
      setBookingProgressText('');
      setShowBookingProgressModal(false);
      setPendingBooking(null);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleReserveAnother = () => {
    setShowSuccessModal(false);
    // Trigger another booking after a short delay
    setTimeout(() => {
      handleStartBooking();
    }, 300);
  };

  const handlePlanUpgrade = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/reservation/upgrade-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setShowPlanUpgradeConfirmModal(false);
        // Refresh dashboard data to get updated plan info
        const refreshResponse = await walletApi.getSummary();
        if (refreshResponse.success && refreshResponse.wallet) {
          const newTaskLimit = Number(refreshResponse.wallet.max_daily_orders) || 0;
          const totalCompleted = Number(refreshResponse.wallet.total_completed_tasks) || Number(refreshResponse.totalCompletedTasks) || 0;
          const rechargeAmount = Number(refreshResponse.recharge_amount) || 0;
          const requiresRecharge = Boolean(refreshResponse.requires_recharge);
          setRechargeAmount(rechargeAmount);

          setDashboardData(prev => ({
            ...prev,
            accountBalance: Number(refreshResponse.wallet.available_balance) || 0.00,
            numberOfTasks: totalCompleted,
            maxDailyTasks: 25, // Always 25 for daily tasks
            frozenBalance: Number(refreshResponse.wallet.frozen_balance) || 0.00,
            totalProfit: Number(refreshResponse.wallet.total_profit) || 0.00,
            taskLimit: newTaskLimit,
            tasksUsed: Math.min(totalCompleted, newTaskLimit),
            tasksCompleted: Number(refreshResponse.wallet.today_orders) || 0, // Today's completed tasks from DB
            commissionToday: Number(refreshResponse.wallet.commission_today) || 0,
            yesterdayCommission: Number(refreshResponse.wallet.commission_yesterday) || 0,
            commissionRate: Number(refreshResponse.wallet.commission_rate) || 0.04,
            requiresRecharge: requiresRecharge,
            currentPlan: Number(refreshResponse.wallet.current_plan) || 1,
            planTasksCompleted: Number(refreshResponse.wallet.plan_tasks_completed) || 0,
            plan1Completed: Boolean(refreshResponse.wallet.plan_1_completed),
            plan2Completed: Boolean(refreshResponse.wallet.plan_2_completed),
            plan3Completed: Boolean(refreshResponse.wallet.plan_3_completed),
            plan4Completed: Boolean(refreshResponse.wallet.plan_4_completed)
          }));
        }
      }
    } catch (error) {
      console.error('Plan upgrade error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Function to update balance after deposit (called from Deposit page)
  const updateBalanceAfterDeposit = (amount: number) => {
    setDashboardData(prev => ({
      ...prev,
      accountBalance: Number(prev.accountBalance) + Number(amount)
    }));
  };

  // Function to handle recharge (reset tasks and set new task limit)
  // Called when admin approves additional deposit
  const handleRecharge = (newTaskLimit: number, commissionRate: number) => {
    setDashboardData(prev => ({
      ...prev,
      taskLimit: newTaskLimit,
      tasksUsed: 0, // Reset tasks used
      requiresRecharge: false,
      rechargeCount: prev.rechargeCount + 1,
      commissionRate: commissionRate / 100 // Convert percentage to decimal
    }));
    console.log('✅ Recharge complete! New task limit:', newTaskLimit, 'Commission rate:', commissionRate + '%');
  };

  // Make handleRecharge available globally for admin panel
  useEffect(() => {
    (window as any).handleRecharge = handleRecharge;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Back</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-800" style={{ fontFamily: 'Montserrat' }}>
            Account Overview Dashboard
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Dashboard Grid - 3x2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Card 1 - Account Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Montserrat' }}>
              {formatCurrency(dashboardData.accountBalance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Account Balance</p>
          </motion.div>

          {/* Card 2 - Number of Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-red-500" style={{ fontFamily: 'Montserrat' }}>
              {dashboardData.numberOfTasks}
            </p>
            <p className="text-xs text-gray-500 mt-1">number of tasks</p>
          </motion.div>

          {/* Card 3 - Yesterday Commission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-orange-500" style={{ fontFamily: 'Montserrat' }}>
              {formatCurrency(dashboardData.yesterdayCommission)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Yesterday commission</p>
          </motion.div>

          {/* Card 4 - Commission Today */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-orange-500" style={{ fontFamily: 'Montserrat' }}>
              {formatCurrency(dashboardData.commissionToday)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Commission today</p>
          </motion.div>

          {/* Card 5 - Frozen Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Snowflake className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-700" style={{ fontFamily: 'Montserrat' }}>
              {formatCurrency(dashboardData.frozenBalance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Frozen Balance</p>
          </motion.div>

          {/* Card 6 - Total Profit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Montserrat' }}>
              {formatCurrency(dashboardData.totalProfit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Profit</p>
          </motion.div>
        </div>

        {/* Daily Tasks Progress */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Daily Tasks</span>
            <span className="font-semibold text-green-600" style={{ fontFamily: 'Montserrat' }}>
              {dashboardData.tasksCompleted}/{dashboardData.maxDailyTasks}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((dashboardData.tasksCompleted / dashboardData.maxDailyTasks) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Start Booking Button */}
        {/* Cash Gap Recharge Link */}
        {(() => {
          const minHotelPrice = 50; // Minimum hotel price for booking
          const cashGap = minHotelPrice - dashboardData.accountBalance;
          return cashGap > 0 ? (
            <div className="text-center mb-3">
              <Link to="/deposit">
                <button
                  onClick={() => {
                    setRechargeAmount(cashGap);
                    setRechargeReason('balance');
                    setShowRechargeModal(true);
                  }}
                  className="text-red-600 font-bold text-lg hover:underline"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Recharge {cashGap.toFixed(2)}USD
                </button>
              </Link>
            </div>
          ) : null;
        })()}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartBooking}
          className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg mb-6"
          style={{ 
            fontFamily: 'Montserrat',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
          }}
        >
          Start Reserving
          <ArrowRight className="inline-block ml-2 w-5 h-5" />
        </motion.button>

        {/* Description Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Montserrat' }}>
            Description
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold">1:</span> The commission earned is the amount of the completed transaction 4%.
            </p>
            <p>
              <span className="font-semibold">2:</span> The system has 4 plans. Complete 25 tasks per plan to unlock the next plan with higher-level hotels.
            </p>
            <p>
              <span className="font-semibold">3:</span> The daily number of tasks will be reset after 24:00 GMT+3.
            </p>
            <p>
              <span className="font-semibold">4:</span> Plan 1 = Level 1 hotels, Plan 2 = Level 1-2 hotels, Plan 3 = Level 1-3 hotels, Plan 4 = All hotels.
            </p>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Montserrat' }}>
              Transaction History
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTransactionFilter('all')}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  transactionFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTransactionFilter('pending')}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  transactionFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setTransactionFilter('approved')}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  transactionFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setTransactionFilter('rejected')}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  transactionFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions
                .filter((tx: any) => {
                  if (transactionFilter === 'all') return true;
                  if (transactionFilter === 'pending') return tx.status === 'pending';
                  if (transactionFilter === 'approved') return tx.status === 'approved' || tx.status === 'completed';
                  if (transactionFilter === 'rejected') return tx.status === 'rejected';
                  return true;
                })
                .slice(0, 5)
                .map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-100 text-green-600' :
                      tx.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {tx.type === 'deposit' ? <TrendingUp className="w-5 h-5" /> :
                       tx.type === 'withdrawal' ? <Wallet className="w-5 h-5" /> :
                       <CheckCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{tx.type}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === 'deposit' ? 'text-green-600' :
                      tx.type === 'withdrawal' ? 'text-red-600' :
                      'text-gray-800'
                    }`}>
                      {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}${Number(tx.amount).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'approved' || tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {transactions.length > 5 && (
            <button
              onClick={() => navigate('/transactions')}
              className="w-full mt-4 text-center text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              View All Transactions →
            </button>
          )}
        </div>
      </div>

      {/* Insufficient Balance// Recharge Modal */}
      <AnimatePresence>
        {showRechargeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Message */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${rechargeReason === 'task_limit' ? 'bg-red-100' : 'bg-amber-100'}`}>
                  {rechargeReason === 'task_limit' ? (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  ) : (
                    <Wallet className="w-8 h-8 text-amber-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {rechargeReason === 'task_limit' ? 'Task Limit Reached' : 'Insufficient Balance'}
                </h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {rechargeReason === 'task_limit' ? (
                    <>
                      <div className="bg-purple-50 rounded-lg p-3 mb-3">
                        <p className="text-gray-600 text-xs mb-2">Daily Progress</p>
                        <p className="text-gray-800 font-semibold">
                          Today: <span className="text-purple-600">{dashboardData.tasksCompleted}</span> / {dashboardData.maxDailyTasks} daily tasks
                        </p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 mb-3">
                        <p className="text-gray-600 text-xs mb-2">Task Limit Status</p>
                        <p className="text-gray-800 font-semibold">
                          Completed: <span className="text-red-600">{dashboardData.numberOfTasks}</span> tasks
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Your task limit is set by admin. Complete tasks to earn commission.
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <p className="text-gray-600 text-xs mb-2">Required Deposit to Continue</p>
                        <p className="text-gray-800 font-semibold">
                          {rechargeAmount > 0 ? (
                            <>
                              Deposit <span className="text-amber-600">${rechargeAmount.toFixed(2)} USD</span> to unlock more tasks
                            </>
                          ) : (
                            <span className="text-amber-600">Deposit required to continue booking</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Additional deposit increases your task capacity
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3 mb-3">
                        <p className="text-gray-600 text-xs mb-2">Today's Profit</p>
                        <p className="text-gray-800 font-semibold">
                          ${dashboardData.commissionToday.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-gray-600 text-xs mb-2">Commission Rate</p>
                        <p className="text-gray-800 font-semibold">
                          {((dashboardData.commissionRate || 0.04) * 100).toFixed(0)}% per booking
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      Your current balance is <span className="font-bold text-red-600">${dashboardData.accountBalance.toFixed(2)}</span>
                      <br />
                      You need to recharge <span className="font-bold text-amber-600">${rechargeAmount.toFixed(2)}</span> to complete this booking
                    </>
                  )}
                </p>
                {rechargeReason === 'balance' && dashboardData.accountBalance === 0 && (
                  <p className="text-amber-600 text-sm mt-2 font-medium">
                    💡 New users must deposit first before booking
                  </p>
                )}
              </div>

              {/* Recharge Link */}
              <div className="text-center mb-4">
                <Link to="/deposit">
                  <button
                    onClick={() => setShowRechargeModal(false)}
                    className="bg-gradient-to-r from-[#F4C444] to-[#D4AF37] text-white px-6 py-3 rounded-lg font-semibold"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    {rechargeReason === 'task_limit' ? 'Make Additional Deposit' : (dashboardData.accountBalance === 0 ? 'Make First Deposit' : 'Add Funds')}
                  </button>
                </Link>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowRechargeModal(false)}
                className="w-full py-3 rounded-lg font-semibold text-white bg-gray-500 hover:bg-gray-600 transition-colors"
                style={{ fontFamily: 'Montserrat' }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {showBookingConfirmModal && pendingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: 'Montserrat' }}>
                Confirm Reservation
              </h3>
              
              {/* Hotel Image */}
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={pendingBooking.hotel.image} 
                  alt={pendingBooking.hotel.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              
              {/* Hotel Details */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 text-lg">{pendingBooking.hotel.name}</h4>
                <p className="text-gray-600 text-sm">{pendingBooking.hotel.city}, {pendingBooking.hotel.country}</p>
                <p className="text-gray-500 text-sm mt-1">{pendingBooking.hotel.description}</p>
              </div>
              
              {/* Amenities */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {pendingBooking.hotel.amenities.map((amenity: string, idx: number) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Hotel Price:</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(pendingBooking.hotel.price)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Commission:</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(pendingBooking.commission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Your Balance:</span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(dashboardData.accountBalance)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingConfirmModal(false)}
                  className="flex-1 py-3 rounded-lg font-semibold text-white bg-gray-500 hover:bg-gray-600"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={isBooking}
                  className="flex-1 py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  {isBooking ? bookingProgressText || 'Processing...' : 'Reserve'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Success Modal */}
      <AnimatePresence>
        {showSuccessModal && selectedHotel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseSuccessModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                Successfully Reserved!
              </h3>
              <p className="text-gray-600 mb-4">
                You have successfully reserved <strong>{selectedHotel.name}</strong>
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  Bookings completed: <span className="font-bold text-blue-600">{completedBookings}</span> / {dashboardData.maxDailyTasks}
                </p>
                <p className="text-sm text-gray-600">
                  Remaining: <span className="font-bold">{dashboardData.maxDailyTasks - dashboardData.tasksCompleted}</span>
                </p>
              </div>
              <button
                onClick={handleReserveAnother}
                className="w-full py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600"
                style={{ fontFamily: 'Montserrat' }}
              >
                Reserve Another
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Progress Modal */}
      <AnimatePresence>
        {showBookingProgressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                Processing Reservation
              </h3>
              <p className="text-gray-600 text-lg font-medium">
                {bookingProgressText}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Limit Reached Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLimitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                Daily Limit Reached
              </h3>
              <p className="text-gray-600 mb-6">
                You have completed {dashboardData.maxDailyTasks} tasks today. Please wait until 24:00 GMT+3 for the reset.
              </p>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Upgrade Modal */}
      <AnimatePresence>
        {showPlanUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPlanUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                Plan Completed!
              </h3>
              <p className="text-gray-600 mb-6">
                {planUpgradeMessage}
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Plan {dashboardData.currentPlan} Stats:</span>
                </p>
                <p className="text-sm text-gray-600">
                  Total Profit: ${dashboardData.totalProfit.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Commission Rate: {(dashboardData.commissionRate * 100).toFixed(0)}%
                </p>
              </div>
              <button
                onClick={() => setShowPlanUpgradeModal(false)}
                className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Congratulations Modal - 25 Tasks Completed */}
      <AnimatePresence>
        {showCongratulationsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              {/* Animated celebration icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg animate-bounce">
                <span className="text-5xl">🎊</span>
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: 'Montserrat' }}>
                Congratulations! 🏆
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                You have completed <strong className="text-gray-800">25 tasks</strong> today!
              </p>

              {/* Today's Profit */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-emerald-700 font-semibold mb-1">Today's Profit</p>
                <p className="text-3xl font-bold text-emerald-600" style={{ fontFamily: 'Montserrat' }}>
                  ${dashboardData.commissionToday.toFixed(2)}
                </p>
              </div>

              <p className="text-gray-600 mb-6">
                Amazing work! You've reached your daily task limit. Upgrade to Plan 2 to unlock higher commission rates and more earning opportunities.
              </p>

              {/* Link to Plan 2 */}
              <Link to="/reservation-plans">
                <button
                  onClick={() => setShowCongratulationsModal(false)}
                  className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-lg"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Upgrade to Plan 2 🚀
                </button>
              </Link>

              <button
                onClick={() => setShowCongratulationsModal(false)}
                className="w-full py-3 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 mt-3"
              >
                Continue to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Upgrade Confirmation Modal */}
      <AnimatePresence>
        {showPlanUpgradeConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              {/* Animated celebration icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg animate-bounce">
                <span className="text-5xl">🎉</span>
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: 'Montserrat' }}>
                Congratulations! 🏆
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                You have completed <strong className="text-gray-800">Plan {dashboardData.currentPlan}</strong> with all 25 tasks!
              </p>

              {/* Today's profit highlight */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Today's Profit</p>
                <p className="text-3xl font-extrabold text-green-600" style={{ fontFamily: 'Montserrat' }}>
                  {formatCurrency(dashboardData.commissionToday)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total earned: <span className="font-semibold text-gray-700">{formatCurrency(dashboardData.totalProfit)}</span>
                </p>
              </div>

              {/* Next plan info */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-bold text-gray-800 mb-1">
                  🚀 Ready for Plan {nextPlanNumber}?
                </p>
                <p className="text-xs text-gray-600">
                  Access higher-level hotels and earn even more commissions with a better rate!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPlanUpgradeConfirmModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Later
                </button>
                <button
                  onClick={async () => {
                    await handlePlanUpgrade();
                    navigate('/plans');
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-md transition-all"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Start Plan {nextPlanNumber} →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResponsiveNav />
    </div>
  );
}
