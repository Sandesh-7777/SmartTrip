import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { mockPackages, CATEGORIES } from '../../services/packageService';

export default function PackagesScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('trending');

  const filtered = mockPackages
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.destination.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || p.category === category;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'trending') return b.trending - a.trending;
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const discount = (pkg) =>
    Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);

  const renderPackage = ({ item }) => (
    <TouchableOpacity
      style={styles.packageCard}
      onPress={() => navigation.navigate('PackageDetail', { package: item })}
      activeOpacity={0.9}
    >
      {/* Card Image */}
      <LinearGradient colors={['#1D4ED8', '#7C3AED']} style={styles.cardImage}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <View style={styles.cardBadges}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount(item)}% OFF</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.packageName}>{item.name}</Text>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={COLORS.gray} />
            <Text style={styles.metaText}>{item.destination}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={COLORS.gray} />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={COLORS.gray} />
            <Text style={styles.metaText}>{item.reviews} reviews</Text>
          </View>
        </View>

        {/* Highlights */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsRow}>
          {item.highlights.map((h, i) => (
            <View key={i} style={styles.highlightTag}>
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Provider & Price */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.providerText}>by {item.provider}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>₹{item.originalPrice.toLocaleString()}</Text>
              <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
            </View>
            <Text style={styles.perPerson}>per person</Text>
          </View>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('PackageDetail', { package: item })}
          >
            <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.viewBtnGradient}>
              <Text style={styles.viewBtnText}>View Deal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.header}>
        <Text style={styles.headerTitle}>Travel Packages</Text>
        <Text style={styles.headerSub}>Curated deals from top providers</Text>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search packages or destinations..."
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

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Row */}
      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>{filtered.length} packages found</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'trending', label: '🔥 Trending' },
            { key: 'rating', label: '⭐ Top Rated' },
            { key: 'price_low', label: '💰 Price ↑' },
            { key: 'price_high', label: '💎 Price ↓' },
          ].map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortChip, sortBy === s.key && styles.sortChipActive]}
              onPress={() => setSortBy(s.key)}
            >
              <Text style={[styles.sortText, sortBy === s.key && styles.sortTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderPackage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No packages found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 24, paddingTop: 20,
    paddingBottom: 24, borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: '#BFDBFE', marginTop: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 14,
    marginHorizontal: 20, marginTop: 14, marginBottom: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.black },
  categoryScroll: { maxHeight: 44 },
  categoryContent: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.lightGray,
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  categoryTextActive: { color: '#fff' },
  sortRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10, gap: 10,
  },
  resultCount: { fontSize: 12, color: COLORS.gray, minWidth: 90 },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.lightGray,
    marginRight: 8,
  },
  sortChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  sortText: { fontSize: 12, fontWeight: '600', color: COLORS.gray },
  sortTextActive: { color: COLORS.primary },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  packageCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  cardImage: { height: 150, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 56 },
  cardBadges: {
    position: 'absolute', top: 12, left: 12,
    right: 12, flexDirection: 'row', justifyContent: 'space-between',
  },
  tagBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  discountText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardBody: { padding: 16 },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8,
  },
  packageName: {
    fontSize: 16, fontWeight: 'bold',
    color: COLORS.black, flex: 1, marginRight: 8,
  },
  ratingBox: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: COLORS.gray },
  highlightsRow: { marginBottom: 12 },
  highlightTag: {
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, marginRight: 6,
  },
  highlightText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', borderTopWidth: 1,
    borderTopColor: COLORS.lightGray, paddingTop: 12,
  },
  providerText: { fontSize: 11, color: COLORS.gray, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  originalPrice: {
    fontSize: 13, color: COLORS.gray,
    textDecorationLine: 'line-through',
  },
  price: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  perPerson: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  viewBtn: { borderRadius: 12, overflow: 'hidden' },
  viewBtnGradient: { paddingHorizontal: 20, paddingVertical: 12 },
  viewBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.gray },
});