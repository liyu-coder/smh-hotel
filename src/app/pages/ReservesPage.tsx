import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Package, Star, Wifi, Utensils, Waves, CheckCircle, Filter, Sparkles, Crown, Gem, Diamond, Info } from 'lucide-react';
import { allHotels } from '../../data/hotels';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function ReservesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const countryParam = searchParams.get('country');

  const [selectedLevel, setSelectedLevel] = useState<number>(() => {
    if (countryParam) {
       const countryHotels = allHotels.filter(h => h.country.toLowerCase() === countryParam.toLowerCase());
       if (countryHotels.length > 0) {
         return countryHotels[0].level;
       }
    }
    return 1;
  });
  const [filteredHotels, setFilteredHotels] = useState(allHotels);
  const [walletData, setWalletData] = useState({
    availableBalance: 2500.00,
    todayOrders: 0,
    maxDailyOrders: 25,
    tasksCompleted: false,
    pending: 0,
    totalApproved: 5000.00
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const commissionRate = 0.26; // 26% commission

  const levels = [
    { id: 1, name: 'Level 1', icon: Sparkles, description: 'Starting at $50', color: 'from-yellow-400 to-amber-500' },
    { id: 2, name: 'Level 2', icon: Gem, description: 'Premium stays', color: 'from-amber-500 to-orange-500' },
    { id: 3, name: 'Level 3', icon: Crown, description: 'Luxury experience', color: 'from-orange-500 to-red-500' },
    { id: 4, name: 'Level 4', icon: Diamond, description: 'Elite exclusive', color: 'from-red-500 to-pink-500' }
  ];

  useEffect(() => {
    let filtered = allHotels;
    if (countryParam) {
      filtered = filtered.filter(hotel => hotel.country.toLowerCase() === countryParam.toLowerCase());
    }
    filtered = filtered.filter(hotel => hotel.level === selectedLevel);
    setFilteredHotels(filtered);
  }, [selectedLevel, countryParam]);

  const handleReserve = (hotel: any) => {
    navigate(`/checkout/${hotel.id}`);
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                {countryParam ? `${countryParam} Reservations` : 'Available Reserves'}
              </h1>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                {countryParam 
                  ? `Exclusive properties in ${countryParam}` 
                  : 'Browse hotels by level - reservations admin-controlled'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm text-gray-600 font-medium" style={{ fontFamily: 'Inter' }}>
              {walletData.todayOrders}/{walletData.maxDailyOrders}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Level Selector Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
              Filter by Level
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {levels.map((level) => {
              const Icon = level.icon;
              return (
                <motion.button
                  key={level.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    selectedLevel === level.id
                      ? 'border-[#D4AF37] bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`absolute top-3 right-3 p-2 rounded-lg bg-gradient-to-br ${level.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                      {level.name}
                    </div>
                    <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                      {level.description}
                    </div>
                    <div className="mt-3 text-xs font-medium text-[#D4AF37]">
                      {filteredHotels.filter(h => h.level === level.id).length} hotels
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-amber-50 rounded-2xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat' }}>
              Daily Task Progress
            </span>
            <span className="text-sm text-[#D4AF37] font-bold" style={{ fontFamily: 'Inter' }}>
              {walletData.todayOrders} of {walletData.maxDailyOrders} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <motion.div
              className="bg-gradient-to-r from-[#D4AF37] to-[#F4C444] h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(walletData.todayOrders / walletData.maxDailyOrders) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {!walletData.tasksCompleted && (
            <div className="mt-3 text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
              Complete {walletData.maxDailyOrders - walletData.todayOrders} more tasks to unlock next plan level
            </div>
          )}
        </motion.div>

        {/* Helpful Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3"
        >
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700" style={{ fontFamily: 'Inter' }}>
            Complete your daily tasks in the Tasks page. Admin controls all reservations based on your task completion and plan level. Finish Plan 1 tasks to unlock Plan 2, then Plan 3, then Plan 4.
          </p>
        </motion.div>

        {/* Hotels Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                {levels.find(l => l.id === selectedLevel)?.name} Hotels {countryParam && `in ${countryParam}`}
              </h2>
              {countryParam && (
                <button
                  onClick={() => navigate('/reserves')}
                  className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-[#D4AF37] border border-gray-200 hover:border-[#D4AF37] rounded-full transition-all"
                >
                  Clear {countryParam} Filter
                </button>
              )}
            </div>
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
              {filteredHotels.length} properties available
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLevel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredHotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  onClick={() => {
                    console.log('Hotel card clicked:', hotel.id, hotel.name);
                    navigate(`/hotel/${hotel.id}`);
                  }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#D4AF37] transition-all cursor-pointer"
                >
                  {/* Level Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${levels.find(l => l.id === hotel.level)?.color}`}>
                      {levels.find(l => l.id === hotel.level)?.name}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="relative h-56">
                    <ImageWithFallback
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover aspect-[4/3]"
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-white rounded-full shadow-lg">
                      <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                      <span className="text-sm font-semibold" style={{ fontFamily: 'Inter' }}>
                        {hotel.rating}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                        {hotel.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3" style={{ fontFamily: 'Inter' }}>
                      <span className="font-medium">{hotel.city}, {hotel.country}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                          {amenity === 'WiFi' && <Wifi className="w-3 h-3 text-gray-600" />}
                          {amenity === 'Pool' && <Waves className="w-3 h-3 text-gray-600" />}
                          {amenity === 'Restaurant' && <Utensils className="w-3 h-3 text-gray-600" />}
                          <span className="text-xs text-gray-600">{amenity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <div className="text-2xl font-bold" style={{ fontFamily: 'Inter', color: '#D4AF37' }}>
                          {hotel.currency === 'USD' ? '$' : hotel.currency === 'EUR' ? 'EUR' : 'USDT'}{hotel.price}
                        </div>
                        <div className="text-xs text-gray-500">per night</div>
                      </div>
                      <div className="px-4 py-2 bg-gray-100 rounded-lg text-xs text-gray-600 text-center">
                        <div className="font-medium">Admin Controlled</div>
                        <div className="text-[10px]">Complete tasks to unlock</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredHotels.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                No hotels found
              </h3>
              <p className="text-gray-500" style={{ fontFamily: 'Inter' }}>
                Try selecting a different level
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

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
                <div className="w-5 h-5 rounded-full border-2 border-white" />
              )}
              <span style={{ fontFamily: 'Inter' }}>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
