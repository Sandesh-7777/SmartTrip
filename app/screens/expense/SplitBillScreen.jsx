import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { CATEGORIES } from '../../services/expenseService';
import {
  calculateSplits, saveSettlements,
  getGroupSettlements, markSettled, clearSettlements
} from '../../services/settlementService';

export default function SplitBillScreen({ navigation, route }) {
  const { group, members, expenses } = route.params;
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [successModal, setSuccessModal] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { transactions: txns, balances: bals } = calculateSplits(expenses || [], members);
      setTransactions(txns);
      setBalances(bals);
      const existing = await getGroupSettlements(group.id);
      setSettlements(existing);
    } catch (err) {
      console.log('Split calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettlements = async () => {
    if (transactions.length === 0) {
      Alert.alert('All Settled!', 'Everyone is even. No payments needed.');
      return;
    }
    setSaving(true);
    try {
      await clearSettlements(group.id);
      await saveSettlements(group.id, transactions);
      const updated = await getGroupSettlements(group.id);
      setSettlements(updated);
      setSuccessModal(true);
    } catch (err) {
      console.log('Save settlements error:', err);
      Alert.alert('Error', 'Failed to save settlements. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkSettled = async (settlementId, fromName, amount) => {
    Alert.alert(
      'Mark as Settled',
      `Confirm that ${fromName} has paid ₹${amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Settled ✅',
          onPress: async () => {
            await markSettled(settlementId);
            setSettlements((prev) =>
              prev.map((s) =>
                s.id === settlementId ? { ...s, status: 'settled' } : s
              )
            );
          },
        },
      ]
    );
  };

  const getCategoryInfo = (label) =>
    CATEGORIES.find((c) => c.label === label) || CATEGORIES[7];

  const totalExpenses = (expenses || []).reduce(
    (sum, e) => sum + Number(e.amount), 0
  );
  const perPerson = members.length > 0
    ? Math.round(totalExpenses / members.length)
    : 0;

  const getMemberName = (userId) => {
    if (userId === user.uid) return 'You';
    return members.find((m) => m.user_id === userId)?.user_name || 'Unknown';
  };

  const pendingSettlements = settlements.filter((s) => s.status === 'pending');
  const settledSettlements = settlements.filter((s) => s.status === 'settled');

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#7C2D12', '#EA580C']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Split & Settle</Text>
          <Text style={styles.headerSub}>{group.name}</Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      {/* Summary Banner */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>₹{totalExpenses.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{members.length}</Text>
          <Text style={styles.summaryLabel}>Members</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>₹{perPerson.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Per Person</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{(expenses || []).length}</Text>
          <Text style={styles.summaryLabel}>Expenses</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['summary', 'balances', 'settle'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'summary' ? '📊 Summary'
                : tab === 'balances' ? '⚖️ Balances'
                : '✅ Settle'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <View>
            <Text style={styles.sectionTitle}>Expense Breakdown</Text>

            {/* Category wise */}
            {Object.entries(
              (expenses || []).reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
                return acc;
              }, {})
            ).map(([cat, amt], i) => {
              const info = getCategoryInfo(cat);
              const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
              return (
                <View key={i} style={styles.categoryRow}>
                  <View style={[styles.catDot, { backgroundColor: info.color }]} />
                  <Text style={styles.catIcon}>{info.icon}</Text>
                  <Text style={styles.catLabel}>{cat}</Text>
                  <View style={styles.catBarBg}>
                    <View style={[
                      styles.catBarFill,
                      { width: `${pct}%`, backgroundColor: info.color }
                    ]} />
                  </View>
                  <Text style={styles.catAmount}>₹{Number(amt).toLocaleString()}</Text>
                </View>
              );
            })}

            {/* Member contributions */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Who Paid What</Text>
            {members.map((member, i) => {
              const paid = (expenses || [])
                .filter((e) => e.paid_by === member.user_id)
                .reduce((sum, e) => sum + Number(e.amount), 0);
              return (
                <View key={i} style={styles.memberRow}>
                  <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                    <Text style={styles.avatarText}>
                      {(member.user_name || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>
                    {member.user_id === user.uid ? 'You' : member.user_name}
                  </Text>
                  <View style={styles.memberBarBg}>
                    <View style={[
                      styles.memberBarFill,
                      {
                        width: totalExpenses > 0 ? `${(paid / totalExpenses) * 100}%` : '0%',
                        backgroundColor: COLORS.primary,
                      }
                    ]} />
                  </View>
                  <Text style={styles.memberPaid}>₹{paid.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Balances Tab */}
        {activeTab === 'balances' && (
          <View>
            <Text style={styles.sectionTitle}>Individual Balances</Text>
            <Text style={styles.balanceHint}>
              + means they are owed money · - means they owe money
            </Text>
            {members.map((member, i) => {
              const balance = balances[member.user_id] || 0;
              const isPositive = balance >= 0;
              const isMe = member.user_id === user.uid;
              return (
                <View key={i} style={styles.balanceCard}>
                  <LinearGradient
                    colors={isPositive ? ['#065F46', '#10B981'] : ['#7C2D12', '#EA580C']}
                    style={styles.balanceLeft}
                  >
                    <Text style={styles.balanceAvatar}>
                      {(member.user_name || '?')[0].toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceName}>
                      {isMe ? 'You' : member.user_name}
                    </Text>
                    <Text style={[
                      styles.balanceStatus,
                      { color: isPositive ? '#10B981' : '#EA580C' }
                    ]}>
                      {isPositive
                        ? balance < 0.01 ? 'All settled ✅' : `Gets back ₹${Math.round(balance).toLocaleString()}`
                        : `Owes ₹${Math.round(-balance).toLocaleString()}`
                      }
                    </Text>
                  </View>
                  <Text style={[
                    styles.balanceAmount,
                    { color: isPositive ? '#10B981' : '#EA580C' }
                  ]}>
                    {isPositive ? '+' : ''}₹{Math.round(balance).toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Settle Tab */}
        {activeTab === 'settle' && (
          <View>
            {/* Transactions to settle */}
            {transactions.length === 0 ? (
              <View style={styles.allSettledBox}>
                <Text style={styles.allSettledEmoji}>🎉</Text>
                <Text style={styles.allSettledTitle}>All Settled!</Text>
                <Text style={styles.allSettledSub}>
                  Everyone's expenses are perfectly balanced!
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>Required Payments</Text>
                <Text style={styles.balanceHint}>
                  Minimum transactions to settle all debts
                </Text>
                {transactions.map((txn, i) => (
                  <View key={i} style={styles.transactionCard}>
                    <View style={styles.transactionFrom}>
                      <View style={[styles.txnAvatar, { backgroundColor: '#EA580C' }]}>
                        <Text style={styles.txnAvatarText}>
                          {txn.fromName[0].toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.txnName}>
                        {txn.fromId === user.uid ? 'You' : txn.fromName}
                      </Text>
                    </View>
                    <View style={styles.transactionMiddle}>
                      <Text style={styles.txnAmount}>₹{txn.amount.toLocaleString()}</Text>
                      <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                    </View>
                    <View style={styles.transactionTo}>
                      <View style={[styles.txnAvatar, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.txnAvatarText}>
                          {txn.toName[0].toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.txnName}>
                        {txn.toId === user.uid ? 'You' : txn.toName}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Save Settlements Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                  onPress={handleSaveSettlements}
                  disabled={saving}
                >
                  <LinearGradient
                    colors={['#7C2D12', '#EA580C']}
                    style={styles.saveBtnGradient}
                  >
                    {saving
                      ? <ActivityIndicator color="#fff" />
                      : <>
                          <Ionicons name="save-outline" size={18} color="#fff" />
                          <Text style={styles.saveBtnText}>Save Settlement Plan</Text>
                        </>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Existing settlements */}
            {settlements.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>Settlement Tracker</Text>

                {pendingSettlements.length > 0 && (
                  <View>
                    <Text style={styles.subSectionTitle}>⏳ Pending</Text>
                    {pendingSettlements.map((s) => (
                      <View key={s.id} style={styles.settlementCard}>
                        <View style={styles.settlementInfo}>
                          <Text style={styles.settlementText}>
                            <Text style={styles.settlementName}>
                              {s.paid_by === user.uid ? 'You' : s.paid_by_name}
                            </Text>
                            {' → '}
                            <Text style={styles.settlementName}>
                              {s.paid_to === user.uid ? 'You' : s.paid_to_name}
                            </Text>
                          </Text>
                          <Text style={styles.settlementAmount}>
                            ₹{Number(s.amount).toLocaleString()}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.markSettledBtn}
                          onPress={() => handleMarkSettled(
                            s.id,
                            s.paid_by === user.uid ? 'You' : s.paid_by_name,
                            s.amount
                          )}
                        >
                          <Text style={styles.markSettledText}>Mark Paid ✓</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {settledSettlements.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.subSectionTitle}>✅ Settled</Text>
                    {settledSettlements.map((s) => (
                      <View key={s.id} style={[styles.settlementCard, styles.settlementCardSettled]}>
                        <View style={styles.settlementInfo}>
                          <Text style={styles.settlementText}>
                            <Text style={styles.settlementName}>
                              {s.paid_by === user.uid ? 'You' : s.paid_by_name}
                            </Text>
                            {' → '}
                            <Text style={styles.settlementName}>
                              {s.paid_to === user.uid ? 'You' : s.paid_to_name}
                            </Text>
                          </Text>
                          <Text style={[styles.settlementAmount, { color: '#10B981' }]}>
                            ₹{Number(s.amount).toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.settledBadge}>
                          <Text style={styles.settledBadgeText}>Paid ✓</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>📋</Text>
            <Text style={styles.modalTitle}>Settlement Plan Saved!</Text>
            <Text style={styles.modalSub}>
              All members can now track and mark payments as settled.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setSuccessModal(false)}
            >
              <LinearGradient colors={['#7C2D12', '#EA580C']} style={styles.modalBtnGradient}>
                <Text style={styles.modalBtnText}>Got It!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  summaryBanner: {
    backgroundColor: COLORS.white, flexDirection: 'row',
    paddingVertical: 16, paddingHorizontal: 8,
    justifyContent: 'space-around', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  summaryLabel: { fontSize: 10, color: COLORS.gray, marginTop: 2 },
  summaryDivider: { width: 1, height: 30, backgroundColor: COLORS.lightGray },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    marginHorizontal: 20, marginVertical: 14,
    borderRadius: 16, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#EA580C' },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.gray },
  tabTextActive: { color: '#fff' },
  body: { paddingHorizontal: 20, paddingBottom: 80 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  balanceHint: { fontSize: 12, color: COLORS.gray, marginBottom: 14 },
  subSectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.gray, marginBottom: 8 },
  categoryRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 12,
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catIcon: { fontSize: 16 },
  catLabel: { fontSize: 13, color: COLORS.black, width: 80 },
  catBarBg: {
    flex: 1, height: 6,
    backgroundColor: COLORS.lightGray, borderRadius: 4,
  },
  catBarFill: { height: 6, borderRadius: 4 },
  catAmount: { fontSize: 12, fontWeight: '700', color: COLORS.black, width: 70, textAlign: 'right' },
  memberRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 12,
  },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  memberName: { fontSize: 13, color: COLORS.black, width: 70 },
  memberBarBg: {
    flex: 1, height: 6,
    backgroundColor: COLORS.lightGray, borderRadius: 4,
  },
  memberBarFill: { height: 6, borderRadius: 4 },
  memberPaid: { fontSize: 12, fontWeight: '700', color: COLORS.black, width: 70, textAlign: 'right' },
  balanceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 16,
    marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  balanceLeft: {
    width: 52, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  balanceAvatar: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  balanceInfo: { flex: 1, paddingHorizontal: 12 },
  balanceName: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  balanceStatus: { fontSize: 12, marginTop: 2 },
  balanceAmount: { fontSize: 16, fontWeight: 'bold', paddingRight: 14 },
  transactionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  transactionFrom: { alignItems: 'center', flex: 1 },
  transactionMiddle: { alignItems: 'center', flex: 1 },
  transactionTo: { alignItems: 'center', flex: 1 },
  txnAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  txnAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  txnName: { fontSize: 12, color: COLORS.black, fontWeight: '600', textAlign: 'center' },
  txnAmount: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  saveBtnGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 15, gap: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  settlementCard: {
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  settlementCardSettled: { opacity: 0.7 },
  settlementInfo: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  settlementText: { fontSize: 13, color: COLORS.gray },
  settlementName: { fontWeight: '700', color: COLORS.black },
  settlementAmount: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  markSettledBtn: {
    backgroundColor: '#F0FDF4', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#10B981',
  },
  markSettledText: { color: '#10B981', fontWeight: '700', fontSize: 13 },
  settledBadge: {
    backgroundColor: '#DCFCE7', borderRadius: 8,
    paddingVertical: 6, alignItems: 'center',
  },
  settledBadgeText: { color: '#16A34A', fontWeight: '700', fontSize: 13 },
  allSettledBox: {
    alignItems: 'center', paddingVertical: 40,
  },
  allSettledEmoji: { fontSize: 64, marginBottom: 16 },
  allSettledTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  allSettledSub: { fontSize: 14, color: COLORS.gray, textAlign: 'center' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.white, borderRadius: 24,
    padding: 32, alignItems: 'center', marginHorizontal: 32,
  },
  modalEmoji: { fontSize: 52, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, marginBottom: 10 },
  modalSub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  modalBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});