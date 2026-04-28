import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Star, Wifi, Utensils, Waves, MapPin, CheckCircle, Calendar, Users, Crown, Gem, Diamond, Sparkles } from 'lucide-react';
import { hotelsApi } from '../lib/api';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function HotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;

      try {
        const response = await hotelsApi.getHotel(id);
        if (response.success && response.hotel) {
          setHotel(response.hotel);
        }
      } catch (error) {
        console.error('Error fetching hotel:', error);
      }
      setLoading(false);
    };

    fetchHotel();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Hotel Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: '#D4AF37' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const levelConfig = {
    1: { name: 'Level 1', icon: Sparkles, color: 'from-gray-500 to-gray-600', description: 'Starting at $50' },
    2: { name: 'Level 2', icon: Gem, color: 'from-blue-500 to-blue-600', description: 'Premium stays' },
    3: { name: 'Level 3', icon: Crown, color: 'from-purple-500 to-purple-600', description: 'Luxury experience' },
    4: { name: 'Level 4', icon: Diamond, color: 'from-yellow-500 to-amber-500', description: 'Elite exclusive' }
  };

  const level = levelConfig[hotel.level as keyof typeof levelConfig];
  const LevelIcon = level.icon;

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
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
              Hotel Details
            </h1>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-96 object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <div className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${level.color}`}>
                  <LevelIcon className="w-4 h-4 inline mr-2" />
                  {level.name}
                </div>
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
                <Star className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-lg font-bold">{hotel.rating}</span>
              </div>
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                {hotel.name}
              </h2>
              <div className="flex items-center gap-2 text-gray-600" style={{ fontFamily: 'Inter' }}>
                <MapPin className="w-4 h-4" />
                <span className="text-lg">{hotel.city}, {hotel.country}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold" style={{ fontFamily: 'Inter', color: '#D4AF37' }}>
                {hotel.currency === 'USD' ? '$' : hotel.currency === 'EUR' ? 'EUR' : 'USDT'}{hotel.price}
              </span>
              <span className="text-gray-600 text-lg">per night</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <LevelIcon className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-semibold" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                  {level.name}
                </span>
              </div>
              <p className="text-gray-600" style={{ fontFamily: 'Inter' }}>
                {level.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter' }}>
                Experience luxury and comfort at {hotel.name}. This stunning property offers world-class amenities 
                and exceptional service, making it the perfect choice for your next getaway. Located in the heart 
                of {hotel.city}, you'll have easy access to local attractions, dining, and entertainment.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Montserrat', color: '#1a1a1a' }}>
                Amenities
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {hotel.amenities.map((amenity: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {amenity === 'WiFi' && <Wifi className="w-5 h-5 text-[#D4AF37]" />}
                    {amenity === 'Pool' && <Waves className="w-5 h-5 text-[#D4AF37]" />}
                    {amenity === 'Restaurant' && <Utensils className="w-5 h-5 text-[#D4AF37]" />}
                    {amenity === 'Spa' && <Crown className="w-5 h-5 text-[#D4AF37]" />}
                    {amenity === 'Gym' && <Users className="w-5 h-5 text-[#D4AF37]" />}
                    <span className="text-gray-700 font-medium" style={{ fontFamily: 'Inter' }}>
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/plans')}
                className="w-full py-4 rounded-xl font-bold text-black transition-colors hover:opacity-90"
                style={{
                  backgroundColor: '#F4C444',
                  fontFamily: 'Montserrat'
                }}
              >
                Reserve Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
