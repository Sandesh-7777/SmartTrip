import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import {
  getUserGroups, createGroup,
  getGroupByInviteCode, joinGroup, deleteGroup
} from '../../services/groupService';

export default function GroupsScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [joinModal, setJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  // Create form state
  const [groupName, setGroupName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const user = auth.currentUser;

  const loadGroups = async () => {
    try {
      const data = await getUserGroups(user.uid);
      setGroups(data);
    } catch (err) {
      console.log('Error loading groups:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadGroups(); }, []));

  const handleCreate = async () => {
    if (!groupName || !destination) {
      Alert.alert('Missing Info', 'Please enter group name and destination.');
      return;
    }
    setCreating(true);
    try {
      await createGroup(user.uid, user.displayName || 'User', user.email, {
        name: groupName,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget: Number(budget) || 0,
      });
      setCreateModal(false);
      setGroupName(''); setDestination('');
      setStartDate(''); setEndDate(''); setBudget('');
      loadGroups();
    } catch (err) {
      console.log('Create group error:', err);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode || inviteCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character invite code.');
      return;
    }
    setJoining(true);
    try {
      const group = await getGroupByInviteCode(inviteCode);
      await joinGroup(group.id, user.uid, user.displayName || 'User', user.email);
      setJoinModal(false);
      setInviteCode('');
      loadGroups();
      Alert.alert('Success! 🎉', `You joined "${group.name}"!`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Invalid invite code. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = (groupId, groupName, createdBy) => {
    if (createdBy !== user.uid) {
      Alert.alert('Not Allowed', 'Only the group admin can delete this group.');
      return;
    }
    Alert.alert('Delete Group', `Delete "${groupName}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteGroup(groupId);
          setGroups((prev) => prev.filter((g) => g.id !== groupId));
        },
      },
    ]);
  };

  const getMemberCount = (group) => {
    try {
      return Array.isArray(group.members) ? group.members.length : 1;
    } catch { return 1; }
  };

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate('GroupDetail', { group: item })}
      activeOpacity={0.9}
    >
      <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.cardTop}>
        <Text style={styles.cardEmoji}>👥</Text>
        <View style={styles.cardTopInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <View style={styles.inviteCodeBadge}>
            <Ionicons name="key-outline" size={11} color="rgba(255,255,255,0.8)" />
            <Text style={styles.inviteCodeText}>{item.invite_code}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id, item.name, item.created_by)}
        >
          <Ionicons name="trash-outline" size={16} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={13} color={COLORS.gray} />
            <Text style={styles.detailText}>{item.destination || 'No destination'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={13} color={COLORS.gray} />
            <Text style={styles.detailText}>{getMemberCount(item)} members</Text>
          </View>
        </View>

        {item.start_date ? (
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.gray} />
            <Text style={styles.detailText}>{item.start_date} → {item.end_date}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          {item.budget > 0 ? (
            <Text style={styles.budgetText}>
              Budget: ₹{Number(item.budget).toLocaleString()}
            </Text>
          ) : (
            <Text style={styles.budgetText}>No budget set</Text>
          )}
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('GroupDetail', { group: item })}
          >
            <Text style={styles.viewBtnText}>View Group →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.header}>
        <Text style={styles.headerTitle}>Group Travel</Text>
        <Text style={styles.headerSub}>Plan & travel together</Text>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setCreateModal(true)}
        >
          <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.actionBtnGradient}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Create Group</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnOutline}
          onPress={() => setJoinModal(true)}
        >
          <Ionicons name="enter-outline" size={18} color={COLORS.primary} />
          <Text style={styles.actionBtnOutlineText}>Join Group</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>No Groups Yet</Text>
          <Text style={styles.emptySub}>
            Create a group or join one with an invite code!
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadGroups(); }}
            />
          }
        />
      )}

      {/* Create Group Modal */}
      <Modal visible={createModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Group</Text>
              <TouchableOpacity onPress={() => setCreateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Group Name *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="people-outline" size={16} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Goa Trip 2025"
                placeholderTextColor={COLORS.gray}
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>

            <Text style={styles.modalLabel}>Destination *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="location-outline" size={16} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Goa, Manali"
                placeholderTextColor={COLORS.gray}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.modalLabel}>Start Date</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={COLORS.gray}
                    value={startDate}
                    onChangeText={setStartDate}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.modalLabel}>End Date</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={COLORS.gray}
                    value={endDate}
                    onChangeText={setEndDate}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.modalLabel}>Group Budget (₹)</Text>
            <View style={styles.inputBox}>
              <Ionicons name="cash-outline" size={16} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 50000"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, creating && { opacity: 0.7 }]}
              onPress={handleCreate}
              disabled={creating}
            >
              <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.confirmBtnGradient}>
                {creating
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.confirmBtnText}>Create Group</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join Group Modal */}
      <Modal visible={joinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.joinModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join a Group</Text>
              <TouchableOpacity onPress={() => setJoinModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <Text style={styles.joinSubText}>
              Enter the 6-character invite code shared by your group admin
            </Text>

            <View style={styles.codeInputBox}>
              <TextInput
                style={styles.codeInput}
                placeholder="e.g. ABC123"
                placeholderTextColor={COLORS.gray}
                value={inviteCode}
                onChangeText={(t) => setInviteCode(t.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, joining && { opacity: 0.7 }]}
              onPress={handleJoin}
              disabled={joining}
            >
              <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.confirmBtnGradient}>
                {joining
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="enter-outline" size={18} color="#fff" />
                      <Text style={styles.confirmBtnText}>Join Group</Text>
                    </>
                }
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
  header: {
    paddingHorizontal: 24, paddingTop: 20,
    paddingBottom: 24, borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: '#DDD6FE', marginTop: 4 },
  actionRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  actionBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  actionBtnGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 14, gap: 8,
  },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  actionBtnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.primary,
    paddingVertical: 14, gap: 8,
    backgroundColor: COLORS.white,
  },
  actionBtnOutlineText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 22 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  groupCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  cardEmoji: { fontSize: 32 },
  cardTopInfo: { flex: 1 },
  groupName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  inviteCodeBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, gap: 4, alignSelf: 'flex-start',
  },
  inviteCodeText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { padding: 16 },
  detailRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: COLORS.gray },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderTopWidth: 1,
    borderTopColor: COLORS.lightGray, paddingTop: 12, marginTop: 8,
  },
  budgetText: { fontSize: 13, fontWeight: '600', color: COLORS.black },
  viewBtn: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
  },
  viewBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24,
  },
  joinModalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24,
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
  rowInputs: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  confirmBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  confirmBtnGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 15, gap: 8,
  },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  joinSubText: {
    fontSize: 14, color: COLORS.gray,
    marginBottom: 24, lineHeight: 20,
  },
  codeInputBox: {
    backgroundColor: '#F8FAFC', borderWidth: 2,
    borderColor: COLORS.primary + '60', borderRadius: 16,
    paddingHorizontal: 20, marginBottom: 24,
  },
  codeInput: {
    fontSize: 28, fontWeight: 'bold', color: COLORS.black,
    textAlign: 'center', paddingVertical: 16,
    letterSpacing: 8,
  },
});