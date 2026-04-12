import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

const BOOKING_TYPES = [
  {
    id: 1, label: 'Hotels', icon: '🏨', screen: 'Hotels',
    desc: 'Find & book stays', color: ['#1D4ED8', '#3B82F6'],
  },
  {
    id: 2, label: 'Buses', icon: '🚌', screen: 'Buses',
    desc: 'Book bus tickets', color: ['#065F46', '#10B981'],
  },
  {
    id: 3, label: 'Trains', icon: '🚂', screen: 'Trains',
    desc: 'Reserve train seats', color: ['#7C2D12', '#EA580C'],
  },
  {
    id: 4, label: 'My Bookings', icon: '🎫', screen: 'MyBookings',
    desc: 'View all bookings', color: ['#4C1D95', '#8B5CF6'],
  },
];

const POPULAR = [
  { id: 1, from: 'Mumbai', to: 'Goa', icon: '🏖️' },
  { id: 2, from: 'Delhi', to: 'Manali', icon: '🏔️' },
  { id: 3, from: 'Bangalore', to: 'Kerala', icon: '🌴' },
  { id: 4, from: 'Chennai', to: 'Jaipur', icon: '🏯' },
];

export default function BookingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.header}>
          <Text style={styles.headerTitle}>Bookings</Text>
          <Text style={styles.headerSub}>Hotels, Buses & Trains</Text>
        </LinearGradient>

        <View style={styles.body}>

          {/* Booking Type Cards */}
          <View style={styles.grid}>
            {BOOKING_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.typeCard}
                onPress={() => navigation.navigate(type.screen)}
                activeOpacity={0.9}
              >
                <LinearGradient colors={type.color} style={styles.typeGradient}>
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                  <Text style={styles.typeDesc}>{type.desc}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Popular Routes */}
          <Text style={styles.sectionTitle}>Popular Routes</Text>
          {POPULAR.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={styles.routeCard}
              onPress={() => navigation.navigate('Buses')}
            >
              <View style={styles.routeLeft}>
                <Text style={styles.routeIcon}>{route.icon}</Text>
                <View>
                  <Text style={styles.routeText}>
                    {route.from} → {route.to}
                  </Text>
                  <Text style={styles.routeSub}>Tap to explore options</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          ))}

          {/* Offers Banner */}
          <LinearGradient colors={['#7C3AED', '#4C1D95']} style={styles.offerBanner}>
            <View>
              <Text style={styles.offerLabel}>Limited Time Offer</Text>
              <Text style={styles.offerTitle}>Get 20% off on{'\n'}your first hotel booking!</Text>
              <TouchableOpacity
                style={styles.offerBtn}
                onPress={() => navigation.navigate('Hotels')}
              >
                <Text style={styles.offerBtnText}>Book Now →</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.offerEmoji}>🏨</Text>
          </LinearGradient>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#BFDBFE', marginTop: 4 },
  body: { padding: 20, paddingBottom: 100 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, marginBottom: 28,
  },
  typeCard: {
    width: '47%', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  typeGradient: { padding: 20, minHeight: 130 },
  typeIcon: { fontSize: 32, marginBottom: 10 },
  typeLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  typeDesc: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  sectionTitle: {
    fontSize: 17, fontWeight: 'bold',
    color: COLORS.black, marginBottom: 14,
  },
  routeCard: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  routeLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  routeIcon: { fontSize: 28 },
  routeText: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  routeSub: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  offerBanner: {
    borderRadius: 20, padding: 22, marginTop: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  offerLabel: { color: '#DDD6FE', fontSize: 12, marginBottom: 6 },
  offerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 22, marginBottom: 14 },
  offerBtn: {
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start',
  },
  offerBtnText: { color: '#7C3AED', fontWeight: 'bold', fontSize: 13 },
  offerEmoji: { fontSize: 56 },
});