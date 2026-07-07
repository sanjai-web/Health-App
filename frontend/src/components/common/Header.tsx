import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotification?: boolean;
  onNotificationPress?: () => void;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

export default function Header({
  title,
  subtitle,
  showBack = false,
  showNotification = false,
  onNotificationPress,
  rightComponent,
  transparent = false,
}: HeaderProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const topPadding = insets.top + 8;

  return (
    <View
      style={{
        backgroundColor: transparent ? 'transparent' : colors.surface,
        paddingTop: topPadding,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderBottomWidth: transparent ? 0 : 1,
        borderBottomColor: colors.cardBorder,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Back or Spacer */}
        <View style={{ width: 40, alignItems: 'flex-start' }}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: colors.glass,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={18} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center: Title */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '700',
              color: colors.text,
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right: Notification or custom */}
        <View style={{ width: 40, alignItems: 'flex-end' }}>
          {showNotification ? (
            <TouchableOpacity
              onPress={onNotificationPress}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: colors.glass,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} color={colors.text} strokeWidth={2} />
              {/* Notification dot */}
              <View
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: colors.accentRed,
                  borderWidth: 1.5,
                  borderColor: colors.surface,
                }}
              />
            </TouchableOpacity>
          ) : rightComponent ? (
            rightComponent
          ) : null}
        </View>
      </View>
    </View>
  );
}
