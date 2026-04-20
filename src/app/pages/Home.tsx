import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Star, Wifi, Utensils, Waves, LogOut, Home as HomeIcon, Package, Calendar, User, Send, CreditCard, HelpCircle, Users, ChevronLeft, ChevronRight, Search, MapPin, Calendar as CalendarIcon, Quote, Wallet, CheckCircle, XCircle, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router';
import { useRef, useState, useEffect } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { hotelsApi, countriesApi } from '../lib/api';
import { ResponsiveNav } from '../components/ResponsiveNav';

const customImages: Record<string, string> = {
  'Philippines': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200&auto=format&fit=crop',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3fb0ad7c1fe6?q=80&w=1200&auto=format&fit=crop',
  'India': 'https://images.unsplash.com/photo-1524492707947-503c5be14495?q=80&w=1200&auto=format&fit=crop',
  'Vietnam': 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop',
  'Uzbekistan': 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?q=80&w=1200&auto=format&fit=crop',
  'Kazakhstan': 'https://images.unsplash.com/photo-1558588942-930faae5a389?q=80&w=1200&auto=format&fit=crop',
  'Azerbaijan': 'https://images.unsplash.com/photo-1539667547529-84c607280d20?q=80&w=1200&auto=format&fit=crop',
  'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
  'China': 'https://images.unsplash.com/photo-1508197149814-0cc02e8b7f74?q=80&w=1200&auto=format&fit=crop',
  'Qatar': 'https://images.unsplash.com/photo-1559586653-997635607b3b?q=80&w=1200&auto=format&fit=crop',
  'Saudi Arabia': 'https://images.unsplash.com/photo-1586724230411-471243ecd16d?q=80&w=1200&auto=format&fit=crop',
  'United Arab Emirates': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop',
  'Yemen': 'https://images.unsplash.com/photo-1621509176371-558832a82069?q=80&w=1200&auto=format&fit=crop',
  'Poland': 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?q=80&w=1200&auto=format&fit=crop',
  'Greece': 'https://images.unsplash.com/photo-1503152394-c571994fd383?q=80&w=1200&auto=format&fit=crop',
  'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop',
  'Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1200&auto=format&fit=crop',
  'Germany': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop',
  'Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200&auto=format&fit=crop',
  'Canada': 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1200&auto=format&fit=crop',
  'Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1200&auto=format&fit=crop',
  'Venezuela': 'https://images.unsplash.com/photo-1533230832481-999a37731994?q=80&w=1200&auto=format&fit=crop',
  'Somalia': 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=1200&auto=format&fit=crop'
};

const testimonials = [
  {
    name: 'Sarah Johnson',
    country: 'USA',
    rating: 5,
    review: 'Absolutely stunning experience! The attention to detail and luxury amenities exceeded all expectations. Will definitely book again.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    stayDetails: 'Grand Plaza Hotel - 5 nights',
    date: 'March 2024'
  },
  {
    name: 'Michael Chen',
    country: 'Singapore',
    rating: 5,
    review: 'Perfect getaway destination. Professional service and breathtaking views made our stay unforgettable. Highly recommended!',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    stayDetails: 'Sunset Beach Resort - 7 nights',
    date: 'February 2024'
  },
  {
    name: 'Emma Martinez',
    country: 'Spain',
    rating: 5,
    review: 'Five-star luxury at its finest. From booking to checkout, everything was seamless and elegant.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    stayDetails: 'Hotel de Russie Rome - 4 nights',
    date: 'January 2024'
  },
  {
    name: 'James Wilson',
    country: 'UK',
    rating: 5,
    review: 'Exceptional service and stunning accommodations. The concierge went above and beyond to make our anniversary special.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    stayDetails: 'The Ritz London - 3 nights',
    date: 'December 2023'
  },
  {
    name: 'Yuki Tanaka',
    country: 'Japan',
    rating: 5,
    review: 'Traditional Japanese hospitality meets modern luxury. The onsen facilities were absolutely incredible.',
    image: 'https://images.unsplash.com/photo-1580489949142-18a6ba1c5a75?w=100&h=100&fit=crop',
    stayDetails: 'Aman Tokyo - 6 nights',
    date: 'November 2023'
  },
  {
    name: 'Sophie Laurent',
    country: 'France',
    rating: 5,
    review: 'Magnificent experience in the heart of Paris. The Eiffel Tower view from our suite was breathtaking!',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    stayDetails: 'Historic Grand Hotel - 5 nights',
    date: 'October 2023'
  },
  {
    name: 'Carlos Rodriguez',
    country: 'Mexico',
    rating: 5,
    review: 'Paradise found! The all-inclusive package was worth every penny. Beach access and spa treatments were amazing.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    stayDetails: 'Tropical Paradise Resort - 8 nights',
    date: 'September 2023'
  },
  {
    name: 'Anna Schmidt',
    country: 'Germany',
    rating: 5,
    review: 'Impeccable service and world-class amenities. The business facilities exceeded our expectations.',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop',
    stayDetails: 'Urban Business Hotel - 4 nights',
    date: 'August 2023'
  },
  {
    name: 'David Kim',
    country: 'South Korea',
    rating: 5,
    review: 'Luxury beyond imagination. The attention to detail and personalized service made our honeymoon perfect.',
    image: 'https://images.unsplash.com/photo-1517841905240-4724ababeb95?w=100&h=100&fit=crop',
    stayDetails: 'Four Seasons Toronto - 10 nights',
    date: 'July 2023'
  }
];

const heroSlidesStatic = [
  {
    id: 1,
    title: "Downtown Urban Living",
    subtitle: "Ultra-luxury modern penthouse with breathtaking city skyline views",
    image: "https://hotel-reserva-online.com/assets/images/hero-property-3.jpg",
    cta: "Explore Now"
  },
  {
    id: 2,
    title: "Luxury Residential Living",
    subtitle: "Magnificent modern mansion with minimalist architecture and infinity fountain",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop",
    cta: "Book Now"
  },
  {
    id: 3,
    title: "Oceanfront Resort Paradise",
    subtitle: "Luxury tropical resort with infinity pool reflecting sunset sky",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000&auto=format&fit=crop",
    cta: "Discover"
  }
];

export function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Search state
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    level: 0
  });
  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Countries state
  const [countries, setCountries] = useState<any[]>([]);

  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch hotels
      const hotelsResponse = await hotelsApi.getHotels({ limit: 100 });
      if (hotelsResponse.success) {
        setFilteredHotels(hotelsResponse.hotels);
      }

      // Fetch countries
      const countriesResponse = await countriesApi.getCountries({ limit: 50 });
      if (countriesResponse.success) {
        setCountries(countriesResponse.countries.map((c: any) => ({
          name: c.name,
          image: c.image_url || customImages[c.name] || `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600&h=400`,
          hotel_count: c.hotel_count || 0
        })));
      }
    } catch (error) {
      console.error('Failed to load data from backend:', error);
    }
  };

  // Use static hero slides
  const heroSlides = heroSlidesStatic;

  // Countries slider state
  const [currentCountrySlide, setCurrentCountrySlide] = useState(0);
  const [isCountryAutoPlaying, setIsCountryAutoPlaying] = useState(true);
  const countriesPerSlide = 6; // How many countries to show per slide

  // Testimonials slider state
  const [currentTestimonialSlide, setCurrentTestimonialSlide] = useState(0);
  const [isTestimonialAutoPlaying, setIsTestimonialAutoPlaying] = useState(true);
  const testimonialsPerSlide = 3; // How many testimonials to show per slide

  // Reservation state
  const [walletData, setWalletData] = useState({
    availableBalance: 2500.00,
    todayOrders: 0,
    maxDailyOrders: 25,
    tasksCompleted: false,
    pending: 0,
    totalApproved: 5000.00
  });

  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const commissionRate = 0.26; // 26% commission

  const handleReserve = (e: React.MouseEvent, hotel: any) => {
    e.stopPropagation(); // Prevent card navigation

    if (walletData.todayOrders >= walletData.maxDailyOrders) {
      showToastMessage(`You have reached the maximum of ${walletData.maxDailyOrders} reserves for today.`, 'error');
      return;
    }

    console.log('Reserve button clicked for hotel:', hotel.id, hotel.name);
    navigate(`/checkout/${hotel.id}`);
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSearchInputChange = (field: string, value: any) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    
    let filtered = filteredHotels;

    // Filter by location
    if (searchData.location) {
      filtered = filtered.filter((hotel: any) => 
        hotel.location?.toLowerCase().includes(searchData.location.toLowerCase()) ||
        hotel.country_name?.toLowerCase().includes(searchData.location.toLowerCase())
      );
    }

    setFilteredHotels(filtered);

    // Scroll to Featured Properties section
    setTimeout(() => {
      const featuredSection = document.getElementById('featured-properties');
      if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setIsSearching(false);
    }, 300);
  };

  const handleCountryClick = (countryName: string) => {
    try {
      navigate(`/reserves?country=${encodeURIComponent(countryName)}`);
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/reserves');
    }
  };

  // Country slider functions
  const nextCountrySlide = () => {
    const totalSlides = Math.ceil(countries.length / countriesPerSlide);
    if (totalSlides > 0) {
      setCurrentCountrySlide((prev) => (prev + 1) % totalSlides);
    }
  };

  const prevCountrySlide = () => {
    const totalSlides = Math.ceil(countries.length / countriesPerSlide);
    if (totalSlides > 0) {
      setCurrentCountrySlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const goToCountrySlide = (index: number) => {
    setCurrentCountrySlide(index);
  };

  // Testimonials slider functions
  const nextTestimonialSlide = () => {
    const totalSlides = Math.ceil(testimonials.length / testimonialsPerSlide);
    if (totalSlides > 0) {
      setCurrentTestimonialSlide((prev) => (prev + 1) % totalSlides);
    }
  };

  const prevTestimonialSlide = () => {
    const totalSlides = Math.ceil(testimonials.length / testimonialsPerSlide);
    if (totalSlides > 0) {
      setCurrentTestimonialSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const goToTestimonialSlide = (index: number) => {
    setCurrentTestimonialSlide(index);
  };

  // Auto-play for testimonials slider (infinite loop)
  useEffect(() => {
    if (!isTestimonialAutoPlaying) return;

    const interval = setInterval(() => {
      const totalSlides = Math.ceil(testimonials.length / testimonialsPerSlide);
      setCurrentTestimonialSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [isTestimonialAutoPlaying, currentTestimonialSlide]);

  // Auto-play for countries slider
  useEffect(() => {
    if (!isCountryAutoPlaying) return;
    
    const interval = setInterval(() => {
      nextCountrySlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [isCountryAutoPlaying, currentCountrySlide]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || heroSlides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  const goToSlide = (index: number) => {
    if (heroSlides.length > 0) {
      setCurrentSlide(index);
      setIsAutoPlaying(false);
    }
  };

  const nextSlide = () => {
    if (heroSlides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setIsAutoPlaying(false);
    }
  };

  const prevSlide = () => {
    if (heroSlides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
      setIsAutoPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Responsive Navigation */}
      <ResponsiveNav />

      {/* Premium Hero Section - 70/30 Layout */}
      <div ref={heroRef} className="relative min-h-screen flex flex-col lg:flex-row">
        {/* LEFT SIDE (70%) - Hero Image Slider */}
        <div className="w-full lg:w-[70%] relative overflow-hidden min-h-[60vh] lg:min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <ImageWithFallback
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                className="w-full h-full object-cover"
                style={{ aspectRatio: '16/9' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Slider Content */}
          <div className="relative h-full flex items-center">
            <div className="px-6 lg:px-16 w-full">
              <div className="max-w-3xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${currentSlide}`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <h1 
                      className="text-5xl lg:text-7xl mb-6 text-white tracking-tight leading-tight"
                      style={{ fontWeight: 700 }}
                    >
                      {heroSlides[currentSlide].title}
                    </h1>
                    <p className="text-xl lg:text-2xl text-white/90 mb-8">
                      {heroSlides[currentSlide].subtitle}
                    </p>
                    <motion.button
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: '0 20px 40px rgba(212, 175, 55, 0.4)',
                        backgroundColor: '#E5C551'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
    try {
      const cta = heroSlides[currentSlide].cta.toLowerCase();
      if (cta === 'discover') {
        document.getElementById('explore-by-country')?.scrollIntoView({ behavior: 'smooth' });
      } else if (cta === 'book now') {
        navigate('/reserves');
      } else if (cta === 'explore now') {
        navigate('/reserves');
      } else {
        navigate('/wallet');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }}
                      className="px-10 py-4 rounded-xl text-white text-lg font-semibold transition-all"
                      style={{ backgroundColor: '#D4AF37' }}
                    >
                      {heroSlides[currentSlide].cta}
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-10">
            {/* Arrow Navigation */}
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Dot Indicators */}
            <div className="flex items-center gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all ${
                    index === currentSlide 
                      ? 'w-10 h-2 bg-white rounded-full' 
                      : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE (30%) - Quick Actions Panel */}
        <div className="w-full lg:w-[30%] bg-white flex items-center justify-center min-h-[40vh] lg:min-h-screen">
          <div className="px-6 lg:px-8 w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-6"
            >
              <div>
                <h2 
                  className="text-2xl lg:text-3xl tracking-tight mb-2"
                  style={{ fontWeight: 600, color: '#1a1a1a' }}
                >
                  Quick Actions
                </h2>
                <p className="text-[#6b6b6b] text-sm">Access your favorite features instantly</p>
              </div>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ 
                    scale: 1.02, 
                    y: -4,
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
    try {
      navigate('/reserves');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#f8f8f8' }}
                    >
                      <Package className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Browse Available Reserves</h3>
                      <p className="text-xs text-[#6b6b6b]">Complete your 25 daily reserves</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ 
                    scale: 1.02, 
                    y: -4,
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
    try {
      navigate('/bookings');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#f8f8f8' }}
                    >
                      <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>My Reservations</h3>
                      <p className="text-xs text-[#6b6b6b]">View and manage bookings</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ 
                    scale: 1.02, 
                    y: -4,
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
    try {
      navigate('/profile');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#f8f8f8' }}
                    >
                      <User className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>Profile Settings</h3>
                      <p className="text-xs text-[#6b6b6b]">Manage your account</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Auto-play toggle */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="text-xs text-[#6b6b6b] hover:text-[#D4AF37] transition-colors"
                >
                  {isAutoPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Search Bar Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
              Discover Your Perfect Stay
            </h2>
            <p className="text-[#6b6b6b] text-lg" style={{ fontFamily: 'Inter' }}>
              Search from 200+ luxury hotels worldwide
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Location */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </label>
                <input
                  type="text"
                  value={searchData.location}
                  onChange={(e) => handleSearchInputChange('location', e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>

              {/* Check-in */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  Check-in
                </label>
                <input
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) => handleSearchInputChange('checkIn', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  Check-out
                </label>
                <input
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) => handleSearchInputChange('checkOut', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                  style={{ fontFamily: 'Inter' }}
                />
              </div>

              {/* Guests & Level */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Guests
                  </label>
                  <select
                    value={searchData.guests}
                    onChange={(e) => handleSearchInputChange('guests', Number(e.target.value))}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                    style={{ fontFamily: 'Inter' }}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5+</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Level</label>
                  <select
                    value={searchData.level}
                    onChange={(e) => handleSearchInputChange('level', Number(e.target.value))}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                    style={{ fontFamily: 'Inter' }}
                  >
                    <option value={0}>All</option>
                    <option value={1}>L1</option>
                    <option value={2}>L2</option>
                    <option value={3}>L3</option>
                    <option value={4}>L4</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6 text-center">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                disabled={isSearching}
                className="px-12 py-4 rounded-xl font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                style={{ 
                  backgroundColor: '#F4C444',
                  fontFamily: 'Montserrat'
                }}
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Hotels
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="featured-properties" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-5xl mb-4 tracking-tight" style={{ fontWeight: 600, color: '#1a1a1a' }}>
              Featured Properties
            </h2>
            <p className="text-[#6b6b6b] text-lg">Handpicked luxury stays around the world</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredHotels.slice(0, 8).map((hotel: any, index: number) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                onClick={() => {
    try {
      navigate(`/hotel/${hotel.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-black/5"
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    style={{ aspectRatio: '4/3' }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      hotel.level === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                      hotel.level === 2 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      hotel.level === 3 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      'bg-gradient-to-r from-yellow-500 to-amber-500'
                    }`}>
                      Level {hotel.level}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>
                  <h3 className="text-xl mb-1" style={{ fontWeight: 600 }}>{hotel.name}</h3>
                  <p className="text-[#6b6b6b] text-sm mb-4">{hotel.city}, {hotel.country}</p>
                  <div className="flex items-center gap-3 mb-4">
                    {hotel.amenities.includes('WiFi') && <Wifi className="w-4 h-4 text-[#6b6b6b]" />}
                    {hotel.amenities.includes('Pool') && <Waves className="w-4 h-4 text-[#6b6b6b]" />}
                    {hotel.amenities.includes('Restaurant') && <Utensils className="w-4 h-4 text-[#6b6b6b]" />}
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl" style={{ fontWeight: 600, color: '#D4AF37' }}>
                      {hotel.currency === 'USD' ? '$' : hotel.currency === 'EUR' ? 'EUR' : 'USDT'}{hotel.price}
                    </span>
                    <span className="text-[#6b6b6b] text-sm">/night</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Reserve button clicked for hotel:', hotel.id, hotel.name);
                      navigate(`/checkout/${hotel.id}`);
                    }}
                    disabled={walletData.todayOrders >= walletData.maxDailyOrders}
                    className="w-full py-3 rounded-lg font-bold text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#F4C444',
                      fontFamily: 'Montserrat'
                    }}
                  >
                    Reserve Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Country */}
      <section id="explore-by-country" className="py-24 bg-[#f8f8f8]">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-5xl mb-4 tracking-tight" style={{ fontWeight: 600, color: '#1a1a1a' }}>
              Explore by Country
            </h2>
            <p className="text-[#6b6b6b] text-lg">Discover destinations worldwide</p>
          </motion.div>

          {/* Countries Slider */}
          <div className="relative">
            {/* Slider Container */}
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentCountrySlide * 100}%)` }}
              >
                {/* Group countries into slides */}
                {Array.from({ length: Math.ceil(countries.length / countriesPerSlide) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0 px-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                      {countries
                        .slice(slideIndex * countriesPerSlide, (slideIndex + 1) * countriesPerSlide)
                        .map((country, countryIndex) => (
                          <motion.div
                            key={country.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: countryIndex * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleCountryClick(country.name)}
                            className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group"
                          >
                            <ImageWithFallback
                              src={country.image}
                              alt={country.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 aspect-[4/3]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute inset-0 flex flex-col justify-end p-5">
                              <h3 className="text-white text-xl font-bold translate-y-1 group-hover:translate-y-0 transition-transform duration-300" style={{ fontFamily: 'Montserrat' }}>
                                {country.name}
                              </h3>
                              <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {country.count} world-class hotels
                              </p>
                            </div>
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/20 transition-colors duration-300" />
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Controls */}
            <div className="absolute top-1/2 transform -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
              <button
                onClick={prevCountrySlide}
                onMouseEnter={() => setIsCountryAutoPlaying(false)}
                onMouseLeave={() => setIsCountryAutoPlaying(true)}
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-800 hover:bg-white hover:shadow-xl transition-all pointer-events-auto"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextCountrySlide}
                onMouseEnter={() => setIsCountryAutoPlaying(false)}
                onMouseLeave={() => setIsCountryAutoPlaying(true)}
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-800 hover:bg-white hover:shadow-xl transition-all pointer-events-auto"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: Math.ceil(countries.length / countriesPerSlide) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToCountrySlide(index)}
                  onMouseEnter={() => setIsCountryAutoPlaying(false)}
                  onMouseLeave={() => setIsCountryAutoPlaying(true)}
                  className={`transition-all ${
                    index === currentCountrySlide 
                      ? 'w-8 h-2 bg-[#D4AF37] rounded-full' 
                      : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Auto-play Toggle */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setIsCountryAutoPlaying(!isCountryAutoPlaying)}
                className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors"
              >
                {isCountryAutoPlaying ? 'Pause Auto-slide' : 'Play Auto-slide'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Top */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#F4C444] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-4 tracking-tight font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
              Trusted by Luxury Travelers Worldwide
            </h2>
            <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter' }}>Join thousands of satisfied guests experiencing premium hospitality</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { number: '50K+', label: 'Happy Guests', suffix: '' },
              { number: '4.9', label: 'Average Rating', suffix: '/5.0' },
              { number: '120+', label: 'Luxury Hotels', suffix: '' },
              { number: '15+', label: 'Countries', suffix: '' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="backdrop-blur-xl bg-white/60 border border-white/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Glassmorphism Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-2xl"></div>
                  <div className="relative z-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.5, type: "spring" }}
                      className="text-4xl md:text-5xl font-bold mb-2"
                      style={{ color: '#F4C444', fontFamily: 'Montserrat' }}
                    >
                      {stat.number}
                      <span className="text-3xl md:text-4xl">{stat.suffix}</span>
                    </motion.div>
                    <div className="text-gray-700 font-medium" style={{ fontFamily: 'Inter' }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Partners Section - Middle */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl mb-4 tracking-tight font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
              Trusted Partners
            </h2>
            <p className="text-gray-600" style={{ fontFamily: 'Inter' }}>Working with world-class hotel brands</p>
          </motion.div>

          <div className="overflow-hidden">
            <div className="flex items-center justify-center space-x-8 lg:space-x-12 flex-wrap gap-8">
              {[
                { name: 'Marriott', logo: 'https://1000logos.net/wp-content/uploads/2022/12/Marriott-logo.png' },
                { name: 'Hilton', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYqcU6HmyRDTSTYBOzJN3G9MTl0E1TjkWsHA&s' },
                { name: 'Hyatt', logo: 'https://newsroom.hyatt.com/image/Hyatt+Logo+Hi+Res+Thumbnail.png' },
                { name: 'Four Seasons', logo: 'https://1000logos.net/wp-content/uploads/2020/10/Four-Seasons-Logo.jpg' },
                { name: 'Ritz-Carlton', logo: 'https://cdn.freebiesupply.com/logos/large/2x/the-ritz-carlton-logo-png-transparent.png' },
                { name: 'Intercontinental', logo: 'https://images.seeklogo.com/logo-png/25/1/intercontinental-hotels-resorts-logo-png_seeklogo-252956.png' }
              ].map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 flex flex-col items-center gap-3 cursor-pointer"
                >
                  <div className="h-20 flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <span className="text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors duration-300" style={{ fontFamily: 'Montserrat', fontWeight: 600 }}>
                    {partner.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section - Bottom */}
      <section className="py-24 bg-gradient-to-br from-[#f8f8f8] to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F4C444] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-5xl mb-4 tracking-tight" style={{ fontWeight: 600, color: '#1a1a1a' }}>
              Guest Experiences
            </h2>
            <p className="text-[#6b6b6b] text-lg mb-4">Real stories from luxury travelers worldwide</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-[#D4AF37] rounded-full"></div>
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
              <div className="w-12 h-1 bg-[#D4AF37] rounded-full"></div>
            </div>
          </motion.div>

          {/* Testimonials Slider */}
          <div className="relative">
            {/* Slider Container */}
            <div className="overflow-hidden rounded-3xl">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonialSlide * 100}%)` }}
              >
                {/* Group testimonials into slides */}
                {Array.from({ length: Math.ceil(testimonials.length / testimonialsPerSlide) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0 px-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {testimonials
                        .slice(slideIndex * testimonialsPerSlide, (slideIndex + 1) * testimonialsPerSlide)
                        .map((testimonial, testimonialIndex) => (
                          <motion.div
                            key={testimonial.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: testimonialIndex * 0.1, duration: 0.6 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                          >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#F4C444]/10 p-6 border-b border-gray-100">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center">
                                    <Star className="w-3 h-3 text-white fill-current" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                                  <p className="text-sm text-gray-600">{testimonial.country}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                                    ))}
                                    <span className="text-xs text-gray-500 ml-1">({testimonial.rating}.0)</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                              <div className="mb-4">
                                <div className="flex items-start gap-2 mb-3">
                                  <Quote className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                                  <p className="text-gray-700 leading-relaxed italic">{testimonial.review}</p>
                                </div>
                              </div>

                              {/* Stay Details */}
                              <div className="border-t border-gray-100 pt-4">
                                <div className="flex items-center justify-between text-sm">
                                  <div>
                                    <p className="text-gray-500">Stay Details</p>
                                    <p className="font-medium text-gray-900">{testimonial.stayDetails}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-gray-500">Date</p>
                                    <p className="font-medium text-gray-900">{testimonial.date}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Verified Badge */}
                              <div className="mt-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                                <span className="text-xs text-[#22C55E] font-medium">Verified Guest</span>
                              </div>
                            </div>

                            {/* Hover Effect Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Controls */}
            <div className="absolute top-1/2 transform -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
              <button
                onClick={prevTestimonialSlide}
                onMouseEnter={() => setIsTestimonialAutoPlaying(false)}
                onMouseLeave={() => setIsTestimonialAutoPlaying(true)}
                className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl flex items-center justify-center text-gray-800 hover:bg-white hover:shadow-3xl transition-all pointer-events-auto group"
              >
                <ChevronLeft className="w-6 h-6 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/0 group-hover:border-[#D4AF37]/30 transition-colors"></div>
              </button>
              <button
                onClick={nextTestimonialSlide}
                onMouseEnter={() => setIsTestimonialAutoPlaying(false)}
                onMouseLeave={() => setIsTestimonialAutoPlaying(true)}
                className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl flex items-center justify-center text-gray-800 hover:bg-white hover:shadow-3xl transition-all pointer-events-auto group"
              >
                <ChevronRight className="w-6 h-6 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/0 group-hover:border-[#D4AF37]/30 transition-colors"></div>
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: Math.ceil(testimonials.length / testimonialsPerSlide) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonialSlide(index)}
                  onMouseEnter={() => setIsTestimonialAutoPlaying(false)}
                  onMouseLeave={() => setIsTestimonialAutoPlaying(true)}
                  className={`transition-all ${
                    index === currentTestimonialSlide 
                      ? 'w-10 h-2 bg-[#D4AF37] rounded-full' 
                      : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Auto-play Toggle */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setIsTestimonialAutoPlaying(!isTestimonialAutoPlaying)}
                className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors"
              >
                {isTestimonialAutoPlaying ? 'Pause Auto-slide' : 'Play Auto-slide'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-12 text-center">
          <h3 className="text-3xl mb-4 tracking-tight" style={{ fontWeight: 600 }}>SMH</h3>
          <p className="text-white/60 mb-6">Luxury hotel reservations, anytime, anywhere</p>
          <p className="text-sm text-white/40">© 2026 SMH. All rights reserved.</p>
        </div>
      </footer>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-lg z-50 ${
              toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`}
          >
            <div className="flex items-center gap-3">
              {toastType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span style={{ fontFamily: 'Inter' }}>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
