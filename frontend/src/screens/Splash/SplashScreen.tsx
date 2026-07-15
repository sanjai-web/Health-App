import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const { width, height } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

function HeartbeatIcon({ color }: { color: string }) {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80">
      <Circle cx={40} cy={40} r={38} fill={`${color}22`} />
      <Path
        d="M12 40 L20 40 L26 26 L34 54 L42 32 L48 46 L54 40 L68 40"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const dotsOpacity = useSharedValue(0);

  const [timerFinished, setTimerFinished] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Logo animation
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 700 }));
    logoScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 100 }));

    // Glow pulse
    glowScale.value = withDelay(800, withSequence(
      withTiming(1.3, { duration: 600 }),
      withTiming(1, { duration: 600 }),
      withTiming(1.2, { duration: 500 }),
      withTiming(1, { duration: 500 }),
    ));

    // Title
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(800, withSpring(0, { damping: 14 }));

    // Subtitle
    subtitleOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));

    // Dots
    dotsOpacity.value = withDelay(1600, withTiming(1, { duration: 400 }));

    // Timer for splash screen display duration (2.8s)
    const timer = setTimeout(() => {
      setTimerFinished(true);
    }, 2800);

    // Listen to Firebase authentication status loading
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoaded(true);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Perform routing decision once animation timer has passed AND firebase auth is resolved
  useEffect(() => {
    if (timerFinished && authLoaded) {
      if (user) {
        navigation.replace('Main');
      } else {
        navigation.replace('Onboarding');
      }
    }
  }, [timerFinished, authLoaded, user]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.4,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#0A0F1E', '#0D1B2A', '#0A0F1E']}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Background glows */}
      <Animated.View style={[styles.glowBlue, glowStyle]} />
      <Animated.View style={[styles.glowCyan, glowStyle]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <HeartbeatIcon color="#00D4FF" />
      </Animated.View>

      {/* Brand name */}
      <Animated.View style={titleStyle}>
        <Text style={styles.brand}>Fitcheck</Text>
        <Text style={styles.brandSub}>HEALTH MONITOR</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={subtitleStyle}>
        <Text style={styles.tagline}>Your personal health guardian</Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsRow, dotsStyle]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, { backgroundColor: i === 1 ? '#00D4FF' : 'rgba(0,212,255,0.4)' }]} />
        ))}
      </Animated.View>

      {/* Bottom label */}
      <Animated.View style={[styles.bottomLabel, subtitleStyle]}>
        <Text style={styles.versionText}>v1.0.0 · Powered by AI</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  glowBlue: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#3B82F6',
    top: height * 0.25,
    left: -60,
    opacity: 0.12,
  },
  glowCyan: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#00D4FF',
    top: height * 0.35,
    right: -40,
    opacity: 0.1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F1F5F9',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  brandSub: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00D4FF',
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  bottomLabel: {
    position: 'absolute',
    bottom: 48,
  },
  versionText: {
    fontSize: 11,
    color: '#334155',
    letterSpacing: 0.5,
  },
});
