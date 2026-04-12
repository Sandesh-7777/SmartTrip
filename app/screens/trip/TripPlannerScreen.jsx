import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { createTrip } from '../../services/tripService';

const TRIP_TYPES = [
  { id: 1, label: 'Beach', icon: '🏖️' },
  { id: 2, label: 'Mountain', icon: '🏔️' },
  { id: 3, label: 'City', icon: '🌆' },
  { id: 4, label: 'Heritage', icon: '🏯' },
  { id: 5, label: 'Adventure', icon: '🧗' },
  { id: 6, label: 'Pilgrimage', icon: '🛕' },
];

const TRANSPORT_MODES = [
  { id: 1, label: 'Bus', icon: '🚌' },
  { id: 2, label: 'Train', icon: '🚂' },
  { id: 3, label: 'Flight', icon: '✈️' },
  { id: 4, label: 'Car', icon: '🚗' },
];

const formatDate = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export default function TripPlannerScreen({ navigation }) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDateObj, setStartDateObj] = useState(null);
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [tripType, setTripType] = useState(null);
  const [transport, setTransport] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModal, setSuccessModal] = useState(false);

  // Date picker states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartDateConfirm = (date) => {
    setStartDate(formatDate(date));
    setStartDateObj(date);
    setShowStartPicker(false);
    // Reset end date if it's before new start date
    if (endDate) {
      const [ed, em, ey] = endDate.split('/').map(Number);
      const end = new Date(ey, em - 1, ed);
      if (end <= date) setEndDate('');
    }
    setError('');
  };

  const handleEndDateConfirm = (date) => {
    setEndDate(formatDate(date));
    setShowEndPicker(false);
    setError('');
  };

  const handleCreate = async () => {
    if (!destination || !startDate || !endDate || !budget || !tripType || !transport) {
      setError('Please fill in all required fields.');
      return;
    }
    if (isNaN(Number(budget)) || Number(budget) <= 0) {
      setError('Please enter a valid budget amount.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      await createTrip(user.uid, {
        destination,
        start_date: startDate,
        end_date: endDate,
        budget: Number(budget),
        travelers: Number(travelers),
        trip_type: tripType,
        transport,
        notes,
        status: 'upcoming',
      });
      setSuccessModal(true);
    } catch (err) {
      console.log('Trip creation error:', err);
      setError('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan a Trip</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Destination */}
        <Text style={styles.sectionLabel}>Where are you going? *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="location-outline" size={18} color={COLORS.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter destination (e.g. Goa, Manali)"
            placeholderTextColor={COLORS.gray}
            value={destination}
            onChangeText={(t) => { setDestination(t); setError(''); }}
          />
        </View>

        {/* Date Row */}
        <View style={styles.row}>

          {/* Start Date */}
          <View style={styles.halfBox}>
            <Text style={styles.sectionLabel}>Start Date *</Text>
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                {startDate || 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* End Date */}
          <View style={styles.halfBox}>
            <Text style={styles.sectionLabel}>End Date *</Text>
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => {
                if (!startDate) {
                  setError('Please select a start date first.');
                  return;
                }
                setShowEndPicker(true);
              }}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                {endDate || 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Date Duration Badge */}
        {startDate && endDate ? (() => {
          const [sd, sm, sy] = startDate.split('/').map(Number);
          const [ed, em, ey] = endDate.split('/').map(Number);
          const diff = new Date(ey, em - 1, ed) - new Date(sy, sm - 1, sd);
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
          return (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} />
              <Text style={styles.durationText}>
                {days} Days / {days - 1} Nights
              </Text>
            </View>
          );
        })() : null}

        {/* Budget & Travelers */}
        <View style={styles.row}>
          <View style={styles.halfBox}>
            <Text style={styles.sectionLabel}>Budget (₹) *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="cash-outline" size={16} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 15000"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
                value={budget}
                onChangeText={(t) => { setBudget(t); setError(''); }}
              />
            </View>
          </View>
          <View style={styles.halfBox}>
            <Text style={styles.sectionLabel}>Travelers *</Text>
            <View style={styles.counterBox}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setTravelers(String(Math.max(1, Number(travelers) - 1)))}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{travelers}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setTravelers(String(Number(travelers) + 1))}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Trip Type */}
        <Text style={styles.sectionLabel}>Trip Type *</Text>
        <View style={styles.chipsGrid}>
          {TRIP_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.chip, tripType === type.label && styles.chipActive]}
              onPress={() => { setTripType(type.label); setError(''); }}
            >
              <Text style={styles.chipIcon}>{type.icon}</Text>
              <Text style={[styles.chipLabel, tripType === type.label && styles.chipLabelActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transport Mode */}
        <Text style={styles.sectionLabel}>Mode of Transport *</Text>
        <View style={styles.chipsRow}>
          {TRANSPORT_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.chip, transport === mode.label && styles.chipActive]}
              onPress={() => { setTransport(mode.label); setError(''); }}
            >
              <Text style={styles.chipIcon}>{mode.icon}</Text>
              <Text style={[styles.chipLabel, transport === mode.label && styles.chipLabelActive]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Text style={styles.sectionLabel}>Additional Notes</Text>
        <View style={[styles.inputBox, { alignItems: 'flex-start', paddingVertical: 4 }]}>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: 'top', paddingTop: 10 }]}
            placeholder="Any special requirements or preferences..."
            placeholderTextColor={COLORS.gray}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createBtn, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.createBtnGradient}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                  <Text style={styles.createBtnText}>Create Trip</Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Start Date Picker */}
      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="date"
        minimumDate={new Date()}
        onConfirm={handleStartDateConfirm}
        onCancel={() => setShowStartPicker(false)}
        display="inline"
        themeVariant="light"
        accentColor={COLORS.primary}
      />

      {/* End Date Picker */}
      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="date"
        minimumDate={startDateObj ? new Date(startDateObj.getTime() + 86400000) : new Date()}
        onConfirm={handleEndDateConfirm}
        onCancel={() => setShowEndPicker(false)}
        display="inline"
        themeVariant="light"
        accentColor={COLORS.primary}
      />

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Trip Created!</Text>
            <Text style={styles.modalSub}>
              Your trip to{' '}
              <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>
                {destination}
              </Text>{' '}
              has been planned successfully.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => { setSuccessModal(false); navigation.goBack(); }}
            >
              <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.modalBtnGradient}>
                <Text style={styles.modalBtnText}>View My Trips</Text>
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
  body: { padding: 20, paddingBottom: 60 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderWidth: 1,
    borderColor: '#FECACA', borderRadius: 10,
    padding: 12, marginBottom: 16, gap: 8,
  },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1 },
  sectionLabel: {
    fontSize: 13, fontWeight: '700',
    color: COLORS.black, marginBottom: 10, marginTop: 6,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 14,
    paddingHorizontal: 14, marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 13, fontSize: 14, color: COLORS.black },
  row: { flexDirection: 'row', gap: 12 },
  halfBox: { flex: 1 },
  dateBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1.5,
    borderColor: COLORS.primary + '60', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    marginBottom: 16, gap: 8,
  },
  dateText: { fontSize: 14, color: COLORS.black, fontWeight: '600' },
  datePlaceholder: { color: COLORS.gray, fontWeight: '400' },
  durationBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    gap: 6, marginBottom: 16, marginTop: -8,
  },
  durationText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  counterBox: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  counterBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  counterValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  chipsRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, gap: 6,
  },
  chipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  chipIcon: { fontSize: 16 },
  chipLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  chipLabelActive: { color: COLORS.primary },
  createBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 10 },
  createBtnGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 16, gap: 8,
  },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.white, borderRadius: 24,
    padding: 32, alignItems: 'center', marginHorizontal: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalEmoji: { fontSize: 52, marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.black, marginBottom: 10 },
  modalSub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  modalBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});