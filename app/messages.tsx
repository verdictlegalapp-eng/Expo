import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import { fetchConversations } from '../lib/chatApi';
import { fetchCurrentUser } from '../lib/authApi';
import { Colors } from '../constants/Colors';

export default function Messages() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
      const interval = setInterval(() => loadData(true), 5000);
      return () => clearInterval(interval);
    }, []),
  );

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      const me = await fetchCurrentUser().catch(() => null);
      setCurrentUser(me);

      const data = await fetchConversations();
      const meId = me?.id != null ? String(me.id) : null;
      const normalized = Array.isArray(data) ? data : [];
      const dedup = new Map<string, any>();
      for (const chat of normalized) {
        const id = chat?.id != null ? String(chat.id) : '';
        if (!id) continue;
        if (meId && id === meId) continue;
        if (!dedup.has(id)) dedup.set(id, chat);
      }
      setChats(Array.from(dedup.values()));
    } catch (e: any) {
      if (!silent) setError(e.message || 'Failed to load conversations');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const filteredChats = chats.filter(chat => 
    (chat.name || chat.lawyerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMatch = (item: any, index: number) => (
    <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).springify()}>
      <TouchableOpacity 
        style={styles.matchItem}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.matchAvatarContainer}>
          {item.image && item.image.startsWith('http') ? (
            <Image source={{ uri: item.image }} style={styles.matchAvatar} />
          ) : (
            <View style={[styles.matchAvatar, styles.initialsAvatar, { width: 64, height: 64, borderRadius: 32 }]}>
              <Text style={[styles.initialsText, { fontSize: 20 }]}>{getInitials(item.name || item.lawyerName || '')}</Text>
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>
        <Text style={styles.matchName} numberOfLines={1}>
          {(item.name || item.lawyerName || '').split(' ')[0]}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background - Reverted to Gold/Blue brand */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]} />
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)}>
            {currentUser?.image ? (
              <Image source={{ uri: currentUser.image }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.initialsAvatar]}>
                <Text style={styles.initialsText}>{getInitials(currentUser?.name || currentUser?.fullName || '')}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
          <TouchableOpacity style={styles.moreBtn} onPress={loadData}>
            <Ionicons name="refresh" size={22} color={Colors.gold} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
            <TextInput
              placeholder="Search Matches"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* New Matches Section */}
          <View style={styles.sectionHeader}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matchesScroll}>
              {chats.slice(0, 8).map(renderMatch)}
            </ScrollView>
          </View>

          <Text style={styles.chatsTitle}>Recent Chats</Text>

          {loading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.chatList}>
              {filteredChats.length > 0 ? (
                filteredChats.map((item, index) => (
                  <Animated.View key={item.id} entering={FadeInUp.delay(index * 100).springify()}>
                    <TouchableOpacity 
                      style={styles.chatCard}
                      onPress={() => router.push(`/chat/${item.id}`)}
                    >
                      <View style={styles.cardAvatarContainer}>
                        {item.image && item.image.startsWith('http') ? (
                          <Image source={{ uri: item.image }} style={styles.cardAvatar} />
                        ) : (
                          <View style={[styles.cardAvatar, styles.initialsAvatar]}>
                            <Text style={styles.initialsText}>{getInitials(item.name || item.lawyerName || '')}</Text>
                          </View>
                        )}
                        <View style={styles.cardOnlineDot} />
                      </View>
  
                      <View style={styles.cardInfo}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardName}>{item.name || item.lawyerName}</Text>
                          <Text style={styles.cardTime}>{item.time || 'now'}</Text>
                        </View>
                        <View style={styles.cardFooter}>
                          <Text style={styles.cardMessage} numberOfLines={1}>
                            {item.lastMessage || 'Tap to start a conversation'}
                          </Text>
                          {item.unread && (
                            <View style={styles.unreadBadge}>
                              <Text style={styles.unreadCount}>1</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={60} color="rgba(255,255,255,0.05)" />
                  <Text style={styles.emptyStateText}>No messages yet</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: Colors.gold },
  initialsAvatar: { backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center' },
  initialsText: { color: Colors.gold, fontFamily: 'Outfit_700Bold', fontSize: 16 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: Colors.white },
  moreBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  searchContainer: { paddingHorizontal: 20, marginTop: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: { flex: 1, marginLeft: 10, color: Colors.white, fontFamily: 'Outfit_400Regular', fontSize: 16 },
  scrollContent: { paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20 },
  matchesScroll: { flex: 1 },
  matchItem: { alignItems: 'center', marginRight: 18, width: 64 },
  matchAvatarContainer: { position: 'relative' },
  matchAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#020617' },
  matchName: { fontFamily: 'Outfit_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  chatsTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.white, marginLeft: 20, marginTop: 30, marginBottom: 15 },
  chatList: { paddingHorizontal: 20 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardAvatarContainer: { position: 'relative' },
  cardAvatar: { width: 60, height: 60, borderRadius: 30 },
  cardOnlineDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#020617' },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardName: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: Colors.white },
  cardTime: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMessage: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.4)', flex: 1, marginRight: 10 },
  unreadBadge: { backgroundColor: Colors.gold, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  unreadCount: { color: Colors.deepBlue, fontSize: 11, fontFamily: 'Outfit_700Bold' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyStateText: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.2)', marginTop: 10 },
});
