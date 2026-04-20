import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, Globe, Headphones, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

// Zod schema for validation
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Country data for phone dropdown
const countries = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: 'US' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: 'CA' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: 'GB' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: 'ES' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: 'IT' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: 'CN' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: 'JP' },
];

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');
  const watchedPhone = watch('phone');

  // Format phone number based on country
  const formatPhoneNumber = (value: string, country: typeof countries[0]) => {
    const digits = value.replace(/\D/g, '');
    
    switch (country.code) {
      case 'US':
      case 'CA':
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      case 'GB':
        if (digits.length <= 4) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
      default:
        return digits;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value, selectedCountry);
    setValue('phone', formatted);
    trigger('phone');
  };

  const handleCountryChange = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setValue('phone', '');
    setShowCountryDropdown(false);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const result = await registerUser(data.name, data.email, data.phone, data.password);
      
      if (result.success) {
        setSuccessMessage('Successfully created! Redirecting...');
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        setErrorMessage(result.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Registration failed');
      console.error('Registration error:', error);
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

      {/* Bottom 60% - White Section with Registration Card */}
      <div className="flex-1 bg-white relative">
        <div className="absolute inset-0 flex items-center justify-center px-6 -mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-[450px]"
          >
            {/* Registration Card */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              <div className="mb-8">
                <h2 
                  className="text-2xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Create Account
                </h2>
                <p 
                  className="text-sm text-gray-600"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Join SMH for luxury hotel reservations
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label 
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      errors.name 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-[#f8f8f8] focus:border-[#F4C444] focus:ring-2 focus:ring-[#F4C444]/20'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label 
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Email
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

                {/* Phone Number with Country Dropdown */}
                <div>
                  <label 
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    {/* Country Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center gap-2 px-3 py-3 rounded-lg border border-gray-200 bg-[#f8f8f8] hover:border-[#F4C444] transition-all min-w-[100px]"
                      >
                        <span className="text-sm">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {showCountryDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                        >
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => handleCountryChange(country)}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                            >
                              <span className="text-sm">{country.flag}</span>
                              <div className="flex-1">
                                <div className="text-sm font-medium">{country.name}</div>
                                <div className="text-xs text-gray-500">{country.dialCode}</div>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Phone Input */}
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      value={watchedPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(555) 000-0000"
                      className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                        errors.phone 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 bg-[#f8f8f8] focus:border-[#F4C444] focus:ring-2 focus:ring-[#F4C444]/20'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.phone.message}
                    </motion.p>
                  )}
                </div>

                {/* Password */}
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
                      placeholder="Create a password"
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

                {/* Confirm Password */}
                <div>
                  <label 
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      placeholder="Confirm your password"
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

                {/* Success/Error Messages */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
                  >
                    {successMessage}
                  </motion.div>
                )}

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {/* Submit Button */}
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
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Already have an account?{' '}
                </span>
                <Link
                  to="/login"
                  className="text-sm text-[#F4C444] hover:text-[#E5B534] transition-colors underline"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Log in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
