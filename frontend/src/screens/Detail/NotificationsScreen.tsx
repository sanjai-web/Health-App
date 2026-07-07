import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useHealthData';
import Header from '../../components/common/Header';
import { CardSkeleton } from '../../components/common/Skeleton';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle, AlertTriangle, Info, XCircle, Bell } from 'lucide-react-native';
import { Notification } from '../../constants/mockData';

function getNotifConfig(type: Notification['type']) {
  switch (type) {
    case 'success': return { color: '#10B981', icon: <CheckCircle size={18} color="#10B981" />, bg: '#10B98118' };
    case 'warning': return { color: '#F59E0B', icon: <AlertTriangle size={18} color="#F59E0B" />, bg: '#F59E0B18' };
    case 'critical': return { color: '#EF4444', icon: <XCircle size={18} color="#EF4444" />, bg: '#EF444418' };
    default: return { color: '#3B82F6', icon: <Info size={18} color="#3B82F6" />, bg: '#3B82F618' };
  }
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'Just now';
}

function NotifCard({ notif }: { notif: Notification }) {
  const { colors, isDark } = useTheme();
  const cfg = getNotifConfig(notif.type);

  return (
    <LinearGradient
      colors={isDark ? ['#1E2D3D', '#111827'] : ['#FFFFFF', '#F8FAFC']}
      style={[
        styles.notifCard,
        { borderColor: notif.read ? colors.cardBorder : `${cfg.color}35` },
      ]}
    >
      {/* Unread indicator */}
      {!notif.read && (
        <View style={[styles.unreadBar, { backgroundColor: cfg.color }]} />
      )}

      <View style={styles.notifInner}>
        <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
          {cfg.icon}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, flex: 1, paddingRight: 8 }}>
              {notif.title}
            </Text>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '500' }}>
              {formatRelativeTime(notif.timestamp)}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>
            {notif.message}
          </Text>
          {!notif.read && (
            <View style={[styles.newPill, { backgroundColor: `${cfg.color}20` }]}>
              <Text style={{ fontSize: 9, color: cfg.color, fontWeight: '700', letterSpacing: 0.5 }}>NEW</Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const { data: notifications, loading } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        showBack
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 10 }}
      >
        {/* Unread section */}
        {!loading && unreadCount > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>UNREAD</Text>
        )}

        {loading
          ? Array(3).fill(0).map((_, i) => <CardSkeleton key={i} height={110} />)
          : notifications.length === 0
            ? (
              <View style={styles.emptyState}>
                <Bell size={40} color={colors.textMuted} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textMuted, marginTop: 12 }}>
                  No notifications
                </Text>
              </View>
            )
            : (
              <>
                {notifications.filter(n => !n.read).map(n => (
                  <NotifCard key={n.id} notif={n} />
                ))}

                {notifications.some(n => n.read) && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 8 }]}>EARLIER</Text>
                    {notifications.filter(n => n.read).map(n => (
                      <NotifCard key={n.id} notif={n} />
                    ))}
                  </>
                )}
              </>
            )
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  notifCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  notifInner: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    paddingLeft: 18,
  },
  notifIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
});
