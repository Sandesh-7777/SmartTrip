import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Share, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { getGroupMembers } from '../../services/groupService';

export default function GroupDetailScreen({ navigation, route }) {
  const { group } = route.params;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const loadMembers = async () => {
    try {
      const data = await getGroupMembers(group.id);
      setMembers(data);
    } catch (err) {
      console.log('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadMembers(); }, []));

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join my group "${group.name}" on SmartTrip!\n\nUse invite code: ${group.invite_code}\n\nOpen SmartTrip → Groups → Join Group → Enter code`,
        title: 'Join my SmartTrip Group!',
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = [
    ['#1D4ED8', '#3B82F6'],
    ['#065F46', '#10B981'],
    ['#7C2D12', '#EA580C'],
    ['#4C1D95', '#8B5CF6'],
    ['#831843', '#EC4899'],
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{group.name}</Text>
          <Text style={styles.headerSub}>{group.destination}</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareInvite}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* Invite Code Card */}
        <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.inviteCard}>
          <View>
            <Text style={styles.inviteLabel}>Group Invite Code</Text>
            <Text style={styles.inviteCode}>{group.invite_code}</Text>
            <Text style={styles.inviteHint}>Share this code to invite members</Text>
          </View>
          <TouchableOpacity style={styles.shareIconBtn} onPress={handleShareInvite}>
            <Ionicons name="share-social-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Trip Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.detailsGrid}>
            {[
              { icon: '📍', label: 'Destination', value: group.destination || 'Not set' },
              { icon: '📅', label: 'Dates', value: group.start_date ? `${group.start_date} → ${group.end_date}` : 'Not set' },
              { icon: '💰', label: 'Budget', value: group.budget > 0 ? `₹${Number(group.budget).toLocaleString()}` : 'Not set' },
              { icon: '👥', label: 'Members', value: `${members.length} people` },
            ].map((item, i) => (
              <View key={i} style={styles.detailItem}>
                <Text style={styles.detailIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Members */}
        <View style={styles.membersCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members ({members.length})</Text>
            <TouchableOpacity onPress={handleShareInvite} style={styles.addMemberBtn}>
              <Ionicons name="person-add-outline" size={16} color={COLORS.primary} />
              <Text style={styles.addMemberText}>Invite</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            members.map((member, i) => (
              <View key={member.id} style={styles.memberRow}>
                <LinearGradient
                  colors={avatarColors[i % avatarColors.length]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{getInitials(member.user_name)}</Text>
                </LinearGradient>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {member.user_name}
                    {member.user_id === user.uid ? ' (You)' : ''}
                  </Text>
                  <Text style={styles.memberEmail}>{member.user_email}</Text>
                </View>
                <View style={[
                  styles.roleBadge,
                  { backgroundColor: member.role === 'admin' ? '#EFF6FF' : '#F5F3FF' }
                ]}>
                  <Text style={[
                    styles.roleText,
                    { color: member.role === 'admin' ? COLORS.primary : '#7C3AED' }
                  ]}>
                    {member.role}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Group Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            {
              icon: '💰', label: 'Expenses',
              color: ['#065F46', '#10B981'],
              onPress: () => navigation.navigate('GroupExpenses', { group }),
            },
            {
              icon: '🔀', label: 'Split Bill',
              color: ['#7C2D12', '#EA580C'],
              onPress: () => navigation.navigate('SplitBill', { group, members }),
            },
            {
              icon: '🗺️', label: 'Trip Plan',
              color: ['#1D4ED8', '#3B82F6'],
              onPress: () => navigation.navigate('Trips'),
            },
            {
              icon: '📤', label: 'Share Code',
              color: ['#4C1D95', '#7C3AED'],
              onPress: handleShareInvite,
            },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.9}
            >
              <LinearGradient colors={action.color} style={styles.actionGradient}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
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
  headerSub: { fontSize: 12, color: '#DDD6FE', marginTop: 2 },
  shareBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: 20, paddingBottom: 80 },
  inviteCard: {
    borderRadius: 20, padding: 20, marginBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  inviteLabel: { color: '#DDD6FE', fontSize: 12, marginBottom: 6 },
  inviteCode: {
    color: '#fff', fontSize: 28, fontWeight: 'bold',
    letterSpacing: 6, marginBottom: 4,
  },
  inviteHint: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  shareIconBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  detailsCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginBottom: 14 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  addMemberBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  addMemberText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  detailsGrid: { gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  detailLabel: { fontSize: 11, color: COLORS.gray },
  detailValue: { fontSize: 14, fontWeight: '600', color: COLORS.black, marginTop: 2 },
  membersCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  memberRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightGray,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  memberEmail: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  roleBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  roleText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  actionCard: {
    width: '47%', borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  actionGradient: { padding: 20, alignItems: 'center', minHeight: 100, justifyContent: 'center' },
  actionIcon: { fontSize: 30, marginBottom: 8 },
  actionLabel: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});