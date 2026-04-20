import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Calendar, MapPin, Users, Star, Filter, Heart, Wifi, Car, Coffee, Dumbbell, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Reserve() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const hotels = [
    {
      id: 1,
      name: 'Grand Plaza Hotel',
      location: 'New York, USA',
      rating: 4.8,
      price: 450,
      image: 'https://images.unsplash.com/photo-1566073771259-4a9604499b0a?w=400&h=250&fit=crop',
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
      rooms: ['Deluxe Suite', 'Ocean View', 'Standard Room'],
      description: 'Luxury hotel in the heart of Manhattan with stunning city views'
    },
    {
      id: 2,
      name: 'Sunset Beach Resort',
      location: 'Miami, Florida',
      rating: 4.9,
      price: 350,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop',
      amenities: ['WiFi', 'Beach Access', 'Spa', 'All Inclusive'],
      rooms: ['Beach Villa', 'Ocean Front', 'Garden View'],
      description: 'Beachfront paradise with pristine white sand and crystal clear waters'
    },
    {
      id: 3,
      name: 'Mountain Lodge Retreat',
      location: 'Aspen, Colorado',
      rating: 4.7,
      price: 280,
      image: 'https://images.unsplash.com/photo-1571003123894-4fda9042a734?w=400&h=250&fit=crop',
      amenities: ['WiFi', 'Fireplace', 'Ski Access', 'Hot Tub'],
      rooms: ['Mountain View', 'Cozy Cabin', 'Luxury Suite'],
      description: 'Alpine retreat with world-class skiing and breathtaking mountain views'
    },
    {
      id: 4,
      name: 'Urban Business Hotel',
      location: 'Chicago, Illinois',
      rating: 4.6,
      price: 220,
      image: 'https://images.unsplash.com/photo-1562774053-52e9c99606c4?w=400&h=250&fit=crop',
      amenities: ['WiFi', 'Business Center', 'Gym', 'Meeting Rooms'],
      rooms: ['Executive Room', 'Business Suite', 'Standard Room'],
      description: 'Modern business hotel with state-of-the-art facilities and conference rooms'
    },
    {
      id: 5,
      name: 'Tropical Paradise Resort',
      location: 'Hawaii, USA',
      rating: 4.9,
      price: 520,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
      amenities: ['WiFi', 'Beach', 'Spa', 'Golf Course'],
      rooms: ['Ocean Suite', 'Beach Bungalow', 'Garden Villa'],
      description: 'Exotic tropical getaway with pristine beaches and luxury amenities'
    },
    {
      id: 6,
      name: 'Historic Grand Hotel',
      location: 'Paris, France',
      rating: 4.8,
      price: 380,
      image: 'https://images.unsplash.com/photo-1564501049662-6aa5d3795169?w=400&h=250&fit=crop',
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge'],
      rooms: ['Classic Suite', 'Deluxe Room', 'Premium Room'],
      description: 'Elegant historic hotel near the Eiffel Tower with classic French charm'
    }
  ];

  const locations = ['New York', 'Miami', 'Aspen', 'Chicago', 'Hawaii', 'Paris', 'London', 'Tokyo'];
  const amenitiesList = ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Beach Access', 'Parking', 'Pet Friendly'];

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !selectedLocation || hotel.location.includes(selectedLocation);
    return matchesSearch && matchesLocation;
  });

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      'WiFi': Wifi,
      'Pool': Check,
      'Gym': Dumbbell,
      'Restaurant': Coffee,
      'Beach Access': MapPin,
      'Parking': Car,
      'Spa': Heart
    };
    return icons[amenity] || Check;
  };

  const handleBookNow = (hotel: any) => {
    setSelectedHotel(hotel);
    
    // Create booking confirmation with exact functionality
    const bookingDetails = {
      hotelName: hotel.name,
      location: hotel.location,
      checkIn: checkIn || new Date().toISOString().split('T')[0],
      checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests: guests,
      roomType: hotel.rooms[0], // Default to first room type
      price: hotel.price,
      totalPrice: hotel.price * (checkIn && checkOut ? 
        Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 1),
      status: 'confirmed',
      bookingReference: `SMH-${Date.now()}`
    };

    // Show booking confirmation dialog
    const confirmBooking = window.confirm(
      `Confirm Booking:\n\n` +
      `Hotel: ${hotel.name}\n` +
      `Location: ${hotel.location}\n` +
      `Check-in: ${bookingDetails.checkIn}\n` +
      `Check-out: ${bookingDetails.checkOut}\n` +
      `Guests: ${bookingDetails.guests}\n` +
      `Room: ${bookingDetails.roomType}\n` +
      `Total Price: $${bookingDetails.totalPrice}\n\n` +
      `Click OK to confirm booking.`
    );

    if (confirmBooking) {
      // Store booking in localStorage for persistence
      const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      existingBookings.push(bookingDetails);
      localStorage.setItem('userBookings', JSON.stringify(existingBookings));
      
      // Show success message and redirect
      alert(`Booking Confirmed!\n\nBooking Reference: ${bookingDetails.bookingReference}\nHotel: ${hotel.name}\nTotal: $${bookingDetails.totalPrice}\n\nRedirecting to your reservations...`);
      
      // Navigate to bookings page to see the confirmed booking
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    }
  };

  const handleSearch = () => {
    // Filter logic already applied above
    console.log('Searching with filters:', { searchTerm, selectedLocation, checkIn, checkOut, guests });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
            Reserve Your Stay
          </h1>
          <p className="text-gray-600">Find and book your perfect hotel experience</p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Check-in */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
                <option value={5}>5+ Guests</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="w-full px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: '#D4AF37' }}
              >
                <Search className="w-5 h-5" />
                Search
              </motion.button>
            </div>
          </div>

          {/* Additional Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by hotel name or location..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel, index) => (
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
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </button>
                </div>
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

                {/* Room Types */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Room Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {hotel.rooms.slice(0, 2).map((room, roomIndex) => (
                      <span
                        key={roomIndex}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {room}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price and Book Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                      ${hotel.price}
                    </p>
                    <p className="text-xs text-gray-500">per night</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBookNow(hotel)}
                    className="px-4 py-2 rounded-lg font-semibold text-white text-sm"
                    style={{ backgroundColor: '#D4AF37' }}
                  >
                    Book Now
                  </motion.button>
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
                setSelectedLocation('');
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
