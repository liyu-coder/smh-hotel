import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Wifi, 
  Utensils, 
  Waves, 
  CreditCard, 
  Calendar,
  ChevronDown,
  X,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react';
import { allHotels, hotelCountries } from '../data/hotels';

interface Hotel {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  level: 1 | 2 | 3 | 4;
  price: number;
  currency: 'USD' | 'EUR' | 'USDT';
  image: string;
  description: string;
  amenities: string[];
  rating: number;
  featured: boolean;
  commission: number;
}

interface BookingData {
  hotelId: string;
  hotelName: string;
  price: number;
  currency: string;
  commission: number;
  netAmount: number;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export function AdvancedHotelPackages() {
  const navigate = useNavigate();
  
  const [hotels, setHotels] = useState<Hotel[]>(allHotels);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>(allHotels);
  const [searchData, setSearchData] = useState({
    location: '',
    level: 'all' as 'all' | '1' | '2' | '3' | '4',
    country: 'all',
    priceRange: 'all' as 'all' | 'budget' | 'mid' | 'luxury'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [todayBookings, setTodayBookings] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const maxDailyBookings = 25;
  const commissionRate = 0.26; // 26%

  useEffect(() => {
    filterHotels();
  }, [searchData, hotels]);

  const filterHotels = () => {
    let filtered = hotels;

    // Filter by search location
    if (searchData.location) {
      filtered = filtered.filter(hotel => 
        hotel.name.toLowerCase().includes(searchData.location.toLowerCase()) ||
        hotel.city.toLowerCase().includes(searchData.location.toLowerCase()) ||
        hotel.country.toLowerCase().includes(searchData.location.toLowerCase())
      );
    }

    // Filter by level
    if (searchData.level !== 'all') {
      filtered = filtered.filter(hotel => hotel.level === parseInt(searchData.level));
    }

    // Filter by country
    if (searchData.country !== 'all') {
      filtered = filtered.filter(hotel => hotel.country === searchData.country);
    }

    // Filter by price range
    if (searchData.priceRange !== 'all') {
      switch (searchData.priceRange) {
        case 'budget':
          filtered = filtered.filter(hotel => hotel.price <= 100);
          break;
        case 'mid':
          filtered = filtered.filter(hotel => hotel.price > 100 && hotel.price <= 300);
          break;
        case 'luxury':
          filtered = filtered.filter(hotel => hotel.price > 300);
          break;
      }
    }

    setFilteredHotels(filtered);
  };

  const handleBooking = (hotel: Hotel) => {
    if (todayBookings >= maxDailyBookings) {
      alert(`You have reached the maximum of ${maxDailyBookings} bookings for today.`);
      return;
    }

    const commission = hotel.price * commissionRate;
    const netAmount = hotel.price - commission;

    const booking: BookingData = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      price: hotel.price,
      currency: hotel.currency,
      commission: commission,
      netAmount: netAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setBookings([booking, ...bookings]);
    setTodayBookings(todayBookings + 1);
    setSelectedHotel(hotel);
    setShowBookingModal(true);
    
    setTimeout(() => {
      setShowBookingModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-gray-100 text-gray-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-purple-100 text-purple-800';
      case 4: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Level 1';
      case 2: return 'Level 2';
      case 3: return 'Level 3';
      case 4: return 'Level 4';
      default: return 'Level 1';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/wallet')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat' }}>
                Hotel Packages
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                {todayBookings}/{maxDailyBookings} bookings today
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(todayBookings / maxDailyBookings) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchData.location}
                onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Search hotels, cities, or countries..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                style={{ fontFamily: 'Inter' }}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
              style={{ fontFamily: 'Montserrat' }}
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters && <X className="w-4 h-4" />}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Hotel Level
                  </label>
                  <select
                    value={searchData.level}
                    onChange={(e) => setSearchData(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{ fontFamily: 'Inter' }}
                  >
                    <option value="all">All Levels</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                  </select>
                </div>

                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Country
                  </label>
                  <select
                    value={searchData.country}
                    onChange={(e) => setSearchData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{ fontFamily: 'Inter' }}
                  >
                    <option value="all">All Countries</option>
                    {hotelCountries.map(country => (
                      <option key={country.code} value={country.name}>
                        {country.name} ({country.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Price Range
                  </label>
                  <select
                    value={searchData.priceRange}
                    onChange={(e) => setSearchData(prev => ({ ...prev, priceRange: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{ fontFamily: 'Inter' }}
                  >
                    <option value="all">All Prices</option>
                    <option value="budget">Budget (Up to $100)</option>
                    <option value="mid">Mid-Range ($100-$300)</option>
                    <option value="luxury">Luxury ($300+)</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                    {filteredHotels.length} hotels found
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleBooking(hotel)}
            >
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(hotel.level)}`}>
                    {getLevelText(hotel.level)}
                  </span>
                </div>
                {hotel.featured && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Featured
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                      {hotel.rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span style={{ fontFamily: 'Inter' }}>{hotel.city}, {hotel.country}</span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2" style={{ fontFamily: 'Inter' }}>
                  {hotel.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.amenities.slice(0, 3).map((amenity, amenityIndex) => {
                    const icons: { [key: string]: React.ComponentType<any> } = {
                      'WiFi': Wifi,
                      'Restaurant': Utensils,
                      'Pool': Waves,
                      'Spa': Star,
                      'Gym': Users,
                    };
                    const Icon = icons[amenity] || Star;
                    return (
                      <div
                        key={amenityIndex}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                      >
                        <Icon className="w-3 h-3" />
                        {amenity}
                      </div>
                    );
                  })}
                </div>

                {/* Price and Commission */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Inter' }}>
                        {hotel.currency === 'USD' ? '$' : hotel.currency === 'EUR' ? 'EUR' : 'USDT'}{hotel.price}
                      </div>
                      <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter' }}>
                        per night
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>
                        Commission
                      </div>
                      <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Inter' }}>
                        -{hotel.currency === 'USD' ? '$' : hotel.currency === 'EUR' ? 'EUR' : 'USDT'}{(hotel.price * commissionRate).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-green-600 font-medium" style={{ fontFamily: 'Inter' }}>
                    Net: {hotel.currency === 'USD' ? '$' : hotel.currency === 'EUR' ? 'EUR' : 'USDT'}{(hotel.price * (1 - commissionRate)).toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedHotel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                Booking Confirmed!
              </h3>
              <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter' }}>
                {selectedHotel.name}
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Total Price:</span>
                  <span className="font-medium">
                    {selectedHotel.currency === 'USD' ? '$' : selectedHotel.currency === 'EUR' ? 'EUR' : 'USDT'}{selectedHotel.price}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Commission (26%):</span>
                  <span className="font-medium text-red-600">
                    -{selectedHotel.currency === 'USD' ? '$' : selectedHotel.currency === 'EUR' ? 'EUR' : 'USDT'}{(selectedHotel.price * commissionRate).toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Net Amount:</span>
                    <span className="font-bold text-green-600">
                      {selectedHotel.currency === 'USD' ? '$' : selectedHotel.currency === 'EUR' ? 'EUR' : 'USDT'}{(selectedHotel.price * (1 - commissionRate)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500" style={{ fontFamily: 'Inter' }}>
                Booking #{todayBookings} of {maxDailyBookings} for today
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg z-50"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5" />
            <span style={{ fontFamily: 'Inter' }}>
              Hotel booked successfully! Commission deducted.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
