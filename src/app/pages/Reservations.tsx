import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, MapPin, Clock, Search, Filter, Star, CreditCard, Users, X, Check, Edit, Trash2, Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reservationApi } from '../lib/api';
import { ResponsiveNav } from '../components/ResponsiveNav';

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
  pending_tasks: number;
  daily_limit: number;
  remaining_today: number;
  requires_recharge: boolean;
  current_plan: {
    name: string;
    commission_rate: number;
    daily_task_limit: number;
  } | null;
}

export function Reservations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // API data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, tasksRes] = await Promise.all([
        reservationApi.getDashboard(),
        reservationApi.getTasks(),
      ]);

      if (dashboardRes.success) {
        setDashboard(dashboardRes.dashboard);
      }

      if (tasksRes.success) {
        setTasks(tasksRes.tasks || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setNotice('Failed to load reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Convert tasks to reservation format
  const tasksAsReservations = tasks.map((task, index) => ({
    id: task.id,
    hotelName: `Reservation Task #${task.task_number}`,
    location: 'Daily Booking Task',
    checkIn: task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Pending',
    checkOut: '-',
    guests: 1,
    roomType: 'Standard',
    price: task.commission_amount,
    currency: 'USDT',
    status: task.status === 'completed' ? 'completed' : task.status === 'expired' ? 'cancelled' : 'pending',
    image: `https://images.unsplash.com/photo-${['1566073771259-4a9604499b0a', '1520250497591-112f2f40a3f4', '1571003123894-4fda9042a734', '1562774053-52e9c99606c4'][index % 4]}?w=300&h=200&fit=crop`,
    rating: 4.5 + (Math.random() * 0.5),
    amenities: ['WiFi', 'Commission', 'Daily Task'],
    bookingReference: `TASK-${task.id}`,
    isTask: true,
    taskData: task
  }));

  const filteredReservations = tasksAsReservations.filter((reservation: any) => {
    const hotelName = reservation.hotelName || '';
    const location = reservation.location || '';
    const matchesSearch = hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || reservation.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCompleteTask = async (taskId: number) => {
    if (!dashboard || dashboard.remaining_today <= 0) {
      setNotice('Daily limit reached! You cannot complete more tasks today.');
      return;
    }

    try {
      setCompletingTask(taskId);
      const response = await reservationApi.completeTask(taskId);
      
      if (response.success) {
        setNotice(`Task completed! Earned $${response.earned}`);
        loadData(); // Refresh data
      } else {
        setNotice(response.message || 'Failed to complete task');
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      setNotice(error.message || 'Failed to complete task');
    } finally {
      setCompletingTask(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleCancelReservation = (id: any) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      // Handle cancellation logic here
      alert('Reservation cancelled successfully');
    }
  };

  const handleModifyReservation = (reservation: any) => {
    setSelectedReservation(reservation);
  };

  const handleBookNew = () => {
    if (!dashboard || dashboard.pending_tasks === 0) {
      setNotice('No pending tasks available. Please make a deposit first.');
      return;
    }
    if (dashboard.remaining_today <= 0) {
      setNotice('Daily limit reached! Come back tomorrow.');
      return;
    }
    navigate('/tasks');
  };

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

      <div className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* Notice Banner */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{notice}</span>
              <button onClick={() => setNotice(null)} className="text-amber-600 hover:text-amber-800">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Progress Card */}
        {dashboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Daily Task Progress</h2>
                  <p className="text-blue-100">
                    Plan: {dashboard.current_plan?.name || 'No Plan'} | 
                    Limit: {dashboard.daily_limit} tasks/day
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dashboard.today_completed}</div>
                    <div className="text-sm text-blue-100">Completed</div>
                  </div>
                  <div className="text-2xl text-blue-200">/</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dashboard.daily_limit}</div>
                    <div className="text-sm text-blue-100">Limit</div>
                  </div>
                  <div className="text-center ml-4">
                    <div className={`text-3xl font-bold ${dashboard.remaining_today > 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {dashboard.remaining_today}
                    </div>
                    <div className="text-sm text-blue-100">Remaining</div>
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(dashboard.today_completed / dashboard.daily_limit) * 100}%` }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                <p className="mt-2 text-sm text-blue-100">
                  {dashboard.remaining_today > 0 
                    ? `Complete ${dashboard.remaining_today} more tasks to reach daily limit`
                    : 'Daily limit reached! Come back tomorrow.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                My Reservations
              </h1>
              <p className="text-gray-600">
                {dashboard?.pending_tasks || 0} pending tasks | 
                {dashboard?.today_completed || 0} completed today
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, filter: 'brightness(0.95)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookNew}
              disabled={!dashboard || dashboard.remaining_today <= 0 || dashboard.pending_tasks === 0}
              className={`px-6 py-3 rounded-xl font-bold text-black flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow ${
                !dashboard || dashboard.remaining_today <= 0 || dashboard.pending_tasks === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              style={{ backgroundColor: '#F4C444', fontFamily: 'Montserrat' }}
            >
              <Plus className="w-5 h-5" />
              Start New Booking
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by hotel name or location..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-[#D4AF37] transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  {filterStatus !== 'all' && (
                    <span className="px-2 py-1 bg-[#D4AF37] text-white text-xs rounded-full">
                      Active
                    </span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => { setFilterStatus('all'); setShowFilters(false); }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        All Reservations
                      </button>
                      <button
                        onClick={() => { setFilterStatus('confirmed'); setShowFilters(false); }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        Confirmed
                      </button>
                      <button
                        onClick={() => { setFilterStatus('pending'); setShowFilters(false); }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => { setFilterStatus('completed'); setShowFilters(false); }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        Completed
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-gray-500">Loading your reservations...</p>
          </div>
        )}

        {/* Reservations Grid or Empty State */}
        {!loading && filteredReservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Calendar className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
              No Tasks Yet
            </h3>
            <p className="text-gray-500 mb-8 text-center max-w-md" style={{ fontFamily: 'Inter' }}>
              {dashboard?.pending_tasks === 0 
                ? 'Make a deposit to get tasks. Admin approval required first.'
                : 'Complete your pending tasks to earn commissions. 25 tasks per day limit.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05, filter: 'brightness(0.95)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookNew}
              disabled={!dashboard || dashboard.remaining_today <= 0 || dashboard.pending_tasks === 0}
              className={`px-8 py-4 rounded-xl font-bold text-black flex items-center gap-3 shadow-lg hover:shadow-xl transition-shadow ${
                !dashboard || dashboard.remaining_today <= 0 || dashboard.pending_tasks === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              style={{ backgroundColor: '#F4C444', fontFamily: 'Montserrat' }}
            >
              <Plus className="w-6 h-6" />
              Start Booking Task
            </motion.button>
          </motion.div>
        ) : !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((reservation, index) => {
            const uniqueKey = `${reservation.id}-${index}`;
            const isPending = reservation.status === 'pending';
            const canComplete = isPending && dashboard && dashboard.remaining_today > 0;
            return (
            <motion.div
              key={uniqueKey}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={reservation.image}
                  alt={reservation.hotelName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: '#1a1a1a' }}>
                      {reservation.hotelName}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {reservation.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{reservation.rating}</span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{reservation.checkIn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{reservation.checkOut}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{reservation.guests || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">{reservation.roomType || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-2">
                    <span className="text-gray-600 font-bold">Ref ID:</span>
                    <span className="font-mono text-[#D4AF37] font-bold">{reservation.bookingReference || `SMH-${reservation.id}`}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {reservation.amenities && reservation.amenities.length > 0 ? (
                    <>
                      {reservation.amenities.slice(0, 3).map((amenity: string) => (
                        <span
                          key={`${reservation.id}-${amenity}`}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {reservation.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{reservation.amenities.length - 3}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      WiFi, Pool, Restaurant
                    </span>
                  )}
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                      ${reservation.price}
                    </p>
                    <p className="text-xs text-gray-500">Total Price</p>
                  </div>
                  <div className="flex gap-2">
                    {/* Complete Task Button */}
                    {canComplete && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCompleteTask(reservation.taskData.id)}
                        disabled={completingTask === reservation.taskData.id}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                      >
                        {completingTask === reservation.taskData.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Complete
                      </motion.button>
                    )}
                    
                    {/* Other Actions */}
                    {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleModifyReservation(reservation)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                    )}
                    {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <ResponsiveNav />
    </div>
  );
}
