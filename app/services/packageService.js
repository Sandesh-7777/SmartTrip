import { supabase } from '../constants/supabase';

// ─── Mock Packages (AI will replace this later) ──────────

export const mockPackages = [
  {
    id: 1,
    name: 'Goa Beach Paradise',
    destination: 'Goa',
    duration: '4D/3N',
    price: 8999,
    originalPrice: 12000,
    rating: 4.8,
    reviews: 1240,
    category: 'Beach',
    provider: 'MakeMyTrip',
    providerLogo: '🏢',
    emoji: '🏖️',
    highlights: ['Hotel Stay', 'Beach Activities', 'Water Sports', 'Sightseeing'],
    includes: ['Accommodation', 'Breakfast', 'Airport Transfer', 'Tour Guide'],
    excludes: ['Flights', 'Lunch & Dinner', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Arrival & Beach', activities: ['Airport pickup', 'Hotel check-in', 'Calangute Beach visit', 'Welcome dinner'] },
      { day: 2, title: 'North Goa Tour', activities: ['Fort Aguada', 'Anjuna Beach', 'Flea Market', 'Sunset cruise'] },
      { day: 3, title: 'Water Sports Day', activities: ['Parasailing', 'Jet skiing', 'Banana boat ride', 'Dolphin spotting'] },
      { day: 4, title: 'Departure', activities: ['Hotel checkout', 'Souvenir shopping', 'Airport drop'] },
    ],
    trending: true,
    tag: '🔥 Best Seller',
  },
  {
    id: 2,
    name: 'Manali Snow Adventure',
    destination: 'Manali',
    duration: '5D/4N',
    price: 11999,
    originalPrice: 16000,
    rating: 4.9,
    reviews: 980,
    category: 'Mountain',
    provider: 'Yatra',
    providerLogo: '🏢',
    emoji: '🏔️',
    highlights: ['Snow Activities', 'Rohtang Pass', 'River Rafting', 'Camping'],
    includes: ['Accommodation', 'All Meals', 'Cab Service', 'Adventure Activities'],
    excludes: ['Flights', 'Personal Expenses', 'Tips'],
    itinerary: [
      { day: 1, title: 'Arrival Manali', activities: ['Airport pickup', 'Hotel check-in', 'Mall Road stroll', 'Local dinner'] },
      { day: 2, title: 'Rohtang Pass', activities: ['Rohtang Pass visit', 'Snow activities', 'Photography', 'Bonfire evening'] },
      { day: 3, title: 'Adventure Day', activities: ['River rafting', 'Zorbing', 'Paragliding', 'Camp night'] },
      { day: 4, title: 'Solang Valley', activities: ['Skiing', 'Cable car ride', 'Local market', 'Cultural show'] },
      { day: 5, title: 'Departure', activities: ['Checkout', 'Hadimba Temple', 'Airport drop'] },
    ],
    trending: true,
    tag: '❄️ Winter Special',
  },
  {
    id: 3,
    name: 'Kerala Backwater Bliss',
    destination: 'Kerala',
    duration: '6D/5N',
    price: 14999,
    originalPrice: 19000,
    rating: 4.7,
    reviews: 760,
    category: 'Nature',
    provider: 'Thomas Cook',
    providerLogo: '🏢',
    emoji: '🌴',
    highlights: ['Houseboat Stay', 'Ayurveda Spa', 'Tea Gardens', 'Wildlife Safari'],
    includes: ['Houseboat', 'All Meals', 'AC Transport', 'Guided Tours'],
    excludes: ['Flights', 'Personal Shopping', 'Tips'],
    itinerary: [
      { day: 1, title: 'Arrival Kochi', activities: ['Airport pickup', 'Fort Kochi visit', 'Chinese fishing nets', 'Kathakali show'] },
      { day: 2, title: 'Munnar Tea Hills', activities: ['Tea garden tour', 'Eravikulam National Park', 'Mattupetty Dam', 'Sunset point'] },
      { day: 3, title: 'Thekkady Wildlife', activities: ['Periyar Tiger Reserve', 'Boat safari', 'Spice plantation', 'Cultural show'] },
      { day: 4, title: 'Alleppey Houseboat', activities: ['Houseboat boarding', 'Backwater cruise', 'Village visit', 'Overnight on boat'] },
      { day: 5, title: 'Kovalam Beach', activities: ['Lighthouse Beach', 'Ayurveda massage', 'Seafood dinner', 'Sunset walk'] },
      { day: 6, title: 'Departure', activities: ['Checkout', 'Local shopping', 'Airport drop'] },
    ],
    trending: false,
    tag: '🌿 Nature Escape',
  },
  {
    id: 4,
    name: 'Rajasthan Royal Tour',
    destination: 'Rajasthan',
    duration: '7D/6N',
    price: 18999,
    originalPrice: 25000,
    rating: 4.8,
    reviews: 1100,
    category: 'Heritage',
    provider: 'Cox & Kings',
    providerLogo: '🏢',
    emoji: '🏯',
    highlights: ['Palace Hotels', 'Camel Safari', 'Desert Camp', 'Fort Tours'],
    includes: ['Heritage Hotels', 'Breakfast & Dinner', 'AC Transport', 'Guide'],
    excludes: ['Flights', 'Lunch', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Arrival Jaipur', activities: ['Airport pickup', 'City Palace', 'Hawa Mahal', 'Pink City walk'] },
      { day: 2, title: 'Jaipur Forts', activities: ['Amber Fort', 'Nahargarh Fort', 'Jal Mahal', 'Bazaar shopping'] },
      { day: 3, title: 'Pushkar', activities: ['Brahma Temple', 'Pushkar Lake', 'Camel ride', 'Local fair'] },
      { day: 4, title: 'Jodhpur', activities: ['Mehrangarh Fort', 'Jaswant Thada', 'Blue City walk', 'Folk music night'] },
      { day: 5, title: 'Jaisalmer', activities: ['Golden Fort', 'Patwon Ki Haveli', 'Sand dunes', 'Desert camp'] },
      { day: 6, title: 'Udaipur', activities: ['City Palace', 'Lake Pichola', 'Boat ride', 'Sunset dinner'] },
      { day: 7, title: 'Departure', activities: ['Checkout', 'Saheliyon Ki Bari', 'Airport drop'] },
    ],
    trending: true,
    tag: '👑 Royal Experience',
  },
  {
    id: 5,
    name: 'Andaman Island Escape',
    destination: 'Andaman',
    duration: '5D/4N',
    price: 19999,
    originalPrice: 26000,
    rating: 4.9,
    reviews: 650,
    category: 'Beach',
    provider: 'EaseMyTrip',
    providerLogo: '🏢',
    emoji: '🏝️',
    highlights: ['Scuba Diving', 'Radhanagar Beach', 'Cellular Jail', 'Glass Bottom Boat'],
    includes: ['Resort Stay', 'All Meals', 'Ferry Tickets', 'Diving Gear'],
    excludes: ['Flights to Port Blair', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Arrival Port Blair', activities: ['Airport pickup', 'Cellular Jail', 'Light & Sound show', 'Hotel check-in'] },
      { day: 2, title: 'Havelock Island', activities: ['Ferry to Havelock', 'Radhanagar Beach', 'Snorkeling', 'Beach bonfire'] },
      { day: 3, title: 'Scuba & Coral', activities: ['Scuba diving', 'Elephant Beach', 'Glass bottom boat', 'Coral reef tour'] },
      { day: 4, title: 'Neil Island', activities: ['Ferry to Neil Island', 'Natural Bridge', 'Bharatpur Beach', 'Sunset point'] },
      { day: 5, title: 'Departure', activities: ['Ferry to Port Blair', 'Local shopping', 'Airport drop'] },
    ],
    trending: true,
    tag: '🌊 Island Special',
  },
  {
    id: 6,
    name: 'Ladakh Bike Expedition',
    destination: 'Ladakh',
    duration: '8D/7N',
    price: 22999,
    originalPrice: 30000,
    rating: 4.9,
    reviews: 430,
    category: 'Adventure',
    provider: 'Adventure Nation',
    providerLogo: '🏢',
    emoji: '🏍️',
    highlights: ['Bike Ride', 'Pangong Lake', 'Khardung La Pass', 'Monastery Tour'],
    includes: ['Royal Enfield Bike', 'Camping Gear', 'All Meals', 'Mechanic Support'],
    excludes: ['Flights to Leh', 'Personal Expenses', 'Medical Costs'],
    itinerary: [
      { day: 1, title: 'Arrival Leh', activities: ['Acclimatization', 'Leh Palace', 'Shanti Stupa', 'Rest day'] },
      { day: 2, title: 'Leh Local', activities: ['Diskit Monastery', 'Nubra Valley', 'Camel safari', 'Camp night'] },
      { day: 3, title: 'Khardung La', activities: ['Khardung La pass 18380ft', 'Photo stops', 'North Pullu', 'Village stay'] },
      { day: 4, title: 'Pangong Lake', activities: ['Pangong Tso Lake', 'Photography', 'Camping by lake', 'Stargazing'] },
      { day: 5, title: 'Chang La Pass', activities: ['Chang La Pass', 'Hemis Monastery', 'Thiksey Monastery', 'Leh return'] },
      { day: 6, title: 'Zanskar Valley', activities: ['Zanskar river', 'Rangdum Monastery', 'Camping', 'Bonfire'] },
      { day: 7, title: 'River Rafting', activities: ['Zanskar rafting', 'Leh market', 'Farewell dinner', 'Hotel stay'] },
      { day: 8, title: 'Departure', activities: ['Checkout', 'Hall of Fame Museum', 'Airport drop'] },
    ],
    trending: false,
    tag: '🏍️ Bike Special',
  },
];

export const CATEGORIES = ['All', 'Beach', 'Mountain', 'Nature', 'Heritage', 'Adventure'];

// ─── Supabase Booking ─────────────────────────────────────

export const bookPackage = async (userId, packageData) => {
  const { data, error } = await supabase
    .from('package_bookings')
    .insert([{ user_id: userId, ...packageData }])
    .select();
  if (error) throw error;
  return data[0];
};

export const getUserPackageBookings = async (userId) => {
  const { data, error } = await supabase
    .from('package_bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};