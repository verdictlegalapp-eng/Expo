import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MOCK_CHATS = [
  {
    id: "1",
    lawyerName: "Eleanor Sterling",
    lastMessage: "I've reviewed your brief. Are you available for a quick call tomorrow at 2 PM?",
    time: "10:42 AM",
    unread: true,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "2",
    lawyerName: "David Chen",
    lastMessage: "We have received your consultation request. Please fill out the attached intake form.",
    time: "Yesterday",
    unread: false,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150"
  }
];

export default function Messages() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A365D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.chatRow}
            onPress={() => router.push(`/chat/${item.id}` as any)}
          >
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.lawyerName}>{item.lawyerName}</Text>
                <Text style={[styles.time, item.unread && styles.timeUnread]}>{item.time}</Text>
              </View>
              <Text style={[styles.lastMessage, item.unread && styles.lastMessageUnread]} numberOfLines={2}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#0F172A',
  },
  chatRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  lawyerName: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
  time: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  timeUnread: {
    color: '#273951',
    fontFamily: 'Outfit_600SemiBold',
  },
  lastMessage: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  lastMessageUnread: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#E2E8F0',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#273951',
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#1F2937',
    marginLeft: 92,
  },
});
