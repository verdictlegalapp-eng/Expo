import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ─── Tier Data ────────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: 'platinum',
    title: 'Verdict Platinum',
    subtitle: 'The ultimate legal edge',
    price: '$49.99',
    period: '/month',
    icon: 'diamond' as const,
    badge: 'BEST VALUE',
    badgeColor: '#7C3AED',
    gradient: ['#1E1B4B', '#312E81', '#4C1D95'] as readonly [string, string, string],
    accentColor: '#A78BFA',
    features: [
      'Priority placement — shown first',
      'Message before matching',
      'See likes you sent (last 7 days)',
      'Stronger algorithmic visibility',
      'Everything in Gold',
    ],
    buttonLabel: 'Upgrade to Platinum',
    isCurrent: false,
  },
  {
    id: 'gold',
    title: 'Verdict Gold',
    subtitle: 'For serious legal professionals',
    price: '$39.99',
    period: '/month',
    icon: 'sparkles' as const,
    badge: 'POPULAR',
    badgeColor: '#B45309',
    gradient: ['#78350F', '#92400E', '#B45309'] as readonly [string, string, string],
    accentColor: '#FCD34D',
    features: [
      'See who already liked you',
      'Daily Top Picks',
      'Weekly Super Consultations',
      '1 Boost per month',
      'Everything in Plus',
    ],
    buttonLabel: 'Upgrade to Gold',
    isCurrent: false,
  },
  {
    id: 'plus',
    title: 'Verdict Plus',
    subtitle: 'Unlock your full potential',
    price: '$24.99',
    period: '/month',
    icon: 'flash' as const,
    badge: null,
    badgeColor: '#1D4ED8',
    gradient: ['#1D4ED8', '#2563EB', '#3B82F6'] as readonly [string, string, string],
    accentColor: '#BFDBFE',
    features: [
      'Unlimited likes',
      'Unlimited rewinds',
      'Change Jurisdictions (Passport)',
      'No ads',
      'Incognito mode',
    ],
    buttonLabel: 'Upgrade to Plus',
    isCurrent: false,
  },
  {
    id: 'basic',
    title: 'Verdict Basic',
    subtitle: 'Get started for free',
    price: 'Free',
    period: '',
    icon: 'person' as const,
    badge: 'CURRENT PLAN',
    badgeColor: '#059669',
    gradient: ['#F8FAFC', '#F1F5F9', '#E2E8F0'] as readonly [string, string, string],
    accentColor: '#475569',
    features: [
      'Standard profile creation',
      'Limited daily swiping',
      'Matching based on mutual likes',
      'Messaging on mutual matches',
    ],
    buttonLabel: 'Current Plan',
    isCurrent: true,
  },
];

// ─── Extra Item Data ──────────────────────────────────────────────────────────

const EXTRAS = [
  {
    section: 'Profile Boosts',
    sectionSubtitle: 'Be a top profile in your area for 30 minutes to get more matches.',
    items: [
      { name: '1 Boost', price: '$8.99', savings: null, icon: 'flash' as const, color: '#7C3AED' },
      { name: '5 Boosts', price: '$39.99', savings: 'Save 11%', icon: 'flash' as const, color: '#7C3AED' },
    ],
  },
  {
    section: 'Super Boost',
    sectionSubtitle: 'Extended high-traffic visibility during peak hours.',
    items: [
      { name: 'Super Boost', price: '$49.99', savings: null, icon: 'rocket' as const, color: '#EC4899' },
    ],
  },
  {
    section: 'Super Consultations',
    sectionSubtitle: 'Stand out before they even swipe — signal high interest instantly.',
    items: [
      { name: '3 Super Consults', price: '$11.99', savings: null, icon: 'star' as const, color: '#3B82F6' },
      { name: '15 Super Consults', price: '$49.99', savings: 'Save 20%', icon: 'star' as const, color: '#3B82F6' },
    ],
  },
];

// ─── Tier Card Component ──────────────────────────────────────────────────────

function TierCard({ tier }: { tier: typeof TIERS[0] }) {
  const isDark = tier.id !== 'basic';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const subTextColor = isDark ? 'rgba(255,255,255,0.65)' : '#64748B';
  const checkColor = tier.accentColor;

  return (
    <LinearGradient
      colors={tier.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.tierCard}
    >
      {/* Badge */}
      {tier.badge && (
        <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : tier.badgeColor + '22', borderColor: isDark ? 'rgba(255,255,255,0.3)' : tier.badgeColor }]}>
          <Text style={[styles.badgeText, { color: isDark ? '#FFFFFF' : tier.badgeColor }]}>{tier.badge}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.tierHeader}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
          <Ionicons name={tier.icon} size={26} color={isDark ? tier.accentColor : tier.accentColor} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.tierTitle, { color: textColor }]}>{tier.title}</Text>
          <Text style={[styles.tierSubtitle, { color: subTextColor }]}>{tier.subtitle}</Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={[styles.tierPrice, { color: isDark ? tier.accentColor : '#0F172A' }]}>{tier.price}</Text>
        {tier.period ? (
          <Text style={[styles.tierPeriod, { color: subTextColor }]}>{tier.period}</Text>
        ) : null}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]} />

      {/* Features */}
      <View style={styles.featuresBlock}>
        {tier.features.map((feature, idx) => (
          <View key={idx} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={17} color={checkColor} style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={[styles.featureText, { color: subTextColor.replace('0.65', '0.85') }]}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={[
          styles.tierButton,
          tier.isCurrent
            ? { backgroundColor: 'transparent', borderColor: isDark ? 'rgba(0,0,0,0.2)' : '#CBD5E1', borderWidth: 1.5 }
            : { backgroundColor: isDark ? '#FFFFFF' : '#0F172A' },
        ]}
        disabled={tier.isCurrent}
        activeOpacity={0.8}
      >
        {!tier.isCurrent && (
          <Ionicons name="arrow-up-circle" size={18} color={isDark ? '#0F172A' : '#FFFFFF'} style={{ marginRight: 8 }} />
        )}
        <Text
          style={[
            styles.tierButtonText,
            {
              color: tier.isCurrent
                ? (isDark ? 'rgba(255,255,255,0.5)' : '#94A3B8')
                : (isDark ? '#0F172A' : '#FFFFFF'),
            },
          ]}
        >
          {tier.isCurrent ? '✓  Current Plan' : tier.buttonLabel}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// ─── Extra Card Component ─────────────────────────────────────────────────────

function ExtraCard({ item }: { item: { name: string; price: string; savings: string | null; icon: keyof typeof Ionicons.glyphMap; color: string } }) {
  return (
    <View style={styles.extraCard}>
      <View style={[styles.extraIconBg, { backgroundColor: item.color + '18' }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.extraDetails}>
        <Text style={styles.extraName}>{item.name}</Text>
        <View style={styles.extraPriceRow}>
          <Text style={styles.extraPrice}>{item.price}</Text>
          {item.savings && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>{item.savings}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={[styles.extraButton, { backgroundColor: item.color }]} activeOpacity={0.8}>
        <Text style={styles.extraButtonText}>Buy</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Subscriptions() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'alacarte'>('subscriptions');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promote Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        {(['subscriptions', 'alacarte'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'subscriptions' ? 'Subscriptions' : 'Boosts & Extras';
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'subscriptions' && (
          <>
            <Text style={styles.sectionHeading}>Choose your plan</Text>
            <Text style={styles.sectionDesc}>Unlock premium features to grow your legal practice and stand out from the crowd.</Text>
            {TIERS.map((tier) => (
              <TierCard key={tier.id} tier={tier} />
            ))}
          </>
        )}

        {activeTab === 'alacarte' && (
          <>
            <Text style={styles.sectionHeading}>One-Time Add-Ons</Text>
            <Text style={styles.sectionDesc}>No subscription needed — buy only what you need, whenever you need it.</Text>
            {EXTRAS.map((group, gi) => (
              <View key={gi} style={styles.extraGroup}>
                <View style={styles.extraGroupHeader}>
                  <Text style={styles.extrasTitle}>{group.section}</Text>
                  <Text style={styles.extrasSubtitle}>{group.sectionSubtitle}</Text>
                </View>
                {group.items.map((item, ii) => (
                  <ExtraCard key={ii} item={item} />
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#273951',
  },
  tabText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#273951',
  },
  content: {
    flex: 1,
  },
  sectionHeading: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  sectionDesc: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 22,
    lineHeight: 20,
  },

  // ── Tier Card ──
  tierCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 14,
  },
  badgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  tierSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  tierPrice: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 34,
    letterSpacing: -1,
  },
  tierPeriod: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  featuresBlock: {
    marginBottom: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    flex: 1,
    lineHeight: 21,
  },
  tierButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 50,
  },
  tierButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
  },

  // ── Extras ──
  extraGroup: {
    marginBottom: 26,
  },
  extraGroupHeader: {
    marginBottom: 14,
  },
  extrasTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  extrasSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  extraCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  extraIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  extraDetails: {
    flex: 1,
  },
  extraName: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 4,
  },
  extraPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  extraPrice: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#273951',
  },
  savingsBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  savingsText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: '#059669',
  },
  extraButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
  },
  extraButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
