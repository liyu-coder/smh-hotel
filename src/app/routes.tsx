import { createBrowserRouter, redirect, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Packages } from './pages/Packages';
import { HotelPackages } from './pages/HotelPackages';
import { Withdraw } from './pages/Withdraw';
import { Support } from './pages/Support';
import { Team } from './pages/Team';
import { Reservations } from './pages/Reservations';
import { ProfileSettings } from './pages/ProfileSettings';
import { HotelDetails } from './pages/HotelDetails';
import { HotelDiscovery } from './pages/HotelDiscovery';
import { Wallet } from './pages/Wallet';
import { WithdrawPage } from './pages/WithdrawPage';
import { ReservesPage } from './pages/ReservesPage';
import { HotelDetailsPage } from './pages/HotelDetailsPage';
import { DepositPage } from './pages/DepositPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { AdminLogin } from './pages/AdminLogin';
import { Admin } from './pages/Admin';
import { ReservationPlans } from './pages/ReservationPlans';
import { Tasks } from './pages/Tasks';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    loader: () => redirect('/login')
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  },
  {
    path: '/packages',
    element: (
      <ProtectedRoute>
        <HotelPackages />
      </ProtectedRoute>
    )
  },
  {
    path: '/discovery',
    element: (
      <ProtectedRoute>
        <HotelDiscovery />
      </ProtectedRoute>
    )
  },
  {
    path: '/wallet',
    element: (
      <ProtectedRoute>
        <Wallet />
      </ProtectedRoute>
    )
  },
  {
    path: '/withdraw',
    element: (
      <ProtectedRoute>
        <Withdraw />
      </ProtectedRoute>
    )
  },
  {
    path: '/reserves',
    element: (
      <ProtectedRoute>
        <ReservesPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/hotel/:id',
    element: (
      <ProtectedRoute>
        <HotelDetailsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/deposit',
    element: (
      <ProtectedRoute>
        <DepositPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/checkout/:id',
    element: (
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/support',
    element: (
      <ProtectedRoute>
        <Support />
      </ProtectedRoute>
    )
  },
  {
    path: '/team',
    element: (
      <ProtectedRoute>
        <Team />
      </ProtectedRoute>
    )
  },
  {
    path: '/reserve',
    element: (
      <ProtectedRoute>
        <Navigate to="/plans" replace />
      </ProtectedRoute>
    )
  },
  {
    path: '/hotel/:id',
    element: (
      <ProtectedRoute>
        <HotelDetails />
      </ProtectedRoute>
    )
  },
  {
    path: '/bookings',
    element: (
      <ProtectedRoute>
        <Reservations />
      </ProtectedRoute>
    )
  },
  {
    path: '/plans',
    element: (
      <ProtectedRoute>
        <ReservationPlans />
      </ProtectedRoute>
    )
  },
  {
    path: '/tasks',
    element: (
      <ProtectedRoute>
        <Tasks />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfileSettings />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: <AdminLogin />
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    loader: () => redirect('/login')
  }
]);
