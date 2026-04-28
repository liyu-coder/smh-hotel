import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, Phone, MapPin, CreditCard, Shield, Bell, Globe, Camera, Save, Eye, EyeOff, Check, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProfileSettings() {
  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    city: 'New York',
    address: '123 Main Street, Apt 4B',
    zipCode: '10001',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    language: 'English',
    currency: 'USD',
    timezone: 'EST (UTC-5)'
  });

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard }
  ];

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'Credit Card',
      last4: '4242',
      brand: 'Visa',
      isDefault: true
    },
    {
      id: 2,
      type: 'Credit Card',
      last4: '8888',
      brand: 'Mastercard',
      isDefault: false
    },
    {
      id: 3,
      type: 'Crypto Wallet',
      name: 'Trust Wallet - USDT (TRC20)',
      address: 'TNXpjoH6kNCSHAWw5VC8vn6tbXt9Fp1L9q',
      network: 'Tron (TRC20)',
      isDefault: false
    },
    {
      id: 4,
      type: 'Crypto Wallet',
      name: 'KuCoin - USDT (TRC20)',
      address: 'TQgo9MgiztoPYdAdEeRiM5YLoX76ATbvN2',
      network: 'Tron (TRC20)',
      isDefault: false
    },
    {
      id: 5,
      type: 'Crypto Wallet',
      name: 'MEXC - USDT (TRC20)',
      address: 'TH7v2jXYSeJNRkzzECEQugdTzVReffDSHC',
      network: 'Tron (TRC20)',
      isDefault: false
    },
    {
      id: 6,
      type: 'Crypto Wallet',
      name: 'Bitget - USDT (TRC20)',
      address: 'TBvixNUGPmZt1rLgyP3fEwZCyepzSH3eDP',
      network: 'Tron (TRC20)',
      isDefault: false
    },
    {
      id: 7,
      type: 'Crypto Wallet',
      name: 'OKX - USDT (TRC20)',
      address: 'TB8YStZmVMQWLfwLJzMvRYk7MfHQXGn7cX',
      network: 'Tron (TRC20)',
      isDefault: false
    }
  ]);

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'Credit Card',
    brand: 'Visa',
    last4: '',
    name: '',
    address: '',
    network: 'Tron (TRC20)'
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSaving(false);
    setShowSuccess(true);
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSaving(false);
    setShowSuccess(true);
    
    // Clear password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeletePaymentMethod = (id: number) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      alert('Payment method removed successfully');
    }
  };

  const handleSetDefaultPayment = (id: number) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    alert('Payment method set as default');
  };

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.type === 'Credit Card' && !newPaymentMethod.last4) {
      alert('Please enter the last 4 digits of your card');
      return;
    }
    if (newPaymentMethod.type === 'Crypto Wallet' && !newPaymentMethod.name) {
      alert('Please enter the wallet name');
      return;
    }

    const newId = Math.max(...paymentMethods.map(m => m.id), 0) + 1;
    const newMethod: any = {
      id: newId,
      type: newPaymentMethod.type,
      isDefault: false
    };

    if (newPaymentMethod.type === 'Credit Card') {
      newMethod.brand = newPaymentMethod.brand;
      newMethod.last4 = newPaymentMethod.last4;
    } else if (newPaymentMethod.type === 'Crypto Wallet') {
      newMethod.name = newPaymentMethod.name;
      newMethod.address = newPaymentMethod.address || 'Not provided';
      newMethod.network = newPaymentMethod.network || 'Tron (TRC20)';
    }

    setPaymentMethods(prev => [...prev, newMethod]);
    setShowAddPaymentModal(false);
    setNewPaymentMethod({
      type: 'Credit Card',
      brand: 'Visa',
      last4: '',
      name: '',
      address: '',
      network: 'Tron (TRC20)'
    });
    alert('Payment method added successfully');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
            Profile Settings
          </h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </motion.div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Settings saved successfully!</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#D4AF37] text-white'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6" style={{ color: '#1a1a1a' }}>
                    Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>France</option>
                        <option>Germany</option>
                        <option>Japan</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-8 py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{ backgroundColor: '#D4AF37' }}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6" style={{ color: '#1a1a1a' }}>
                    Security Settings
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={formData.currentPassword}
                              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={formData.newPassword}
                              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePasswordChange}
                          disabled={isSaving}
                          className="px-8 py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          style={{ backgroundColor: '#D4AF37' }}
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4" />
                              Update Password
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="p-6 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6" style={{ color: '#1a1a1a' }}>
                    Preferences
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Notifications */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <span className="font-medium">Email Notifications</span>
                          <input
                            type="checkbox"
                            checked={formData.emailNotifications}
                            onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                            className="w-5 h-5 text-[#D4AF37] rounded focus:ring-[#D4AF37]"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <span className="font-medium">SMS Notifications</span>
                          <input
                            type="checkbox"
                            checked={formData.smsNotifications}
                            onChange={(e) => setFormData(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                            className="w-5 h-5 text-[#D4AF37] rounded focus:ring-[#D4AF37]"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <span className="font-medium">Push Notifications</span>
                          <input
                            type="checkbox"
                            checked={formData.pushNotifications}
                            onChange={(e) => setFormData(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                            className="w-5 h-5 text-[#D4AF37] rounded focus:ring-[#D4AF37]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Regional Settings */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Regional Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                          </label>
                          <select
                            value={formData.language}
                            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                          >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                            <option>Chinese</option>
                            <option>Japanese</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                          </label>
                          <select
                            value={formData.currency}
                            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                          >
                            <option>USD</option>
                            <option>EUR</option>
                            <option>GBP</option>
                            <option>JPY</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-8 py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{ backgroundColor: '#D4AF37' }}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Preferences
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold" style={{ color: '#1a1a1a' }}>
                      Payment Methods
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddPaymentModal(true)}
                      className="px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2"
                      style={{ backgroundColor: '#D4AF37' }}
                    >
                      <CreditCard className="w-4 h-4" />
                      Add Payment Method
                    </motion.button>
                  </div>
                  
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="p-6 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{method.brand}</span>
                                {method.isDefault && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              {method.type === 'Credit Card' && (
                                <p className="text-sm text-gray-600">••••• {method.last4}</p>
                              )}
                              {method.type === 'Crypto Wallet' && (
                                <>
                                  <p className="text-sm text-gray-600">{method.address}</p>
                                  <p className="text-sm text-gray-500">{method.network}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSetDefaultPayment(method.id)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Set Default
                            </button>
                            <button
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Payment Method Modal */}
                  {showAddPaymentModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl p-6 max-w-md w-full"
                      >
                        <h3 className="text-xl font-semibold mb-4">Add Payment Method</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                            <select
                              value={newPaymentMethod.type}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                            >
                              <option value="Credit Card">Credit Card</option>
                              <option value="Crypto Wallet">Crypto Wallet (USDT TRC20)</option>
                            </select>
                          </div>

                          {newPaymentMethod.type === 'Credit Card' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Brand</label>
                                <select
                                  value={newPaymentMethod.brand}
                                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, brand: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                >
                                  <option value="Visa">Visa</option>
                                  <option value="Mastercard">Mastercard</option>
                                  <option value="American Express">American Express</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 Digits</label>
                                <input
                                  type="text"
                                  maxLength={4}
                                  value={newPaymentMethod.last4}
                                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, last4: e.target.value.replace(/\D/g, '') }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                  placeholder="1234"
                                />
                              </div>
                            </>
                          )}

                          {newPaymentMethod.type === 'Crypto Wallet' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Name</label>
                                <select
                                  value={newPaymentMethod.name}
                                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                >
                                  <option value="">Select Wallet</option>
                                  <option value="Trust Wallet - USDT (TRC20)">Trust Wallet - USDT (TRC20)</option>
                                  <option value="KuCoin - USDT (TRC20)">KuCoin - USDT (TRC20)</option>
                                  <option value="MEXC - USDT (TRC20)">MEXC - USDT (TRC20)</option>
                                  <option value="Bitget - USDT (TRC20)">Bitget - USDT (TRC20)</option>
                                  <option value="OKX - USDT (TRC20)">OKX - USDT (TRC20)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                                <input
                                  type="text"
                                  value={newPaymentMethod.address}
                                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, address: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                  placeholder="e.g., TNXpjoH6kNCSHAWw5VC8vn6tbXt9Fp1L9q"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => setShowAddPaymentModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddPaymentMethod}
                            className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#b8962e]"
                          >
                            Add Method
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
