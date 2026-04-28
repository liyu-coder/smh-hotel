import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Filter, Star, MapPin, Heart, Wifi, Car, Coffee, Dumbbell, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockHotels } from '../data/mockHotels';

interface Hotel {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
  amenities: string[];
  rooms: string[];
  description: string;
  reviews: number;
  featured: boolean;
  discount?: number;
}

const hotels = mockHotels.map(hotel => ({
  id: hotel.id,
  name: hotel.name,
  location: `${hotel.location}, ${hotel.country}`,
  rating: hotel.rating,
  price: hotel.pricePerNight,
  image: hotel.image,
  amenities: hotel.amenities,
  rooms: ['Standard Room', 'Deluxe Room', 'Executive Suite'],
  description: hotel.description,
  reviews: 150, // Default review count
  featured: hotel.featured,
  discount: hotel.discount
}));

const locations = ['All Locations', 'New York', 'Miami', 'Aspen', 'Chicago', 'Hawaii', 'Paris', 'London', 'Tokyo'];
const priceRanges = ['All Prices', 'Under $200', '$200-$300', '$300-$400', '$400-$500', 'Over $500'];

export function HotelPackages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Load search data from Home page
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });

  const [searchTerm, setSearchTerm] = useState(searchData.location || '');
  const [selectedLocation, setSelectedLocation] = useState(searchData.location || 'All Locations');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  // Update search term when searchData changes
  useEffect(() => {
    setSearchTerm(searchData.location || '');
    setSelectedLocation(searchData.location || 'All Locations');
  }, [searchData]);

  useEffect(() => {
    // Favorites will be loaded from database in a real implementation
  }, []);

  const toggleFavorite = (hotelId: number) => {
    const newFavorites = favorites.includes(hotelId)
      ? favorites.filter(id => id !== hotelId)
      : [...favorites, hotelId];

    setFavorites(newFavorites);
    // In a real app, this would be saved to the database via API
  };

  const filteredHotels = hotels.filter((hotel: Hotel) => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'All Locations' || hotel.location.includes(selectedLocation);
    
    let matchesPrice = true;
    if (selectedPriceRange !== 'All Prices') {
      switch (selectedPriceRange) {
        case 'Under $200':
          matchesPrice = hotel.price < 200;
          break;
        case '$200-$300':
          matchesPrice = hotel.price >= 200 && hotel.price < 300;
          break;
        case '$300-$400':
          matchesPrice = hotel.price >= 300 && hotel.price < 400;
          break;
        case '$400-$500':
          matchesPrice = hotel.price >= 400 && hotel.price < 500;
          break;
        case 'Over $500':
          matchesPrice = hotel.price >= 500;
          break;
      }
    }
    
    return matchesSearch && matchesLocation && matchesPrice;
  }).sort((a: Hotel, b: Hotel) => {
    switch (sortBy) {
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      'WiFi': Wifi,
      'Pool': Check,
      'Gym': Dumbbell,
      'Restaurant': Coffee,
      'Beach Access': MapPin,
      'Parking': Car,
      'Spa': Heart,
      'Business Center': Check,
      'All Inclusive': Check,
      'Water Sports': Check,
      'Pool Bar': Coffee,
      'Fireplace': Check,
      'Hot Tub': Check,
      'Ski Access': Check,
      'Ski Storage': Check,
      'Meeting Rooms': Check,
      'Concierge': Check,
      'Room Service': Check,
      'Valet Parking': Car,
      'Multiple Restaurants': Coffee,
      'Kids Club': Check,
      'Golf Course': Check,
      'Bar': Coffee
    };
    return icons[amenity] || Check;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/home" className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
            SMH
          </Link>
          <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37]">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
            Hotel Packages
          </h1>
          <p className="text-gray-600">Discover amazing hotel deals and exclusive packages</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search hotels or locations..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                {priceRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-[#D4AF37] transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel: Hotel, index: number) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Featured Badge */}
                {hotel.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#D4AF37] text-white text-xs rounded-full font-medium">
                      Featured
                    </span>
                  </div>
                )}

                {/* Discount Badge */}
                {hotel.discount && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                      {hotel.discount}% OFF
                    </span>
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(hotel.id)}
                  className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(hotel.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>

                {/* Rating */}
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{hotel.rating}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#1a1a1a' }}>
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    {hotel.location}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{hotel.description}</p>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.slice(0, 3).map((amenity: string, amenityIndex: number) => {
                      const Icon = getAmenityIcon(amenity);
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
                    {hotel.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        +{hotel.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    {hotel.discount ? (
                      <div>
                        <p className="text-xl font-bold text-red-500 line-through">
                          ${hotel.price}
                        </p>
                        <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                          ${Math.round(hotel.price * (1 - hotel.discount / 100))}
                        </p>
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                          ${hotel.price}
                        </p>
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                      className="px-4 py-2 rounded-lg font-semibold text-white text-sm"
                      style={{ backgroundColor: '#D4AF37' }}
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredHotels.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#1a1a1a' }}>
              No Hotels Found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('All Locations');
                setSelectedPriceRange('All Prices');
              }}
              className="px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: '#D4AF37' }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
