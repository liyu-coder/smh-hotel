import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, X, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';

export function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login, logout, isLoading, clearError } = useAuth();
  
  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Generate random captcha
  const [captchaCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing errors
    clearError();
    setErrors({});
    
    // Validation
    if (!email || !password) {
      setErrors({ general: 'Email and password are required' });
      return;
    }

    if (!captcha) {
      setErrors({ general: 'Please enter the captcha code' });
      return;
    }

    // Use the authentication
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to admin panel
      if (result.user && (result.user.role === 'admin' || result.user.role === 'super_admin')) {
        console.log('✅ Admin login successful, redirecting to admin panel');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        console.log('⚠️ User is not admin, logging out');
        // User is not admin, log them out
        await logout();
        setErrors({ general: 'Access denied. You must be an admin to access this page.' });
      }
    } else {
      // Set error from auth context
      if (result.error) {
        setErrors({ general: result.error.message });
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(false);
    
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }
    
    setForgotLoading(true);
    try {
      const response = await authApi.forgotPassword(forgotEmail);
      if (response.success) {
        setForgotSuccess(true);
      } else {
        setForgotError(response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      setForgotError(error.message || 'An error occurred');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 relative overflow-hidden">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="0,0 50,50 0,100" fill="white" />
          <polygon points="100,0 50,50 100,100" fill="white" />
          <polygon points="0,0 100,0 50,50" fill="white" />
          <polygon points="0,100 100,100 50,50" fill="white" />
        </svg>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-indigo-900/90" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }}></div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to BOOK SMH</h1>
          <p className="text-blue-100 text-sm">Admin Login to BOOK SMH Dashboard</p>
        </div>

        {/* Form Card */}
        <div className="bg-indigo-900/90 backdrop-blur-sm rounded-b-2xl p-8 shadow-2xl">
          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm text-center">{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Email */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Username<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Admin"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-300">Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            {/* Captcha */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Captcha<span className="text-red-500">*</span>
              </label>
              <div className="bg-white rounded-lg p-3 mb-2">
                <div className="text-center">
                  <span className="text-lg font-mono tracking-widest text-gray-800 select-none" style={{ textDecoration: 'line-through', fontStyle: 'italic' }}>
                    {captchaCode.split('').join(' ')}
                  </span>
                </div>
              </div>
              <input
                type="text"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                className="w-full px-4 py-3 bg-indigo-800/50 border border-indigo-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="code"
                disabled={isLoading}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  LOGIN...
                </div>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowForgotModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Login</span>
                </button>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>

              {forgotSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-green-600 font-medium">Reset link sent!</p>
                  <p className="text-gray-500 text-sm mt-2">Check your email for instructions.</p>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSuccess(false);
                      setForgotEmail('');
                    }}
                    className="mt-6 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {forgotError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{forgotError}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
