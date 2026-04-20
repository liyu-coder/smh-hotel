import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, Globe, Headphones, Check, X, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

// Zod schema for password reset validation
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');

  // Password strength indicators
  const passwordStrength = {
    hasLength: watchedPassword.length >= 8,
    hasNumber: /\d/.test(watchedPassword),
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call your backend API to reset the password
      // For demo purposes, we'll just show success
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (isSuccess) {
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

        {/* Bottom 60% - White Section with Success Card */}
        <div className="flex-1 bg-white relative">
          <div className="absolute inset-0 flex items-center justify-center px-6 -mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md"
            >
              {/* Success Card */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 text-center">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-8 h-8 text-green-600" />
                </motion.div>

                <div className="mb-8">
                  <h2 
                    className="text-2xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Password Reset Successful!
                  </h2>
                  <p 
                    className="text-gray-600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Your password has been successfully reset. You can now login with your new password.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoginRedirect}
                  className="w-full py-3 px-4 rounded-lg font-bold text-black transition-all"
                  style={{ 
                    backgroundColor: '#F4C444',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Go to Login
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Bottom 60% - White Section with Reset Password Card */}
      <div className="flex-1 bg-white relative">
        <div className="absolute inset-0 flex items-center justify-center px-6 -mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Reset Password Card */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              {/* Lock Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-[#F4C444]/10 rounded-full mx-auto mb-6">
                <Lock className="w-8 h-8 text-[#F4C444]" />
              </div>

              <div className="mb-8">
                <h2 
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Reset Password
                </h2>
                <p 
                  className="text-sm text-gray-600"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New Password */}
                <div>
                  <label 
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Enter your new password"
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

                  {/* Password Strength Indicators */}
                  {watchedPassword && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasLength ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={passwordStrength.hasLength ? 'text-green-600' : 'text-gray-400'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasNumber ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                          Contains a number
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label 
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      placeholder="Confirm your new password"
                      className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all ${
                        errors.confirmPassword 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 bg-[#f8f8f8] focus:border-[#F4C444] focus:ring-2 focus:ring-[#F4C444]/20'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full py-3 px-4 rounded-lg font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#F4C444',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Resetting Password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-[#F4C444] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
