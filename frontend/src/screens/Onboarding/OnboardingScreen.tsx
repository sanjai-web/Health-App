import React, { useRef, useState } from 'react';
import {
  View, Text, Dimensions, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect, Polyline } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { StatusBar } from 'expo-status-bar';
import { ONBOARDING_SCREENS } from '../../constants/mockData';

const { width, height } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

function SlideIcon({ id, color }: { id: number; color: string }) {
  if (id === 1) return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle cx={60} cy={60} r={55} fill={`${color}12`} stroke={color} strokeWidth={1.5} strokeDasharray="6,4" />
      <Circle cx={60} cy={60} r={38} fill={`${color}08`} />
      <Path d="M20 60 L32 60 L42 38 L54 82 L66 46 L76 68 L86 60 L100 60"
        stroke={color} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
  if (id === 2) return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle cx={60} cy={60} r={55} fill={`${color}12`} stroke={color} strokeWidth={1.5} strokeDasharray="6,4" />
      <Rect x={30} y={35} width={60} height={50} rx={10} fill={`${color}18`} stroke={color} strokeWidth={1.5} />
      <Circle cx={60} cy={50} r={8} fill={color} opacity={0.8} />
      <Path d="M45 70 L60 58 L75 70" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Circle cx={45} cy={76} r={4} fill={color} opacity={0.5} />
      <Circle cx={60} cy={76} r={4} fill={color} opacity={0.8} />
      <Circle cx={75} cy={76} r={4} fill={color} opacity={0.5} />
    </Svg>
  );
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle cx={60} cy={60} r={55} fill={`${color}12`} stroke={color} strokeWidth={1.5} strokeDasharray="6,4" />
      <Polyline points="24,80 38,55 52,65 66,40 80,52 94,38"
        stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={24} y={80} width={14} height={20} rx={3} fill={color} opacity={0.4} />
      <Rect x={45} y={65} width={14} height={35} rx={3} fill={color} opacity={0.6} />
      <Rect x={66} y={40} width={14} height={60} rx={3} fill={color} opacity={0.8} />
    </Svg>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const goNext = () => {
    if (activeIndex < ONBOARDING_SCREENS.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.replace('Main');
    }
  };

  const skip = () => navigation.replace('Main');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        ref={flatRef}
        data={ONBOARDING_SCREENS}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.gradientColors as any}
            style={styles.slide}
          >
            {/* Glow */}
            <View style={[styles.glow, { backgroundColor: item.accentColor }]} />

            {/* Icon */}
            <View style={[styles.iconWrapper, { borderColor: `${item.accentColor}30`, backgroundColor: 'rgba(255,255,255,0.7)' }]}>
              <SlideIcon id={item.id} color={item.accentColor} />
            </View>

            {/* Step indicator */}
            <Text style={[styles.stepLabel, { color: item.accentColor }]}>
              {item.id} / {ONBOARDING_SCREENS.length}
            </Text>

            {/* Title */}
            <Text style={styles.title}>{item.title}</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />

      {/* Control Footer */}
      <View style={styles.controls}>
        {/* Pagination Dots */}
        <View style={styles.dots}>
          {ONBOARDING_SCREENS.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <View
                key={item.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive ? item.accentColor : '#CBD5E1',
                    width: isActive ? 24 : 8,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
            <LinearGradient
              colors={[ONBOARDING_SCREENS[activeIndex].accentColor, ONBOARDING_SCREENS[activeIndex].accentColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextText}>
                {activeIndex === ONBOARDING_SCREENS.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 20,
    paddingBottom: 160,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.15,
    top: height * 0.18,
  },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 44,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  skipText: { fontSize: 15, color: '#475569', fontWeight: '600' },
  nextBtn: { borderRadius: 16, overflow: 'hidden', flex: 1, marginLeft: 16 },
  nextGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  nextText: { fontSize: 16, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
});
