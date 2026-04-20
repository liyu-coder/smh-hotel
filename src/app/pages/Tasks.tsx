import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, CheckCircle,
  Calendar, Target, RotateCcw, ChevronRight,
  Building, X,
} from 'lucide-react';
import { reservationApi } from '../lib/api';

interface Task {
  id: number;
  deposit_id: number;
  task_number: number;
  commission_amount: number;
  status: 'pending' | 'completed' | 'expired';
  completed_at: string | null;
  deposit_amount: number;
}

interface Dashboard {
  balance: number;
  total_approved: number;
  cash_gap: number;
  today_completed: number;
  today_earned: number;
  yesterday_commission?: number;
  pending_tasks: number;
  daily_limit: number;
  remaining_today: number;
  requires_recharge: boolean;
  recharge_amount?: number;
  commission_multiplier?: number;
  plan_ceiling_reached?: boolean;
  highest_plan_cap?: number;
  current_plan: {
    name: string;
    commission_rate: number;
  } | null;
}

export function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState<number | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, tasksRes] = await Promise.all([
        reservationApi.getDashboard(),
        reservationApi.getTasks(),
      ]);

      if (dashboardRes.success) {
        const d = dashboardRes.dashboard;
        setDashboard(d);
        if (d.requires_recharge) {
          setShowRechargeModal(true);
        }
      }
      if (tasksRes.success) {
        setTasks(tasksRes.tasks.filter((t: Task) => t.status === 'pending').slice(0, 25));
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completeTask = async (taskId: number) => {
    if (dashboard?.requires_recharge) {
      setShowRechargeModal(true);
      return;
    }
    try {
      setCompletingTask(taskId);
      const response = await reservationApi.completeTask(taskId.toString());
      if (response.success) {
        await loadData();
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompletingTask(null);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const rechargeUsd = dashboard
    ? (dashboard.recharge_amount ??
      Math.round(Math.max(0, dashboard.total_approved - dashboard.balance) * 100) / 100)
    : 0;

  const mult = dashboard?.commission_multiplier ?? 1.8;

  const handleStartBooking = () => {
    if (!dashboard) return;
    if (dashboard.pending_tasks === 0) {
      setNotice('You have no active tasks. Make a new deposit after admin approval to receive more tasks.');
      return;
    }
    if (dashboard.remaining_today <= 0) {
      setNotice(`You have reached the daily limit of ${dashboard.daily_limit || 25} completed tasks. Try again after 24:00 GMT+3.`);
      return;
    }
    if (dashboard.requires_recharge) {
      setShowRechargeModal(true);
      return;
    }
    setNotice(null);
    document.getElementById('available-tasks-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const dailyCap = dashboard?.daily_limit && dashboard.daily_limit > 0 ? dashboard.daily_limit : 25;
  const progressPct = Math.min(100, ((dashboard?.today_completed || 0) / dailyCap) * 100);

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        <h1 className="text-center text-lg font-semibold text-gray-900 mb-6">Account Overview Dashboard</h1>

        {notice && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {notice}
          </div>
        )}

        {dashboard && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Account Balance</p>
              <p className={`text-xl font-bold ${dashboard.balance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                {formatCurrency(dashboard.balance)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">number of tasks</p>
              <p
                className={`text-xl font-bold ${
                  dashboard.requires_recharge || dashboard.pending_tasks > 0 ? 'text-red-600' : 'text-gray-800'
                }`}
              >
                {dashboard.pending_tasks}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Yesterday commission</p>
              <p className="text-xl font-bold text-orange-500">
                {formatCurrency(dashboard.yesterday_commission ?? 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Commission today</p>
              <p className="text-xl font-bold text-orange-500">{formatCurrency(dashboard.today_earned)}</p>
            </div>
          </div>
        )}

        {dashboard && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleStartBooking}
            className="w-full mb-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 shadow-md transition-colors"
          >
            Start booking
          </motion.button>
        )}

        {dashboard && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Daily progress</span>
              <span className="text-sm text-gray-500">
                {dashboard.today_completed}/{dailyCap} (max {dailyCap} / day)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.45 }}
              />
            </div>
          </div>
        )}
      </div>

      <div id="available-tasks-section" className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Available Tasks
            </h2>
            <button type="button" onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <RotateCcw className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">All tasks completed!</p>
              <p className="text-sm text-gray-500 mt-1">Make a new deposit to get more tasks after admin approval.</p>
              <button
                type="button"
                onClick={() => navigate('/deposit')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Deposit
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="font-bold text-blue-700">{task.task_number}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">Task #{task.task_number}</p>
                      <p className="text-sm text-gray-500 truncate">From ${Number(task.deposit_amount).toFixed(2)} deposit</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-green-600">+{formatCurrency(Number(task.commission_amount))}</p>
                      <p className="text-xs text-gray-400">commission</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => completeTask(task.id)}
                      disabled={
                        completingTask === task.id ||
                        dashboard?.remaining_today === 0 ||
                        dashboard?.requires_recharge
                      }
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {completingTask === task.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {completingTask === task.id ? '…' : 'Complete'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {dashboard && dashboard.pending_tasks === 0 && dashboard.total_approved > 0 && (
        <div className="max-w-3xl mx-auto px-4 mt-6">
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/reserves')}
            className="w-full border-2 border-blue-600 text-blue-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
          >
            <Building className="w-5 h-5" />
            <span>Browse hotel reserves</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 mt-8 mb-10">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Description
          </h3>
          <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-5">
            <li>The commission earned is the amount of the completed transaction 4%.</li>
            <li>The system sends the task randomly and it will be completed as soon as possible to avoid being suspended all the time.</li>
            <li>The number of tasks will be reset after 24:00 GMT+3.</li>
            <li>Maximum {dailyCap} tasks per day (daily limit), separate from the task package size set when your deposit is approved.</li>
            <li>If your working balance falls below your approved deposit principal while you still have pending tasks, you must recharge to continue.</li>
          </ol>
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
                  <span className="block mt-3 text-gray-800 font-medium">
                    You have reached the <strong>top reservation plan</strong> (Plan 1–3 ceiling). Submit another deposit for admin approval to continue.
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
    </div>
  );
}
