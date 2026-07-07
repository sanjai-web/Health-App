import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { TouchableOpacity } from 'react-native';

const AnimatedView = Animated.createAnimatedComponent(View);

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: string[];
  onPress?: () => void;
  glass?: boolean;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  padding?: number;
  animated?: boolean;
}

export default function GradientCard({
  children,
  style,
  gradientColors,
  onPress,
  glass = false,
  borderColor,
  borderWidth = 1,
  radius = 20,
  padding = 16,
  animated = true,
}: GradientCardProps) {
  const { colors, shadows, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (animated && onPress) scale.value = withSpring(0.97, { damping: 15 });
  };
  const handlePressOut = () => {
    if (animated && onPress) scale.value = withSpring(1, { damping: 15 });
  };

  const defaultColors = glass
    ? [colors.glass, colors.glass]
    : gradientColors ?? [colors.card, colors.surfaceSecondary];

  const cardContent = (
    <LinearGradient
      colors={defaultColors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: radius,
          borderWidth: borderWidth,
          borderColor: borderColor ?? colors.cardBorder,
          overflow: 'hidden',
        },
        shadows.card,
        style,
      ]}
    >
      <View style={{ padding }}>{children}</View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <AnimatedView style={[animatedStyle]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {cardContent}
        </TouchableOpacity>
      </AnimatedView>
    );
  }

  return <View>{cardContent}</View>;
}
