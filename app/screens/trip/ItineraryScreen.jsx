import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { generateItinerary } from '../../services/aiService';

const tripTypeIcons = {
  Beach: '🏖️', Mountain: '🏔️', City: '🌆',
  Heritage: '🏯', Adventure: '🧗', Pilgrimage: '🛕',
};

const transportIcons = {
  Bus: '🚌', Train: '🚂', Flight: '✈️', Car: '🚗',
};

export default function ItineraryScreen({ navigation, route }) {
  const { trip } = route.params;

  const getDays = () => {
    const [sd, sm, sy] = trip.start_date.split('/').map(Number);
    const [ed, em, ey] = trip.end_date.split('/').map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    const days = [];
    let current = new Date(start);
    let dayNum = 1;
    while (current <= end) {
      days.push({
        day: dayNum++,
        date: current.toLocaleDateString('en-IN', {
          weekday: 'short', day: 'numeric', month: 'short'
        }),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

const [aiDays, setAiDays] = useState(null);
const [aiLoading, setAiLoading] = useState(true);
const [aiError, setAiError] = useState(false);

useEffect(() => {
  loadAIItinerary();
}, []);

const loadAIItinerary = async () => {
  try {
    const generated = await generateItinerary(trip);
    setAiDays(generated);
  } catch (err) {
    console.log('AI itinerary error:', err);
    setAiError(true);
  } finally {
    setAiLoading(false);
  }
};

const days = getDays();
const itineraryDays = aiDays || days.map((d) => ({
  ...d,
  title: `Day ${d.day} Plan`,
  activities: [
    { time: 'Morning', icon: '🌅', activity: 'Check-in & Freshen up' },
    { time: 'Afternoon', icon: '☀️', activity: 'Explore local attractions' },
    { time: 'Evening', icon: '🌆', activity: 'Leisure & local dining' },
  ],
}));

  const summaryItems = [
    { icon: '👥', label: 'Travelers', value: trip.travelers },
    { icon: transportIcons[trip.transport] || '🚗', label: 'Transport', value: trip.transport },
    { icon: '💰', label: 'Budget', value: `₹${Number(trip.budget).toLocaleString()}` },
    { icon: '🏷️', label: 'Type', value: trip.trip_type },
  ];

  const budgetBreakdown = [
    { label: 'Transport', percent: 30, color: '#3B82F6' },
    { label: 'Accommodation', percent: 35, color: '#10B981' },
    { label: 'Food', percent: 20, color: '#F59E0B' },
    { label: 'Activities', percent: 15, color: '#8B5CF6' },
  ];

  const daySlots = [
    { time: 'Morning', icon: '🌅', activity: 'Check-in & Freshen up' },
    { time: 'Afternoon', icon: '☀️', activity: 'Explore local attractions' },
    { time: 'Evening', icon: '🌆', activity: 'Leisure & local dining' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#1D4ED8', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>
            {tripTypeIcons[trip.trip_type] || '🌍'}
          </Text>
          <Text style={styles.headerTitle}>{trip.destination}</Text>
          <Text style={styles.headerSub}>{trip.start_date} → {trip.end_date}</Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {summaryItems.map((item, i) => (
            <View key={i} style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>{item.icon}</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {trip.notes ? (
          <View style={styles.notesCard}>
            <View style={styles.notesTitleRow}>
              <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
              <Text style={styles.notesTitle}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{trip.notes}</Text>
          </View>
        ) : null}

        {/* Day-wise Itinerary */}
        <Text style={styles.sectionTitle}>Day-wise Itinerary</Text>

        {aiLoading ? (
          <View style={styles.aiLoadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.aiLoadingText}>🤖 AI is building your itinerary...</Text>
          </View>
        ) : aiError ? (
          <View style={styles.aiErrorBox}>
            <Text style={styles.aiErrorText}>
              ⚠️ Could not generate AI itinerary. Showing default plan.
            </Text>
          </View>
        ) : (
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>✨ AI Generated Itinerary</Text>
          </View>
        )}

        {itineraryDays.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.dayBadge}>
              <Text style={styles.dayNum}>Day {day.day}</Text>
              <Text style={styles.dayDate}>{day.date}</Text>
            </LinearGradient>
            <View style={styles.dayContent}>
              {day.title ? (
                <Text style={styles.dayTitle}>{day.title}</Text>
              ) : null}
              {(day.activities || []).map((slot, i) => (
                <View key={i} style={[
                  styles.activityRow,
                  i < (day.activities.length - 1) && styles.activityBorder
                ]}>
                  <Text style={styles.activityIcon}>{slot.icon || '📍'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTime}>{slot.time}</Text>
                    <Text style={styles.activityText}>{slot.activity}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Budget Breakdown */}
        <Text style={styles.sectionTitle}>Budget Breakdown</Text>
        <View style={styles.budgetCard}>
          {budgetBreakdown.map((item, i) => {
            const amount = Math.round((item.percent / 100) * trip.budget);
            return (
              <View key={i} style={styles.budgetRow}>
                <View style={styles.budgetLeft}>
                  <View style={[styles.budgetDot, { backgroundColor: item.color }]} />
                  <Text style={styles.budgetLabel}>{item.label}</Text>
                </View>
                <View style={styles.budgetRight}>
                  <View style={styles.budgetBarBg}>
                    <View style={[
                      styles.budgetBarFill,
                      { width: `${item.percent}%`, backgroundColor: item.color }
                    ]} />
                  </View>
                  <Text style={styles.budgetAmount}>₹{amount.toLocaleString()}</Text>
                </View>
              </View>
            );
          })}
          <View style={styles.budgetTotal}>
            <Text style={styles.budgetTotalLabel}>Total Budget</Text>
            <Text style={styles.budgetTotalValue}>
              ₹{Number(trip.budget).toLocaleString()}
            </Text>
          </View>
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
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerEmoji: { fontSize: 28, marginBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 12, color: '#BFDBFE', marginTop: 2 },
  body: { padding: 20, paddingBottom: 80 },
  summaryRow: {
    flexDirection: 'row', gap: 10,
    marginBottom: 20, flexWrap: 'wrap',
  },
  summaryCard: {
    flex: 1, minWidth: '22%',
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  summaryIcon: { fontSize: 22, marginBottom: 6 },
  summaryValue: {
    fontSize: 12, fontWeight: 'bold',
    color: COLORS.black, textAlign: 'center',
  },
  summaryLabel: { fontSize: 10, color: COLORS.gray, marginTop: 2 },
  notesCard: {
    backgroundColor: '#EFF6FF', borderRadius: 16,
    padding: 16, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: COLORS.primary,
  },
  notesTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: 8,
  },
  notesTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  notesText: { fontSize: 13, color: COLORS.black, lineHeight: 20 },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    color: COLORS.black, marginBottom: 14,
  },
  dayCard: {
    backgroundColor: COLORS.white, borderRadius: 18,
    marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  dayBadge: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  dayNum: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  dayDate: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  dayContent: { padding: 16 },
  activityRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, paddingVertical: 10,
  },
  activityBorder: {
    borderBottomWidth: 1, borderBottomColor: COLORS.lightGray,
  },
  activityIcon: { fontSize: 20, marginTop: 2 },
  activityTime: {
    fontSize: 11, color: COLORS.primary,
    fontWeight: '700', marginBottom: 2,
  },
  activityText: { fontSize: 13, color: COLORS.black },
  budgetCard: {
    backgroundColor: COLORS.white, borderRadius: 18,
    padding: 18, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  budgetRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  budgetLeft: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, width: 120,
  },
  budgetDot: { width: 10, height: 10, borderRadius: 5 },
  budgetLabel: { fontSize: 13, color: COLORS.black, fontWeight: '600' },
  budgetRight: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', gap: 10,
  },
  budgetBarBg: {
    flex: 1, height: 6,
    backgroundColor: COLORS.lightGray, borderRadius: 4,
  },
  budgetBarFill: { height: 6, borderRadius: 4 },
  budgetAmount: { fontSize: 12, color: COLORS.gray, width: 70, textAlign: 'right' },
  budgetTotal: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderTopWidth: 1,
    borderTopColor: COLORS.lightGray, paddingTop: 14, marginTop: 4,
  },
  budgetTotalLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.black },
  budgetTotalValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  aiLoadingBox: {
  alignItems: 'center', paddingVertical: 30,
  backgroundColor: COLORS.white, borderRadius: 18,
  marginBottom: 14, gap: 12,
},
aiLoadingText: { fontSize: 14, color: COLORS.gray, fontWeight: '600' },
aiErrorBox: {
  backgroundColor: '#FEF3C7', borderRadius: 12,
  padding: 14, marginBottom: 14,
},
aiErrorText: { fontSize: 13, color: '#92400E' },
aiBadge: {
  backgroundColor: COLORS.primary + '15',
  borderRadius: 20, paddingHorizontal: 14,
  paddingVertical: 6, alignSelf: 'flex-start',
  marginBottom: 14,
},
aiBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
dayTitle: {
  fontSize: 14, fontWeight: 'bold',
  color: COLORS.black, marginBottom: 10,
},
});