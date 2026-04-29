import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { fetchNotifications } from '../lib/lawyerApi';
import { Colors } from '../constants/Colors';
import { format } from 'date-fns';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await fetchNotifications();
    setNotifications(data);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.notificationCard}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: item.type === 'individual' ? '#EFF6FF' : '#FFF7ED' }]}>
          <Ionicons 
            name={item.type === 'individual' ? 'person-outline' : 'megaphone-outline'} 
            size={20} 
            color={item.type === 'individual' ? '#3B82F6' : '#F59E0B'} 
          />
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.cardHeader}>
          <Text style={styles.typeText}>{item.type === 'individual' ? 'Direct Message' : 'Announcement'}</Text>
          <Text style={styles.dateText}>{format(new Date(item.createdAt), 'MMM d, h:mm a')}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Notifications',
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.navy} />
          </TouchableOpacity>
        ),
        headerTitleStyle: { fontFamily: 'Outfit_700Bold', fontSize: 20 },
        headerShadowVisible: false,
      }} />

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.electricBlue} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.electricBlue]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No Notifications Yet</Text>
              <Text style={styles.emptySubtitle}>We'll notify you when you have new messages or updates.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 10,
    color: '#94A3B8',
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  body: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
});
