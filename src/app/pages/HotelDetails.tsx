import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Coffee, 
  Dumbbell, 
  Check, 
  Heart, 
  Calendar, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  Globe,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  phone: string;
  website: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  reviews: number;
}

const hotelsData: Hotel[] = [
  {
    id: 1,
    name: 'Grand Plaza Hotel',
    location: 'New York, USA',
    rating: 4.8,
    price: 450,
    image: 'https://images.unsplash.com/photo-1566073771259-4a9604499b0a?w=800&h=600&fit=crop',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Business Center'],
    rooms: ['Deluxe Suite', 'Ocean View', 'Standard Room', 'Executive Floor'],
    description: 'Experience luxury at its finest in the heart of Manhattan. The Grand Plaza Hotel offers stunning city views, world-class amenities, and impeccable service. Located in Times Square, you\'ll be steps away from Broadway theaters, world-class shopping, and iconic landmarks.',
    phone: '+1 (212) 555-0100',
    website: 'www.grandplazahotel.com',
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
    reviews: 1247
  },
  {
    id: 2,
    name: 'Sunset Beach Resort',
    location: 'Miami, Florida',
    rating: 4.9,
    price: 350,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    amenities: ['WiFi', 'Beach Access', 'Spa', 'All Inclusive', 'Water Sports', 'Pool Bar'],
    rooms: ['Beach Villa', 'Ocean Front', 'Garden View', 'Penthouse Suite'],
    description: 'Paradise awaits at Sunset Beach Resort, where pristine white sand beaches meet crystal clear turquoise waters. Enjoy all-inclusive luxury with unlimited dining, premium drinks, and exciting water activities. Perfect for couples and families seeking the ultimate tropical getaway.',
    phone: '+1 (305) 555-0200',
    website: 'www.sunsetbeachresort.com',
    checkInTime: '4:00 PM',
    checkOutTime: '10:00 AM',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
    reviews: 2103
  },
  {
    id: 3,
    name: 'Mountain Lodge Retreat',
    location: 'Aspen, Colorado',
    rating: 4.7,
    price: 280,
    image: 'https://images.unsplash.com/photo-1571003123894-4fda9042a734?w=800&h=600&fit=crop',
    amenities: ['WiFi', 'Fireplace', 'Ski Access', 'Hot Tub', 'Restaurant', 'Ski Storage'],
    rooms: ['Mountain View', 'Cozy Cabin', 'Luxury Suite', 'Family Lodge'],
    description: 'Escape to the mountains at our alpine retreat, where world-class skiing meets rustic luxury. After a day on the slopes, relax by the stone fireplace or unwind in your private hot tub. Our ski-in/ski-out location gives you direct access to the best runs in Aspen.',
    phone: '+1 (970) 555-0300',
    website: 'www.mountainlodgeaspen.com',
    checkInTime: '4:00 PM',
    checkOutTime: '10:00 AM',
    cancellationPolicy: 'Free cancellation up to 72 hours before check-in',
    reviews: 892
  },
  {
    id: 4,
    name: 'Urban Business Hotel',
    location: 'Chicago, Illinois',
    rating: 4.6,
    price: 220,
    image: 'https://images.unsplash.com/photo-1562774053-52e9c99606c4?w=800&h=600&fit=crop',
    amenities: ['WiFi', 'Business Center', 'Gym', 'Meeting Rooms', 'Restaurant', 'Concierge'],
    rooms: ['Executive Room', 'Business Suite', 'Standard Room', 'Corner Office'],
    description: 'Designed for the modern business traveler, our downtown Chicago hotel combines efficiency with comfort. State-of-the-art meeting facilities, 24-hour business center, and prime location near the Financial District make this the perfect base for your work trip.',
    phone: '+1 (312) 555-0400',
    website: 'www.uranbusinesschicago.com',
    checkInTime: '3:00 PM',
    checkOutTime: '12:00 PM',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
    reviews: 1567
  },
  {
    id: 5,
    name: 'Tropical Paradise Resort',
    location: 'Hawaii, USA',
    rating: 4.9,
    price: 520,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    amenities: ['WiFi', 'Beach', 'Spa', 'Golf Course', 'Multiple Restaurants', 'Kids Club'],
    rooms: ['Ocean Suite', 'Beach Bungalow', 'Garden Villa', 'Presidential Suite'],
    description: 'Discover heaven on earth at our Hawaiian paradise resort. Nestled between lush tropical gardens and pristine beaches, our resort offers unlimited activities from championship golf to traditional luaus. Experience true aloha spirit with our world-renowned hospitality.',
    phone: '+1 (808) 555-0500',
    website: 'www.tropicalparadisehawaii.com',
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
    reviews: 3421
  },
  {
    id: 6,
    name: 'Historic Grand Hotel',
    location: 'Paris, France',
    rating: 4.8,
    price: 380,
    image: 'https://images.unsplash.com/photo-1564501049662-6aa5d3795169?w=800&h=600&fit=crop',
    amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Room Service', 'Valet Parking'],
    rooms: ['Classic Suite', 'Deluxe Room', 'Premium Room', 'Eiffel Tower View'],
    description: 'Step back in time at our historic Parisian hotel, where classic French elegance meets modern luxury. Located just steps from the Eiffel Tower, our hotel has been hosting discerning travelers since 1889. Savor exquisite French cuisine at our Michelin-starred restaurant.',
    phone: '+33 (1) 555-0600',
    website: 'www.historicgrandparis.com',
    checkInTime: '2:00 PM',
    checkOutTime: '12:00 PM',
    cancellationPolicy: 'Free cancellation up to 72 hours before check-in',
    reviews: 2894
  }
];

export function HotelDetails() {
  const { id } = useParams<{ id: string }();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hotelId = parseInt(id || '0');
    const foundHotel = hotelsData.find(h => h.id === hotelId);
    setHotel(foundHotel || null);
    
    if (foundHotel) {
      setSelectedRoom(foundHotel.rooms[0]);
      
      // Save to recently viewed
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updated = [foundHotel.id, ...recentlyViewed.filter((id: number) => id !== foundHotel.id)].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      
      // Check if favorite
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(foundHotel.id));
    }
  }, [id]);

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut || !selectedRoom) {
      alert('Please select check-in date, check-out date, and room type');
      return;
    }

    setIsLoading(true);

    // Calculate total price
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = (hotel?.price || 0) * nights;

    // Create booking
    const bookingDetails = {
      hotelName: hotel?.name,
      location: hotel?.location,
      checkIn,
      checkOut,
      guests,
      roomType: selectedRoom,
      price: hotel?.price,
      totalPrice,
      status: 'confirmed',
      bookingReference: `SMH-${Date.now()}`,
      hotelId: hotel?.id
    };

    // Show confirmation
    const confirmBooking = window.confirm(
      `Confirm Booking:\n\n` +
      `Hotel: ${hotel?.name}\n` +
      `Location: ${hotel?.location}\n` +
      `Check-in: ${checkIn}\n` +
      `Check-out: ${checkOut}\n` +
      `Guests: ${guests}\n` +
      `Room: ${selectedRoom}\n` +
      `Total Price: $${totalPrice}\n\n` +
      `Click OK to confirm booking.`
    );

    if (confirmBooking) {
      // Save booking
      const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      existingBookings.push(bookingDetails);
      localStorage.setItem('userBookings', JSON.stringify(existingBookings));
      
      alert(`Booking Confirmed!\n\nBooking Reference: ${bookingDetails.bookingReference}\nTotal: $${totalPrice}\n\nRedirecting to your reservations...`);
      
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    }

    setIsLoading(false);
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const updated = favorites.filter((id: number) => id !== hotel?.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      favorites.push(hotel?.id || 0);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % 3);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + 3) % 3);
  };

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hotel Not Found</h1>
          <Link to="/packages" className="text-blue-600 hover:underline">
            Back to Packages
          </Link>
        </div>
      </div>
    );
  }

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
      'Kids Club': Users,
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
          <Link to="/packages" className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37]">
            <ArrowLeft className="w-4 h-4" />
            Back to Packages
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section with Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative h-96 rounded-2xl overflow-hidden">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Image Navigation */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={prevImage}
                className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>

            {/* Hotel Info Overlay */}
            <div className="absolute bottom-8 left-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-4 text-lg">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  {hotel.location}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                  {hotel.rating} ({hotel.reviews} reviews)
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
                About This Hotel
              </h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity, index) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Hotel Policies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
                Hotel Policies
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <p className="font-medium">Check-in / Check-out</p>
                    <p className="text-sm text-gray-600">Check-in: {hotel.checkInTime} | Check-out: {hotel.checkOutTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <p className="font-medium">Cancellation Policy</p>
                    <p className="text-sm text-gray-600">{hotel.cancellationPolicy}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{hotel.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{hotel.website}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
            >
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-3xl font-bold" style={{ color: '#D4AF37' }}>
                      ${hotel.price}
                    </p>
                    <p className="text-sm text-gray-500">per night</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span className="font-medium">{hotel.rating}</span>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  >
                    {hotel.rooms.map((room, index) => (
                      <option key={index} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
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
              </div>

              {/* Book Now Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookNow}
                disabled={isLoading}
                className="w-full mt-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#D4AF37' }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Book Now'
                )}
              </motion.button>

              {!user && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  You'll need to login to complete booking
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
