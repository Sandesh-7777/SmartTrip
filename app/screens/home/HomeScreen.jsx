import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants';
import { auth } from '../../constants/firebase';
import { logoutUser } from '../../services/authService';
import { mockPackages } from '../../services/packageService';
import { useState, useEffect } from 'react';
import { generateTripSuggestions } from '../../services/aiService';
import { ActivityIndicator } from 'react-native';

const categories = [
  { id: 1, icon: '🏨', label: 'Hotels', tab: 'Bookings', screen: 'Hotels' },
  { id: 2, icon: '🚌', label: 'Buses', tab: 'Bookings', screen: 'Buses' },
  { id: 3, icon: '🚂', label: 'Trains', tab: 'Bookings', screen: 'Trains' },
  { id: 4, icon: '📦', label: 'Packages', tab: 'Packages', screen: 'PackagesList' },
];

const popularDestinations = [
  { id: 1, name: 'Goa', tag: 'Beach Getaway', emoji: '🏖️', price: '₹4,999' },
  { id: 2, name: 'Manali', tag: 'Mountain Escape', emoji: '🏔️', price: '₹6,499' },
  { id: 3, name: 'Jaipur', tag: 'Heritage Tour', emoji: '🏯', price: '₹3,999' },
  { id: 4, name: 'Kerala', tag: 'Backwaters', emoji: '🌴', price: '₹5,499' },
];

const quickActions = [
  { id: 1, icon: '👥', label: 'Group Trip', screen: 'Groups' },
  { id: 2, icon: '💰', label: 'Expenses', screen: 'Groups' },
  { id: 3, icon: '🤖', label: 'AI Plan', screen: 'Trips' },
  { id: 4, icon: '💳', label: 'Payments', screen: 'Bookings' },
];

export default function HomeScreen({ navigation }) {
  const user = auth.currentUser;
  const firstName = user?.displayName?.split(' ')[0] || 'Traveler';
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);

  useEffect(() => {
    loadAISuggestions();
  }, []);

  const loadAISuggestions = async () => {
    try {
      const result = await generateTripSuggestions({
        budget: 10000,
        duration: '3-5',
        type: 'Leisure',
        season: 'Any',
        fromCity: 'Mumbai',
      });
      setAiSuggestions(result.suggestions || []);
    } catch (err) {
      console.log('AI suggestions error:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient
          colors={['#1D4ED8', '#2563EB', '#3B82F6']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good Morning 👋</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <TouchableOpacity
                style={styles.avatarBox}
                onPress={async () => {
                await logoutUser();
                }}
            >
                <Text style={styles.avatarText}>
                    {firstName.charAt(0).toUpperCase()}
                </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations, hotels..."
              placeholderTextColor="#94A3B8"
            />
          </View>
        </LinearGradient>

        <View style={styles.body}>

          {/* Categories */}
          <Text style={styles.sectionTitle}>What are you looking for?</Text>
          <View style={styles.categoriesRow}>
            {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => navigation.navigate(cat.tab, { screen: cat.screen })}
            >
              <View style={styles.categoryIconBox}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Trip Suggestions */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>AI Suggestions ✨</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Trips', { screen: 'TripPlanner' })}>
              <Text style={styles.seeAll}>Plan Trip</Text>
            </TouchableOpacity>
          </View>

          {suggestionsLoading ? (
            <View style={styles.suggestionsLoading}>
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={styles.suggestionsLoadingText}>AI finding best trips for you...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {(aiSuggestions.length > 0 ? aiSuggestions : popularDestinations).map((dest, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.destinationCard}
                  onPress={() => navigation.navigate('Trips', { screen: 'TripPlanner' })}
                >
                  <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.destinationGradient}>
                    <Text style={styles.destinationEmoji}>{dest.emoji || '🌍'}</Text>
                  </LinearGradient>
                  <View style={styles.destinationInfo}>
                    <Text style={styles.destinationName}>
                      {dest.destination || dest.name}
                    </Text>
                    <Text style={styles.destinationTag}>
                      {dest.tagline || dest.tag}
                    </Text>
                    <Text style={styles.destinationPrice}>
                      {dest.estimatedCost || dest.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {popularDestinations.map((dest) => (
              <TouchableOpacity key={dest.id} style={styles.destinationCard}>
                <LinearGradient
                  colors={['#1E40AF', '#3B82F6']}
                  style={styles.destinationGradient}
                >
                  <Text style={styles.destinationEmoji}>{dest.emoji}</Text>
                </LinearGradient>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{dest.name}</Text>
                  <Text style={styles.destinationTag}>{dest.tag}</Text>
                  <Text style={styles.destinationPrice}>From {dest.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Upcoming Trip Banner */}
          <LinearGradient
            colors={['#065F46', '#059669']}
            style={styles.tripBanner}
          >
            <View>
              <Text style={styles.tripBannerLabel}>Plan Your Next Trip</Text>
              <Text style={styles.tripBannerTitle}>Let AI Build Your{'\n'}Perfect Itinerary</Text>
            </View>
            <TouchableOpacity
            style={styles.tripBannerBtn}
            onPress={() => navigation.navigate('Trips', { screen: 'TripPlanner' })}
            >
              <Text style={styles.tripBannerBtnText}>Start →</Text>
            </TouchableOpacity>
            </LinearGradient>

          {/* Trending Packages */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Packages</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Packages')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {mockPackages.slice(0, 2).map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={styles.packageCard}
              onPress={() => navigation.navigate('Packages', { screen: 'PackageDetail', params: { package: pkg } })}
            >
              <LinearGradient colors={['#1D4ED8', '#7C3AED']} style={styles.packageImageBox}>
                <Text style={styles.packageEmoji}>{pkg.emoji}</Text>
              </LinearGradient>
              <View style={styles.packageInfo}>
                <Text style={styles.packageTag}>{pkg.tag}</Text>
                <Text style={styles.packageTitle}>{pkg.name}</Text>
                <Text style={styles.packageDuration}>{pkg.duration}</Text>
                <View style={styles.packageBottom}>
                  <Text style={styles.packagePrice}>₹{pkg.price.toLocaleString()}</Text>
                  <View style={styles.ratingBox}>
                    <Text style={styles.ratingText}>⭐ {pkg.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: '#BFDBFE',
    fontSize: 14,
  },
  userName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  categoryCard: {
    alignItems: 'center',
    width: '22%',
  },
  categoryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 26,
  },
  categoryLabel: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  quickActionCard: {
    width: '22%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    color: COLORS.black,
    fontWeight: '600',
    textAlign: 'center',
  },
  horizontalScroll: {
    marginBottom: 28,
  },
  destinationCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  destinationGradient: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationEmoji: {
    fontSize: 42,
  },
  destinationInfo: {
    padding: 12,
  },
  destinationName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  destinationTag: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  destinationPrice: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 6,
  },
  tripBanner: {
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  tripBannerLabel: {
    color: '#A7F3D0',
    fontSize: 12,
    marginBottom: 6,
  },
  tripBannerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  tripBannerBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tripBannerBtnText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14,
  },
  packageCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  packageImageBox: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageEmoji: {
    fontSize: 36,
  },
  packageInfo: {
    flex: 1,
    padding: 14,
  },
  packageTag: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  packageTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 2,
  },
  packageDuration: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  packageBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  ratingBox: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  suggestionsLoading: {
  flexDirection: 'row', alignItems: 'center',
  gap: 10, paddingVertical: 20,
  backgroundColor: COLORS.white, borderRadius: 14,
  paddingHorizontal: 16, marginBottom: 28,
  },
  suggestionsLoadingText: { fontSize: 13, color: COLORS.gray },
});