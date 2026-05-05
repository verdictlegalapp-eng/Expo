import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Colors based on the reference image
const BG_COLOR = '#0A0A0C'; // Very dark, almost black
const CARD_BG = '#151517'; // Dark grey for cards
const ICON_BG_GREY = '#222225'; // Darker grey for icon backgrounds
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#888888';
const BRAND_YELLOW = '#DCA83A'; // Yellow/Gold for buttons and icons
const ACTIVE_GREEN = '#2E8B57'; // Green for ACTIVE text
const ACTIVE_BG = 'rgba(46, 139, 87, 0.15)'; // Tinted green for ACTIVE badge

export default function BoostDashboard() {
  const router = useRouter();

  const handlePress = () => {
    Alert.alert('Coming Soon', 'Payment will release soon');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Spacer for top */}
          <View style={{ height: 20 }} />

          {/* Discovery Priority Card (Active) */}
          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(220, 168, 58, 0.1)' }]}>
              <MaterialCommunityIcons name="rocket" size={28} color={BRAND_YELLOW} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Discovery Priority</Text>
              <Text style={styles.cardSubtitle}>Appear 5x more often in{'\n'}swiping</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          </View>

          {/* Top of Search Card (Purchaseable) */}
          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: ICON_BG_GREY }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={28} color={TEXT_PRIMARY} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Top of Search</Text>
              <Text style={styles.cardSubtitle}>Be the first seen in your{'\n'}category</Text>
            </View>
            <TouchableOpacity style={styles.buyButton} onPress={handlePress}>
              <Text style={styles.buyButtonText}>$8.99</Text>
            </TouchableOpacity>
          </View>

          {/* A-La-Carte Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>A-La-Carte Packages</Text>
            
            {/* Small Pack */}
            <TouchableOpacity style={styles.packageCard} onPress={handlePress}>
              <View style={[styles.smallIconContainer, { backgroundColor: ICON_BG_GREY }]}>
                <MaterialCommunityIcons name="star" size={22} color={BRAND_YELLOW} />
              </View>
              <Text style={styles.packageLabel}>Small Pack Super Consults</Text>
              <Text style={styles.packagePrice}>$11.99</Text>
            </TouchableOpacity>

            {/* Large Pack */}
            <TouchableOpacity style={styles.packageCard} onPress={handlePress}>
              <View style={[styles.smallIconContainer, { backgroundColor: ICON_BG_GREY }]}>
                <MaterialCommunityIcons name="star" size={22} color={BRAND_YELLOW} />
              </View>
              <Text style={styles.packageLabel}>Large Pack Super Consults</Text>
              <View style={styles.priceColumn}>
                <Text style={styles.packagePrice}>$49.99</Text>
                <Text style={styles.savingsText}>SAVE 20%</Text>
              </View>
            </TouchableOpacity>

            {/* Super Boost */}
            <TouchableOpacity style={styles.packageCard} onPress={handlePress}>
              <View style={[styles.smallIconContainer, { backgroundColor: ICON_BG_GREY }]}>
                <MaterialCommunityIcons name="rocket" size={22} color={BRAND_YELLOW} />
              </View>
              <Text style={styles.packageLabel}>Super Boost (Extended)</Text>
              <Text style={styles.packagePrice}>$49.99</Text>
            </TouchableOpacity>

            {/* Mega Boost */}
            <TouchableOpacity style={styles.packageCard} onPress={handlePress}>
              <View style={[styles.smallIconContainer, { backgroundColor: ICON_BG_GREY }]}>
                <MaterialCommunityIcons name="rocket-launch" size={22} color={BRAND_YELLOW} />
              </View>
              <Text style={styles.packageLabel}>Mega Boost (Max Visibility)</Text>
              <Text style={styles.packagePrice}>$129.99</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BG_COLOR 
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // leave room for any bottom nav
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
  },
  iconContainer: { 
    width: 64, 
    height: 64, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  cardInfo: { 
    flex: 1 
  },
  cardTitle: { 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 18, 
    color: TEXT_PRIMARY, 
    marginBottom: 4 
  },
  cardSubtitle: { 
    fontFamily: 'Outfit_400Regular', 
    fontSize: 14, 
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  activeBadge: { 
    backgroundColor: ACTIVE_BG, 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(46, 139, 87, 0.3)',
  },
  activeText: { 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 12, 
    color: ACTIVE_GREEN 
  },
  buyButton: { 
    backgroundColor: BRAND_YELLOW, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 20,
  },
  buyButtonText: { 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 15, 
    color: '#000000' // Black text on yellow button
  },
  section: { 
    marginTop: 24,
  },
  sectionTitle: { 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 20, 
    color: TEXT_PRIMARY, 
    marginBottom: 20 
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  smallIconContainer: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  packageLabel: { 
    flex: 1, 
    fontFamily: 'Outfit_600SemiBold', 
    fontSize: 15, 
    color: TEXT_PRIMARY 
  },
  packagePrice: { 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 17, 
    color: TEXT_PRIMARY 
  },
  priceColumn: { 
    alignItems: 'flex-end' 
  },
  savingsText: { 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 10, 
    color: ACTIVE_GREEN, 
    marginTop: 4 
  },
});
