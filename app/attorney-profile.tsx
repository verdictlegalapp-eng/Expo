import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { fetchCurrentUser } from '../lib/authApi';

export default function AttorneyProfile() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<any>(null);

  React.useEffect(() => {
    fetchCurrentUser().then(setUserData).catch(console.error);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={Colors.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: userData?.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{userData?.name || 'Loading...'}</Text>
          <Text style={styles.practice}>{userData?.lawyerProfile?.practice || 'Attorney at Law'}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Accepting Clients</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>Active Leads</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>28</Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/boost')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="rocket" size={20} color={Colors.electricBlue} />
              </View>
              <Text style={styles.menuItemText}>Boost Profile & Analytics</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/messages')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#F8FAFC' }]}>
                <Ionicons name="chatbubbles" size={20} color={Colors.navy} />
              </View>
              <Text style={styles.menuItemText}>Messages & Intake</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                <FontAwesome5 name="chart-line" size={16} color={Colors.success} />
              </View>
              <Text style={styles.menuItemText}>Consultation History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF5F5' }]}>
                <Ionicons name="document-text" size={20} color={Colors.error} />
              </View>
              <Text style={styles.menuItemText}>Edit Public Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.border} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: Colors.text,
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.navy,
  },
  name: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 4,
  },
  practice: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  statusText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: Colors.success,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.slate,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.subtext,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.slate,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.electricBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  logoutBtnWrapper: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 48,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutGradient: {
    padding: 2,
  },
  logoutButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navy,
    borderRadius: 14,
  },
  logoutText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
