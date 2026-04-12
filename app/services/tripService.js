import { supabase } from '../constants/supabase';

// Create a new trip
export const createTrip = async (userId, tripData) => {
  const { data, error } = await supabase
    .from('trips')
    .insert([{ user_id: userId, ...tripData }])
    .select();
  if (error) throw error;
  return data[0];
};

// Get all trips for a user
export const getUserTrips = async (userId) => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Update a trip
export const updateTrip = async (tripId, updatedData) => {
  const { error } = await supabase
    .from('trips')
    .update(updatedData)
    .eq('id', tripId);
  if (error) throw error;
};

// Delete a trip
export const deleteTrip = async (tripId) => {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);
  if (error) throw error;
};