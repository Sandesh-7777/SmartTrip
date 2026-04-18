import { supabase } from '../constants/supabase';

// ─── Core Split Algorithm ─────────────────────────────────

export const calculateSplits = (expenses, members) => {
  // Build balance map: userId → net balance
  const balances = {};
  members.forEach((m) => { balances[m.user_id] = 0; });

  expenses.forEach((expense) => {
    const amount = Number(expense.amount);
    const splitAmong = expense.split_among || [];
    const perPerson = splitAmong.length > 0 ? amount / splitAmong.length : amount;

    // Person who paid gets credited
    if (balances[expense.paid_by] !== undefined) {
      balances[expense.paid_by] += amount;
    }

    // Each person in split gets debited
    splitAmong.forEach((userId) => {
      if (balances[userId] !== undefined) {
        balances[userId] -= perPerson;
      }
    });
  });

  // Convert balances to transactions (who pays whom)
  const transactions = [];
  const creditors = []; // people owed money (positive balance)
  const debtors = [];   // people who owe money (negative balance)

  Object.entries(balances).forEach(([userId, balance]) => {
    const member = members.find((m) => m.user_id === userId);
    if (balance > 0.01) {
      creditors.push({ userId, name: member?.user_name || 'Unknown', amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ userId, name: member?.user_name || 'Unknown', amount: -balance });
    }
  });

  // Match debtors with creditors
  let i = 0, j = 0;
  const tempCreditors = creditors.map((c) => ({ ...c }));
  const tempDebtors = debtors.map((d) => ({ ...d }));

  while (i < tempDebtors.length && j < tempCreditors.length) {
    const debtor = tempDebtors[i];
    const creditor = tempCreditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      transactions.push({
        fromId: debtor.userId,
        fromName: debtor.name,
        toId: creditor.userId,
        toName: creditor.name,
        amount: Math.round(amount),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return { transactions, balances };
};

// Save settlements to Supabase
export const saveSettlements = async (groupId, transactions) => {
  if (transactions.length === 0) return;
  const rows = transactions.map((t) => ({
    group_id: groupId,
    paid_by: t.fromId,
    paid_by_name: t.fromName,
    paid_to: t.toId,
    paid_to_name: t.toName,
    amount: t.amount,
    status: 'pending',
  }));
  const { error } = await supabase.from('settlements').insert(rows);
  if (error) throw error;
};

// Get settlements for a group
export const getGroupSettlements = async (groupId) => {
  const { data, error } = await supabase
    .from('settlements')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Mark settlement as paid
export const markSettled = async (settlementId) => {
  const { error } = await supabase
    .from('settlements')
    .update({ status: 'settled', settled_at: new Date().toISOString() })
    .eq('id', settlementId);
  if (error) throw error;
};

// Delete all settlements for a group (to recalculate)
export const clearSettlements = async (groupId) => {
  const { error } = await supabase
    .from('settlements')
    .delete()
    .eq('group_id', groupId)
    .eq('status', 'pending');
  if (error) throw error;
};