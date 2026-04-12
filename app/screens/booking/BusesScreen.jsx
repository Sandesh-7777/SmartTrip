import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { mockBuses, createBooking } from '../../services/bookingService';

export default function BusesScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);
  const [bookingModal, setBookingModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!date) {
      Alert.alert('Missing Info', 'Please enter travel date.');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      await createBooking(user.uid, {
        type: 'bus',
        item_id: selected.id,
        item_name: selected.operator,
        from_location: selected.from,
        to_location: selected.to,
        date,
        travelers: seats,
        total_price: selected.price * seats,
        status: 'confirmed',
        details: { departure: selected.departure, arrival: selected.arrival, busType: selected.type },
      });
      setBookingModal(false);
      setSuccessModal(true);
    } catch (err) {
      console.log('Bus booking error:', err);
      Alert.alert('Error', 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBus = ({ item }) => (
    <TouchableOpacity
      style={styles.busCard}
      onPress={() => { setSelected(item); setBookingModal(true); }}
      activeOpacity={0.9}
    >
      <View style={styles.busTop}>
        <View style={styles.operatorBox}>
          <Text style={styles.busEmoji}>🚌</Text>
          <View>
            <Text style={styles.operatorName}>{item.operator}</Text>
            <View style={styles.busTypeBadge}>
              <Text style={styles.busTypeText}>{item.type}</Text>
            </View>
          </View>
        </View>
        <View style={styles.ratingBox}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routePoint}>
          <Text style={styles.routeTime}>{item.departure}</Text>
          <Text style={styles.routeCity}>{item.from}</Text>
        </View>
        <View style={styles.routeCenter}>
          <Text style={styles.duration}>{item.duration}</Text>
          <View style={styles.routeLine}>
            <View style={styles.routeDot} />
            <View style={styles.routeDash} />
            <Ionicons name="bus" size={16} color={COLORS.primary} />
            <View style={styles.routeDash} />
            <View style={styles.routeDot} />
          </View>
        </View>
        <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
          <Text style={styles.routeTime}>{item.arrival}</Text>
          <Text style={styles.routeCity}>{item.to}</Text>
        </View>
      </View>

      <View style={styles.busFooter}>
        <Text style={styles.seatsLeft}>🪑 {item.seats} seats left</Text>
        <View style={styles.priceRow}>
          <Text style={styles.busPrice}>₹{item.price}</Text>
          <Text style={styles.perSeat}>/seat</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => { setSelected(item); setBookingModal(true); }}
        >
          <Text style={styles.bookBtnText}>Book</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#065F46', '#10B981']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bus Tickets</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <FlatList
        data={mockBuses}
        renderItem={renderBus}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Booking Modal */}
      {selected && (
        <Modal visible={bookingModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selected.operator}</Text>
                <TouchableOpacity onPress={() => setBookingModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalRoute}>
                {selected.from} → {selected.to}
              </Text>
              <Text style={styles.modalTiming}>
                {selected.departure} - {selected.arrival} · {selected.duration}
              </Text>

              <Text style={styles.modalLabel}>Travel Date</Text>
              <View style={styles.modalInput}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
                <TextInput
                  style={styles.modalInputText}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={COLORS.gray}
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <Text style={styles.modalLabel}>Number of Seats</Text>
              <View style={styles.counterBox}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setSeats(Math.max(1, seats - 1))}
                >
                  <Ionicons name="remove" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.counterVal}>{seats}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setSeats(Math.min(selected.seats, seats + 1))}
                >
                  <Ionicons name="add" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹{(selected.price * seats).toLocaleString()}</Text>
              </View>

              <TouchableOpacity
                style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
                onPress={handleBook}
                disabled={loading}
              >
                <LinearGradient colors={['#065F46', '#10B981']} style={styles.confirmBtnGradient}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Ticket Booked!</Text>
            <Text style={styles.successSub}>
              Your bus ticket from{' '}
              <Text style={{ fontWeight: 'bold' }}>{selected?.from}</Text> to{' '}
              <Text style={{ fontWeight: 'bold' }}>{selected?.to}</Text> is confirmed!
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => { setSuccessModal(false); navigation.navigate('MyBookings'); }}
            >
              <LinearGradient colors={['#065F46', '#10B981']} style={styles.confirmBtnGradient}>
                <Text style={styles.confirmBtnText}>View Booking</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import { TextInput } from 'react-native';

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
  list: { padding: 20, paddingBottom: 100 },
  busCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    marginBottom: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  busTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  operatorBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  busEmoji: { fontSize: 28 },
  operatorName: { fontSize: 14, fontWeight: 'bold', color: COLORS.black },
  busTypeBadge: {
    backgroundColor: '#DCFCE7', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 6, marginTop: 4,
  },
  busTypeText: { fontSize: 11, color: '#16A34A', fontWeight: '600' },
  ratingBox: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  routeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  routePoint: {},
  routeTime: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  routeCity: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  routeCenter: { alignItems: 'center', flex: 1 },
  duration: { fontSize: 11, color: COLORS.gray, marginBottom: 4 },
  routeLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  routeDash: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  busFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: COLORS.lightGray, paddingTop: 12,
  },
  seatsLeft: { fontSize: 12, color: COLORS.gray },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  busPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  perSeat: { fontSize: 12, color: COLORS.gray },
  bookBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
  },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.black },
  modalRoute: { fontSize: 14, color: COLORS.gray, marginBottom: 4 },
  modalTiming: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.black, marginBottom: 8 },
  modalInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 16, gap: 10,
  },
  modalInputText: { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.black },
  counterBox: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  counterBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  counterVal: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  totalBox: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#F0FDF4',
    borderRadius: 12, padding: 14, marginBottom: 20,
  },
  totalLabel: { fontSize: 13, color: COLORS.gray },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },
  confirmBtn: { borderRadius: 14, overflow: 'hidden' },
  confirmBtnGradient: { paddingVertical: 15, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  successCard: {
    backgroundColor: COLORS.white, borderRadius: 24,
    padding: 32, alignItems: 'center', marginHorizontal: 32,
  },
  successEmoji: { fontSize: 52, marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.black, marginBottom: 10 },
  successSub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  successBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
});