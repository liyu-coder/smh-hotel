import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Wifi, 
  Waves, 
  Dumbbell, 
  Utensils, 
  Coffee, 
  Car,
  Filter,
  ChevronDown,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { mockHotels, countries, type Country, type Hotel } from '../data/mockHotels';

type SortBy = 'priceLow' | 'priceHigh' | 'topRated' | 'featured';
type ViewMode = 'grid' | 'list';

const amenityIcons: { [key: string]: any } = {
  'WiFi': Wifi,
  'Pool': Waves,
  'Spa': Heart,
  'Gym': Dumbbell,
  'Restaurant': Utensils,
  'Bar': Coffee,
  'Business Center': Grid,
  'Concierge': Filter,
  'Room Service': Utensils,
  'Valet': Car,
  'Beach Access': Waves,
  'Ski Access': Waves,
  'Garden': Heart,
  'Tea House': Coffee,
  'Zen Garden': Heart,
  'Onsen': Waves,
  'Rooftop Bar': Coffee,
  'Theatre': Grid,
  'Fireplace': Heart
};

export function HotelDiscovery() {
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([300, 1500]);
  const [sortBy, setSortBy] = useState<SortBy>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (hotelId: number) => {
    const newFavorites = favorites.includes(hotelId)
      ? favorites.filter(id => id !== hotelId)
      : [...favorites, hotelId];

    setFavorites(newFavorites);
    // In a real app, this would be saved to the database via API
  };

  // Filter and sort hotels
  const filteredAndSortedHotels = useMemo(() => {
    let filtered = mockHotels.filter(hotel => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Country filter
      const matchesCountry = selectedCountry === 'all' || hotel.country === selectedCountry;

      // Price filter
      const matchesPrice = hotel.pricePerNight >= priceRange[0] && hotel.pricePerNight <= priceRange[1];

      return matchesSearch && matchesCountry && matchesPrice;
    });

    // Sort hotels
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priceLow':
          return a.pricePerNight - b.pricePerNight;
        case 'priceHigh':
          return b.pricePerNight - a.pricePerNight;
        case 'topRated':
          return b.rating - a.rating;
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [searchTerm, selectedCountry, priceRange, sortBy]);

  const handleViewDetails = (hotelId: number) => {
    navigate(`/hotel/${hotelId}`);
  };

  const getAmenityIcon = (amenity: string) => {
    return amenityIcons[amenity] || Heart;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#F4C444] shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Hotel Discovery</h1>
              <p className="text-black/80 mt-1">Find your perfect luxury stay</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium">Filters</span>
              </button>
              <div className="flex bg-black/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-black/20' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-black/20' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className={`bg-white border-b border-gray-200 transition-all duration-300 ${showFilters ? 'py-6' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search hotels or cities..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C444] focus:border-transparent"
              />
            </div>

            {/* Country Filter */}
            <div>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as Country | 'all')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C444] focus:border-transparent"
              >
                <option value="all">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg">
                <span className="text-sm font-medium">${priceRange[0]}</span>
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm font-medium">${priceRange[1]}</span>
              </div>
              {showFilters && (
                <div className="mt-2">
                  <input
                    type="range"
                    min="300"
                    max="1500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C444] focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="topRated">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredAndSortedHotels.length} hotels found
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCountry('all');
                setPriceRange([300, 1500]);
                setSortBy('featured');
              }}
              className="text-sm text-[#F4C444] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </div>

      {/* Hotels Grid/List */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedHotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="relative h-64">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Featured Badge */}
                  {hotel.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-[#F4C444] text-black text-xs rounded-full font-medium">
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
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{hotel.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.location}, {hotel.country}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{hotel.description}</p>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 3).map((amenity, amenityIndex) => {
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

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      {hotel.discount ? (
                        <div>
                          <p className="text-lg font-bold text-red-500 line-through">
                            ${hotel.pricePerNight}
                          </p>
                          <p className="text-2xl font-bold text-[#F4C444]">
                            ${Math.round(hotel.pricePerNight * (1 - hotel.discount / 100))}
                          </p>
                          <p className="text-xs text-gray-500">per night</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-2xl font-bold text-[#F4C444]">
                            ${hotel.pricePerNight}
                          </p>
                          <p className="text-xs text-gray-500">per night</p>
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(hotel.id)}
                      className="px-4 py-2 bg-[#F4C444] text-black rounded-lg font-semibold text-sm hover:bg-[#E5C551] transition-colors"
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedHotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative h-48 md:h-auto md:w-80">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(hotel.id)}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(hotel.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {hotel.featured && (
                            <span className="px-2 py-1 bg-[#F4C444] text-black text-xs rounded-full font-medium">
                              Featured
                            </span>
                          )}
                          {hotel.discount && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                              {hotel.discount}% OFF
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{hotel.rating}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">{hotel.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{hotel.location}, {hotel.country}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{hotel.description}</p>
                        
                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.slice(0, 5).map((amenity, amenityIndex) => {
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
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="ml-6 text-right">
                        {hotel.discount ? (
                          <div>
                            <p className="text-lg font-bold text-red-500 line-through">
                              ${hotel.pricePerNight}
                            </p>
                            <p className="text-2xl font-bold text-[#F4C444]">
                              ${Math.round(hotel.pricePerNight * (1 - hotel.discount / 100))}
                            </p>
                            <p className="text-xs text-gray-500 mb-4">per night</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-2xl font-bold text-[#F4C444]">
                              ${hotel.pricePerNight}
                            </p>
                            <p className="text-xs text-gray-500 mb-4">per night</p>
                          </div>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewDetails(hotel.id)}
                          className="px-4 py-2 bg-[#F4C444] text-black rounded-lg font-semibold text-sm hover:bg-[#E5C551] transition-colors"
                        >
                          View Details
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedHotels.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">No Hotels Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCountry('all');
                setPriceRange([300, 1500]);
                setSortBy('featured');
              }}
              className="px-6 py-3 bg-[#F4C444] text-black rounded-lg font-semibold hover:bg-[#E5C551] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
