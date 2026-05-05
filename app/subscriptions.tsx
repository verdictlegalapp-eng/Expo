import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

// We'll use a strong orange brand color to match the image
const BRAND_ORANGE = '#F97316'; 

export default function Subscriptions() {
  const router = useRouter();
  const [activeTierId, setActiveTierId] = useState('plus');
  const [isAnnual, setIsAnnual] = useState(false);

  const TIERS = [
    {
      id: 'free',
      name: 'FREE PLAN',
      price: '$0 USD',
      period: isAnnual ? '/yr' : '/mo',
      description: 'Limited features and functionality',
      badge: null,
    },
    {
      id: 'plus',
      name: 'PLUS PLAN',
      price: isAnnual ? '$89.99 USD' : '$8.99 USD',
      period: isAnnual ? '/yr' : '/mo',
      description: 'AI features and functionality',
      badge: '50% OFF',
    },
    {
      id: 'gold',
      name: 'GOLD PLAN',
      price: isAnnual ? '$399.99 USD' : '$39.99 USD',
      period: isAnnual ? '/yr' : '/mo',
      description: 'Efficiency for professional results.',
      badge: 'MOST POPULAR',
    },
    {
      id: 'platinum',
      name: 'PLATINUM PLAN',
      price: isAnnual ? '$499.99 USD' : '$49.99 USD',
      period: isAnnual ? '/yr' : '/mo',
      description: 'Algorithmic priority for elite access.',
      badge: 'ELITE ACCESS',
    },
  ];


  const activeTier = TIERS.find((t) => t.id === activeTierId) || TIERS[1];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea}>
        
        {/* Header - simple back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Billing Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity onPress={() => setIsAnnual(false)}>
              <Text style={[styles.toggleText, !isAnnual && styles.toggleTextActive]}>Monthly</Text>
            </TouchableOpacity>
            <Switch
              value={isAnnual}
              onValueChange={setIsAnnual}
              trackColor={{ false: '#333', true: BRAND_ORANGE }}
              thumbColor="#FFF"
              ios_backgroundColor="#333"
              style={{ marginHorizontal: 12 }}
            />
            <TouchableOpacity onPress={() => setIsAnnual(true)}>
              <Text style={[styles.toggleText, isAnnual && styles.toggleTextActive]}>Annually</Text>
            </TouchableOpacity>
          </View>

          {/* Stacked Cards */}
          <View style={styles.cardsContainer}>
            {TIERS.map((tier) => {
              const isSelected = activeTierId === tier.id;
              
              return (
                <View key={tier.id} style={{ position: 'relative', marginBottom: 20 }}>
                  <TouchableOpacity
                    style={[
                      styles.card,
                      isSelected ? styles.cardSelected : styles.cardUnselected
                    ]}
                    onPress={() => setActiveTierId(tier.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.cardLeft}>
                        <Text style={styles.planName}>{tier.name}</Text>
                        <View style={styles.priceRow}>
                          <Text style={styles.price}>{tier.price}</Text>
                          <Text style={styles.priceMo}> /mo</Text>
                        </View>
                        <Text style={styles.description}>{tier.description}</Text>
                        <Text style={styles.learnMore}>Learn More</Text>
                      </View>
                      
                      <View style={styles.cardRight}>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={28} color={BRAND_ORANGE} />
                        ) : (
                          <Ionicons name="ellipse-outline" size={28} color="#444" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Floating Badge */}
                  {tier.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{tier.badge}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Footer Security */}
          <View style={styles.securitySection}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" />
            <Text style={styles.securityText}>Transaction is secured with 256bit.</Text>
          </View>

        </ScrollView>

        {/* Fixed Bottom CTA */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>Subscribe to {activeTier.name.split(' ')[0].toLowerCase()} ✨</Text>
          </TouchableOpacity>

          <View style={styles.legalLinks}>
            <TouchableOpacity>
              <Text style={styles.legalText}>Terms & Conditions</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}> • </Text>
            <TouchableOpacity>
              <Text style={styles.legalText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505', // Very dark, almost black
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  toggleText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#888',
  },
  toggleTextActive: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#FFF',
  },
  cardsContainer: {
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
  },
  cardUnselected: {
    backgroundColor: '#1C1C1E', // Dark grey
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  cardSelected: {
    backgroundColor: 'rgba(249, 115, 22, 0.08)', // Tinted orange
    borderWidth: 1,
    borderColor: BRAND_ORANGE,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFF',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: '#FFF',
  },
  priceMo: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#888',
  },
  description: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#AAA',
    marginBottom: 16,
  },
  learnMore: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: BRAND_ORANGE,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 32,
    backgroundColor: BRAND_ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFF',
  },
  securitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  securityText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: '#050505',
  },
  subscribeBtn: {
    backgroundColor: BRAND_ORANGE,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  subscribeBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#FFF',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: BRAND_ORANGE,
  },
  legalDot: {
    color: '#444',
    marginHorizontal: 8,
  },
});
