import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useUser } from '../context/UserContext';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function FloatingGlassNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { userRole } = useUser();

  // Unified role detection from global context
  const isAttorney = userRole === 'attorney';

  const navItems = [
    { id: 'swipe', label: 'Swipe', icon: 'flame-outline', activeIcon: 'flame', path: '/discovery' },
    { id: 'explore', label: 'Explore', icon: 'compass-outline', activeIcon: 'compass', path: '/explore' },
    isAttorney 
      ? { id: 'boost', label: 'Boost', icon: 'flash-outline', activeIcon: 'flash', path: '/boost' }
      : { id: 'likes', label: 'Likes', icon: 'heart-outline', activeIcon: 'heart', path: '/likes' },
    { id: 'chat', label: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', path: '/messages' },
    { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', path: isAttorney ? '/attorney-profile' : '/client-profile' },
  ];

  return (
    <View style={styles.navWrapper}>
      <View style={styles.glassNav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/discovery' && pathname === '/');
          
          return (
            <TouchableOpacity 
              key={item.id}
              style={isActive ? styles.navItemActive : styles.navItem} 
              onPress={() => router.replace(item.path as any)}
            >
              {isActive ? (
                <View style={styles.activeBubble}>
                  <Ionicons name={item.activeIcon as any} size={24} color={Colors.electricBlue} />
                  <Text style={styles.navLabelActive}>{item.label}</Text>
                </View>
              ) : (
                <View style={styles.inactiveItem}>
                  <Ionicons name={item.icon as any} size={22} color="#94A3B8" />
                  <Text style={styles.navLabel}>{item.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  glassNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 40,
    height: 76,
    width: '100%',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    flex: 1.6, // Give more room for the expanded bubble
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activeBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.electricBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  navLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 10,
    color: '#94A3B8',
  },
  navLabelActive: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: Colors.electricBlue,
  },
});
