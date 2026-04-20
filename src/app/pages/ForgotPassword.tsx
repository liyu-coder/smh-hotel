import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Globe, Headphones } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for email validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store the email for demo purposes (in real app, this would be handled by backend)
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending reset email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isSubmitted) {
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
                  <Mail className="w-8 h-8 text-green-600" />
                </motion.div>

                <div className="mb-8">
                  <h2 
                    className="text-2xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Check Your Email
                  </h2>
                  <p 
                    className="text-gray-600 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    We've sent a password reset link to:
                  </p>
                  <p 
                    className="font-medium text-[#F4C444]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {submittedEmail}
                  </p>
                </div>

                <div className="space-y-4">
                  <p 
                    className="text-sm text-gray-500"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Click the link in the email to reset your password. 
                    If you don't see it, check your spam folder.
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackToLogin}
                    className="w-full py-3 px-4 rounded-lg font-bold text-black transition-all"
                    style={{ 
                      backgroundColor: '#F4C444',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    Back to Login
                  </motion.button>

                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSubmittedEmail('');
                    }}
                    className="w-full py-3 px-4 rounded-lg font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Try Another Email
                  </button>
                </div>
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

      {/* Bottom 60% - White Section with Forgot Password Card */}
      <div className="flex-1 bg-white relative">
        <div className="absolute inset-0 flex items-center justify-center px-6 -mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Forgot Password Card */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              {/* Back Button */}
              <Link
                to="/login"
                className="flex items-center gap-2 text-gray-600 hover:text-[#F4C444] transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Back to Login
                </span>
              </Link>

              <div className="mb-8">
                <h2 
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Forgot Password?
                </h2>
                <p 
                  className="text-sm text-gray-600"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label 
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="Enter your email address"
                      className={`w-full px-4 py-3 pl-12 rounded-lg border transition-all ${
                        errors.email 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 bg-[#f8f8f8] focus:border-[#F4C444] focus:ring-2 focus:ring-[#F4C444]/20'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
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
                      Sending Reset Link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </motion.button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Don't have an account?{' '}
                </span>
                <Link
                  to="/register"
                  className="text-sm text-[#F4C444] hover:text-[#E5B534] transition-colors underline"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
