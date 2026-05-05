import React from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useUser } from '../context/UserContext';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const NavButton = ({ item, isActive, onPress }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const IconComponent = item.type === 'MCI' ? MaterialCommunityIcons : Ionicons;

  return (
    <Pressable
      style={isActive ? styles.navItemActive : styles.navItem}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.85, { damping: 12, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
    >
      <Animated.View style={animatedStyle}>
        {isActive ? (
          <LinearGradient
            colors={Colors.goldGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeBubble}
          >
            <IconComponent name={item.activeIcon as any} size={22} color={Colors.deepBlue} />
          </LinearGradient>
        ) : (
          <View style={styles.inactiveItem}>
            <IconComponent name={item.icon as any} size={22} color="rgba(255,255,255,0.4)" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default function FloatingGlassNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { userRole } = useUser();

  const isAttorney = userRole === 'attorney';

  const navItems = [
    ...(isAttorney ? [] : [{ id: 'swipe', label: 'Swipe', icon: 'gavel', activeIcon: 'gavel', path: '/discovery', type: 'MCI' }]),
    { id: 'explore', label: 'Explore', icon: 'compass-outline', activeIcon: 'compass', path: '/explore', type: 'Ionicons' },
    isAttorney 
      ? { id: 'license', label: 'License', icon: 'ribbon-outline', activeIcon: 'ribbon', path: '/license-verification', type: 'Ionicons' }
      : { id: 'likes', label: 'Likes', icon: 'heart-outline', activeIcon: 'heart', path: '/likes', type: 'Ionicons' },
    { id: 'chat', label: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', path: '/messages', type: 'Ionicons' },
    { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', path: isAttorney ? '/attorney-profile' : '/client-profile', type: 'Ionicons' },
  ];

  return (
    <View style={styles.navWrapper}>
      <View style={styles.glassNav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/discovery' && pathname === '/');
          
          return (
            <NavButton 
              key={item.id}
              item={item}
              isActive={isActive}
              onPress={() => router.replace(item.path as any)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1000,
  },
  glassNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 35,
    height: 70,
    width: '100%',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
