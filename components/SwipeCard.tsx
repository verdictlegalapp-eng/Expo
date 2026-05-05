import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

export interface Lawyer {
  id: string;
  userId?: string;
  name: string;
  practice: string;
  experience: string;
  location: string;
  bio: string;
  badges: string[];
  image: string;
  isVerified?: boolean;
}

interface SwipeCardProps {
  lawyer: Lawyer;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeCard({ lawyer, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const router = useRouter();

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const springConfig = { velocity: event.velocityX, damping: 15, stiffness: 120, mass: 0.8 };
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(width * 1.5, springConfig, () => {
          runOnJS(onSwipeRight)();
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-width * 1.5, springConfig, () => {
          runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0, springConfig);
        translateY.value = withSpring(0, springConfig);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-8, 0, 8],
      Extrapolation.CLAMP
    );
    
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, width / 2],
      [1, 0.95],
      Extrapolation.CLAMP
    );

    const topRadius = interpolate(
      Math.abs(translateX.value),
      [0, width / 4],
      [0, 40],
      Extrapolation.CLAMP
    );

    return {
      borderTopLeftRadius: topRadius,
      borderTopRightRadius: topRadius,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { translateY: -(height * 0.88) / 2 },
        { rotate: `${rotate}deg` },
        { translateY: (height * 0.88) / 2 },
        { scale },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, width / 4], [0, 0.68], Extrapolation.CLAMP);
    return { opacity };
  });

  const nopeOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, -width / 4], [0, 0.68], Extrapolation.CLAMP);
    return { opacity };
  });

  const leftBtnStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, width / 4], [1, 0], Extrapolation.CLAMP);
    const scale = interpolate(translateX.value, [0, -width / 4], [1, 1.2], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const rightBtnStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [-width / 4, 0], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(translateX.value, [0, width / 4], [1, 1.2], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const handleManualRight = () => {
    translateX.value = withSpring(width * 1.5, { velocity: 10, damping: 15, stiffness: 120, mass: 0.8 }, () => {
      runOnJS(onSwipeRight)();
    });
  };

  const handleManualLeft = () => {
    translateX.value = withSpring(-width * 1.5, { velocity: -10, damping: 15, stiffness: 120, mass: 0.8 }, () => {
      runOnJS(onSwipeLeft)();
    });
  };

  return (
    <Animated.View style={[styles.card, animatedCardStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: lawyer.image }} style={styles.image} />
            
            {/* Top Gradient for Status Bar Visibility */}
            <LinearGradient
              colors={['rgba(2, 6, 23, 0.8)', 'rgba(2, 6, 23, 0.3)', 'transparent']}
              style={styles.topGradient}
            />

            {/* Floating Verified Badge */}
            {lawyer.isVerified && (
              <View style={styles.floatingBadge}>
                <LinearGradient
                  colors={Colors.goldGradient}
                  style={styles.badgeGradient}
                >
                  <Ionicons name="shield-checkmark" size={14} color={Colors.deepBlue} />
                  <Text style={styles.badgeText}>VERIFIED</Text>
                </LinearGradient>
              </View>
            )}

            {/* Bottom Content Gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(2, 6, 23, 0.2)', 'rgba(2, 6, 23, 0.85)', 'rgba(2, 6, 23, 1)']}
              style={styles.textOverlay}
            />
          </View>

          <Animated.View style={[styles.overlayLike, likeOpacity]} pointerEvents="none">
            <FontAwesome5 name="gavel" size={120} color={Colors.gold} />
          </Animated.View>
          <Animated.View style={[styles.overlayNope, nopeOpacity]} pointerEvents="none">
            <Ionicons name="close" size={140} color="rgba(255,255,255,1)" />
          </Animated.View>

          <View style={styles.contentContainer}>
            <View style={styles.infoWrapper}>
              <View style={styles.nameHeader}>
                <Text style={styles.name} numberOfLines={1}>{lawyer.name}</Text>
                <TouchableOpacity onPress={() => router.push(`/lawyer/${lawyer.id}`)} style={styles.infoCircle}>
                  <Ionicons name="information" size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.practice}>{lawyer.practice}</Text>

              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Ionicons name="location-sharp" size={12} color={Colors.gold} />
                  <Text style={styles.tagText}>{lawyer.location.split(',')[0]}</Text>
                </View>
                <View style={styles.tag}>
                  <Ionicons name="briefcase-sharp" size={12} color={Colors.gold} />
                  <Text style={styles.tagText}>{lawyer.experience || 'Experienced'}</Text>
                </View>
                {lawyer.badges?.includes('verified') && (
                  <View style={[styles.tag, { borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                    <Text style={[styles.tagText, { color: '#10B981' }]}>Verified</Text>
                  </View>
                )}
              </View>

              <Text style={styles.bio} numberOfLines={2}>
                {lawyer.bio || "Leading attorney dedicated to providing exceptional legal results through strategic advocacy."}
              </Text>
            </View>
          </View>
        </View>
      </GestureDetector>

      <View style={styles.floatingButtons} pointerEvents="box-none">
        <Animated.View style={leftBtnStyle}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleManualLeft}>
            <Ionicons name="close" size={32} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={rightBtnStyle}>
          <TouchableOpacity style={styles.mainActionBtn} onPress={handleManualRight}>
            <LinearGradient colors={Colors.goldGradient} style={styles.mainActionGradient}>
              <FontAwesome5 name="gavel" size={26} color={Colors.deepBlue} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { 
    position: 'absolute', 
    width: width, 
    height: height * 0.88, 
    backgroundColor: '#020617',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  imageContainer: { flex: 1 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },
  textOverlay: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    bottom: 0, 
    height: '80%' 
  },
  floatingBadge: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: Colors.deepBlue,
    letterSpacing: 0.5,
  },
  contentContainer: { 
    position: 'absolute', 
    bottom: 185, 
    left: 0, 
    right: 0, 
    paddingHorizontal: 24,
    zIndex: 2,
  },
  infoWrapper: {
    gap: 8,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 34, 
    color: Colors.white, 
    flex: 1,
    letterSpacing: -0.5
  },
  infoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  practice: { 
    fontFamily: 'Outfit_600SemiBold', 
    fontSize: 18, 
    color: Colors.gold,
    marginTop: -2,
  },
  tagsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 8, 
    marginTop: 8 
  },
  tag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    gap: 6, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    backgroundColor: 'rgba(255,255,255,0.08)' 
  },
  tagText: { 
    fontFamily: 'Outfit_700Bold', 
    fontSize: 12, 
    color: Colors.white 
  },
  bio: { 
    fontFamily: 'Outfit_400Regular', 
    fontSize: 15, 
    color: 'rgba(255,255,255,0.5)', 
    lineHeight: 22, 
    marginTop: 8 
  },
  floatingButtons: { 
    position: 'absolute', 
    bottom: 30, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 30, 
    zIndex: 100,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0
  },
  actionBtn: { 
    width: 68, 
    height: 68, 
    borderRadius: 34, 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  mainActionBtn: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10
  },
  mainActionGradient: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  overlayLike: { 
    position: 'absolute', 
    top: 100, 
    left: 40, 
    transform: [{ rotate: '-15deg' }], 
    zIndex: 10 
  },
  overlayNope: { 
    position: 'absolute', 
    top: 100, 
    right: 40, 
    transform: [{ rotate: '15deg' }], 
    zIndex: 10 
  },
});
