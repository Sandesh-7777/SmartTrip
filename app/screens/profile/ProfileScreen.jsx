import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { logoutUser } from '../../services/authService';
import {
  updateProfile, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential
} from 'firebase/auth';
import { supabase } from '../../constants/supabase';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(auth.currentUser);
  const [stats, setStats] = useState({ trips: 0, bookings: 0, expenses: 0, spent: 0 });
  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const loadStats = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const [tripsRes, bookingsRes, expensesRes] = await Promise.all([
        supabase.from('trips').select('id').eq('user_id', uid),
        supabase.from('bookings').select('id').eq('user_id', uid),
        supabase.from('expenses').select('id, amount').eq('user_id', uid).eq('is_personal', true),
      ]);

      const totalSpent = (expensesRes.data || []).reduce(
        (sum, e) => sum + Number(e.amount), 0
      );

      setStats({
        trips: tripsRes.data?.length || 0,
        bookings: bookingsRes.data?.length || 0,
        expenses: expensesRes.data?.length || 0,
        spent: totalSpent,
      });
    } catch (err) {
      console.log('Error loading stats:', err);
    }
  };

  useFocusEffect(useCallback(() => {
    setUser(auth.currentUser);
    setNewName(auth.currentUser?.displayName || '');
    loadStats();
  }, []));

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: newName.trim() });
      setUser({ ...auth.currentUser, displayName: newName.trim() });
      setEditModal(false);
      Alert.alert('Success ✅', 'Your name has been updated!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email, currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordModal(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      Alert.alert('Success ✅', 'Password updated successfully!');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Current password is incorrect.');
      } else {
        Alert.alert('Error', 'Failed to update password. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => { await logoutUser(); },
      },
    ]);
  };

  const statCards = [
  {
    label: 'Trips', value: stats.trips, icon: '🗺️',
    onPress: () => navigation.navigate('Trips', { screen: 'TripsList' }),
  },
  {
    label: 'Bookings', value: stats.bookings, icon: '🎫',
    onPress: () => navigation.navigate('Bookings', { screen: 'MyBookings' }),
  },
  {
    label: 'Expenses', value: stats.expenses, icon: '💸',
    onPress: () => navigation.navigate('Expenses'),
  },
  {
    label: 'Spent',
    value: stats.spent >= 1000
      ? `₹${(stats.spent / 1000).toFixed(1)}k`
      : `₹${stats.spent}`,
    icon: '💰',
    onPress: () => navigation.navigate('Expenses'),
  },
];

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline', label: 'Edit Profile',
          onPress: () => setEditModal(true), type: 'action',
        },
        {
          icon: 'lock-closed-outline', label: 'Change Password',
          onPress: () => setPasswordModal(true), type: 'action',
        },
        {
          icon: 'mail-outline', label: 'Email',
          value: user?.email, type: 'info',
        },
      ],
    },
    {
      title: 'My Activity',
      items: [
        {
          icon: 'map-outline', label: 'My Trips',
          onPress: () => navigation.navigate('Trips', { screen: 'TripsList' }),
          type: 'action',
        },
        {
          icon: 'ticket-outline', label: 'My Bookings',
          onPress: () => navigation.navigate('Bookings', { screen: 'MyBookings' }),
          type: 'action',
        },
        {
          icon: 'wallet-outline', label: 'My Expenses',
          onPress: () => navigation.navigate('Expenses'),
          type: 'action',
        },
        {
          icon: 'people-outline', label: 'My Groups',
          onPress: () => navigation.navigate('Groups', { screen: 'GroupsList' }),
          type: 'action',
        },
        {
          icon: 'cube-outline', label: 'My Packages',
          onPress: () => navigation.navigate('Packages', { screen: 'PackagesList' }),
          type: 'action',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline', label: 'Push Notifications',
          type: 'toggle', value: notifications,
          onToggle: () => setNotifications(!notifications),
        },
        {
          icon: 'moon-outline', label: 'Dark Mode',
          type: 'toggle', value: darkMode,
          onToggle: () => setDarkMode(!darkMode),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline', label: 'Help & Support',
          onPress: () => Alert.alert('Help', 'Contact us at support@smarttrip.app'),
          type: 'action',
        },
        {
          icon: 'shield-checkmark-outline', label: 'Privacy Policy',
          onPress: () => Alert.alert('Privacy', 'Your data is safe with us.'),
          type: 'action',
        },
        {
          icon: 'information-circle-outline', label: 'App Version',
          value: 'v1.0.0', type: 'info',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1D4ED8', '#7C3AED']} style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.displayName)}</Text>
          </View>
          <Text style={styles.userName}>{user?.displayName || 'Traveler'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => setEditModal(true)}
          >
            <Ionicons name="pencil-outline" size={14} color="#fff" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats — Tappable */}
        <View style={styles.statsCard}>
          {statCards.map((stat, i) => (
            <TouchableOpacity
              key={i}
              style={styles.statItem}
              onPress={stat.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={styles.statArrow}>
                <Ionicons name="chevron-forward" size={10} color={COLORS.gray} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {menuSections.map((section, si) => (
            <View key={si} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, ii) => (
                  <TouchableOpacity
                    key={ii}
                    style={[
                      styles.menuItem,
                      ii < section.items.length - 1 && styles.menuItemBorder,
                    ]}
                    onPress={
                      item.type !== 'toggle' && item.type !== 'info'
                        ? item.onPress
                        : undefined
                    }
                    activeOpacity={item.type === 'action' ? 0.7 : 1}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconBox}>
                        <Ionicons name={item.icon} size={18} color={COLORS.primary} />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    {item.type === 'toggle' && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                        thumbColor="#fff"
                      />
                    )}
                    {item.type === 'info' && (
                      <Text style={styles.menuValue}>{item.value}</Text>
                    )}
                    {item.type === 'action' && (
                      <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>Made with ❤️ by SmartTrip Team</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Full Name</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={16} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.gray}
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <Text style={styles.modalLabel}>Email</Text>
            <View style={[styles.inputBox, { opacity: 0.6 }]}>
              <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                value={user?.email}
                editable={false}
              />
            </View>
            <Text style={styles.emailHint}>Email cannot be changed</Text>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleUpdateName}
              disabled={saving}
            >
              <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.saveBtnGradient}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Save Changes</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Current Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor={COLORS.gray}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                <Ionicons
                  name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                  size={18} color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>New Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-open-outline" size={16} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={COLORS.gray}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Ionicons
                  name={showNew ? 'eye-off-outline' : 'eye-outline'}
                  size={18} color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Confirm New Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-open-outline" size={16} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={COLORS.gray}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={saving}
            >
              <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.saveBtnGradient}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Update Password</Text>
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
    alignItems: 'center', paddingTop: 30,
    paddingBottom: 36, paddingHorizontal: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#BFDBFE', marginBottom: 16 },
  editProfileBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, gap: 6,
  },
  editProfileText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsCard: {
    backgroundColor: COLORS.white, marginHorizontal: 20,
    marginTop: -20, borderRadius: 20, padding: 16,
    flexDirection: 'row', justifyContent: 'space-around',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
  },
  statItem: { alignItems: 'center', gap: 4, position: 'relative' },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  statLabel: { fontSize: 11, color: COLORS.gray },
  statArrow: { position: 'absolute', bottom: -4, right: -4 },
  menuContainer: { padding: 20, paddingBottom: 40 },
  menuSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.gray,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: COLORS.white, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 15,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  menuValue: { fontSize: 13, color: COLORS.gray },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    backgroundColor: '#FEF2F2', borderRadius: 16,
    paddingVertical: 16, marginBottom: 24,
    borderWidth: 1.5, borderColor: '#FECACA',
  },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 15 },
  footerText: { textAlign: 'center', fontSize: 13, color: COLORS.gray, marginBottom: 20 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalCard: {
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
  emailHint: { fontSize: 12, color: COLORS.gray, marginTop: -12, marginBottom: 16 },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  saveBtnGradient: { paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});