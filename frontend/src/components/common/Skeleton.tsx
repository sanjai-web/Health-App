import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonItem({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? '#1E2D3D' : '#E2E8F0',
        },
        style,
      ]}
    />
  );
}

export function MetricCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
      }}
    >
      <SkeletonItem width={80} height={12} borderRadius={6} />
      <SkeletonItem width={60} height={32} borderRadius={8} />
      <SkeletonItem width={100} height={10} borderRadius={5} />
    </View>
  );
}

export function CardSkeleton({ height = 120 }: { height?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
        height,
        gap: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        justifyContent: 'space-between',
      }}
    >
      <SkeletonItem width="60%" height={16} borderRadius={8} />
      <View style={{ gap: 8 }}>
        <SkeletonItem width="100%" height={10} borderRadius={5} />
        <SkeletonItem width="80%" height={10} borderRadius={5} />
      </View>
    </View>
  );
}

export default SkeletonItem;
