import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, ActivityIndicator,
  Alert, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import {
  addExpense, getUserExpenses,
  deleteExpense, getExpenseSummary, CATEGORIES
} from '../../services/expenseService';
import { categorizeExpense } from '../../services/aiService';

const formatDate = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export default function ExpenseScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [date, setDate] = useState(formatDate(new Date()));
  const [notes, setNotes] = useState('');

  const user = auth.currentUser;

  const loadExpenses = async () => {
    try {
      const data = await getUserExpenses(user.uid);
      setExpenses(data);
    } catch (err) {
      console.log('Error loading expenses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadExpenses(); }, []));

  const handleAdd = async () => {
    if (!title || !amount) {
      Alert.alert('Missing Info', 'Please fill in title and amount.');
      return;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    // Auto-categorize if no category selected
    let finalCategory = category;
    if (!finalCategory) {
      try {
        const aiCategory = await categorizeExpense(title, amount);
        const validCat = CATEGORIES.find((c) => c.label === aiCategory);
        finalCategory = validCat ? aiCategory : 'Other';
      } catch {
        finalCategory = 'Other';
      }
    }

    setSaving(true);
    try {
      await addExpense({
        user_id: user.uid,
        title,
        amount: Number(amount),
        category: finalCategory,
        paid_by: user.uid,
        paid_by_name: user.displayName || 'You',
        date,
        notes,
        is_personal: true,
        split_among: [],
      });
      resetForm();
      setAddModal(false);
      loadExpenses();
    } catch (err) {
      console.log('Add expense error:', err);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setAmount('');
    setCategory(null); setNotes('');
    setDate(formatDate(new Date()));
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteExpense(id);
          setExpenses((prev) => prev.filter((e) => e.id !== id));
        },
      },
    ]);
  };

  const filtered = activeFilter === 'All'
    ? expenses
    : expenses.filter((e) => e.category === activeFilter);

  const { summary, total } = getExpenseSummary(expenses);

  const getCategoryInfo = (label) =>
    CATEGORIES.find((c) => c.label === label) || CATEGORIES[7];

  const renderExpense = ({ item }) => {
    const cat = getCategoryInfo(item.category);
    return (
      <TouchableOpacity
        style={styles.expenseCard}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.9}
      >
        <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
          <Text style={styles.categoryEmoji}>{cat.icon}</Text>
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <View style={styles.expenseMeta}>
            <Text style={styles.expenseDate}>{item.date}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: cat.color + '20' }]}>
              <Text style={[styles.categoryBadgeText, { color: cat.color }]}>
                {item.category}
              </Text>
            </View>
          </View>
          {item.notes ? (
            <Text style={styles.expenseNotes} numberOfLines={1}>{item.notes}</Text>
          ) : null}
        </View>
        <Text style={[styles.expenseAmount, { color: cat.color }]}>
          ₹{Number(item.amount).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#065F46', '#10B981']} style={styles.header}>
        <Text style={styles.headerTitle}>My Expenses</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <LinearGradient colors={['#065F46', '#10B981']} style={styles.summaryGradient}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={styles.summaryTotal}>₹{total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.addExpenseBtn}
              onPress={() => setAddModal(true)}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addExpenseBtnText}>Add Expense</Text>
            </TouchableOpacity>
          </View>

          {/* Category Breakdown */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryBreakdown}>
            {Object.entries(summary).map(([cat, amt], i) => {
              const catInfo = getCategoryInfo(cat);
              return (
                <View key={i} style={styles.summaryItem}>
                  <Text style={styles.summaryItemIcon}>{catInfo.icon}</Text>
                  <Text style={styles.summaryItemAmount}>₹{Number(amt).toLocaleString()}</Text>
                  <Text style={styles.summaryItemLabel}>{cat}</Text>
                </View>
              );
            })}
          </ScrollView>
        </LinearGradient>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {['All', ...CATEGORIES.map((c) => c.label)].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f === 'All' ? '📋 All' : `${getCategoryInfo(f).icon} ${f}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Expenses List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>💸</Text>
          <Text style={styles.emptyTitle}>No Expenses Yet</Text>
          <Text style={styles.emptySub}>Start tracking your travel expenses!</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setAddModal(true)}>
            <LinearGradient colors={['#065F46', '#10B981']} style={styles.emptyBtnGradient}>
              <Text style={styles.emptyBtnText}>+ Add Expense</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadExpenses(); }}
            />
          }
          ListFooterComponent={
            <Text style={styles.longPressHint}>
              Long press on an expense to delete
            </Text>
          }
        />
      )}

      {/* Add Expense Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity onPress={() => { setAddModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title */}
              <Text style={styles.modalLabel}>Title *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="receipt-outline" size={16} color={COLORS.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Lunch at beach shack"
                  placeholderTextColor={COLORS.gray}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Amount */}
              <Text style={styles.modalLabel}>Amount (₹) *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="cash-outline" size={16} color={COLORS.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 850"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* Category */}
              <Text style={styles.modalLabel}>Category{' '} <Text style={{ color: COLORS.gray, fontWeight: '400' }}> (optional — AI will auto-detect) </Text> </Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      category === cat.label && {
                        backgroundColor: cat.color + '20',
                        borderColor: cat.color,
                      }
                    ]}
                    onPress={() => setCategory(cat.label)}
                  >
                    <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                    <Text style={[
                      styles.categoryChipText,
                      category === cat.label && { color: cat.color, fontWeight: '700' }
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date */}
              <Text style={styles.modalLabel}>Date</Text>
              <TouchableOpacity
                style={styles.dateBox}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={styles.dateText}>{date}</Text>
              </TouchableOpacity>

              {/* Notes */}
              <Text style={styles.modalLabel}>Notes (optional)</Text>
              <View style={[styles.inputBox, { alignItems: 'flex-start', paddingVertical: 4 }]}>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]}
                  placeholder="Any additional details..."
                  placeholderTextColor={COLORS.gray}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              <TouchableOpacity
                style={[styles.confirmBtn, adding && { opacity: 0.7 }]}
                onPress={handleAdd}
                disabled={adding}
              >
                <LinearGradient colors={['#065F46', '#10B981']} style={styles.confirmBtnGradient}>
                  {adding
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Ionicons name="add-circle-outline" size={18} color="#fff" />
                        <Text style={styles.confirmBtnText}>Add Expense</Text>
                      </>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(d) => { setDate(formatDate(d)); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
        display="inline"
        themeVariant="light"
        accentColor="#10B981"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 20, overflow: 'hidden' },
  summaryGradient: { padding: 20 },
  summaryTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  summaryLabel: { color: '#A7F3D0', fontSize: 13, marginBottom: 4 },
  summaryTotal: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  addExpenseBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, gap: 6,
  },
  addExpenseBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  summaryBreakdown: { marginTop: 4 },
  summaryItem: { alignItems: 'center', marginRight: 20 },
  summaryItemIcon: { fontSize: 22, marginBottom: 4 },
  summaryItemAmount: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  summaryItemLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
  filterScroll: { maxHeight: 50, marginTop: 14 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.lightGray,
  },
  filterChipActive: { backgroundColor: '#065F46', borderColor: '#065F46' },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.gray },
  filterTextActive: { color: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginBottom: 28 },
  emptyBtn: { width: '70%', borderRadius: 14, overflow: 'hidden' },
  emptyBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  list: { padding: 20, paddingBottom: 100 },
  expenseCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  categoryIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryEmoji: { fontSize: 22 },
  expenseInfo: { flex: 1 },
  expenseTitle: { fontSize: 14, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
  expenseMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expenseDate: { fontSize: 11, color: COLORS.gray },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { fontSize: 10, fontWeight: '600' },
  expenseNotes: { fontSize: 11, color: COLORS.gray, marginTop: 4 },
  expenseAmount: { fontSize: 16, fontWeight: 'bold' },
  longPressHint: {
    textAlign: 'center', color: COLORS.gray,
    fontSize: 12, marginTop: 8, marginBottom: 20,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.black, marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 16, gap: 10,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 14, color: COLORS.black },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, gap: 6,
  },
  categoryChipIcon: { fontSize: 16 },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: COLORS.gray },
  dateBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5,
    borderColor: COLORS.primary + '60', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    marginBottom: 16, gap: 10,
  },
  dateText: { fontSize: 14, color: COLORS.black, fontWeight: '600' },
  confirmBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4, marginBottom: 20 },
  confirmBtnGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 15, gap: 8,
  },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});