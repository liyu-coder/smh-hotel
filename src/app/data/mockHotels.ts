export interface Hotel {
  id: number;
  name: string;
  description: string;
  country: string;
  location: string;
  pricePerNight: number;
  rating: number;
  image: string;
  amenities: string[];
  featured: boolean;
  discount?: number;
}

export const mockHotels: Hotel[] = [
  {
    id: 1,
    name: "The Plaza Hotel",
    description: "Iconic luxury hotel in the heart of Manhattan with timeless elegance and world-class service.",
    country: "USA",
    location: "New York",
    pricePerNight: 850,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Concierge"],
    featured: true,
    discount: 15
  },
  {
    id: 2,
    name: "Four Seasons Toronto",
    description: "Sophisticated urban oasis in downtown Toronto with stunning city views and premium amenities.",
    country: "Canada",
    location: "Toronto",
    pricePerNight: 620,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Business Center"],
    featured: true
  },
  {
    id: 3,
    name: "The Ritz London",
    description: "Legendary luxury hotel combining British heritage with modern sophistication in Piccadilly.",
    country: "UK",
    location: "London",
    pricePerNight: 1200,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1551882426-cbcf4f0f5f84?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Spa", "Gym", "Restaurant", "Bar", "Room Service", "Valet"],
    featured: true,
    discount: 10
  },
  {
    id: 4,
    name: "Hotel Arts Barcelona",
    description: "Contemporary beachfront hotel overlooking the Mediterranean with stunning architecture.",
    country: "Spain",
    location: "Barcelona",
    pricePerNight: 480,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Beach Access"],
    featured: false
  },
  {
    id: 5,
    name: "Hotel de Russie Rome",
    description: "Luxurious retreat near the Spanish Steps with beautiful gardens and Roman elegance.",
    country: "Italy",
    location: "Rome",
    pricePerNight: 950,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Spa", "Gym", "Restaurant", "Bar", "Garden", "Concierge"],
    featured: true
  },
  {
    id: 6,
    name: "The Peninsula Beijing",
    description: "Award-winning luxury hotel blending Chinese tradition with contemporary comfort.",
    country: "China",
    location: "Beijing",
    pricePerNight: 580,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Business Center", "Tea House"],
    featured: false
  },
  {
    id: 7,
    name: "Aman Tokyo",
    description: "Serene urban sanctuary in the heart of Tokyo with minimalist Japanese design.",
    country: "Japan",
    location: "Tokyo",
    pricePerNight: 1500,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Spa", "Gym", "Restaurant", "Bar", "Zen Garden", "Onsen"],
    featured: true,
    discount: 20
  },
  {
    id: 8,
    name: "Waldorf Astoria Beverly Hills",
    description: "Ultra-luxury hotel with panoramic views of Los Angeles and Hollywood Hills.",
    country: "USA",
    location: "Los Angeles",
    pricePerNight: 1100,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1551882426-cbcf4f0f5f84?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Rooftop Bar", "Valet"],
    featured: true
  },
  {
    id: 9,
    name: "Fairmont Chateau Lake Louise",
    description: "Iconic Rocky Mountain resort with stunning lake views and world-class skiing.",
    country: "Canada",
    location: "Lake Louise",
    pricePerNight: 450,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Spa", "Gym", "Restaurant", "Ski Access", "Fireplace"],
    featured: false
  },
  {
    id: 10,
    name: "The Savoy London",
    description: "Historic luxury hotel on the River Thames with Edwardian glamour and modern luxury.",
    country: "UK",
    location: "London",
    pricePerNight: 980,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1611892440507-4a797e13e3f0?q=80&w=1000&auto=format&fit=crop",
    amenities: ["WiFi", "Spa", "Gym", "Restaurant", "Bar", "Theatre", "Concierge"],
    featured: true
  }
];

export const countries = ["USA", "Canada", "UK", "Spain", "Italy", "China", "Japan"] as const;
export type Country = typeof countries[number];
