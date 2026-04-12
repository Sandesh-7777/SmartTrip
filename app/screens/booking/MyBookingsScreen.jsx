import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { getUserBookings, cancelBooking } from '../../services/bookingService';

const typeColors = {
  hotel: ['#1D4ED8', '#3B82F6'],
  bus: ['#065F46', '#10B981'],
  train: ['#7C2D12', '#EA580C'],
};

const typeIcons = { hotel: '🏨', bus: '🚌', train: '🚂' };

const statusColors = {
  confirmed: { bg: '#DCFCE7', text: '#16A34A' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadBookings = async () => {
    try {
      const user = auth.currentUser;
      const data = await getUserBookings(user.uid);
      setBookings(data);
    } catch (err) {
      console.log('Error loading bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadBookings(); }, []));

  const handleCancel = (id) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await cancelBooking(id);
          setBookings((prev) =>
            prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b)
          );
        },
      },
    ]);
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.type === filter);

  const renderBooking = ({ item }) => {
    const colors = typeColors[item.type] || ['#1D4ED8', '#3B82F6'];
    const status = statusColors[item.status] || statusColors.confirmed;

    return (
      <View style={styles.bookingCard}>
        <LinearGradient colors={colors} style={styles.cardTop}>
          <Text style={styles.cardIcon}>{typeIcons[item.type]}</Text>
          <View style={styles.cardTopInfo}>
            <Text style={styles.cardItemName}>{item.item_name}</Text>
            <Text style={styles.cardRoute}>
              {item.from_location} → {item.to_location}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>
              {item.status}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={13} color={COLORS.gray} />
              <Text style={styles.detailText}>{item.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={13} color={COLORS.gray} />
              <Text style={styles.detailText}>{item.travelers} travelers</Text>
            </View>
            {item.seat_class && (
              <View style={styles.detailItem}>
                <Ionicons name="ticket-outline" size={13} color={COLORS.gray} />
                <Text style={styles.detailText}>{item.seat_class}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.totalPrice}>
              ₹{Number(item.total_price).toLocaleString()}
            </Text>
            {item.status === 'confirmed' && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item.id)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#4C1D95', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'hotel', 'bus', 'train'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>🎫</Text>
          <Text style={styles.emptyTitle}>No Bookings Found</Text>
          <Text style={styles.emptySub}>Your bookings will appear here</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.goBack()}
          >
            <LinearGradient colors={['#4C1D95', '#8B5CF6']} style={styles.emptyBtnGradient}>
              <Text style={styles.emptyBtnText}>Browse & Book</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadBookings(); }}
            />
          }
        />
      )}
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  filterRow: {
    flexDirection: 'row', padding: 16, gap: 8,
  },
  filterTab: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    alignItems: 'center', backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.lightGray,
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  filterTextActive: { color: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.gray, marginBottom: 28 },
  emptyBtn: { width: '70%', borderRadius: 14, overflow: 'hidden' },
  emptyBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  list: { padding: 20, paddingBottom: 100 },
  bookingCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  cardIcon: { fontSize: 28 },
  cardTopInfo: { flex: 1 },
  cardItemName: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  cardRoute: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  cardBody: { padding: 16 },
  detailRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: COLORS.gray },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderTopWidth: 1,
    borderTopColor: COLORS.lightGray, paddingTop: 12,
  },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  cancelBtn: {
    borderWidth: 1.5, borderColor: '#EF4444',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  cancelBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
});