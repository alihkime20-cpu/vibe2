import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const MOCK_VIDEOS = [
  { id: 'profile-1', color: '#243B53', views: '1.2K', symbol: '✦' },
  { id: 'profile-2', color: '#6B3E26', views: '860', symbol: '◌' },
  { id: 'profile-3', color: '#2F5D50', views: '2.4K', symbol: '◇' },
  { id: 'profile-4', color: '#4A3B6B', views: '534', symbol: '✧' },
  { id: 'profile-5', color: '#7A3E48', views: '3.1K', symbol: '○' },
  { id: 'profile-6', color: '#315C72', views: '912', symbol: '△' },
];

const TABS = [
  { id: 'videos', label: 'فيديوهاتي', icon: '▦' },
  { id: 'liked', label: 'أعجبتني', icon: '♡' },
];

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function VideoTile({ item }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`فيديو، ${item.views} مشاهدة`}
      onPress={() => {}}
      style={({ pressed }) => [styles.videoTile, pressed && styles.pressed]}
    >
      <View style={[styles.videoArtwork, { backgroundColor: item.color }]}>
        <Text style={styles.videoSymbol}>{item.symbol}</Text>
        <View style={styles.viewsBadge}>
          <Text style={styles.viewsIcon}>▶</Text>
          <Text style={styles.viewsText}>{item.views}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('videos');
  const videos = useMemo(
    () => (activeTab === 'videos' ? MOCK_VIDEOS : []),
    [activeTab]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={videos}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VideoTile item={item} />}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View>
            <View style={styles.topBar}>
              <Text style={styles.screenTitle}>الملف الشخصي</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="خيارات الملف الشخصي"
                onPress={() => {}}
                style={styles.moreButton}
              >
                <Text style={styles.moreText}>⋯</Text>
              </Pressable>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>V</Text>
                </View>
              </View>
              <Text style={styles.displayName}>VIBE User</Text>
              <Text style={styles.username}>@vibe_user</Text>
              <Text style={styles.bio}>اصنع لحظتك وشارك الـ VIBE الخاص بك.</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="تعديل الملف الشخصي"
                onPress={() => {}}
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
              >
                <Text style={styles.editButtonText}>تعديل الملف الشخصي</Text>
              </Pressable>
            </View>

            <View style={styles.statsCard}>
              <Stat value="0" label="المتابعون" />
              <View style={styles.statDivider} />
              <Stat value="0" label="يتابع" />
              <View style={styles.statDivider} />
              <Stat value="0" label="الإعجابات" />
            </View>

            <View style={styles.tabs}>
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    onPress={() => setActiveTab(tab.id)}
                    style={[styles.tab, active && styles.activeTab]}
                  >
                    <Text style={[styles.tabIcon, active && styles.activeTabText]}>{tab.icon}</Text>
                    <Text style={[styles.tabLabel, active && styles.activeTabText]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>▦</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'liked' ? 'لا توجد إعجابات بعد' : 'لا توجد فيديوهات بعد'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'liked'
                ? 'ستظهر هنا الفيديوهات التي تعجبك.'
                : 'شارك أول فيديو لك وابدأ رحلتك على VIBE.'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 28,
  },
  topBar: {
    minHeight: 58,
    paddingHorizontal: dimensions.padding.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    flex: 1,
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: '800',
    textAlign: 'center',
  },
  moreButton: {
    position: 'absolute',
    right: dimensions.padding.medium,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 28,
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: dimensions.padding.large,
    paddingTop: 8,
    paddingBottom: 18,
  },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    padding: 3,
    backgroundColor: colors.text,
  },
  avatar: {
    flex: 1,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarText: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
  },
  displayName: {
    marginTop: 12,
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: '800',
  },
  username: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.medium,
  },
  bio: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    textAlign: 'center',
  },
  editButton: {
    minWidth: 190,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: dimensions.radius.small,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.text,
    fontSize: dimensions.fontSize.small,
    fontWeight: '700',
  },
  statsCard: {
    marginHorizontal: dimensions.padding.medium,
    paddingVertical: 15,
    borderRadius: dimensions.radius.medium,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  tabs: {
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: dimensions.padding.medium,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.text,
  },
  tabIcon: {
    color: colors.textMuted,
    fontSize: 20,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.text,
  },
  gridRow: {
    paddingHorizontal: dimensions.padding.medium,
    gap: 4,
  },
  videoTile: {
    flex: 1,
    aspectRatio: 0.72,
    marginBottom: 4,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  videoArtwork: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoSymbol: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 38,
  },
  viewsBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewsIcon: {
    color: colors.text,
    fontSize: 10,
  },
  viewsText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: dimensions.padding.large,
    paddingTop: 44,
    paddingBottom: 34,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    color: colors.textSecondary,
    fontSize: 28,
  },
  emptyTitle: {
    marginTop: 16,
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: '800',
  },
  emptySubtitle: {
    maxWidth: 260,
    marginTop: 8,
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
    lineHeight: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});
