import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { mockTrains, createBooking } from '../../services/bookingService';

export default function TrainsScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [bookingModal, setBookingModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!date || !selectedClass) {
      Alert.alert('Missing Info', 'Please select class and enter travel date.');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      await createBooking(user.uid, {
        type: 'train',
        item_id: selected.id,
        item_name: selected.name,
        from_location: selected.from,
        to_location: selected.to,
        date,
        travelers: passengers,
        seat_class: selectedClass.type,
        total_price: selectedClass.price * passengers,
        status: 'confirmed',
        details: {
          trainNumber: selected.number,
          departure: selected.departure,
          arrival: selected.arrival,
          class: selectedClass.type,
        },
      });
      setBookingModal(false);
      setSuccessModal(true);
    } catch (err) {
      console.log('Train booking error:', err);
      Alert.alert('Error', 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTrain = ({ item }) => (
    <TouchableOpacity
      style={styles.trainCard}
      onPress={() => { setSelected(item); setSelectedClass(null); setBookingModal(true); }}
      activeOpacity={0.9}
    >
      {/* Train Header */}
      <LinearGradient colors={['#7C2D12', '#EA580C']} style={styles.trainHeader}>
        <View>
          <Text style={styles.trainName}>{item.name}</Text>
          <Text style={styles.trainNumber}>#{item.number}</Text>
        </View>
        <View style={styles.ratingBox}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </LinearGradient>

      <View style={styles.trainBody}>
        {/* Route */}
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
              <Text style={{ fontSize: 16 }}>🚂</Text>
              <View style={styles.routeDash} />
              <View style={styles.routeDot} />
            </View>
          </View>
          <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
            <Text style={styles.routeTime}>{item.arrival}</Text>
            <Text style={styles.routeCity}>{item.to}</Text>
          </View>
        </View>

        {/* Days */}
        <View style={styles.daysRow}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.gray} />
          <Text style={styles.daysText}>{item.days}</Text>
        </View>

        {/* Classes */}
        <View style={styles.classesRow}>
          {item.classes.map((cls, i) => (
            <View key={i} style={styles.classTag}>
              <Text style={styles.classType}>{cls.type}</Text>
              <Text style={styles.classPrice}>₹{cls.price}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#7C2D12', '#EA580C']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Train Tickets</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <FlatList
        data={mockTrains}
        renderItem={renderTrain}
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
                <View>
                  <Text style={styles.modalTitle}>{selected.name}</Text>
                  <Text style={styles.modalSub}>#{selected.number} · {selected.from} → {selected.to}</Text>
                </View>
                <TouchableOpacity onPress={() => setBookingModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Select Class */}
                <Text style={styles.modalLabel}>Select Class</Text>
                <View style={styles.classSelectRow}>
                  {selected.classes.map((cls, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.classSelectCard,
                        selectedClass?.type === cls.type && styles.classSelectActive
                      ]}
                      onPress={() => setSelectedClass(cls)}
                    >
                      <Text style={[
                        styles.classSelectType,
                        selectedClass?.type === cls.type && { color: COLORS.primary }
                      ]}>
                        {cls.type}
                      </Text>
                      <Text style={[
                        styles.classSelectPrice,
                        selectedClass?.type === cls.type && { color: COLORS.primary }
                      ]}>
                        ₹{cls.price}
                      </Text>
                      <Text style={styles.classSelectSeats}>{cls.seats} seats</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Date */}
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

                {/* Passengers */}
                <Text style={styles.modalLabel}>Passengers</Text>
                <View style={styles.counterBox}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setPassengers(Math.max(1, passengers - 1))}
                  >
                    <Ionicons name="remove" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.counterVal}>{passengers}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setPassengers(passengers + 1)}
                  >
                    <Ionicons name="add" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                {/* Total */}
                {selectedClass && (
                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>
                      ₹{(selectedClass.price * passengers).toLocaleString()}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
                  onPress={handleBook}
                  disabled={loading}
                >
                  <LinearGradient colors={['#7C2D12', '#EA580C']} style={styles.confirmBtnGradient}>
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
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
              Your train ticket on{' '}
              <Text style={{ fontWeight: 'bold' }}>{selected?.name}</Text> is confirmed!
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => { setSuccessModal(false); navigation.navigate('MyBookings'); }}
            >
              <LinearGradient colors={['#7C2D12', '#EA580C']} style={styles.confirmBtnGradient}>
                <Text style={styles.confirmBtnText}>View Booking</Text>
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
  trainCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  trainHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14,
  },
  trainName: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  trainNumber: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  ratingBox: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  trainBody: { padding: 16 },
  routeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  routePoint: {},
  routeTime: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  routeCity: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  routeCenter: { alignItems: 'center', flex: 1 },
  duration: { fontSize: 11, color: COLORS.gray, marginBottom: 4 },
  routeLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EA580C' },
  routeDash: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  daysRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: 12,
  },
  daysText: { fontSize: 12, color: COLORS.gray },
  classesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  classTag: {
    backgroundColor: '#FFF7ED', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center',
  },
  classType: { fontSize: 12, fontWeight: 'bold', color: '#EA580C' },
  classPrice: { fontSize: 13, fontWeight: '700', color: COLORS.black, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.black },
  modalSub: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.black, marginBottom: 10 },
  classSelectRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  classSelectCard: {
    borderWidth: 1.5, borderColor: COLORS.lightGray,
    borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 80,
  },
  classSelectActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  classSelectType: { fontSize: 14, fontWeight: 'bold', color: COLORS.black },
  classSelectPrice: { fontSize: 13, fontWeight: '700', color: COLORS.gray, marginTop: 4 },
  classSelectSeats: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
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
    alignItems: 'center', backgroundColor: '#FFF7ED',
    borderRadius: 12, padding: 14, marginBottom: 20,
  },
  totalLabel: { fontSize: 13, color: COLORS.gray },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#EA580C' },
  confirmBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
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