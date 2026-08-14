import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const HEADER_HEIGHT = 56;
const BOTTOM_NAV_HEIGHT = 75;

// بيانات محلية مؤقتة تحافظ على نفس العقد المتوقع لاحقًا من services/videos.js.
const MOCK_VIDEOS = [
  {
    id: 'video-1',
    username: '@vibe_creator',
    displayName: 'VIBE Creator',
    description: 'اكتشف لحظات جديدة وشاركها مع مجتمع VIBE #VIBE',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    likes: 12400,
    comments: 318,
    shares: 86,
    isFollowing: false,
  },
  {
    id: 'video-2',
    username: '@travel_vibe',
    displayName: 'Travel Vibe',
    description: 'كل مكان يحمل قصة تستحق أن تُروى.',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    likes: 8700,
    comments: 142,
    shares: 51,
    isFollowing: false,
  },
  {
    id: 'video-3',
    username: '@daily_vibe',
    displayName: 'Daily Vibe',
    description: 'اصنع يومك، ثم شارك الـ VIBE الخاص بك.',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    likes: 5200,
    comments: 94,
    shares: 27,
    isFollowing: false,
  },
];

function formatCount(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function ActionButton({ icon, label, onPress, active = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
    >
      <Text style={[styles.actionIcon, active && styles.activeActionIcon]}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function FeedVideoItem({ item, index, isActive, itemHeight, itemWidth, safeBottom }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);
  const [isFollowing, setIsFollowing] = useState(item.isFollowing);
  const [comments, setComments] = useState(item.comments);
  const [isPlaying, setIsPlaying] = useState(index === 0);

  const player = useVideoPlayer(item.videoUrl, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = false;
    if (index === 0) videoPlayer.play();
  });

  useEffect(() => {
    if (isActive) {
      player.play();
      setIsPlaying(true);
      return;
    }

    player.pause();
    setIsPlaying(false);
  }, [isActive, player]);

  const togglePlayback = useCallback(() => {
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }, [player]);

  const toggleLike = useCallback(() => {
    setIsLiked((liked) => {
      setLikes((count) => count + (liked ? -1 : 1));
      return !liked;
    });
  }, []);

  const handleComment = useCallback(() => {
    setComments((count) => count + 1);
    Alert.alert('التعليقات', 'واجهة التعليقات ستُربط بالخدمة الخلفية لاحقًا.');
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `شاهد هذا الفيديو على VIBE من ${item.username}`,
      });
    } catch (error) {
      Alert.alert('المشاركة', 'تعذر فتح خيارات المشاركة حاليًا.');
    }
  }, [item.username]);

    return (
    <View style={[styles.videoItem, { height: itemHeight, width: itemWidth }]}>
      <View style={styles.videoCanvas}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'إيقاف الفيديو' : 'تشغيل الفيديو'}
          onPress={togglePlayback}
          style={styles.videoFrame}
        >
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
            allowsFullscreen={false}
          />
          <View pointerEvents="none" style={styles.videoShade} />
          {!isPlaying && (
            <View pointerEvents="none" style={styles.playOverlay}>
              <Text style={styles.playOverlayIcon}>▶</Text>
            </View>
          )}
          <View pointerEvents="none" style={styles.progressHint}>
            <View style={styles.progressFill} />
          </View>

          <View pointerEvents="box-none" style={styles.videoOverlay}>
            <View style={[styles.overlayBottom, { paddingBottom: safeBottom }]}>
              <View style={styles.videoMeta}>
                <View style={styles.authorRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.displayName.charAt(0)}</Text>
                  </View>
                  <View style={styles.authorDetails}>
                    <Text numberOfLines={1} style={styles.displayName}>{item.displayName}</Text>
                    <Text numberOfLines={1} style={styles.username}>{item.username}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isFollowing ? 'إلغاء المتابعة' : 'متابعة المستخدم'}
                    onPress={() => setIsFollowing((following) => !following)}
                    style={[styles.followButton, isFollowing && styles.followingButton]}
                  >
                    <Text style={[styles.followText, isFollowing && styles.followingText]}>
                      {isFollowing ? 'يتابع' : 'متابعة'}
                    </Text>
                  </Pressable>
                </View>
                <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
              </View>

              <View style={styles.actionsRail}>
                <ActionButton
                  icon={isLiked ? '♥' : '♡'}
                  label={formatCount(likes)}
                  onPress={toggleLike}
                  active={isLiked}
                />
                <ActionButton icon="◯" label={formatCount(comments)} onPress={handleComment} />
                <ActionButton icon="↗" label={formatCount(item.shares)} onPress={handleShare} />
                <ActionButton icon="⋯" label="المزيد" onPress={() => Alert.alert('VIBE', 'المزيد من الخيارات ستتوفر لاحقًا.')} />
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen({ onOpenSearch }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const headerHeight = HEADER_HEIGHT + insets.top;
  const bottomBarHeight = BOTTOM_NAV_HEIGHT + insets.bottom;
  const feedHeight = Math.max(windowHeight - headerHeight - bottomBarHeight, 1);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const firstVisible = viewableItems.find((viewableItem) => viewableItem.isViewable);
    if (firstVisible?.index != null) setActiveIndex(firstVisible.index);
  }).current;

  const renderItem = useCallback(
      ({ item, index }) => (
      <FeedVideoItem
        item={item}
        index={index}
        isActive={index === activeIndex}
        itemHeight={feedHeight}
        itemWidth={windowWidth}
        safeBottom={Math.max(dimensions.padding.small, insets.bottom)}
      />
    ),
    [activeIndex, feedHeight, insets.bottom, windowWidth]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { height: headerHeight, paddingTop: insets.top }]}>

        <Text style={styles.logo}>VIBE</Text>
        <View style={styles.headerTabs}>
          <Text style={styles.activeTab}>لك</Text>
          <Text style={styles.tab}>يتابع</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="فتح البحث"
          onPress={onOpenSearch}
          style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
        >
          <Text style={styles.searchIcon}>⌕</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.feed}
        data={MOCK_VIDEOS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={feedHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: feedHeight,
          offset: feedHeight * index,
          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: dimensions.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    zIndex: 2,
  },

  searchButton: {
    width: 38,
    height: 38,
    borderRadius: dimensions.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  searchIcon: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 30,
  },

  logo: {
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: '900',
    letterSpacing: 4,
  },

  headerTabs: {
    flexDirection: 'row',
    gap: 20,
  },

  activeTab: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },

  tab: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.medium,
  },

  feed: {
    flex: 1,
  },

  videoItem: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  videoCanvas: {
    flex: 1,
    width: '100%',
  },

  videoFrame: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },

  video: {
    ...StyleSheet.absoluteFillObject,
  },

  videoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },

  playOverlay: {
    position: 'absolute',
    top: '46%',
    left: '46%',
    width: 56,
    height: 56,
    borderRadius: dimensions.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  playOverlayIcon: {
    color: colors.text,
    fontSize: dimensions.fontSize.title,
    marginLeft: 3,
  },

  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },

  overlayBottom: {
    position: 'absolute',
    right: dimensions.padding.medium,
    bottom: 0,
    left: dimensions.padding.medium,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  videoMeta: {
    flex: 1,
    minWidth: 0,
    marginRight: dimensions.padding.small,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: dimensions.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.text,
  },

  avatarText: {
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: '900',
  },

  authorDetails: {
    flex: 1,
    marginHorizontal: dimensions.padding.small,
  },

  displayName: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },

  username: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    marginTop: 2,
  },

  followButton: {
    minWidth: 72,
    paddingHorizontal: dimensions.padding.small,
    paddingVertical: 7,
    borderRadius: dimensions.radius.small,
    borderWidth: 1,
    borderColor: colors.text,
    alignItems: 'center',
  },

  followingButton: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },

  followText: {
    color: colors.text,
    fontSize: dimensions.fontSize.small,
    fontWeight: 'bold',
  },

  followingText: {
    color: colors.textSecondary,
  },

  description: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
    lineHeight: 21,
    marginTop: dimensions.padding.small,
  },

  actionsRail: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: dimensions.padding.medium,
  },

  actionButton: {
    minWidth: 42,
    alignItems: 'center',
  },

  pressed: {
    opacity: 0.6,
  },

  actionIcon: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 32,
    textAlign: 'center',
  },

  activeActionIcon: {
    color: colors.danger,
  },

  actionLabel: {
    color: colors.text,
    fontSize: dimensions.fontSize.small,
    fontWeight: 'bold',
    marginTop: 2,
  },

  progressHint: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  progressFill: {
    width: '35%',
    height: 2,
    backgroundColor: colors.text,
  },
});
