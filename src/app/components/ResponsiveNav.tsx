import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Home, 
  Wallet, 
  CreditCard, 
  Calendar,
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  Settings, 
  LogOut,
  Target,
  DollarSign,
  User,
  Star,
  Send
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

export function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navItems: Array<{
    icon: any;
    label: string;
    to: string;
    primary: boolean;
  }> = [
    // Navigation items removed as requested
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex lg:flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-black/5 sticky top-0 z-50 px-6 py-4">
        <div className="flex items-center gap-6">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 text-[#6b6b6b] hover:text-[#F4C444] transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {/* Balance and user info removed */}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden lg:hidden flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-black/5 sticky top-0 z-50 px-4 py-4">
        <div className="w-8"></div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-gray-900 text-white">
            <SheetHeader className="border-b border-gray-800 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-white">Menu</SheetTitle>
              </div>
              
              {/* User info header removed */}
            </SheetHeader>

            {/* Primary Links */}
            <div className="space-y-2 mb-6">
              <p className="text-xs uppercase text-gray-500 font-semibold mb-3">Primary</p>
              {navItems.filter(item => item.primary).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#F4C444] transition-colors" />
                    <span className="font-medium group-hover:text-[#F4C444] transition-colors">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Secondary Links */}
            <div className="space-y-2 mb-6">
              <p className="text-xs uppercase text-gray-500 font-semibold mb-3">Secondary</p>
              {navItems.filter(item => !item.primary).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#F4C444] transition-colors" />
                    <span className="font-medium group-hover:text-[#F4C444] transition-colors">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout Button */}
            <div className="mt-auto">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Mobile Bottom Navigation Bar - Always Visible */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/5 z-50 px-4 py-2">
        <div className="flex items-center justify-around">
          <Link
            to="/home"
            className="flex flex-col items-center gap-1 text-[#6b6b6b] hover:text-[#F4C444] transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/plans"
            className="flex flex-col items-center gap-1 text-[#6b6b6b] hover:text-[#F4C444] transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Reserve</span>
          </Link>
          <a
            href="https://t.me/Customer_support24hours"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-[#6b6b6b] hover:text-[#F4C444] transition-colors"
          >
            <Send className="w-5 h-5" />
            <span className="text-xs">Telegram</span>
          </a>
          <Link
            to="/profile"
            className="flex flex-col items-center gap-1 text-[#6b6b6b] hover:text-[#F4C444] transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
