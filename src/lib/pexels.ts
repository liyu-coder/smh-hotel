// Pexels API utility for fetching country images
// Adapted for React + Vite architecture

const CACHE_KEY = 'pexels_country_images';
const CACHE_DURATION = 86400000; // 24 hours in milliseconds

interface CachedImage {
  url: string;
  timestamp: number;
}

// Query optimization mapping for better search results
const countryQueryMap: Record<string, string> = {
  'United Arab Emirates': 'Dubai skyline',
  'UAE': 'Dubai skyline',
  'France': 'Eiffel Tower Paris',
  'Egypt': 'Pyramids of Giza',
  'Japan': 'Tokyo city',
  'Australia': 'Sydney Opera House',
  'United States': 'New York skyline',
  'USA': 'New York skyline',
  'United Kingdom': 'London skyline',
  'UK': 'London skyline',
  'Italy': 'Colosseum Rome',
  'Spain': 'Sagrada Familia Barcelona',
  'Germany': 'Brandenburg Gate Berlin',
  'Greece': 'Santorini Greece',
  'Turkey': 'Istanbul Turkey',
  'China': 'Great Wall of China',
  'India': 'Taj Mahal India',
  'Brazil': 'Christ the Redeemer Rio',
  'Mexico': 'Chichen Itza Mexico',
  'Russia': 'Red Square Moscow',
  'Canada': 'Niagara Falls Canada',
  'South Africa': 'Table Mountain Cape Town',
  'Morocco': 'Marrakech Morocco',
  'Thailand': 'Bangkok Thailand',
  'Vietnam': 'Ha Long Bay Vietnam',
  'Indonesia': 'Bali Indonesia',
  'Malaysia': 'Petronas Towers Kuala Lumpur',
  'Singapore': 'Marina Bay Sands Singapore',
  'Philippines': 'Palawan Philippines',
  'South Korea': 'Seoul South Korea',
  'Qatar': 'Doha Qatar',
  'Saudi Arabia': 'Mecca Saudi Arabia',
  'Kuwait': 'Kuwait City Kuwait',
  'Bahrain': 'Manama Bahrain',
  'Oman': 'Muscat Oman',
  'Azerbaijan': 'Flame Towers Baku',
  'Uzbekistan': 'Registan Square Samarkand',
  'Kazakhstan': 'Astana Kazakhstan',
  'Poland': 'Warsaw Poland',
  'Czech Republic': 'Prague Czech Republic',
  'Hungary': 'Budapest Hungary',
  'Austria': 'Vienna Austria',
  'Switzerland': 'Swiss Alps Switzerland',
  'Netherlands': 'Amsterdam Netherlands',
  'Belgium': 'Brussels Belgium',
  'Sweden': 'Stockholm Sweden',
  'Norway': 'Oslo Norway',
  'Denmark': 'Copenhagen Denmark',
  'Finland': 'Helsinki Finland',
  'Ireland': 'Dublin Ireland',
  'Portugal': 'Lisbon Portugal',
  'Argentina': 'Buenos Aires Argentina',
  'Chile': 'Santiago Chile',
  'Peru': 'Machu Picchu Peru',
  'Colombia': 'Cartagena Colombia',
  'Venezuela': 'Caracas Venezuela',
  'Somalia': 'Mogadishu Somalia',
  'Kenya': 'Nairobi Kenya',
  'Tanzania': 'Mount Kilimanjaro Tanzania',
  'Ethiopia': 'Lalibela Ethiopia',
  'Yemen': 'Sanaa Yemen',
  'Jordan': 'Petra Jordan',
  'Lebanon': 'Beirut Lebanon',
  'Israel': 'Jerusalem Israel',
  'New Zealand': 'Auckland New Zealand',
  'Fiji': 'Fiji Islands',
  'Maldives': 'Maldives Islands',
  'Sri Lanka': 'Colombo Sri Lanka',
  'Nepal': 'Mount Everest Nepal',
  'Bangladesh': 'Dhaka Bangladesh',
  'Pakistan': 'Lahore Pakistan',
  'Afghanistan': 'Kabul Afghanistan',
  'Iran': 'Tehran Iran',
  'Iraq': 'Baghdad Iraq',
  'Syria': 'Damascus Syria',
  'Libya': 'Tripoli Libya',
  'Algeria': 'Algiers Algeria',
  'Tunisia': 'Tunis Tunisia',
  'Ghana': 'Accra Ghana',
  'Nigeria': 'Lagos Nigeria',
  'Senegal': 'Dakar Senegal'
};

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg';

// Get cached images from localStorage
function getCachedImages(): Record<string, CachedImage> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Filter out expired cache entries
      const now = Date.now();
      const filtered: Record<string, CachedImage> = {};
      Object.keys(parsed).forEach(key => {
        if (now - parsed[key].timestamp < CACHE_DURATION) {
          filtered[key] = parsed[key];
        }
      });
      return filtered;
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return {};
}

// Save cached images to localStorage
function setCachedImage(country: string, url: string): void {
  try {
    const cached = getCachedImages();
    cached[country] = {
      url,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

// Fetch country image from Pexels API
async function fetchFromPexels(query: string): Promise<string> {
  const apiKey = (import.meta.env as any).VITE_PEXELS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_PEXELS_API_KEY_HERE') {
    console.warn('⚠️ Pexels API key not configured, using fallback image');
    return FALLBACK_IMAGE;
  }

  try {
    console.log('📡 Fetching from Pexels API for query:', query);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    );

    if (!response.ok) {
      console.error('❌ Pexels API error:', response.status, response.statusText);
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      console.log('✅ Pexels image fetched successfully:', data.photos[0].src.large);
      return data.photos[0].src.large;
    }

    console.warn('⚠️ No photos returned from Pexels, using fallback');
    return FALLBACK_IMAGE;
  } catch (error) {
    console.error('❌ Error fetching from Pexels:', error);
    return FALLBACK_IMAGE;
  }
}

// Main function to get country image
export async function getCountryImage(country: string): Promise<string> {
  // Check cache first
  const cached = getCachedImages();
  if (cached[country]) {
    return cached[country].url;
  }

  // Get optimized query
  const query = countryQueryMap[country] || `${country} landscape`;
  
  // Fetch from Pexels
  const imageUrl = await fetchFromPexels(query);
  
  // Cache the result
  setCachedImage(country, imageUrl);
  
  return imageUrl;
}

// Batch fetch multiple country images
export async function getCountryImages(countries: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const cached = getCachedImages();
  
  // Use cached images where available
  const toFetch: string[] = [];
  
  countries.forEach(country => {
    if (cached[country]) {
      results[country] = cached[country].url;
    } else {
      toFetch.push(country);
    }
  });
  
  // Fetch remaining images
  const fetchPromises = toFetch.map(async (country) => {
    const query = countryQueryMap[country] || `${country} landscape`;
    const imageUrl = await fetchFromPexels(query);
    setCachedImage(country, imageUrl);
    results[country] = imageUrl;
  });
  
  await Promise.all(fetchPromises);
  
  return results;
}

// Clear cache (useful for testing)
export function clearImageCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Core function to get Pexels images with dynamic per_page
export async function getPexelsImage(query: string, perPage: number = 1): Promise<string[]> {
  const apiKey = (import.meta.env as any).VITE_PEXELS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_PEXELS_API_KEY_HERE') {
    console.warn('Pexels API key not configured, using fallback image');
    return [FALLBACK_IMAGE];
  }

  try {
    console.log(`Fetching from Pexels: query="${query}", per_page=${perPage}`);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    );

    console.log(`Pexels API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pexels API error ${response.status}:`, errorText);
      throw new Error(`Pexels API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Pexels API returned ${data.photos?.length || 0} photos for query: ${query}`);

    if (data.photos && data.photos.length > 0) {
      return data.photos.map((photo: any) => photo.src.large);
    }

    console.warn(`No photos found for query: ${query}, using fallback`);
    return [FALLBACK_IMAGE];
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return [FALLBACK_IMAGE];
  }
}

// Get featured properties images
export async function getFeaturedProperties(): Promise<string[]> {
  const CACHE_KEY_FEATURED = 'pexels_featured_properties';
  const cached = localStorage.getItem(CACHE_KEY_FEATURED);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (error) {
      console.error('Error reading featured properties cache:', error);
    }
  }

  const images = await getPexelsImage('luxury hotel resort', 6);

  try {
    localStorage.setItem(CACHE_KEY_FEATURED, JSON.stringify({
      data: images,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching featured properties:', error);
  }

  return images;
}

// Get browse destinations images
export async function getBrowseDestinations(): Promise<string[]> {
  const CACHE_KEY_DESTINATIONS = 'pexels_browse_destinations';
  const cached = localStorage.getItem(CACHE_KEY_DESTINATIONS);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (error) {
      console.error('Error reading destinations cache:', error);
    }
  }

  const images = await getPexelsImage('travel destinations world', 8);

  try {
    localStorage.setItem(CACHE_KEY_DESTINATIONS, JSON.stringify({
      data: images,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching destinations:', error);
  }

  return images;
}

// Get experience images
export async function getExperienceImages(count: number = 6): Promise<string[]> {
  const CACHE_KEY_EXPERIENCES = 'pexels_experiences';
  const cached = localStorage.getItem(CACHE_KEY_EXPERIENCES);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (error) {
      console.error('Error reading experiences cache:', error);
    }
  }

  const images = await getPexelsImage('travel adventure experience', count);

  try {
    localStorage.setItem(CACHE_KEY_EXPERIENCES, JSON.stringify({
      data: images,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching experiences:', error);
  }

  return images;
}

// Get profile images for testimonials
export async function getProfileImages(count: number = 10): Promise<string[]> {
  const CACHE_KEY_PROFILES = 'pexels_profiles';
  const cached = localStorage.getItem(CACHE_KEY_PROFILES);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (error) {
      console.error('Error reading profiles cache:', error);
    }
  }

  const images = await getPexelsImage('person portrait professional', count);

  try {
    localStorage.setItem(CACHE_KEY_PROFILES, JSON.stringify({
      data: images,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching profiles:', error);
  }

  return images;
}
