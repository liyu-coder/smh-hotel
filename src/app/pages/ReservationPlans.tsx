import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Star, Zap, AlertCircle, Wallet, TrendingUp, Calendar, X } from 'lucide-react';
import { reservationApi } from '../lib/api';
import { ResponsiveNav } from '../components/ResponsiveNav';

interface Plan {
  id: number;
  name: string;
  min_amount: number;
  max_amount: number;
  commission_rate: number;
  daily_task_limit: number;
  description: string;
  image_url: string;
  badge: string;
}

interface PlanFlowDashboard {
  requires_recharge: boolean;
  recharge_amount?: number;
  commission_multiplier?: number;
  balance: number;
  total_approved: number;
  pending_tasks: number;
  plan_ceiling_reached?: boolean;
  highest_plan_cap?: number;
  prev_plan_completed?: boolean;
  plan_progress?: {
    plan1_completed: boolean;
    plan2_completed: boolean;
    plan3_completed: boolean;
    plan4_completed: boolean;
  };
}

export function ReservationPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [totalApproved, setTotalApproved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<PlanFlowDashboard | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const [planRes, dashRes] = await Promise.all([
        reservationApi.getMyPlan(),
        reservationApi.getDashboard(),
      ]);
      if (planRes.success) {
        setPlans(planRes.allPlans || []);
        setCurrentPlan(planRes.currentPlan);
        setTotalApproved(planRes.totalApproved || 0);
      }
      if (dashRes.success && dashRes.dashboard) {
        const d = dashRes.dashboard;
        setDashboard({
          requires_recharge: !!d.requires_recharge,
          recharge_amount: d.recharge_amount,
          commission_multiplier: d.commission_multiplier,
          balance: d.balance,
          total_approved: d.total_approved,
          pending_tasks: d.pending_tasks,
          plan_ceiling_reached: d.plan_ceiling_reached,
          highest_plan_cap: d.highest_plan_cap,
          prev_plan_completed: d.prev_plan_completed,
          plan_progress: d.plan_progress,
        });
        if (d.requires_recharge) {
          setShowRechargeModal(true);
        }
      }
    } catch (err) {
      setError('Failed to load reservation plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const rechargeUsd = dashboard
    ? dashboard.recharge_amount ??
      Math.round(Math.max(0, dashboard.total_approved - dashboard.balance) * 100) / 100
    : 0;
  const mult = dashboard?.commission_multiplier ?? 1.8;

  const goToTasks = () => {
    if (dashboard?.requires_recharge) {
      setShowRechargeModal(true);
      return;
    }
    navigate('/tasks');
  };

  const getPlanStars = (planName: string) => {
    switch (planName) {
      case 'Plan 1': return 1;
      case 'Plan 2': return 2;
      case 'Plan 3': return 3;
      case 'Plan 4': return 4;
      default: return 1;
    }
  };

  const getPlanNumber = (planName: string) => {
    return parseInt(planName.replace('Plan ', '')) || 1;
  };

  const formatAmount = (amount: number) => {
    return amount >= 1000 ? `${(amount / 1000).toFixed(0)}K` : amount.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Reservation Plans</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="w-4 h-4 text-yellow-600" />
            <span className="text-gray-600">Total Deposited:</span>
            <span className="font-bold text-yellow-600">${totalApproved.toFixed(2)} USDT</span>
          </div>
        </div>
      </div>

      {dashboard?.plan_ceiling_reached && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
            You are at the <strong>highest plan tier</strong> (Plan 1–3 cap). If you still have open tasks and the system requires a top-up, use <strong>Recharge</strong> below or in the popup.
          </div>
        </div>
      )}

      {/* Current Plan Status */}
      {currentPlan && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-blue-100">Current Plan</p>
                <p className="font-bold text-lg">{currentPlan.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Commission Rate</p>
              <p className="font-bold">{(currentPlan.commission_rate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">Reservation Plans</h2>
        <p className="text-sm text-gray-600 text-center mb-6 max-w-xl mx-auto">
          Plans unlock sequentially. Complete <strong>all tasks</strong> in Plan 1 to unlock Plan 2, 
          complete Plan 2 to unlock Plan 3, and complete Plan 3 to unlock Plan 4. 
          Admin sets task limits and commission rates for each plan.
        </p>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
          {plans.map((plan, index) => {
            const stars = getPlanStars(plan.name);
            const isCurrentPlan = currentPlan?.id === plan.id;
            const hasEnoughDeposit = totalApproved >= plan.min_amount;
            
            // Sequential unlocking: check if all previous plans are completed
            const planNumber = getPlanNumber(plan.name);
            const prevPlan = plans.find(p => getPlanNumber(p.name) === planNumber - 1);
            const prevPlanCompleted = !prevPlan || (dashboard && planNumber > 1 && dashboard.prev_plan_completed);
            
            // Plan is locked if: not enough deposit OR previous plan not completed
            const isLocked = !hasEnoughDeposit || !prevPlanCompleted;
            const isSequentialLocked = hasEnoughDeposit && !prevPlanCompleted;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: isLocked ? 1 : 1.02 }}
              >
                <div className={`relative bg-white rounded-xl shadow-sm overflow-hidden border-2 transition-all w-full max-w-[280px] ${
                  isCurrentPlan 
                    ? 'border-yellow-500 ring-2 ring-yellow-200' 
                    : isLocked 
                      ? 'border-gray-200 opacity-75' 
                      : 'border-gray-200 hover:border-yellow-400'
                }`}>
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                      plan.badge === 'VIP' ? 'bg-purple-600' : 'bg-gray-800'
                    }`}>
                      {plan.badge}
                    </span>
                    {dashboard?.plan_ceiling_reached &&
                      dashboard.highest_plan_cap != null &&
                      Math.abs(Number(plan.max_amount) - Number(dashboard.highest_plan_cap)) < 0.02 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">Plan cap</span>
                    )}
                  </div>

                {/* Provider Logo Placeholder */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="w-12 h-6 bg-white rounded shadow-sm flex items-center justify-center text-xs font-bold text-blue-600">
                    Expedia
                  </div>
                </div>

                {/* Image */}
                <div className="h-32 bg-gray-200 relative">
                  <img
                    src={plan.image_url}
                    alt={plan.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-900 mb-1">{plan.name}</h3>
                  
                  {/* Amount Range */}
                  <p className="text-sm text-orange-500 font-semibold mb-2">
                    {formatAmount(plan.min_amount)} - {formatAmount(plan.max_amount)} USDT
                  </p>

                  {/* Stars */}
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Status */}
                  {isCurrentPlan ? (
                    <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                      ✓ Current Plan
                    </div>
                  ) : isSequentialLocked ? (
                    <div className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Complete Plan {planNumber - 1} first
                      </div>
                    </div>
                  ) : isLocked ? (
                    <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Need ${Number(plan.min_amount || 0).toFixed(0)} USDT
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={goToTasks}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Start Tasks
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>

        {/* Description */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>1.</strong> Deposit USDT to your wallet (minimum amounts apply per plan)</p>
            <p><strong>2.</strong> Admin approves your deposit and sets task limit & commission %</p>
            <p><strong>3.</strong> Complete daily tasks (up to 25/day) to earn commission</p>
            <p><strong>4.</strong> Each task pays commission based on your deposit amount × percent</p>
            <p><strong>5.</strong> Once all tasks completed, you can reserve hotels and earn more!</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRechargeModal && dashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRechargeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                onClick={() => setShowRechargeModal(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <p className="text-sm text-gray-900 leading-relaxed pr-6">
                Hello, your account balance is insufficient, you cannot submit this order temporarily, you need to
                recharge{' '}
                <span className="font-semibold">{rechargeUsd.toFixed(2)}USD</span> to submit this order.{' '}
                <span className="text-red-600 font-medium">
                  The commission for completing this order will be increased by {mult} times
                </span>
                {dashboard.plan_ceiling_reached ? (
                  <span className="block mt-3 text-gray-700 font-medium">
                    You have reached the top reservation plan (Plan 1–3 ceiling). An additional approved deposit is required to continue.
                  </span>
                ) : null}
              </p>
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowRechargeModal(false);
                    navigate('/deposit');
                  }}
                  className="text-red-600 font-semibold hover:underline"
                >
                  Recharge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bottom Navigation */}
      <ResponsiveNav />
    </div>
  );
}
