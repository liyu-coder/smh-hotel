import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getToken, removeToken } from '../lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar_url?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface AuthError {
  message: string;
  code: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError; user?: User }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  clearError: () => void;
  error: AuthError | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Check if user is logged in by validating token with backend
    const token = getToken();
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      // Token might be invalid, remove it
      removeToken();
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError; user?: User }> => {
    setIsLoading(true);
    clearError();

    try {
      // Validation
      if (!email || !password) {
        throw { code: 'MISSING_FIELDS', message: 'Email and password are required' };
      }

      if (!validateEmail(email)) {
        throw { code: 'INVALID_EMAIL', message: 'Please enter a valid email address' };
      }

      // Call backend API
      const response = await authApi.login(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw { code: 'LOGIN_FAILED', message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: AuthError }> => {
    setIsLoading(true);
    clearError();

    try {
      // Validation
      if (!name || !email || !password) {
        throw { code: 'MISSING_FIELDS', message: 'Name, email, and password are required' };
      }

      if (name.trim().length < 2) {
        throw { code: 'INVALID_NAME', message: 'Name must be at least 2 characters long' };
      }

      if (!validateEmail(email)) {
        throw { code: 'INVALID_EMAIL', message: 'Please enter a valid email address' };
      }

      if (phone && !validatePhone(phone)) {
        throw { code: 'INVALID_PHONE', message: 'Please enter a valid phone number' };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw { 
          code: 'INVALID_PASSWORD', 
          message: passwordValidation.errors.join('. ') 
        };
      }

      // Call backend API
      const response = await authApi.register(name, email, phone, password);

      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      } else {
        throw { code: 'REGISTER_FAILED', message: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
    clearError();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user, 
      isLoading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
