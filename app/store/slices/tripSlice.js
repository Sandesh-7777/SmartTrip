import { createSlice } from '@reduxjs/toolkit';

const tripSlice = createSlice({
  name: 'trip',
  initialState: { trips: [], activeTrip: null },
  reducers: {
    setTrips: (state, action) => { state.trips = action.payload; },
    setActiveTrip: (state, action) => { state.activeTrip = action.payload; },
  },
});

export const { setTrips, setActiveTrip } = tripSlice.actions;
export default tripSlice.reducer;