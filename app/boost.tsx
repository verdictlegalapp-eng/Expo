import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function BoostDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile Boost</Text>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.navy} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <LinearGradient
            colors={Colors.brandGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.statsGradient}
          >
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2.4k</Text>
                <Text style={styles.statLabel}>Reach</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>182</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+12%</Text>
                <Text style={styles.statLabel}>Growth</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Boosts</Text>
          
          <TouchableOpacity style={styles.boostCard}>
            <View style={styles.boostIconContainer}>
              <Ionicons name="rocket" size={24} color={Colors.electricBlue} />
            </View>
            <View style={styles.boostInfo}>
              <Text style={styles.boostName}>Discovery Priority</Text>
              <Text style={styles.boostDesc}>Appear 5x more often in swiping</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.boostCard}>
            <View style={[styles.boostIconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="flash" size={24} color={Colors.success} />
            </View>
            <View style={styles.boostInfo}>
              <Text style={styles.boostName}>Top of Search</Text>
              <Text style={styles.boostDesc}>Be the first seen in your category</Text>
            </View>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeText}>ADD</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.premiumBanner}>
          <LinearGradient
            colors={Colors.brandGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.premiumGradient}
          >
            <MaterialCommunityIcons name="crown" size={40} color="white" style={styles.crownIcon} />
            <Text style={styles.premiumTitle}>Verdict Platinum</Text>
            <Text style={styles.premiumSub}>Unlock unlimited reach and priority intake processing.</Text>
            <TouchableOpacity style={styles.premiumBtn}>
              <Text style={styles.premiumBtnText}>Manage Subscription</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: Colors.text,
  },
  infoButton: {
    padding: 4,
  },
  statsCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  statsGradient: {
    padding: 24,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 16,
    marginLeft: 8,
  },
  boostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.slate,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  boostIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  boostInfo: {
    flex: 1,
  },
  boostName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  boostDesc: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.subtext,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  activeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: Colors.success,
  },
  upgradeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navy,
    borderRadius: 12,
  },
  upgradeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  premiumBanner: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 32,
    alignItems: 'center',
  },
  crownIcon: {
    marginBottom: 16,
  },
  premiumTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  premiumSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  premiumBtn: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  premiumBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
