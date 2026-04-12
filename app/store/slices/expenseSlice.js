import { createSlice } from '@reduxjs/toolkit';

const expenseSlice = createSlice({
  name: 'expense',
  initialState: { expenses: [], total: 0 },
  reducers: {
    setExpenses: (state, action) => { state.expenses = action.payload; },
    addExpense: (state, action) => { state.expenses.push(action.payload); },
  },
});

export const { setExpenses, addExpense } = expenseSlice.actions;
export default expenseSlice.reducer;