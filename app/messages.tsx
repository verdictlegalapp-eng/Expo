import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchConversations } from '../lib/chatApi';
import { fetchCurrentUser } from '../lib/authApi';
import { Colors } from '../constants/Colors';

export default function Messages() {
  const router = useRouter();
  const [chats, setChats] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadConversations();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, []),
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConversations();
      const me = await fetchCurrentUser().catch(() => null);
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
      setError(e.message || 'Failed to load conversations');
      console.error('Failed to load conversations:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity onPress={loadConversations} style={styles.refreshButton}>
            <Ionicons name="reload" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading your conversations...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={60} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadConversations}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.chatRow}
              onPress={() => router.push({
                pathname: `/chat/${item.id}`,
                params: { name: item.name || item.lawyerName }
              } as any)}
              disabled={!item?.id}
            >
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: item.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150' }} 
                  style={styles.avatar} 
                />
                {item.unread && <View style={styles.onlineBadge} />}
              </View>
              
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <View style={styles.nameRow}>
                    <Text style={styles.partnerName} numberOfLines={1}>{item.name || item.lawyerName}</Text>
                    {item.role && (
                      <View style={[styles.roleBadge, item.role === 'lawyer' ? styles.lawyerBadge : styles.clientBadge]}>
                        <Text style={styles.roleText}>{item.role === 'lawyer' ? 'Attorney' : 'Client'}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <View style={styles.messageRow}>
                  <Text style={[styles.lastMessage, item.unread && styles.lastMessageUnread]} numberOfLines={1}>
                    {item.lastMessage || 'Start a conversation'}
                  </Text>
                  {item.unread && (
                    <View style={styles.unreadCount}>
                      <Text style={styles.unreadText}>1</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={80} color="#E2E8F0" />
              <Text style={styles.emptyStateTitle}>No messages yet</Text>
              <Text style={styles.emptyStateSub}>Your conversations with legal experts will appear here.</Text>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Outfit_700Bold',
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '700',
  },
  refreshButton: {
    padding: 5,
  },
  list: {
    paddingBottom: 20,
  },
  chatRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
  },
  onlineBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    marginLeft: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  partnerName: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Outfit_700Bold',
    fontSize: 17,
    color: '#0F172A',
    fontWeight: '700',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
  },
  lawyerBadge: {
    backgroundColor: '#E0F2FE',
  },
  clientBadge: {
    backgroundColor: '#F1F5F9',
  },
  roleText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Outfit_600SemiBold',
    color: '#0369A1',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  time: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Outfit_400Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Outfit_400Regular',
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    marginRight: 10,
  },
  lastMessageUnread: {
    color: '#0F172A',
    fontWeight: '600',
  },
  unreadCount: {
    backgroundColor: '#2395DB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1D2433',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 20,
  },
  emptyStateSub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
});
