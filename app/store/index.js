import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tripReducer from './slices/tripSlice';
import bookingReducer from './slices/bookingSlice';
import expenseReducer from './slices/expenseSlice';
import groupReducer from './slices/groupSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trip: tripReducer,
    booking: bookingReducer,
    expense: expenseReducer,
    group: groupReducer,
  },
});