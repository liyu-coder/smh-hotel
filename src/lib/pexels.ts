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
  'Senegal': 'Dakar Senegal',
  'Mauritius': 'Port Louis Mauritius'
};

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg';

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
  // Get optimized query
  const query = countryQueryMap[country] || `${country} landscape`;

  // Fetch from Pexels
  const imageUrl = await fetchFromPexels(query);

  return imageUrl;
}

// Batch fetch multiple country images
export async function getCountryImages(countries: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  // Fetch all images from Pexels
  const fetchPromises = countries.map(async (country) => {
    const query = countryQueryMap[country] || `${country} landscape`;
    const imageUrl = await fetchFromPexels(query);
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
  const images = await getPexelsImage('luxury hotel resort', 6);
  return images;
}

// Get browse destinations images
export async function getBrowseDestinations(): Promise<string[]> {
  const images = await getPexelsImage('travel destinations world', 8);
  return images;
}

// Get experience images
export async function getExperienceImages(count: number = 6): Promise<string[]> {
  const images = await getPexelsImage('travel adventure experience', count);
  return images;
}

// Get profile images for testimonials
export async function getProfileImages(count: number = 10): Promise<string[]> {
  const images = await getPexelsImage('person portrait professional', count);
  return images;
}
