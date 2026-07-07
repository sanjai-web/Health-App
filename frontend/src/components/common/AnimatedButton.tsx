import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  gradientColors?: string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export default function AnimatedButton({
  title,
  onPress,
  gradientColors,
  style,
  textStyle,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
}: AnimatedButtonProps) {
  const { colors, shadows, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const sizeStyles: Record<string, { height: number; borderRadius: number; fontSize: number; px: number }> = {
    sm: { height: 40, borderRadius: 10, fontSize: 13, px: 16 },
    md: { height: 52, borderRadius: 14, fontSize: 15, px: 20 },
    lg: { height: 60, borderRadius: 16, fontSize: 17, px: 24 },
  };

  const s = sizeStyles[size];
  const defaultGradient = gradientColors ?? [colors.accent, colors.primary];

  const containerStyle: ViewStyle = {
    height: s.height,
    borderRadius: s.borderRadius,
    overflow: 'hidden',
    opacity: disabled ? 0.5 : 1,
    ...(variant === 'primary' ? shadows.button : {}),
    ...style,
  };

  const inner = (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: s.px,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" size="small" />
      ) : (
        <>
          {icon && icon}
          <Text
            style={[
              {
                color:
                  variant === 'outline' || variant === 'ghost'
                    ? colors.accent
                    : '#FFFFFF',
                fontSize: s.fontSize,
                fontWeight: '700',
                letterSpacing: 0.3,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={{ flex: 1 }}
      >
        {variant === 'primary' || variant === 'secondary' ? (
          <LinearGradient
            colors={defaultGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          >
            {inner}
          </LinearGradient>
        ) : variant === 'outline' ? (
          <View
            style={{
              flex: 1,
              borderWidth: 1.5,
              borderColor: colors.accent,
              borderRadius: s.borderRadius,
              backgroundColor: 'transparent',
            }}
          >
            {inner}
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>{inner}</View>
        )}
      </AnimatedTouchable>
    </Animated.View>
  );
}
