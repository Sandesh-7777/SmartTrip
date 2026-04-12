import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Modal,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { mockHotels, createBooking } from '../../services/bookingService';

export default function HotelsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  const [bookingModal, setBookingModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = mockHotels.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  const discountedPrice = selected
    ? Math.round(selected.price * (1 - selected.discount / 100))
    : 0;

  const handleBook = async () => {
    if (!checkIn || !checkOut) {
      Alert.alert('Missing Info', 'Please enter check-in and check-out dates.');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      await createBooking(user.uid, {
        type: 'hotel',
        item_id: selected.id,
        item_name: selected.name,
        from_location: selected.location,
        to_location: selected.location,
        date: checkIn,
        travelers: guests,
        total_price: discountedPrice * rooms,
        status: 'confirmed',
        details: { checkIn, checkOut, rooms, guests, hotelType: selected.type },
      });
      setBookingModal(false);
      setSuccessModal(true);
    } catch (err) {
      console.log('Hotel booking error:', err);
      Alert.alert('Error', 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHotel = ({ item }) => (
    <TouchableOpacity
      style={styles.hotelCard}
      onPress={() => { setSelected(item); setBookingModal(true); }}
      activeOpacity={0.9}
    >
      <LinearGradient colors={['#1D4ED8', '#7C3AED']} style={styles.hotelImage}>
        <Text style={styles.hotelEmoji}>{item.image}</Text>
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
      </LinearGradient>
      <View style={styles.hotelInfo}>
        <View style={styles.hotelTop}>
          <Text style={styles.hotelName}>{item.name}</Text>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        </View>
        <View style={styles.hotelMeta}>
          <Ionicons name="location-outline" size={13} color={COLORS.gray} />
          <Text style={styles.hotelLocation}>{item.location}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
        <View style={styles.amenitiesRow}>
          {item.amenities.slice(0, 3).map((a, i) => (
            <View key={i} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>
        <View style={styles.hotelFooter}>
          <View>
            {item.discount > 0 && (
              <Text style={styles.originalPrice}>₹{item.price}/night</Text>
            )}
            <Text style={styles.hotelPrice}>
              ₹{Math.round(item.price * (1 - item.discount / 100))}/night
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => { setSelected(item); setBookingModal(true); }}
          >
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hotels</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hotels or destinations..."
          placeholderTextColor={COLORS.gray}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderHotel}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🏨</Text>
            <Text style={styles.emptyText}>No hotels found</Text>
          </View>
        }
      />

      {/* Booking Modal */}
      {selected && (
        <Modal visible={bookingModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selected.name}</Text>
                <TouchableOpacity onPress={() => setBookingModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalPriceRow}>
                  <Text style={styles.modalPrice}>
                    ₹{discountedPrice}<Text style={styles.perNight}>/night</Text>
                  </Text>
                  <View style={styles.ratingBox}>
                    <Text style={styles.ratingText}>⭐ {selected.rating}</Text>
                  </View>
                </View>

                <Text style={styles.modalLabel}>Check-in Date</Text>
                <View style={styles.modalInput}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
                  <TextInput
                    style={styles.modalInputText}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={COLORS.gray}
                    value={checkIn}
                    onChangeText={setCheckIn}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <Text style={styles.modalLabel}>Check-out Date</Text>
                <View style={styles.modalInput}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
                  <TextInput
                    style={styles.modalInputText}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={COLORS.gray}
                    value={checkOut}
                    onChangeText={setCheckOut}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={styles.modalRow}>
                  <View style={styles.modalHalf}>
                    <Text style={styles.modalLabel}>Rooms</Text>
                    <View style={styles.counterBox}>
                      <TouchableOpacity
                        style={styles.counterBtn}
                        onPress={() => setRooms(Math.max(1, rooms - 1))}
                      >
                        <Ionicons name="remove" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                      <Text style={styles.counterVal}>{rooms}</Text>
                      <TouchableOpacity
                        style={styles.counterBtn}
                        onPress={() => setRooms(rooms + 1)}
                      >
                        <Ionicons name="add" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.modalHalf}>
                    <Text style={styles.modalLabel}>Guests</Text>
                    <View style={styles.counterBox}>
                      <TouchableOpacity
                        style={styles.counterBtn}
                        onPress={() => setGuests(Math.max(1, guests - 1))}
                      >
                        <Ionicons name="remove" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                      <Text style={styles.counterVal}>{guests}</Text>
                      <TouchableOpacity
                        style={styles.counterBtn}
                        onPress={() => setGuests(guests + 1)}
                      >
                        <Ionicons name="add" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Total (per night × {rooms} room)</Text>
                  <Text style={styles.totalValue}>₹{(discountedPrice * rooms).toLocaleString()}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
                  onPress={handleBook}
                  disabled={loading}
                >
                  <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.confirmBtnGradient}>
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
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSub}>
              Your stay at{' '}
              <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>
                {selected?.name}
              </Text>{' '}
              has been booked successfully.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => { setSuccessModal(false); navigation.navigate('MyBookings'); }}
            >
              <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.confirmBtnGradient}>
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
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 14,
    marginHorizontal: 20, marginVertical: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.black },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  hotelCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  hotelImage: { height: 130, alignItems: 'center', justifyContent: 'center' },
  hotelEmoji: { fontSize: 52 },
  discountBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#EF4444', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  discountText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  hotelInfo: { padding: 16 },
  hotelTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  hotelName: { fontSize: 15, fontWeight: 'bold', color: COLORS.black, flex: 1 },
  ratingBox: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  hotelMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  hotelLocation: { fontSize: 12, color: COLORS.gray, flex: 1 },
  typeBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  typeText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  amenitiesRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  amenityTag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  amenityText: { fontSize: 11, color: COLORS.gray },
  hotelFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderTopWidth: 1,
    borderTopColor: COLORS.lightGray, paddingTop: 12,
  },
  originalPrice: {
    fontSize: 12, color: COLORS.gray,
    textDecorationLine: 'line-through',
  },
  hotelPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
  },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.gray },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.black, flex: 1 },
  modalPriceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalPrice: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  perNight: { fontSize: 13, color: COLORS.gray, fontWeight: '400' },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.black, marginBottom: 8 },
  modalInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 16, gap: 10,
  },
  modalInputText: { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.black },
  modalRow: { flexDirection: 'row', gap: 12 },
  modalHalf: { flex: 1 },
  counterBox: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  counterBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  counterVal: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  totalBox: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: COLORS.primary + '10',
    borderRadius: 12, padding: 14, marginBottom: 20,
  },
  totalLabel: { fontSize: 13, color: COLORS.gray },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
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