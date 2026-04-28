import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, Globe, Headphones, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

// Zod schema for validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        navigate('/home');
      } else {
        setErrorMessage(result.error?.message || 'Login failed');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top 40% - Yellow Brand Section */}
      <div className="relative bg-[#F4C444] h-[40vh] min-h-[320px]">
        {/* Top Right Icons */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-white/20 transition-colors">
            <Globe className="w-5 h-5 text-black" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/20 transition-colors">
            <Headphones className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Logo and Subtitle */}
        <div className="flex flex-col items-center justify-center h-full px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 
              className="text-6xl font-black mb-4 tracking-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              SMH
            </h1>
            <p 
              className="text-lg font-medium text-black/90 max-w-md mx-auto"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Order Reservations securely anytime, anywhere.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom 60% - White Section with Login Card */}
      <div className="flex-1 bg-white relative">
        <div className="absolute inset-0 flex items-center justify-center px-6 -mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              <div className="mb-8">
                <h2 
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Welcome Back
                </h2>
                <p 
                  className="text-sm text-gray-600"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Sign in to access your reservations
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* General Error */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {/* Email/Phone Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      errors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-[#f8f8f8] focus:border-[#F4C444] focus:ring-2 focus:ring-[#F4C444]/20'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all ${
                        errors.password
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-[#f8f8f8] focus:border-[#F4C444] focus:ring-2 focus:ring-[#F4C444]/20'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                {/* Login Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3 px-4 rounded-lg font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#F4C444',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Log In'
                  )}
                </motion.button>
              </form>

              {/* Register & Forgot Password */}
              <div className="mt-6 flex items-center justify-between">
                <Link
                  to="/register"
                  className="text-sm text-gray-600 hover:text-[#F4C444] transition-colors underline"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Register
                </Link>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 hover:text-[#F4C444] transition-colors underline"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
