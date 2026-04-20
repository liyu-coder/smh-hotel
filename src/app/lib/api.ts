// API utility for backend communication
const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

// Get stored token
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set token
const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove token
const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Generic fetch with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Token found and added to headers');
  } else {
    console.log('⚠️ No token found');
  }

  console.log('🔍 API Request:', url, options.method || 'GET');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    console.log('📦 API Response:', url, data);

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('❌ API Error:', url, error);
    throw error;
  }
}

// Auth API
export const authApi = {
  register: async (name: string, email: string, phone: string, password: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
    
    if (response.success && response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  logout: () => {
    removeToken();
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  updateProfile: async (data: { name?: string; phone?: string; avatar_url?: string }) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  deleteAccount: async () => {
    return apiRequest('/users/account', {
      method: 'DELETE',
    });
  },
};

// Hotels API
export const hotelsApi = {
  getHotels: async (params?: { page?: number; limit?: number; country?: string; featured?: boolean; search?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/hotels?${queryString}`);
  },

  getHotel: async (id: string) => {
    return apiRequest(`/hotels/${id}`);
  },

  getFeaturedHotels: async () => {
    return apiRequest('/hotels/featured/list');
  },
};

// Bookings API
export const bookingsApi = {
  getBookings: async (params?: { page?: number; limit?: number; status?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/bookings?${queryString}`);
  },

  getBooking: async (id: string) => {
    return apiRequest(`/bookings/${id}`);
  },

  createBooking: async (data: {
    hotel_id: number;
    check_in_date: string;
    check_out_date: string;
    guests: number;
    special_requests?: string;
  }) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancelBooking: async (id: string) => {
    return apiRequest(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  updateUserStatus: async (id: string, data: { is_active?: boolean; is_verified?: boolean }) => {
    return apiRequest(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateUserRole: async (id: string, data: { role: string }) => {
    return apiRequest(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getTransactions: async (params?: { page?: number; limit?: number; type?: string; status?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/admin/transactions${queryString ? `?${queryString}` : ''}`);
  },

  updateTransactionStatus: async (id: string, data: { status: string; task_limit?: number; percent?: number }) => {
    return apiRequest(`/admin/transactions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  createAdmin: async (data: { name: string; email: string; password: string; phone?: string; role: string }) => {
    return apiRequest('/admin/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRoleStats: async () => {
    return apiRequest('/admin/role-stats');
  },
};

// Reservation API
export const reservationApi = {
  getPlans: async () => {
    return apiRequest('/reservation/plans');
  },

  getMyPlan: async () => {
    return apiRequest('/reservation/my-plan');
  },

  getTasks: async () => {
    return apiRequest('/reservation/tasks');
  },

  completeTask: async (taskId: string) => {
    return apiRequest(`/reservation/tasks/${taskId}/complete`, {
      method: 'POST',
    });
  },

  getDashboard: async () => {
    return apiRequest('/reservation/dashboard');
  },
};

// Wallet API
export const walletApi = {
  getWallet: async () => {
    return apiRequest('/wallet');
  },

  createDeposit: async (data: {
    amount: number;
    currency: string;
    method: string;
    address?: string;
    network?: string;
  }) => {
    return apiRequest('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createWithdrawal: async (data: {
    amount: number;
    currency: string;
    method: string;
    address?: string;
    network?: string;
  }) => {
    return apiRequest('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSummary: async () => {
    return apiRequest('/wallet/summary');
  },
};

// Transactions API
export const transactionsApi = {
  getTransactions: async (params?: { page?: number; limit?: number; type?: string; status?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/transactions?${queryString}`);
  },

  getTransaction: async (id: string) => {
    return apiRequest(`/transactions/${id}`);
  },
};

// Team API
export const teamApi = {
  getTeam: async () => {
    return apiRequest('/team');
  },

  getReferrals: async (params?: { page?: number; limit?: number }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/team/referrals?${queryString}`);
  },

  joinTeam: async (referral_code: string) => {
    return apiRequest('/team/join', {
      method: 'POST',
      body: JSON.stringify({ referral_code }),
    });
  },

  getStats: async () => {
    return apiRequest('/team/stats');
  },
};

// Support API
export const supportApi = {
  getTickets: async (params?: { page?: number; limit?: number; status?: string; category?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/support?${queryString}`);
  },

  getTicket: async (id: string) => {
    return apiRequest(`/support/${id}`);
  },

  createTicket: async (data: { subject: string; message: string; category?: string; priority?: string }) => {
    return apiRequest('/support', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Countries API
export const countriesApi = {
  getCountries: async (params?: { page?: number; limit?: number }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/countries?${queryString}`);
  },

  getCountry: async (id: string) => {
    return apiRequest(`/countries/${id}`);
  },

  getCountryByName: async (name: string) => {
    return apiRequest(`/countries/name/${name}`);
  },

  getFeaturedCountries: async () => {
    return apiRequest('/countries/featured/list');
  },
};

export { getToken, setToken, removeToken };
