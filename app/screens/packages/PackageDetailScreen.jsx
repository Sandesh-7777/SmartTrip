import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { bookPackage } from '../../services/packageService';

const formatDate = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export default function PackageDetailScreen({ navigation, route }) {
  const { package: pkg } = route.params;
  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const total = pkg.price * travelers;
  const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);

  const handleBook = async () => {
    if (!startDate) {
      Alert.alert('Missing Info', 'Please select a start date.');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      await bookPackage(user.uid, {
        package_id: pkg.id,
        package_name: pkg.name,
        destination: pkg.destination,
        start_date: startDate,
        travelers,
        total_price: total,
        status: 'confirmed',
        details: { duration: pkg.duration, provider: pkg.provider, category: pkg.category },
      });
      setBookingModal(false);
      setSuccessModal(true);
    } catch (err) {
      console.log('Package booking error:', err);
      Alert.alert('Error', 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#1D4ED8', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerEmoji}>{pkg.emoji}</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* Package Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoTop}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{pkg.tag}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>⭐ {pkg.rating}</Text>
            </View>
          </View>
          <Text style={styles.packageName}>{pkg.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.gray} />
              <Text style={styles.metaText}>{pkg.destination}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.gray} />
              <Text style={styles.metaText}>{pkg.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star-outline" size={14} color={COLORS.gray} />
              <Text style={styles.metaText}>{pkg.reviews} reviews</Text>
            </View>
          </View>
          <View style={styles.providerRow}>
            <Text style={styles.providerLabel}>Provided by</Text>
            <Text style={styles.providerName}>{pkg.provider}</Text>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <View>
            <Text style={styles.originalPrice}>₹{pkg.originalPrice.toLocaleString()}</Text>
            <Text style={styles.price}>₹{pkg.price.toLocaleString()}</Text>
            <Text style={styles.perPerson}>per person</Text>
          </View>
          <View style={styles.discountCircle}>
            <Text style={styles.discountText}>{discount}%</Text>
            <Text style={styles.discountOff}>OFF</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {['overview', 'itinerary', 'includes'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.highlightsGrid}>
              {pkg.highlights.map((h, i) => (
                <View key={i} style={styles.highlightCard}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'itinerary' && (
          <View style={styles.tabContent}>
            {pkg.itinerary.map((day, i) => (
              <View key={i} style={styles.dayCard}>
                <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.dayBadge}>
                  <Text style={styles.dayNum}>Day {day.day}</Text>
                </LinearGradient>
                <View style={styles.dayBody}>
                  <Text style={styles.dayTitle}>{day.title}</Text>
                  {day.activities.map((act, j) => (
                    <View key={j} style={styles.activityRow}>
                      <View style={styles.activityDot} />
                      <Text style={styles.activityText}>{act}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'includes' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Included</Text>
            {pkg.includes.map((item, i) => (
              <View key={i} style={styles.includeRow}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.includeText}>{item}</Text>
              </View>
            ))}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Not Included</Text>
            {pkg.excludes.map((item, i) => (
              <View key={i} style={styles.includeRow}>
                <Ionicons name="close-circle" size={18} color="#EF4444" />
                <Text style={styles.includeText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Now Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>₹{pkg.price.toLocaleString()}</Text>
          <Text style={styles.footerSub}>per person</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => setBookingModal(true)}
        >
          <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.bookBtnGradient}>
            <Text style={styles.bookBtnText}>Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <Modal visible={bookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Package</Text>
              <TouchableOpacity onPress={() => setBookingModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalPackageName}>{pkg.name}</Text>

            <Text style={styles.modalLabel}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.dateText, !startDate && { color: COLORS.gray }]}>
                {startDate || 'Select start date'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.modalLabel}>Travelers</Text>
            <View style={styles.counterBox}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setTravelers(Math.max(1, travelers - 1))}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.counterVal}>{travelers}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setTravelers(travelers + 1)}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{(pkg.price * travelers).toLocaleString()}</Text>
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
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => { setStartDate(formatDate(date)); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
        display="inline"
        themeVariant="light"
        accentColor={COLORS.primary}
      />

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Package Booked!</Text>
            <Text style={styles.successSub}>
              Your{' '}
              <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>{pkg.name}</Text>
              {' '}package has been confirmed!
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => { setSuccessModal(false); navigation.goBack(); }}
            >
              <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.confirmBtnGradient}>
                <Text style={styles.confirmBtnText}>Done</Text>
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
    paddingHorizontal: 20, paddingVertical: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerEmoji: { fontSize: 48 },
  body: { padding: 20 },
  infoCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  infoTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tagBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  tagText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  ratingBox: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  packageName: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.gray },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  providerLabel: { fontSize: 12, color: COLORS.gray },
  providerName: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  priceCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 16, marginBottom: 14, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  originalPrice: {
    fontSize: 14, color: COLORS.gray,
    textDecorationLine: 'line-through',
  },
  price: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
  perPerson: { fontSize: 12, color: COLORS.gray },
  discountCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#EF4444', alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  discountOff: { color: '#fff', fontSize: 11, fontWeight: '600' },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: 16, padding: 4, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  tabTextActive: { color: '#fff' },
  tabContent: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.black, marginBottom: 12 },
  highlightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  highlightCard: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  highlightText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  dayCard: {
    backgroundColor: COLORS.background, borderRadius: 14,
    marginBottom: 12, overflow: 'hidden',
  },
  dayBadge: { paddingHorizontal: 14, paddingVertical: 8 },
  dayNum: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  dayBody: { padding: 14 },
  dayTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.black, marginBottom: 10 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  activityDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  activityText: { fontSize: 13, color: COLORS.gray },
  includeRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 10,
  },
  includeText: { fontSize: 14, color: COLORS.black },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 12,
  },
  footerPrice: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  footerSub: { fontSize: 12, color: COLORS.gray },
  bookBtn: { borderRadius: 14, overflow: 'hidden' },
  bookBtnGradient: { paddingHorizontal: 32, paddingVertical: 14 },
  bookBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  modalPackageName: { fontSize: 14, color: COLORS.gray, marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.black, marginBottom: 8 },
  dateBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5,
    borderColor: COLORS.primary + '60', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    marginBottom: 16, gap: 10,
  },
  dateText: { fontSize: 14, color: COLORS.black, fontWeight: '600' },
  counterBox: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  counterBtn: {
    width: 32, height: 32, borderRadius: 16,
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
  totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
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