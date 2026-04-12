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
  addExpense, getGroupExpenses,
  deleteExpense, getExpenseSummary, CATEGORIES
} from '../../services/expenseService';
import { getGroupMembers } from '../../services/groupService';

const formatDate = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export default function GroupExpensesScreen({ navigation, route }) {
  const { group } = route.params;
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [paidBy, setPaidBy] = useState(null);
  const [date, setDate] = useState(formatDate(new Date()));
  const [notes, setNotes] = useState('');
  const [splitType, setSplitType] = useState('equal');

  const user = auth.currentUser;

  const loadData = async () => {
    try {
      const [expData, memberData] = await Promise.all([
        getGroupExpenses(group.id),
        getGroupMembers(group.id),
      ]);
      setExpenses(expData);
      setMembers(memberData);
      if (!paidBy && memberData.length > 0) {
        const me = memberData.find((m) => m.user_id === user.uid);
        if (me) setPaidBy(me);
      }
    } catch (err) {
      console.log('Error loading group expenses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleAdd = async () => {
    if (!title || !amount || !category || !paidBy) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }
    setAdding(true);
    try {
      await addExpense(user.uid, {
        title,
        amount: Number(amount),
        category,
        paid_by: paidBy.user_id,
        paid_by_name: paidBy.user_name,
        date,
        notes,
        group_id: group.id,
        is_group_expense: true,
        split_type: splitType,
        split_among: members.map((m) => ({
          userId: m.user_id,
          name: m.user_name,
          share: Number(amount) / members.length,
        })),
      });
      setAddModal(false);
      resetForm();
      loadData();
    } catch (err) {
      console.log('Add group expense error:', err);
      Alert.alert('Error', 'Failed to add expense.');
    } finally {
      setAdding(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setAmount('');
    setCategory(null); setNotes('');
    setDate(formatDate(new Date()));
    setSplitType('equal');
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

  const { summary, total } = getExpenseSummary(expenses);

  const getCategoryInfo = (label) =>
    CATEGORIES.find((c) => c.label === label) || CATEGORIES[7];

  const perPersonShare = members.length > 0 ? total / members.length : 0;

  const renderExpense = ({ item }) => {
    const cat = getCategoryInfo(item.category);
    return (
      <TouchableOpacity
        style={styles.expenseCard}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.9}
      >
        <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
          <Text style={styles.catEmoji}>{cat.icon}</Text>
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <View style={styles.expenseMeta}>
            <Text style={styles.paidByText}>Paid by {item.paid_by_name}</Text>
            <View style={[styles.catBadge, { backgroundColor: cat.color + '20' }]}>
              <Text style={[styles.catBadgeText, { color: cat.color }]}>{item.category}</Text>
            </View>
          </View>
          <Text style={styles.expenseDate}>{item.date}</Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={[styles.expenseAmount, { color: cat.color }]}>
            ₹{Number(item.amount).toLocaleString()}
          </Text>
          <Text style={styles.perPersonText}>
            ₹{(Number(item.amount) / members.length).toFixed(0)}/person
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#065F46', '#10B981']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Group Expenses</Text>
          <Text style={styles.headerSub}>{group.name}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Summary */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Total Spent', value: `₹${total.toLocaleString()}`, color: '#10B981' },
          { label: 'Per Person', value: `₹${perPersonShare.toFixed(0)}`, color: '#3B82F6' },
          { label: 'Expenses', value: expenses.length.toString(), color: '#8B5CF6' },
          { label: 'Members', value: members.length.toString(), color: '#F59E0B' },
        ].map((item, i) => (
          <View key={i} style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Settle Up Button */}
      <TouchableOpacity
        style={styles.settleBtn}
        onPress={() => navigation.navigate('SplitBill', { group, members, expenses })}
      >
        <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.settleBtnGradient}>
          <Ionicons name="swap-horizontal-outline" size={18} color="#fff" />
          <Text style={styles.settleBtnText}>Settle Up / Split Bill</Text>
        </LinearGradient>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : expenses.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>💸</Text>
          <Text style={styles.emptyTitle}>No Group Expenses</Text>
          <Text style={styles.emptySub}>Add expenses to split with your group</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setAddModal(true)}>
            <LinearGradient colors={['#065F46', '#10B981']} style={styles.emptyBtnGradient}>
              <Text style={styles.emptyBtnText}>+ Add Expense</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadData(); }}
            />
          }
          ListFooterComponent={
            <Text style={styles.hint}>Long press to delete an expense</Text>
          }
        />
      )}

      {/* Add Expense Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Group Expense</Text>
              <TouchableOpacity onPress={() => { setAddModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Title *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="receipt-outline" size={16} color={COLORS.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Hotel dinner"
                  placeholderTextColor={COLORS.gray}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <Text style={styles.modalLabel}>Amount (₹) *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="cash-outline" size={16} color={COLORS.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2400"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <Text style={styles.modalLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      category === cat.label && { backgroundColor: cat.color + '20', borderColor: cat.color }
                    ]}
                    onPress={() => setCategory(cat.label)}
                  >
                    <Text>{cat.icon}</Text>
                    <Text style={[
                      styles.catChipText,
                      category === cat.label && { color: cat.color, fontWeight: '700' }
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>Paid By *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {members.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.memberChip,
                      paidBy?.user_id === member.user_id && styles.memberChipActive
                    ]}
                    onPress={() => setPaidBy(member)}
                  >
                    <Text style={styles.memberChipInitial}>
                      {member.user_name?.charAt(0).toUpperCase()}
                    </Text>
                    <Text style={[
                      styles.memberChipText,
                      paidBy?.user_id === member.user_id && { color: COLORS.primary }
                    ]}>
                      {member.user_id === user.uid ? 'You' : member.user_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>Split Type</Text>
              <View style={styles.splitRow}>
                {['equal', 'custom'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.splitChip, splitType === type && styles.splitChipActive]}
                    onPress={() => setSplitType(type)}
                  >
                    <Text style={[styles.splitText, splitType === type && styles.splitTextActive]}>
                      {type === 'equal' ? '⚖️ Equal Split' : '✏️ Custom Split'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {amount && members.length > 0 && splitType === 'equal' && (
                <View style={styles.splitPreview}>
                  <Text style={styles.splitPreviewText}>
                    Each person pays:{' '}
                    <Text style={styles.splitPreviewAmount}>
                      ₹{(Number(amount) / members.length).toFixed(2)}
                    </Text>
                  </Text>
                </View>
              )}

              <Text style={styles.modalLabel}>Date</Text>
              <TouchableOpacity
                style={styles.dateBox}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={styles.dateText}>{date}</Text>
              </TouchableOpacity>

              <Text style={styles.modalLabel}>Notes (optional)</Text>
              <View style={[styles.inputBox, { alignItems: 'flex-start', paddingVertical: 4 }]}>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top', paddingTop: 10 }]}
                  placeholder="Any details..."
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
                    : <Text style={styles.confirmBtnText}>Add Group Expense</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 12, color: '#A7F3D0', marginTop: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 14,
    padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  summaryValue: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  summaryLabel: { fontSize: 10, color: COLORS.gray, textAlign: 'center' },
  settleBtn: { marginHorizontal: 20, borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  settleBtnGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 13, gap: 8,
  },
  settleBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginBottom: 28 },
  emptyBtn: { width: '70%', borderRadius: 14, overflow: 'hidden' },
  emptyBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  expenseCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  catIcon: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  catEmoji: { fontSize: 20 },
  expenseInfo: { flex: 1 },
  expenseTitle: { fontSize: 14, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
  expenseMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  paidByText: { fontSize: 11, color: COLORS.gray },
  catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  catBadgeText: { fontSize: 10, fontWeight: '600' },
  expenseDate: { fontSize: 11, color: COLORS.gray },
  amountCol: { alignItems: 'flex-end' },
  expenseAmount: { fontSize: 15, fontWeight: 'bold' },
  perPersonText: { fontSize: 10, color: COLORS.gray, marginTop: 2 },
  hint: { textAlign: 'center', color: COLORS.gray, fontSize: 12, marginTop: 8, marginBottom: 20 },
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
  catChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    marginRight: 8, gap: 6,
  },
  catChipText: { fontSize: 12, fontWeight: '600', color: COLORS.gray },
  memberChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8, gap: 8,
  },
  memberChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  memberChipInitial: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  memberChipText: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  splitRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  splitChip: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    alignItems: 'center', backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.lightGray,
  },
  splitChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  splitText: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  splitTextActive: { color: COLORS.primary },
  splitPreview: {
    backgroundColor: '#F0FDF4', borderRadius: 10,
    padding: 12, marginBottom: 16,
  },
  splitPreviewText: { fontSize: 13, color: COLORS.black, textAlign: 'center' },
  splitPreviewAmount: { fontWeight: 'bold', color: '#10B981' },
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