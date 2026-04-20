import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, DollarSign, Clock, CheckCircle, XCircle, Search, Shield,
  Eye, Ban, Check, ChevronDown, ArrowLeft, Building, Calendar, Wallet,
  Plus, Edit, Trash2, Star, LayoutDashboard, UserCheck, Settings,
  CreditCard, Hotel, BookOpen, Menu, ChevronRight, TrendingUp, TrendingDown,
  Mail, Smartphone, Percent, Gift, BarChart3, PieChart, Globe, Monitor,
  User, Phone, MapPin, Calendar as CalendarIcon, RefreshCw, Filter,
  Download, MoreHorizontal, AlertCircle, Info, FileText, Coins, ArrowUpCircle,
  ArrowDownCircle, RotateCcw, Trash, X, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../lib/api';

// Sidebar Menu Item Component with Submenu Support
const MenuItem = ({ icon: Icon, label, active, onClick, hasSubmenu, isExpanded, children }: any) => (
  <div>
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-left">{label}</span>
      {hasSubmenu && (
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      )}
    </button>
    <AnimatePresence>
      {isExpanded && children && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden bg-gray-800"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Sub Menu Item Component
const SubMenuItem = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors pl-12 ${
      active
        ? 'bg-blue-700 text-white'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`}
  >
    <div className="w-2 h-2 rounded-full border border-current" />
    <span>{label}</span>
  </button>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, trend, subtext }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${color} rounded-xl p-5 text-white shadow-lg`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-white/80">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-300' : 'text-red-300'}`}>
          {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    {subtext && <p className="text-xs text-white/70 mt-2">{subtext}</p>}
  </motion.div>
);

// Simple Bar Chart Component
const SimpleBarChart = ({ data }: any) => (
  <div className="flex items-end justify-between h-40 gap-2">
    {data.map((item: any, index: number) => (
      <div key={index} className="flex flex-col items-center flex-1">
        <div className="flex gap-1 h-32 items-end">
          <div
            className="w-3 bg-blue-500 rounded-t"
            style={{ height: `${(item.deposit / 50000) * 100}%` }}
          />
          <div
            className="w-3 bg-green-500 rounded-t"
            style={{ height: `${(item.withdraw / 50000) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">{item.month}</span>
      </div>
    ))}
  </div>
);

// Simple Line Chart Component
const SimpleLineChart = () => (
  <svg viewBox="0 0 300 100" className="w-full h-40">
    <defs>
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0,80 Q50,70 100,60 T200,40 T300,50"
      fill="none"
      stroke="#3B82F6"
      strokeWidth="2"
    />
    <path
      d="M0,80 Q50,70 100,60 T200,40 T300,50 L300,100 L0,100 Z"
      fill="url(#lineGradient)"
    />
    <path
      d="M0,85 Q50,80 100,75 T200,65 T300,70"
      fill="none"
      stroke="#10B981"
      strokeWidth="2"
    />
  </svg>
);

// Simple Donut Chart Component
const SimpleDonutChart = ({ data, colors }: any) => {
  const total = data.reduce((acc: number, item: number) => acc + item, 0);
  let currentAngle = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
      {data.map((value: number, index: number) => {
        const angle = (value / total) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;
        const endAngle = currentAngle;

        const x1 = 50 + 35 * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 50 + 35 * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 50 + 35 * Math.cos((endAngle * Math.PI) / 180);
        const y2 = 50 + 35 * Math.sin((endAngle * Math.PI) / 180);

        const largeArc = angle > 180 ? 1 : 0;

        return (
          <path
            key={index}
            d={`M50,50 L${x1},${y1} A35,35 0 ${largeArc},1 ${x2},${y2} Z`}
            fill={colors[index]}
          />
        );
      })}
      <circle cx="50" cy="50" r="20" fill="white" />
    </svg>
  );
};

export function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions' | 'hotels' | 'bookings' | 'deposits' | 'withdrawals' | 'reports' | 'gateways'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'banned' | 'email_unverified' | 'mobile_unverified' | 'kyc_unverified' | 'kyc_pending' | 'with_balance'>('all');
  const [reportFilter, setReportFilter] = useState<'transaction_log' | 'login_history' | 'notification_history' | 'ptc_view_log' | 'referral_commissions'>('transaction_log');
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'methods'>('all');
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected'>('all');
  const [gatewayFilter, setGatewayFilter] = useState<'automatic' | 'manual'>('automatic');
  const [depositSearchQuery, setDepositSearchQuery] = useState('');
  const [depositDateRange, setDepositDateRange] = useState({ start: '', end: '' });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Submenu expanded states
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    deposits: false,
    withdrawals: false,
    bookings: false,
    users: false,
    hotels: false,
    reports: false,
    gateways: false,
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{type: string; id: string; status?: string; isDeposit?: boolean} | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [taskLimit, setTaskLimit] = useState<number>(25);
  const [taskPercent, setTaskPercent] = useState<number>(4);
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [showDepositDetailsModal, setShowDepositDetailsModal] = useState(false);
  const [showAcceptDepositModal, setShowAcceptDepositModal] = useState(false);
  const [pendingAcceptDeposit, setPendingAcceptDeposit] = useState<any>(null);
  const [notification, setNotification] = useState<{type: string; message: string} | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ subject: '', message: '', type: 'all' });

  // Hotel modal states
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [hotelForm, setHotelForm] = useState({
    name: '',
    description: '',
    city: '',
    country: '',
    price_per_night: '',
    rating: 4,
    location: '',
    amenities: '',
    image_url: ''
  });

  // Create Admin modal states
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin'
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Sample chart data
  const monthlyData = [
    { month: 'Aug', deposit: 35000, withdraw: 25000 },
    { month: 'Sep', deposit: 42000, withdraw: 28000 },
    { month: 'Oct', deposit: 38000, withdraw: 32000 },
    { month: 'Nov', deposit: 45000, withdraw: 30000 },
    { month: 'Dec', deposit: 50000, withdraw: 35000 },
    { month: 'Jan', deposit: 48000, withdraw: 33000 },
    { month: 'Feb', deposit: 55000, withdraw: 38000 },
    { month: 'Mar', deposit: 52000, withdraw: 36000 },
    { month: 'Apr', deposit: 58000, withdraw: 40000 },
    { month: 'May', deposit: 62000, withdraw: 42000 },
    { month: 'Jun', deposit: 60000, withdraw: 45000 },
    { month: 'Jul', deposit: 65000, withdraw: 48000 },
  ];

  // Check if user is admin
  useEffect(() => {
    console.log('🔍 Admin component - User:', user);
    console.log('🔍 Admin component - User role:', user?.role);
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      console.log('⚠️ User is not admin, redirecting to admin login');
      navigate('/admin');
    }
  }, [user, navigate]);

  // Load dashboard stats
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  // Load users
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, searchQuery, userFilter]);

  // Load transactions
  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab]);

  // Load hotels
  useEffect(() => {
    if (activeTab === 'hotels') {
      loadHotels();
    }
  }, [activeTab]);

  // Load reports
  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, reportFilter]);

  // Load bookings
  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab]);

  // Load deposits
  useEffect(() => {
    if (activeTab === 'deposits') {
      loadDeposits();
    }
  }, [activeTab]);

  // Load withdrawals
  useEffect(() => {
    if (activeTab === 'withdrawals') {
      loadWithdrawals();
    }
  }, [activeTab]);

  // Notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading admin stats...');
      const response = await adminApi.getStats();
      console.log('📦 Admin stats response:', response);
      if (response.success) {
        setStats(response.stats);
      } else {
        setError('Failed to load stats');
      }
    } catch (error: any) {
      console.error('❌ Error loading stats:', error);
      setError(error.message || 'Error loading stats');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setReportLoading(true);
    try {
      if (reportFilter === 'transaction_log') {
        const resp = await adminApi.getTransactions({ limit: 100 });
        if (resp.success) setReportRows(resp.transactions || []);
      } else if (reportFilter === 'login_history') {
        const resp = await adminApi.getUsers({ limit: 100 });
        if (resp.success) setReportRows(resp.users || []);
      } else if (reportFilter === 'notification_history') {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/support/admin/all?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setReportRows(data.tickets || []);
      } else if (reportFilter === 'ptc_view_log') {
        const res = await fetch('http://localhost:5000/api/hotels?limit=100');
        const data = await res.json();
        if (data.success) setReportRows(data.hotels || []);
      } else if (reportFilter === 'referral_commissions') {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/admin/team-members?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setReportRows(data.teamMembers || []);
      }
    } catch (e) {
      console.error('Error loading reports:', e);
      setReportRows([]);
    } finally {
      setReportLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers({ search: searchQuery });
      if (response.success) {
        let filteredUsers = response.users;

        // Apply user filter
        switch (userFilter) {
          case 'active':
            filteredUsers = filteredUsers.filter((u: any) => u.is_active);
            break;
          case 'banned':
            filteredUsers = filteredUsers.filter((u: any) => !u.is_active);
            break;
          case 'email_unverified':
            filteredUsers = filteredUsers.filter((u: any) => !u.is_verified);
            break;
          case 'mobile_unverified':
            // Assuming mobile verification status is stored in user data
            filteredUsers = filteredUsers.filter((u: any) => !u.mobile_verified);
            break;
          case 'kyc_unverified':
            filteredUsers = filteredUsers.filter((u: any) => !u.kyc_verified);
            break;
          case 'kyc_pending':
            filteredUsers = filteredUsers.filter((u: any) => u.kyc_status === 'pending');
            break;
          case 'with_balance':
            filteredUsers = filteredUsers.filter((u: any) => (u.available_balance || 0) > 0);
            break;
          default:
            // 'all' - no filtering
            break;
        }

        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await adminApi.getTransactions({ status: 'pending' });
      if (response.success) {
        setTransactions(response.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHotels = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/hotels');
      const data = await response.json();
      if (data.success) {
        setHotels(data.hotels);
      }
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddHotelModal = () => {
    setEditingHotel(null);
    setHotelForm({
      name: '',
      description: '',
      city: '',
      country: '',
      price_per_night: '',
      rating: 4,
      location: '',
      amenities: '',
      image_url: ''
    });
    setShowHotelModal(true);
  };

  const openEditHotelModal = (hotel: any) => {
    setEditingHotel(hotel);
    setHotelForm({
      name: hotel.name || '',
      description: hotel.description || '',
      city: hotel.city || '',
      country: hotel.country || '',
      price_per_night: hotel.price_per_night || '',
      rating: hotel.rating || 4,
      location: hotel.location || '',
      amenities: hotel.amenities || '',
      image_url: hotel.image_url || ''
    });
    setShowHotelModal(true);
  };

  const handleDeleteHotel = async (id: string) => {
    setConfirmAction({ type: 'deleteHotel', id });
    setShowConfirmModal(true);
  };

  const handleSaveHotel = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingHotel
        ? `http://localhost:5000/api/admin/hotels/${editingHotel.id}`
        : 'http://localhost:5000/api/admin/hotels';
      const method = editingHotel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotelForm)
      });

      const data = await response.json();
      if (data.success) {
        showNotification('success', editingHotel ? 'Hotel updated successfully' : 'Hotel added successfully');
        setShowHotelModal(false);
        loadHotels();
      } else {
        showNotification('error', data.message || 'Failed to save hotel');
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      showNotification('error', 'Failed to save hotel');
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      showNotification('error', 'Name, email and password are required');
      return;
    }

    if (adminForm.password.length < 6) {
      showNotification('error', 'Password must be at least 6 characters');
      return;
    }

    setCreatingAdmin(true);
    try {
      const response = await adminApi.createAdmin(adminForm);
      if (response.success) {
        showNotification('success', `${adminForm.role} account created successfully`);
        setShowCreateAdminModal(false);
        setAdminForm({ name: '', email: '', password: '', phone: '', role: 'admin' });
        loadUsers();
      } else {
        showNotification('error', response.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      showNotification('error', 'Failed to create admin user');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings');
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getTransactions({ type: 'deposit' });
      if (response.success) {
        setDeposits(response.transactions);
      }
    } catch (error) {
      console.error('Error loading deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getTransactions({ type: 'withdrawal' });
      if (response.success) {
        setWithdrawals(response.transactions);
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId: string, is_active: boolean) => {
    setActionLoading(true);
    try {
      await adminApi.updateUserStatus(userId, { is_active });
      showNotification('success', `User ${is_active ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error) {
      showNotification('error', 'Failed to update user status');
      console.error('Error updating user status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserVerification = async (userId: string, is_verified: boolean) => {
    setActionLoading(true);
    try {
      await adminApi.updateUserStatus(userId, { is_verified });
      showNotification('success', `User ${is_verified ? 'verified' : 'unverified'} successfully`);
      loadUsers();
    } catch (error) {
      showNotification('error', 'Failed to update user verification');
      console.error('Error updating user verification:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransactionApproval = async (transactionId: string, status: 'approved' | 'rejected', isDeposit?: boolean) => {
    setActionLoading(true);
    try {
      const updateData: any = { status };
      // Include task_limit and percent for deposit approvals
      if (status === 'approved' && isDeposit) {
        updateData.task_limit = taskLimit;
        updateData.percent = taskPercent;
      }
      await adminApi.updateTransactionStatus(transactionId, updateData);
      showNotification('success', `Transaction ${status} successfully${status === 'approved' && isDeposit ? ` with ${taskLimit} tasks at ${taskPercent}%` : ''}`);
      // Reload all transaction-related data
      loadTransactions();
      loadDeposits();
      loadWithdrawals();
      loadStats();
    } catch (error) {
      showNotification('error', 'Failed to update transaction status');
      console.error('Error updating transaction status:', error);
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
      setShowAcceptDepositModal(false);
      setPendingAcceptDeposit(null);
      // Reset task settings
      setTaskLimit(25);
      setTaskPercent(4);
    }
  };

  const openConfirmModal = (type: string, id: string, status?: string) => {
    setConfirmAction({ type, id, status });
    setShowConfirmModal(true);
  };

  const viewUserDetails = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-medium mb-2">Error loading dashboard</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats?.totalUsers || 0}
                color="bg-gradient-to-r from-blue-600 to-blue-500"
              />
              <StatCard
                icon={UserCheck}
                label="Active Users"
                value={stats?.activeUsers || 0}
                color="bg-gradient-to-r from-green-500 to-green-400"
              />
              <StatCard
                icon={Mail}
                label="Email Unverified"
                value={0}
                color="bg-gradient-to-r from-red-500 to-red-400"
              />
              <StatCard
                icon={Smartphone}
                label="Mobile Unverified"
                value={0}
                color="bg-gradient-to-r from-orange-500 to-orange-400"
              />
            </div>

            {/* Deposit Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={DollarSign}
                label="Total Deposited"
                value={`$${(stats?.totalBalance || 0).toLocaleString()}`}
                color="bg-gradient-to-r from-green-600 to-green-500"
                subtext="View All"
              />
              <StatCard
                icon={Clock}
                label="Pending Deposits"
                value={stats?.pendingTransactions || 0}
                color="bg-gradient-to-r from-yellow-500 to-yellow-400"
                subtext="View All"
              />
              <StatCard
                icon={XCircle}
                label="Rejected Deposits"
                value={0}
                color="bg-gradient-to-r from-red-600 to-red-500"
                subtext="View All"
              />
              <StatCard
                icon={Percent}
                label="Deposited Charge"
                value="$0.00"
                color="bg-gradient-to-r from-purple-600 to-purple-500"
                subtext="View All"
              />
            </div>

            {/* Withdrawal Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={CreditCard}
                label="Total Withdrawn"
                value="$0.00"
                color="bg-gradient-to-r from-teal-600 to-teal-500"
                subtext="View All"
              />
              <StatCard
                icon={Clock}
                label="Pending Withdrawals"
                value={stats?.pendingTransactions || 0}
                color="bg-gradient-to-r from-yellow-500 to-yellow-400"
                subtext="View All"
              />
              <StatCard
                icon={XCircle}
                label="Rejected Withdrawals"
                value={0}
                color="bg-gradient-to-r from-red-600 to-red-500"
                subtext="View All"
              />
              <StatCard
                icon={Percent}
                label="Withdrawal Charge"
                value="$0.00"
                color="bg-gradient-to-r from-pink-600 to-pink-500"
                subtext="View All"
              />
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Gift}
                label="Total Ads"
                value="0.00 USDT"
                color="bg-gradient-to-r from-indigo-600 to-indigo-500"
                subtext="View All"
              />
              <StatCard
                icon={Eye}
                label="Viewed Ads"
                value="0.00 USDT"
                color="bg-gradient-to-r from-cyan-600 to-cyan-500"
                subtext="View All"
              />
              <StatCard
                icon={Percent}
                label="Referral Commissions"
                value="0.00 USDT"
                color="bg-gradient-to-r from-orange-600 to-orange-500"
                subtext="View All"
              />
              <StatCard
                icon={BarChart3}
                label="Total Plan Purchased"
                value="0.00 USDT"
                color="bg-gradient-to-r from-violet-600 to-violet-500"
                subtext="View All"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Report Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Deposit & Withdraw Report (Last 12 Month)</h3>
                <SimpleBarChart data={monthlyData} />
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-600">Total Deposit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-xs text-gray-600">Total Withdraw</span>
                  </div>
                </div>
              </div>

              {/* Transactions Line Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions Report (Last 30 Days)</h3>
                <SimpleLineChart />
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Plus Transactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Minus Transactions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donut Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Login By Browser (Last 30 days)</h3>
                <SimpleDonutChart data={[40, 35, 25]} colors={['#3B82F6', '#EF4444', '#10B981']} />
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Login By OS (Last 30 days)</h3>
                <SimpleDonutChart data={[50, 30, 20]} colors={['#F59E0B', '#8B5CF6', '#EC4899']} />
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Login By Country (Last 30 days)</h3>
                <SimpleDonutChart data={[60, 25, 15]} colors={['#EF4444', '#3B82F6', '#10B981']} />
              </div>
            </div>
          </motion.div>
        );
      case 'users':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header with Filter Info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {userFilter === 'all' ? 'All Users' :
                   userFilter === 'active' ? 'Active Users' :
                   userFilter === 'banned' ? 'Banned Users' :
                   userFilter === 'email_unverified' ? 'Email Unverified Users' :
                   userFilter === 'mobile_unverified' ? 'Mobile Unverified Users' :
                   userFilter === 'kyc_unverified' ? 'KYC Unverified Users' :
                   userFilter === 'kyc_pending' ? 'KYC Pending Users' :
                   userFilter === 'with_balance' ? 'Users With Balance' : 'Users'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {users.length} user{users.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex items-center gap-2">
                {userFilter !== 'all' && (
                  <button
                    onClick={() => setUserFilter('all')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Clear Filter
                  </button>
                )}
                {user?.role === 'super_admin' && (
                  <button
                    onClick={() => setShowCreateAdminModal(true)}
                    className="flex items-center gap-2 bg-[#F4C444] hover:bg-[#E5B334] text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    Create Admin
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{userItem.name}</div>
                          <div className="text-sm text-gray-500">{userItem.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          userItem.role === 'super_admin' ? 'bg-red-100 text-red-700 border border-red-200' :
                          userItem.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          userItem.role === 'support' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          userItem.role === 'moderator' ? 'bg-green-100 text-green-700 border border-green-200' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {userItem.role === 'super_admin' && <Shield className="w-3 h-3" />}
                          {userItem.role === 'admin' && <UserCheck className="w-3 h-3" />}
                          {userItem.role === 'support' && <HelpCircle className="w-3 h-3" />}
                          {userItem.role === 'moderator' && <Eye className="w-3 h-3" />}
                          {userItem.role === 'user' && <User className="w-3 h-3" />}
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${Number(userItem.available_balance || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            userItem.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {userItem.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {userItem.is_verified && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewUserDetails(userItem)}
                            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserStatusChange(userItem.id, !userItem.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              userItem.is_active ? 'hover:bg-red-100 text-red-600' : 'hover:bg-green-100 text-green-600'
                            }`}
                            title={userItem.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {userItem.is_active ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleUserVerification(userItem.id, !userItem.is_verified)}
                            className={`p-2 rounded-lg transition-colors ${
                              userItem.is_verified ? 'hover:bg-orange-100 text-orange-600' : 'hover:bg-green-100 text-green-600'
                            }`}
                            title={userItem.is_verified ? 'Unverify' : 'Verify'}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      case 'hotels':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Hotels Management</h2>
              <button onClick={openAddHotelModal} className="flex items-center gap-2 bg-[#F4C444] hover:bg-[#E5B334] text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
                Add Hotel
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{hotel.name}</div>
                        <div className="text-sm text-gray-500">{hotel.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{hotel.city}, {hotel.country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${Number(hotel.price_per_night).toFixed(2)}/night
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-900">{hotel.rating}</span>
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditHotelModal(hotel)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteHotel(hotel.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hotels.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No hotels found
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'deposits': {
        let filteredDeposits = depositFilter === 'all' ? deposits :
          depositFilter === 'pending' ? deposits.filter((d: any) => d.status === 'pending') :
          depositFilter === 'approved' ? deposits.filter((d: any) => d.status === 'approved') :
          depositFilter === 'completed' ? deposits.filter((d: any) => d.status === 'completed') :
          depositFilter === 'rejected' ? deposits.filter((d: any) => d.status === 'rejected') :
          deposits;
        
        // Apply search query filter
        if (depositSearchQuery) {
          const query = depositSearchQuery.toLowerCase();
          filteredDeposits = filteredDeposits.filter((d: any) => 
            d.transaction_id?.toString().toLowerCase().includes(query) ||
            d.user_name?.toLowerCase().includes(query) ||
            d.user_email?.toLowerCase().includes(query) ||
            d.user_telegram?.toLowerCase().includes(query) ||
            d.id?.toString().includes(query)
          );
        }
        
        // Apply date range filter
        if (depositDateRange.start && depositDateRange.end) {
          const startDate = new Date(depositDateRange.start);
          const endDate = new Date(depositDateRange.end);
          endDate.setHours(23, 59, 59);
          filteredDeposits = filteredDeposits.filter((d: any) => {
            const depositDate = new Date(d.created_at);
            return depositDate >= startDate && depositDate <= endDate;
          });
        }

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {depositFilter === 'pending' ? 'Pending Deposits' :
                   depositFilter === 'approved' ? 'Approved Deposits' :
                   depositFilter === 'completed' ? 'Completed Deposits' :
                   depositFilter === 'rejected' ? 'Rejected Deposits' :
                   'All Deposits'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredDeposits.length} deposit{filteredDeposits.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex items-center gap-2">
                {depositFilter !== 'all' && (
                  <button
                    onClick={() => setDepositFilter('all')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Clear Filter
                  </button>
                )}
                <button 
                  onClick={loadDeposits}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Search Bar Section */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              {/* Date Range */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={depositDateRange.start}
                  onChange={(e) => setDepositDateRange((r) => ({ ...r, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-gray-400 text-sm">—</span>
                <input
                  type="date"
                  value={depositDateRange.end}
                  onChange={(e) => setDepositDateRange((r) => ({ ...r, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => { setDepositDateRange({ start: '', end: '' }); }}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                >
                  Clear dates
                </button>
              </div>

              {/* Transaction/User Search */}
              <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
                <input
                  type="text"
                  placeholder="Trx number/Username"
                  value={depositSearchQuery}
                  onChange={(e) => setDepositSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button 
                  onClick={() => setDepositSearchQuery('')}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-indigo-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Gateway | Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Initiated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Conversion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDeposits.map((deposit) => {
                    const depositDate = new Date(deposit.created_at);
                    const timeAgo = Math.floor((Date.now() - depositDate.getTime()) / 60000);
                    const timeAgoText = timeAgo < 1 ? 'Just now' : timeAgo < 60 ? `${timeAgo} minute${timeAgo > 1 ? 's' : ''} ago` : `${Math.floor(timeAgo / 60)} hour${Math.floor(timeAgo / 60) > 1 ? 's' : ''} ago`;
                    
                    return (
                      <tr key={deposit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-blue-600">{deposit.method?.toUpperCase() || 'USDT'}</div>
                          <div className="text-xs text-gray-500">{deposit.transaction_id || deposit.id?.toString().slice(-5) || '69666'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{depositDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-xs text-gray-500">{timeAgoText}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{deposit.user_name}</div>
                          <div className="text-sm text-blue-500">@{deposit.user_telegram || deposit.user_email?.split('@')[0] || '7464956295'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <span className="text-gray-900">${Number(deposit.amount).toFixed(2)}</span>
                            <span className="text-red-500 ml-1">+ 0.00</span>
                          </div>
                          <div className="text-xs text-gray-500">{Number(deposit.amount).toFixed(2)} USDT</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">1 {deposit.method?.toUpperCase() || 'USDT'} = 1.00 USDT</div>
                          <div className="text-xs text-gray-500">{Number(deposit.amount).toFixed(2)} USDT</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            deposit.status === 'approved' ? 'bg-green-100 text-green-700' :
                            deposit.status === 'pending' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                            deposit.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {deposit.status?.charAt(0).toUpperCase() + deposit.status?.slice(1) || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => { setSelectedDeposit(deposit); setShowDepositDetailsModal(true); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-500 text-indigo-600 hover:bg-indigo-50 text-xs font-medium transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredDeposits.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No deposits found</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      }

      case 'withdrawals': {
        const filteredWithdrawals = withdrawalFilter === 'all' ? withdrawals :
          withdrawalFilter === 'pending' ? withdrawals.filter((w: any) => w.status === 'pending') :
          withdrawalFilter === 'approved' ? withdrawals.filter((w: any) => w.status === 'approved') :
          withdrawalFilter === 'rejected' ? withdrawals.filter((w: any) => w.status === 'rejected') :
          withdrawals;

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {withdrawalFilter === 'methods' ? 'Withdrawal Methods' :
                   withdrawalFilter === 'pending' ? 'Pending Withdrawals' :
                   withdrawalFilter === 'approved' ? 'Approved Withdrawals' :
                   withdrawalFilter === 'rejected' ? 'Rejected Withdrawals' :
                   'All Withdrawals'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredWithdrawals.length} withdrawal{filteredWithdrawals.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex items-center gap-2">
                {withdrawalFilter !== 'all' && (
                  <button
                    onClick={() => setWithdrawalFilter('all')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Clear Filter
                  </button>
                )}
                <button 
                  onClick={loadWithdrawals}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{withdrawal.user_name}</div>
                        <div className="text-sm text-gray-500">{withdrawal.user_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-red-600">
                          -${Number(withdrawal.amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {withdrawal.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          withdrawal.status === 'approved' ? 'bg-green-100 text-green-700' :
                          withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          withdrawal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {withdrawal.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openConfirmModal('transaction', withdrawal.id, 'approved')}
                              className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openConfirmModal('transaction', withdrawal.id, 'rejected')}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredWithdrawals.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ArrowUpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No withdrawals found</p>
                </div>
              )}
            </div>
          </motion.div>
        );

      }

      case 'gateways':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {gatewayFilter === 'automatic' ? 'Automatic Payment Gateways' : 'Manual Payment Gateways'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your {gatewayFilter === 'automatic' ? 'automatic' : 'manual'} payment methods
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => showNotification('success', 'Add gateway feature coming soon')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Gateway
                </button>
              </div>
            </div>

            {/* Gateway Types Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setGatewayFilter('automatic')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  gatewayFilter === 'automatic'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Automatic Gateways
              </button>
              <button
                onClick={() => setGatewayFilter('manual')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  gatewayFilter === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manual Gateways
              </button>
            </div>

            {/* Gateway Content Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sample Gateway Card */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{gatewayFilter === 'automatic' ? 'Stripe' : 'Bank Transfer'}</h3>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Active</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {gatewayFilter === 'automatic' ? 'Automatic payment processing via Stripe API' : 'Manual bank transfer with reference code'}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                      Disable
                    </button>
                  </div>
                </div>

                {/* Sample Gateway Card 2 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{gatewayFilter === 'automatic' ? 'PayPal' : 'Crypto Wallet'}</h3>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Active</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {gatewayFilter === 'automatic' ? 'PayPal Express Checkout integration' : 'Cryptocurrency payments via wallet address'}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                      Disable
                    </button>
                  </div>
                </div>

                {/* Add New Gateway Card */}
                <button
                  onClick={() => showNotification('success', 'Add gateway feature coming soon')}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 min-h-[180px]"
                >
                  <Plus className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Add New Gateway</span>
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'reports':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {reportFilter === 'transaction_log' ? 'Transaction Log' :
                   reportFilter === 'login_history' ? 'Login History' :
                   reportFilter === 'notification_history' ? 'Notification History' :
                   reportFilter === 'ptc_view_log' ? 'PTC View Log' :
                   reportFilter === 'referral_commissions' ? 'Referral Commissions' : 'Reports'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  View and export detailed reports
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => showNotification('success', 'Export feature coming soon')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {reportRows.length} record{reportRows.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={loadReports}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {reportLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : reportRows.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No data found</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    {reportFilter === 'transaction_log' && (
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    )}
                    {reportFilter === 'login_history' && (
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    )}
                    {reportFilter === 'notification_history' && (
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    )}
                    {reportFilter === 'ptc_view_log' && (
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      </tr>
                    )}
                    {reportFilter === 'referral_commissions' && (
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Referrals</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      </tr>
                    )}
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {reportRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {reportFilter === 'transaction_log' && (
                          <>
                            <td className="px-6 py-4 text-sm text-gray-900 capitalize">{row.type}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{row.user_name}</div>
                              <div className="text-xs text-gray-500">{row.user_email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">${Number(row.amount).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{row.method}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 capitalize">{row.status}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(row.created_at).toLocaleDateString()}</td>
                          </>
                        )}

                        {reportFilter === 'login_history' && (
                          <>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{row.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 capitalize">{row.role}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(row.created_at).toLocaleDateString()}</td>
                          </>
                        )}

                        {reportFilter === 'notification_history' && (
                          <>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.subject}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{row.user_name}</div>
                              <div className="text-xs text-gray-500">{row.user_email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 capitalize">{row.category}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 capitalize">{row.status}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(row.created_at).toLocaleDateString()}</td>
                          </>
                        )}

                        {reportFilter === 'ptc_view_log' && (
                          <>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{row.location || `${row.city || ''} ${row.country_name || ''}`}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{row.views_count || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{row.rating}</td>
                          </>
                        )}

                        {reportFilter === 'referral_commissions' && (
                          <>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{row.user_name}</div>
                              <div className="text-xs text-gray-500">{row.user_email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{row.referral_code}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">${Number(row.total_earnings || 0).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{row.total_referrals || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{Number(row.commission_rate || 0) * 100}%</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        );

      case 'bookings':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={loadBookings}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">#{booking.id}</div>
                        <div className="text-xs text-gray-500">{booking.booking_reference}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{booking.user_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{booking.user_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{booking.hotel_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.hotel_city}, {booking.hotel_country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            {new Date(booking.check_in_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <ArrowDownCircle className="w-4 h-4 text-gray-400" />
                            {new Date(booking.check_out_date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${Number(booking.total_amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">{booking.guests} guests</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          {booking.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => openConfirmModal('booking', booking.id, 'confirmed')}
                                className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => openConfirmModal('booking', booking.id, 'cancelled')}
                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No bookings found</p>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'transactions':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Pending Transactions</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={loadTransactions}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{transaction.user_name}</div>
                        <div className="text-sm text-gray-500">{transaction.user_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {transaction.type === 'deposit' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {transaction.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (transaction.type === 'deposit') {
                                setPendingAcceptDeposit(transaction);
                                setTaskLimit(25);
                                setTaskPercent(4);
                                setShowAcceptDepositModal(true);
                              } else {
                                openConfirmModal('transaction', transaction.id, 'approved');
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openConfirmModal('transaction', transaction.id, 'rejected')}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending transactions</p>
                  <p className="text-sm text-gray-400 mt-1">All caught up!</p>
                </div>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 min-h-screen transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-xl">😎</span>
            </div>
            {sidebarOpen && <span className="text-white font-bold">BOOK SMH</span>}
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 py-4">
          <MenuItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <MenuItem
            icon={Percent}
            label="Referral Commissions"
            active={activeTab === 'transactions'}
            onClick={() => setActiveTab('transactions')}
            hasSubmenu
          />
          <MenuItem
            icon={CreditCard}
            label="Subscription Plan"
            active={activeTab === 'deposits'}
            onClick={() => setActiveTab('deposits')}
            hasSubmenu
          />
          <MenuItem
            icon={Hotel}
            label="PTC Ads"
            active={activeTab === 'hotels'}
            onClick={() => setActiveTab('hotels')}
            hasSubmenu
          />
          <MenuItem
            icon={Users}
            label="Manage Users"
            active={activeTab === 'users'}
            onClick={() => toggleMenu('users')}
            hasSubmenu
            isExpanded={expandedMenus.users}
          >
            <SubMenuItem
              label="Active Users"
              active={userFilter === 'active'}
              onClick={() => { setActiveTab('users'); setUserFilter('active'); }}
            />
            <SubMenuItem
              label="Banned Users"
              active={userFilter === 'banned'}
              onClick={() => { setActiveTab('users'); setUserFilter('banned'); }}
            />
            <SubMenuItem
              label="Email Unverified"
              active={userFilter === 'email_unverified'}
              onClick={() => { setActiveTab('users'); setUserFilter('email_unverified'); }}
            />
            <SubMenuItem
              label="Mobile Unverified"
              active={userFilter === 'mobile_unverified'}
              onClick={() => { setActiveTab('users'); setUserFilter('mobile_unverified'); }}
            />
            <SubMenuItem
              label="KYC Unverified"
              active={userFilter === 'kyc_unverified'}
              onClick={() => { setActiveTab('users'); setUserFilter('kyc_unverified'); }}
            />
            <SubMenuItem
              label="KYC Pending"
              active={userFilter === 'kyc_pending'}
              onClick={() => { setActiveTab('users'); setUserFilter('kyc_pending'); }}
            />
            <SubMenuItem
              label="With Balance"
              active={userFilter === 'with_balance'}
              onClick={() => { setActiveTab('users'); setUserFilter('with_balance'); }}
            />
            <SubMenuItem
              label="All Users"
              active={userFilter === 'all'}
              onClick={() => { setActiveTab('users'); setUserFilter('all'); }}
            />
            <SubMenuItem
              label="Notification to All"
              active={showNotificationModal}
              onClick={() => setShowNotificationModal(true)}
            />
          </MenuItem>
          {/* Deposits with Submenu */}
          <MenuItem
            icon={DollarSign}
            label="Deposits"
            active={activeTab === 'deposits'}
            onClick={() => toggleMenu('deposits')}
            hasSubmenu
            isExpanded={expandedMenus.deposits}
          >
            <div className="relative">
              <SubMenuItem
                label="Pending Deposits"
                active={depositFilter === 'pending'}
                onClick={() => { setActiveTab('deposits'); setDepositFilter('pending'); }}
              />
              {deposits.filter((d: any) => d.status === 'pending').length > 0 && (
                <span className="absolute right-4 top-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                  {deposits.filter((d: any) => d.status === 'pending').length}
                </span>
              )}
            </div>
            <SubMenuItem
              label="Approved Deposits"
              active={depositFilter === 'approved'}
              onClick={() => { setActiveTab('deposits'); setDepositFilter('approved'); }}
            />
            <SubMenuItem
              label="Completed Deposits"
              active={depositFilter === 'completed'}
              onClick={() => { setActiveTab('deposits'); setDepositFilter('completed'); }}
            />
            <SubMenuItem
              label="Rejected Deposits"
              active={depositFilter === 'rejected'}
              onClick={() => { setActiveTab('deposits'); setDepositFilter('rejected'); }}
            />
            <SubMenuItem
              label="All Deposits"
              active={depositFilter === 'all'}
              onClick={() => { setActiveTab('deposits'); setDepositFilter('all'); }}
            />
          </MenuItem>
          
          {/* Withdrawals with Submenu */}
          <MenuItem
            icon={ArrowUpCircle}
            label="Withdrawals"
            active={activeTab === 'withdrawals'}
            onClick={() => toggleMenu('withdrawals')}
            hasSubmenu
            isExpanded={expandedMenus.withdrawals}
          >
            <SubMenuItem
              label="Withdrawal Methods"
              active={withdrawalFilter === 'methods'}
              onClick={() => { setActiveTab('withdrawals'); setWithdrawalFilter('methods'); }}
            />
            <div className="relative">
              <SubMenuItem
                label="Pending Withdrawals"
                active={withdrawalFilter === 'pending'}
                onClick={() => { setActiveTab('withdrawals'); setWithdrawalFilter('pending'); }}
              />
              {withdrawals.filter((w: any) => w.status === 'pending').length > 0 && (
                <span className="absolute right-4 top-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                  {withdrawals.filter((w: any) => w.status === 'pending').length}
                </span>
              )}
            </div>
            <SubMenuItem
              label="Approved Withdrawals"
              active={withdrawalFilter === 'approved'}
              onClick={() => { setActiveTab('withdrawals'); setWithdrawalFilter('approved'); }}
            />
            <SubMenuItem
              label="Rejected Withdrawals"
              active={withdrawalFilter === 'rejected'}
              onClick={() => { setActiveTab('withdrawals'); setWithdrawalFilter('rejected'); }}
            />
            <SubMenuItem
              label="All Withdrawals"
              active={withdrawalFilter === 'all'}
              onClick={() => { setActiveTab('withdrawals'); setWithdrawalFilter('all'); }}
            />
          </MenuItem>
          <MenuItem
            icon={CheckCircle}
            label="Support Ticket"
            active={false}
            onClick={() => {}}
            hasSubmenu
          />
          {/* Report with Submenu */}
          <MenuItem
            icon={BarChart3}
            label="Report"
            active={activeTab === 'reports'}
            onClick={() => toggleMenu('reports')}
            hasSubmenu
            isExpanded={expandedMenus.reports}
          >
            <SubMenuItem
              label="Transaction Log"
              active={reportFilter === 'transaction_log'}
              onClick={() => { setActiveTab('reports'); setReportFilter('transaction_log'); }}
            />
            <SubMenuItem
              label="Login History"
              active={reportFilter === 'login_history'}
              onClick={() => { setActiveTab('reports'); setReportFilter('login_history'); }}
            />
            <SubMenuItem
              label="Notification History"
              active={reportFilter === 'notification_history'}
              onClick={() => { setActiveTab('reports'); setReportFilter('notification_history'); }}
            />
            <SubMenuItem
              label="PTC View Log"
              active={reportFilter === 'ptc_view_log'}
              onClick={() => { setActiveTab('reports'); setReportFilter('ptc_view_log'); }}
            />
            <SubMenuItem
              label="Referral Commissions"
              active={reportFilter === 'referral_commissions'}
              onClick={() => { setActiveTab('reports'); setReportFilter('referral_commissions'); }}
            />
          </MenuItem>
        </div>

        {/* Settings */}
        <div className="border-t border-gray-800 p-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Settings</p>
          <MenuItem
            icon={Settings}
            label="System Settings"
            active={false}
            onClick={() => {}}
          />
          <button
            onClick={() => {
              logout();
              navigate('/admin');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
          >
            <span className="text-red-400">→</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">{user?.role}</span>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Site
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {selectedUser.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Role</span>
                    </div>
                    <p className="font-medium text-gray-900 capitalize">{selectedUser.role}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">Phone</span>
                    </div>
                    <p className="font-medium text-gray-900">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="text-sm">Joined</span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm">Available Balance</span>
                    </div>
                    <p className="font-medium text-green-600">
                      ${Number(selectedUser.available_balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Wallet Stats */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Wallet Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        ${Number(selectedUser.available_balance || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">Available</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        ${Number(selectedUser.pending_amount || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        ${Number(selectedUser.total_approved || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">Total Approved</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleUserStatusChange(selectedUser.id, !selectedUser.is_active);
                      setShowUserModal(false);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedUser.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {selectedUser.is_active ? 'Deactivate User' : 'Activate User'}
                  </button>
                  <button
                    onClick={() => {
                      handleUserVerification(selectedUser.id, !selectedUser.is_verified);
                      setShowUserModal(false);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedUser.is_verified
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {selectedUser.is_verified ? 'Unverify User' : 'Verify User'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotel Modal */}
      <AnimatePresence>
        {showHotelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowHotelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                </h2>
                <button
                  onClick={() => setShowHotelModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
                  <input
                    type="text"
                    value={hotelForm.name}
                    onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter hotel name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={hotelForm.description}
                    onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter hotel description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={hotelForm.city}
                      onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={hotelForm.country}
                      onChange={(e) => setHotelForm({ ...hotelForm, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Night ($)</label>
                    <input
                      type="number"
                      value={hotelForm.price_per_night}
                      onChange={(e) => setHotelForm({ ...hotelForm, price_per_night: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={hotelForm.rating}
                        onChange={(e) => setHotelForm({ ...hotelForm, rating: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) })}
                        className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="5"
                      />
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= hotelForm.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={hotelForm.location}
                    onChange={(e) => setHotelForm({ ...hotelForm, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma separated)</label>
                  <input
                    type="text"
                    value={hotelForm.amenities}
                    onChange={(e) => setHotelForm({ ...hotelForm, amenities: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="WiFi, Pool, Gym, Spa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={hotelForm.image_url}
                    onChange={(e) => setHotelForm({ ...hotelForm, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowHotelModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHotel}
                  className="flex-1 py-2 px-4 rounded-lg font-medium bg-[#F4C444] text-gray-900 hover:bg-[#E5B334] transition-colors"
                >
                  {editingHotel ? 'Update Hotel' : 'Add Hotel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
                  {confirmAction.type === 'deleteHotel' ? (
                    <Trash2 className="w-8 h-8 text-red-600" />
                  ) : confirmAction.status === 'approved' || confirmAction.status === 'confirmed' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {confirmAction.type === 'deleteHotel' ? 'Delete Hotel' :
                   confirmAction.status === 'approved' ? 'Confirm Approval' :
                   confirmAction.status === 'confirmed' ? 'Confirm Booking' :
                   confirmAction.status === 'cancelled' ? 'Confirm Cancellation' : 'Confirm Rejection'}
                </h3>
                <p className="text-gray-600">
                  {confirmAction.type === 'deleteHotel'
                    ? 'Are you sure you want to delete this hotel? This action cannot be undone.'
                    : `Are you sure you want to ${confirmAction.status} this ${confirmAction.type}?`}
                </p>

              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (confirmAction.type === 'deleteHotel') {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`http://localhost:5000/api/admin/hotels/${confirmAction.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (response.ok) {
                        showNotification('success', 'Hotel deleted successfully');
                        loadHotels();
                      } else {
                        showNotification('error', 'Failed to delete hotel');
                      }
                    } else if (confirmAction.type === 'transaction') {
                      handleTransactionApproval(confirmAction.id, confirmAction.status as 'approved' | 'rejected', confirmAction.isDeposit);
                    }
                    setShowConfirmModal(false);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    confirmAction.type === 'deleteHotel' ? 'Delete' : 'Confirm'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {showCreateAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateAdminModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Create Admin User</h2>
                    <p className="text-sm text-gray-500">Super Admin only</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateAdminModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Min 6 characters"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="+1 234 567 890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    value={adminForm.role}
                    onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="support">Support</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Role hierarchy: super_admin → admin → support → moderator → user
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Permissions for {adminForm.role}:</p>
                    <p className="mt-1">
                      {adminForm.role === 'admin' && 'Full admin access except creating other admins'}
                      {adminForm.role === 'moderator' && 'Can moderate content and manage users'}
                      {adminForm.role === 'support' && 'Can handle support tickets and view user data'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowCreateAdminModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdmin}
                  disabled={creatingAdmin || !adminForm.name || !adminForm.email || !adminForm.password}
                  className="flex-1 py-2 px-4 rounded-lg font-medium bg-[#F4C444] text-gray-900 hover:bg-[#E5B334] transition-colors disabled:opacity-50"
                >
                  {creatingAdmin ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    `Create ${adminForm.role.charAt(0).toUpperCase() + adminForm.role.slice(1)}`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit review (details) — matches admin pending deposit review layout */}
      <AnimatePresence>
        {showDepositDetailsModal && selectedDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowDepositDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-gray-100 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden my-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
                <p className="text-sm md:text-base font-medium text-gray-800">
                  <span className="text-blue-600 font-semibold">
                    {selectedDeposit.user_telegram || selectedDeposit.user_email?.split('@')[0] || 'User'}
                  </span>{' '}
                  requested{' '}
                  <span className="font-semibold">{Number(selectedDeposit.amount).toFixed(2)} {selectedDeposit.method?.toUpperCase() || 'USDT'}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowDepositDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Deposit Via {selectedDeposit.method?.toUpperCase() || 'USDT'}
                  </h3>
                  <dl className="space-y-0 divide-y divide-gray-100 text-sm">
                    {[
                      ['Date', new Date(selectedDeposit.created_at).toLocaleString()],
                      ['Transaction Number', String(selectedDeposit.transaction_id || selectedDeposit.id)],
                      ['Username', selectedDeposit.user_telegram || selectedDeposit.user_email?.split('@')[0] || '—'],
                      ['Method', selectedDeposit.method?.toUpperCase() || 'USDT'],
                      ['Amount', `${Number(selectedDeposit.amount).toFixed(2)} ${selectedDeposit.method?.toUpperCase() || 'USDT'}`],
                      ['Charge', `${Number(selectedDeposit.fee || 0).toFixed(2)} ${selectedDeposit.method?.toUpperCase() || 'USDT'}`],
                      ['After Charge', `${(Number(selectedDeposit.amount) - Number(selectedDeposit.fee || 0)).toFixed(2)} ${selectedDeposit.method?.toUpperCase() || 'USDT'}`],
                      ['Rate', `1 ${selectedDeposit.method?.toUpperCase() || 'USDT'} = 1.00 USDT`],
                      ['Payable', `${Number(selectedDeposit.amount).toFixed(2)} ${selectedDeposit.method?.toUpperCase() || 'USDT'}`],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="flex justify-between py-3 gap-4">
                        <dt className="text-gray-500 shrink-0">{k}</dt>
                        <dd className={`text-right font-medium text-gray-900 ${k === 'Username' ? 'text-blue-600' : ''}`}>{v}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between py-3 gap-4 items-center">
                      <dt className="text-gray-500">Status</dt>
                      <dd>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                          selectedDeposit.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          selectedDeposit.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          selectedDeposit.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {selectedDeposit.status?.charAt(0).toUpperCase() + selectedDeposit.status?.slice(1) || 'Pending'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-4">User Deposit Information</h3>
                  <p className="text-sm text-gray-600 mb-6 flex-1">
                    Review the deposit on the left. Approve to assign a task package and commission percent, or reject this request.
                  </p>
                  {selectedDeposit.status === 'pending' ? (
                    <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setPendingAcceptDeposit(selectedDeposit);
                          setTaskLimit(25);
                          setTaskPercent(4);
                          setShowDepositDetailsModal(false);
                          setShowAcceptDepositModal(true);
                        }}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Check className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDepositDetailsModal(false);
                          openConfirmModal('transaction', selectedDeposit.id, 'rejected');
                        }}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Ban className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">This deposit has already been processed.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accept deposit confirmation — task limit & percent (Pic 3) */}
      <AnimatePresence>
        {showAcceptDepositModal && pendingAcceptDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => { if (!actionLoading) { setShowAcceptDepositModal(false); setPendingAcceptDeposit(null); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Accept Confirmation</h3>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => { setShowAcceptDepositModal(false); setPendingAcceptDeposit(null); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <p className="text-sm text-gray-700">
                  Are you sure to <strong>Confirm</strong> deposit of{' '}
                  <strong>{Number(pendingAcceptDeposit.amount).toFixed(2)} {pendingAcceptDeposit.method?.toUpperCase() || 'USDT'}</strong>?
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Task Limit<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={taskLimit}
                    onChange={(e) => setTaskLimit(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">User can work through up to this many tasks from this deposit (daily completion cap 25 is separate).</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Percent</label>
                  <input
                    type="number"
                    min={0.1}
                    max={100}
                    step={0.1}
                    value={taskPercent}
                    onChange={(e) => setTaskPercent(parseFloat(e.target.value) || 4)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="4"
                  />
                  <p className="text-xs text-gray-500 mt-1">Commission percent of deposit per task (leave as 4 if unsure).</p>
                </div>
                <button
                  type="button"
                  disabled={actionLoading || taskLimit < 1}
                  onClick={() => handleTransactionApproval(String(pendingAcceptDeposit.id), 'approved', true)}
                  className="w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
