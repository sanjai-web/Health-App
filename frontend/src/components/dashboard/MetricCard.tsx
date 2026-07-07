import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { ChevronRight } from 'lucide-react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  gradientColors: string[];
  onPress?: () => void;
  status?: 'normal' | 'warning' | 'critical';
  statusLabel?: string;
  trend?: 'up' | 'down' | 'stable';
}

export default function MetricCard({
  label,
  value,
  unit,
  icon,
  gradientColors,
  onPress,
  status = 'normal',
  statusLabel = 'Normal',
  trend,
}: MetricCardProps) {
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

  const statusColor =
    status === 'normal'
      ? colors.accentGreen
      : status === 'warning'
      ? colors.accentOrange
      : colors.accentRed;

  const trendChar = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? colors.accentRed : trend === 'down' ? colors.accentGreen : colors.textMuted;

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={[isDark ? 'rgba(30,45,61,0.95)' : 'rgba(255,255,255,0.98)', isDark ? 'rgba(17,24,39,0.95)' : 'rgba(248,250,252,0.98)']}
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            padding: 16,
            ...shadows.card,
          }}
        >
          {/* Top Row: Icon + Arrow */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <LinearGradient
              colors={gradientColors as any}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </LinearGradient>
            {onPress && <ChevronRight size={16} color={colors.textMuted} />}
          </View>

          {/* Label */}
          <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '500', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>
            {label}
          </Text>

          {/* Value Row */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text, letterSpacing: -0.5 }}>
              {value}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>
              {unit}
            </Text>
            {trend && (
              <Text style={{ fontSize: 12, color: trendColor, fontWeight: '700', marginLeft: 4 }}>
                {trendChar}
              </Text>
            )}
          </View>

          {/* Status Pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: `${statusColor}18`,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 20,
              alignSelf: 'flex-start',
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
            <Text style={{ fontSize: 10, color: statusColor, fontWeight: '600' }}>{statusLabel}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}
