import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
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
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(width * 1.5, { velocity: event.velocityX }, () => {
          runOnJS(onSwipeRight)();
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-width * 1.5, { velocity: event.velocityX }, () => {
          runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-8, 0, 8],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, width / 4], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  const handleManualRight = () => {
    translateX.value = withSpring(width * 1.5, { velocity: 10 }, () => {
      runOnJS(onSwipeRight)();
    });
  };

  const handleManualLeft = () => {
    translateX.value = withSpring(-width * 1.5, { velocity: -10 }, () => {
      runOnJS(onSwipeLeft)();
    });
  };

  const nopeOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, -width / 4], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <Animated.View style={[styles.card, animatedCardStyle]}>
      
      {/* The Swipable Area */}
      <GestureDetector gesture={panGesture}>
        <View style={StyleSheet.absoluteFill}>
          
          {/* Full Edge-to-Edge Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: lawyer.image }} style={styles.image} />
            
            {/* Transparent Gradient Over Image */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(15, 23, 42, 0.85)', 'rgba(15, 23, 42, 1)']}
              style={styles.textOverlay}
            />
          </View>

          {/* Action Stamps */}
          <Animated.View style={[styles.overlayLike, likeOpacity]}>
            <Text style={styles.overlayTextLike}>VERDICT</Text>
          </Animated.View>
          <Animated.View style={[styles.overlayNope, nopeOpacity]}>
            <Text style={styles.overlayTextNope}>PASS</Text>
          </Animated.View>

          {/* Floating Content Section */}
          <View style={[styles.contentContainer, { bottom: 80 }]}>
            <View style={styles.mainInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.name} numberOfLines={1}>{lawyer.name}</Text>
                <TouchableOpacity onPress={() => router.push(`/lawyer/${lawyer.id}`)} hitSlop={15}>
                  <Ionicons name="information-circle" size={26} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={styles.practice}>{lawyer.practice}</Text>
            </View>

            {/* Highlights Row */}
            <View style={styles.highlightsRow}>
              <LinearGradient
                colors={['#3B82F6', '#273951']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.highlightBadge}
              >
                <Ionicons name="location" size={12} color="#FFFFFF" />
                <Text style={styles.highlightText}>{lawyer.location}</Text>
              </LinearGradient>
              <View style={styles.expBadge}>
                <Ionicons name="ribbon" size={12} color="#3B82F6" />
                <Text style={styles.expText}>{lawyer.experience}</Text>
              </View>
              {lawyer.badges?.some(b => b.toLowerCase() === 'verified') ? (
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.verifiedBadge}
                >
                  <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </LinearGradient>
              ) : null}
            </View>

            {/* Bio Snippet */}
            <Text style={styles.bioExcerpt} numberOfLines={2}>
              {lawyer.bio || "Leading attorney dedicated to achieving the best possible results for clients with personalized legal strategies."}
            </Text>
          </View>
        </View>
      </GestureDetector>

      {/* Transparent Floating Action Buttons (Outside GestureDetector to fix clicks) */}
      <View style={styles.floatingButtons} pointerEvents="box-none">
        <TouchableOpacity style={styles.dislikeBtn} onPress={handleManualLeft}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn} onPress={handleManualRight}>
          <LinearGradient
            colors={['#3B82F6', '#273951']}
            style={styles.gradientBtn}
          >
            <FontAwesome5 name="gavel" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: width * 0.94,
    height: height * 0.80, // Expanded height
    backgroundColor: '#000000',
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%', // High gradient for readability
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 30,
    gap: 12,
  },
  mainInfo: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: -0.8,
    flex: 1,
  },
  practice: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#CBD5E1',
  },
  highlightsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 6,
  },
  highlightText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Transparent white
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  expText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 6,
  },
  verifiedBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  bioExcerpt: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 8,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 44,
    zIndex: 100,
  },
  dislikeBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  likeBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayLike: {
    position: 'absolute',
    top: 60,
    left: 40,
    borderWidth: 4,
    borderColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    transform: [{ rotate: '-15deg' }],
    zIndex: 10,
  },
  overlayTextLike: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 30,
    color: '#3B82F6',
    letterSpacing: 2,
  },
  overlayNope: {
    position: 'absolute',
    top: 60,
    right: 40,
    borderWidth: 4,
    borderColor: '#94A3B8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    transform: [{ rotate: '15deg' }],
    zIndex: 10,
  },
  overlayTextNope: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 30,
    color: '#94A3B8',
    letterSpacing: 2,
  },
});
