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
import { getUserTrips, deleteTrip } from '../../services/tripService';

const transportIcons = {
  Bus: '🚌', Train: '🚂', Flight: '✈️', Car: '🚗',
};

const tripTypeIcons = {
  Beach: '🏖️', Mountain: '🏔️', City: '🌆',
  Heritage: '🏯', Adventure: '🧗', Pilgrimage: '🛕',
};

export default function TripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = async () => {
    try {
      const user = auth.currentUser;
      const data = await getUserTrips(user.uid);
      setTrips(data);
    } catch (err) {
      console.log('Error loading trips:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadTrips(); }, []));

  const handleDelete = (tripId) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTrip(tripId);
            setTrips((prev) => prev.filter((t) => t.id !== tripId));
          },
        },
      ]
    );
  };

  const getDuration = (start, end) => {
    const [sd, sm, sy] = start.split('/').map(Number);
    const [ed, em, ey] = end.split('/').map(Number);
    const diff = new Date(ey, em - 1, ed) - new Date(sy, sm - 1, sd);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days}D / ${days - 1}N`;
  };

  const renderTrip = ({ item }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => navigation.navigate('Itinerary', { trip: item })}
      activeOpacity={0.9}
    >
      {/* Card Top */}
      <LinearGradient colors={['#1D4ED8', '#7C3AED']} style={styles.cardTop}>
        <Text style={styles.cardEmoji}>
          {tripTypeIcons[item.trip_type] || '🌍'}
        </Text>
        <View style={styles.cardTopRight}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <Text style={styles.tripDestination}>{item.destination}</Text>
        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.gray} />
            <Text style={styles.metaText}>{item.start_date} → {item.end_date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text>{transportIcons[item.transport] || '🚗'}</Text>
            <Text style={styles.metaText}>{item.transport}</Text>
          </View>
        </View>
        <View style={styles.tripFooter}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={COLORS.gray} />
            <Text style={styles.metaText}>{item.travelers} Travelers</Text>
          </View>
          <Text style={styles.tripDuration}>
            {getDuration(item.start_date, item.end_date)}
          </Text>
          <Text style={styles.tripBudget}>₹{Number(item.budget).toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('TripPlanner')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>No Trips Yet</Text>
          <Text style={styles.emptySub}>Start planning your first adventure!</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('TripPlanner')}
          >
            <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.emptyBtnGradient}>
              <Text style={styles.emptyBtnText}>+ Plan a Trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTrip}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadTrips(); }}
              colors={[COLORS.primary]}
            />
          }
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.planNewBtn}
              onPress={() => navigation.navigate('TripPlanner')}
            >
              <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.planNewBtnGradient}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.planNewBtnText}>Plan New Trip</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', padding: 40,
  },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyTitle: {
    fontSize: 22, fontWeight: 'bold',
    color: COLORS.black, marginBottom: 8,
  },
  emptySub: {
    fontSize: 14, color: COLORS.gray,
    textAlign: 'center', marginBottom: 28,
  },
  emptyBtn: { width: '70%', borderRadius: 14, overflow: 'hidden' },
  emptyBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  list: { padding: 20, paddingBottom: 100 },
  planNewBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  planNewBtnGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 14, gap: 8,
  },
  planNewBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  tripCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  cardEmoji: { fontSize: 40 },
  cardTopRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusText: {
    color: '#fff', fontSize: 11,
    fontWeight: '700', textTransform: 'uppercase',
  },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { padding: 16 },
  tripDestination: {
    fontSize: 20, fontWeight: 'bold',
    color: COLORS.black, marginBottom: 10,
  },
  tripMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.gray },
  tripFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: COLORS.lightGray, paddingTop: 12,
  },
  tripDuration: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  tripBudget: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
});