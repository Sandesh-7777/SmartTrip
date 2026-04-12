import { supabase } from '../constants/supabase';

// ─── Mock Data ───────────────────────────────────────────

export const mockHotels = [
  {
    id: 1, name: 'The Grand Palace Hotel', location: 'Goa', rating: 4.8,
    price: 3500, type: 'Luxury', amenities: ['WiFi', 'Pool', 'Spa', 'Gym'],
    image: '🏨', reviews: 1240, discount: 15,
  },
  {
    id: 2, name: 'Beachside Resort & Spa', location: 'Goa', rating: 4.6,
    price: 2800, type: 'Resort', amenities: ['WiFi', 'Pool', 'Beach Access'],
    image: '🌴', reviews: 980, discount: 10,
  },
  {
    id: 3, name: 'Mountain View Lodge', location: 'Manali', rating: 4.5,
    price: 2200, type: 'Lodge', amenities: ['WiFi', 'Fireplace', 'Trekking'],
    image: '🏔️', reviews: 654, discount: 0,
  },
  {
    id: 4, name: 'Heritage Haveli Inn', location: 'Jaipur', rating: 4.7,
    price: 3100, type: 'Heritage', amenities: ['WiFi', 'Pool', 'Cultural Tours'],
    image: '🏯', reviews: 870, discount: 20,
  },
  {
    id: 5, name: 'Backwater Premium Stay', location: 'Kerala', rating: 4.9,
    price: 4200, type: 'Luxury', amenities: ['WiFi', 'Houseboat', 'Spa'],
    image: '🌿', reviews: 1100, discount: 5,
  },
  {
    id: 6, name: 'City Center Suites', location: 'Mumbai', rating: 4.4,
    price: 2600, type: 'Business', amenities: ['WiFi', 'Gym', 'Conference Room'],
    image: '🌆', reviews: 760, discount: 12,
  },
];

export const mockBuses = [
  {
    id: 1, operator: 'RedBus Express', from: 'Mumbai', to: 'Goa',
    departure: '10:00 PM', arrival: '07:00 AM', duration: '9h',
    price: 850, type: 'Sleeper AC', seats: 12, rating: 4.5,
  },
  {
    id: 2, operator: 'VRL Travels', from: 'Mumbai', to: 'Goa',
    departure: '08:00 PM', arrival: '05:30 AM', duration: '9.5h',
    price: 650, type: 'Semi-Sleeper', seats: 24, rating: 4.2,
  },
  {
    id: 3, operator: 'Orange Tours', from: 'Delhi', to: 'Manali',
    departure: '06:00 PM', arrival: '08:00 AM', duration: '14h',
    price: 1200, type: 'Volvo AC', seats: 8, rating: 4.7,
  },
  {
    id: 4, operator: 'KSRTC', from: 'Bangalore', to: 'Kerala',
    departure: '09:00 PM', arrival: '06:00 AM', duration: '9h',
    price: 780, type: 'Sleeper AC', seats: 18, rating: 4.3,
  },
  {
    id: 5, operator: 'Paulo Travels', from: 'Pune', to: 'Goa',
    departure: '11:00 PM', arrival: '07:30 AM', duration: '8.5h',
    price: 720, type: 'Volvo AC', seats: 6, rating: 4.6,
  },
];

export const mockTrains = [
  {
    id: 1, name: 'Rajdhani Express', number: '12951',
    from: 'Mumbai Central', to: 'New Delhi',
    departure: '05:00 PM', arrival: '08:35 AM', duration: '15h 35m',
    classes: [
      { type: '3A', price: 1450, seats: 24 },
      { type: '2A', price: 2100, seats: 12 },
      { type: '1A', price: 3800, seats: 4 },
    ],
    rating: 4.7, days: 'Mon, Wed, Fri, Sun',
  },
  {
    id: 2, name: 'Shatabdi Express', number: '12009',
    from: 'Mumbai Central', to: 'Pune',
    departure: '06:25 AM', arrival: '08:50 AM', duration: '2h 25m',
    classes: [
      { type: 'CC', price: 480, seats: 32 },
      { type: 'EC', price: 890, seats: 16 },
    ],
    rating: 4.6, days: 'Daily',
  },
  {
    id: 3, name: 'Duronto Express', number: '12267',
    from: 'Mumbai CST', to: 'Goa',
    departure: '11:05 PM', arrival: '11:45 AM', duration: '12h 40m',
    classes: [
      { type: '3A', price: 1200, seats: 18 },
      { type: '2A', price: 1850, seats: 8 },
    ],
    rating: 4.5, days: 'Tue, Thu, Sat',
  },
  {
    id: 4, name: 'Kerala Express', number: '12625',
    from: 'New Delhi', to: 'Thiruvananthapuram',
    departure: '11:35 AM', arrival: '04:30 PM', duration: '29h',
    classes: [
      { type: 'SL', price: 680, seats: 42 },
      { type: '3A', price: 1580, seats: 20 },
      { type: '2A', price: 2280, seats: 10 },
    ],
    rating: 4.4, days: 'Daily',
  },
];

// ─── Supabase Booking Functions ───────────────────────────

export const createBooking = async (userId, bookingData) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ user_id: userId, ...bookingData }])
    .select();
  if (error) throw error;
  return data[0];
};

export const getUserBookings = async (userId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const cancelBooking = async (bookingId) => {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);
  if (error) throw error;
};