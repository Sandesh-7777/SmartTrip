import { supabase } from '../constants/supabase';

export const CATEGORIES = [
  { id: 1, label: 'Food', icon: '🍔', color: '#F59E0B' },
  { id: 2, label: 'Transport', icon: '🚗', color: '#3B82F6' },
  { id: 3, label: 'Stay', icon: '🏨', color: '#8B5CF6' },
  { id: 4, label: 'Activities', icon: '🎯', color: '#10B981' },
  { id: 5, label: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { id: 6, label: 'Medical', icon: '💊', color: '#EF4444' },
  { id: 7, label: 'Fuel', icon: '⛽', color: '#F97316' },
  { id: 8, label: 'Others', icon: '📦', color: '#6B7280' },
];

// Add a personal expense
export const addExpense = async (userId, expenseData) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{ user_id: userId, ...expenseData }])
    .select();
  if (error) throw error;
  return data[0];
};

// Get personal expenses
export const getUserExpenses = async (userId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_group_expense', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Get group expenses
export const getGroupExpenses = async (groupId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId)
    .eq('is_group_expense', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Delete expense
export const deleteExpense = async (expenseId) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);
  if (error) throw error;
};

// Get expense summary by category
export const getExpenseSummary = (expenses) => {
  const summary = {};
  let total = 0;
  expenses.forEach((exp) => {
    if (!summary[exp.category]) summary[exp.category] = 0;
    summary[exp.category] += Number(exp.amount);
    total += Number(exp.amount);
  });
  return { summary, total };
};