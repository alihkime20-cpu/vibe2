import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const DEFAULT_DURATION = 30;
const STEP = 1;
const MAX_CAPTION = 150;

const formatTime = (seconds) => {
  const value = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
};

function Preview({ video, start, end, muted, onTime }) {
  const player = useVideoPlayer(video.uri, (instance) => {
    instance.loop = false;
    instance.muted = muted;
    instance.timeUpdateEventInterval = 0.25;
  });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    const subscription = player.addListener('timeUpdate', ({ currentTime }) => {
      onTime(currentTime);
      if (currentTime >= end) {
        player.pause();
        player.currentTime = start;
        setPlaying(false);
      }
    });
    return () => subscription.remove();
  }, [end, onTime, player, start]);

  const toggle = useCallback(() => {
    if (player.playing) {
      player.pause();
      setPlaying(false);
    } else {
      if (player.currentTime < start || player.currentTime >= end) player.currentTime = start;
      player.play();
      setPlaying(true);
    }
  }, [end, player, start]);

  return (
    <Pressable onPress={toggle} style={styles.preview}>
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} allowsFullscreen />
      <View pointerEvents="none" style={styles.previewShade} />
      {!playing && <View pointerEvents="none" style={styles.playButton}><Text style={styles.playIcon}>▶</Text></View>}
      <View pointerEvents="none" style={styles.audioBadge}><Text style={styles.audioBadgeText}>{muted ? 'صامت' : 'الصوت مفعّل'}</Text></View>
    </Pressable>
  );
}

function Stepper({ title, value, min, max, onMinus, onPlus }) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperTitle}>{title}</Text>
      <View style={styles.stepperControls}>
        <Pressable disabled={value <= min} onPress={onMinus} style={[styles.stepButton, value <= min && styles.disabled]}><Text style={styles.stepText}>−</Text></Pressable>
        <Text style={styles.stepValue}>{formatTime(value)}</Text>
        <Pressable disabled={value >= max} onPress={onPlus} style={[styles.stepButton, value >= max && styles.disabled]}><Text style={styles.stepText}>＋</Text></Pressable>
      </View>
    </View>
  );
}

export default function VideoEditorScreen({ video, onBack }) {
  const initialDuration = useMemo(() => {
    const milliseconds = Number(video?.duration || 0);
    return milliseconds > 0 ? Math.ceil(milliseconds / 1000) : DEFAULT_DURATION;
  }, [video?.duration]);
  const [duration, setDuration] = useState(initialDuration);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(initialDuration);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    setDuration(initialDuration);
    setStart(0);
    setEnd(initialDuration);
  }, [initialDuration]);

  const adjustStart = (delta) => setStart((value) => Math.max(0, Math.min(value + delta, end - STEP)));
  const adjustEnd = (delta) => setEnd((value) => Math.min(duration, Math.max(value + delta, start + STEP)));
  const publishLater = () => Alert.alert('جاهز للمرحلة التالية', 'تم تجهيز إعدادات القص والوصف محليًا. لن يتم إنشاء ملف جديد أو رفع الفيديو قبل ربط Backend.');

  if (!video?.uri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.logo}>VIBE</Text>
          <Text style={styles.emptyTitle}>لم يتم اختيار فيديو</Text>
          <Text style={styles.emptyText}>ارجع إلى شاشة الرفع واختر فيديو للبدء.</Text>
          <Pressable onPress={onBack} style={styles.primary}><Text style={styles.primaryText}>العودة إلى الرفع</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.headerAction}><Text style={styles.headerActionText}>رجوع</Text></Pressable>
          <Text style={styles.headerTitle}>تحرير الفيديو</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Preview video={video} start={start} end={end} muted={muted} onTime={setCurrentTime} />
          <View style={styles.fileRow}>
            <View style={styles.fileIcon}><Text style={styles.fileIconText}>▶</Text></View>
            <View style={styles.fileInfo}><Text numberOfLines={1} style={styles.fileName}>{video.fileName || 'vibe-video.mp4'}</Text><Text style={styles.fileMeta}>{formatTime(currentTime)} من {formatTime(duration)}</Text></View>
          </View>

          <View style={styles.section}>
            <View style={styles.heading}><Text style={styles.sectionTitle}>قص الفيديو</Text><Text style={styles.sectionValue}>{formatTime(start)} – {formatTime(end)}</Text></View>
            <View style={styles.timeline}><View style={[styles.selection, { left: `${(start / duration) * 100}%`, right: `${100 - (end / duration) * 100}%` }]} /></View>
            <Text style={styles.helper}>تم تجهيز نقطتي البداية والنهاية. تصدير ملف مقصوص سيُضاف لاحقًا مع الحفاظ على الفيديو الأصلي.</Text>
            <Stepper title="بداية المقطع" value={start} min={0} max={end - STEP} onMinus={() => adjustStart(-STEP)} onPlus={() => adjustStart(STEP)} />
            <Stepper title="نهاية المقطع" value={end} min={start + STEP} max={duration} onMinus={() => adjustEnd(-STEP)} onPlus={() => adjustEnd(STEP)} />
          </View>

          <View style={styles.section}>
            <View style={styles.heading}><Text style={styles.sectionTitle}>الصوت</Text><Text style={styles.sectionValue}>{muted ? 'مكتوم' : 'مفعّل'}</Text></View>
            <Pressable onPress={() => setMuted((value) => !value)} style={styles.audioButton}><Text style={styles.audioIcon}>{muted ? '⌁' : '◖)'}</Text><Text style={styles.audioText}>{muted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}</Text></Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.heading}><Text style={styles.sectionTitle}>الوصف</Text><Text style={styles.sectionValue}>{caption.length}/{MAX_CAPTION}</Text></View>
            <TextInput value={caption} onChangeText={setCaption} maxLength={MAX_CAPTION} multiline textAlign="right" placeholder="اكتب وصفًا للفيديو..." placeholderTextColor={colors.textMuted} style={styles.caption} />
          </View>
          <Pressable onPress={publishLater} style={styles.primary}><Text style={styles.primaryText}>التالي</Text></Pressable>
          <Text style={styles.footer}>لن يتم رفع الفيديو أو نشره قبل ربط الخادم.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  header: { height: 65, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: dimensions.padding.medium, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { color: colors.text, fontSize: dimensions.fontSize.medium, fontWeight: 'bold' },
  headerAction: { minWidth: 52, paddingVertical: dimensions.padding.small },
  headerActionText: { color: colors.textSecondary, fontSize: dimensions.fontSize.small },
  headerSpacer: { minWidth: 52 },
  content: { padding: dimensions.padding.medium, paddingBottom: dimensions.padding.large },
  preview: { height: 300, borderRadius: dimensions.radius.large, overflow: 'hidden', backgroundColor: colors.surface },
  video: { flex: 1 },
  previewShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  playButton: { position: 'absolute', top: '42%', left: '45%', width: 54, height: 54, borderRadius: dimensions.radius.round, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
  playIcon: { color: colors.text, fontSize: dimensions.fontSize.title, marginLeft: 3 },
  audioBadge: { position: 'absolute', right: dimensions.padding.small, bottom: dimensions.padding.small, paddingHorizontal: dimensions.padding.small, paddingVertical: 5, borderRadius: dimensions.radius.small, backgroundColor: 'rgba(0,0,0,0.65)' },
  audioBadgeText: { color: colors.textSecondary, fontSize: dimensions.fontSize.small },
  fileRow: { flexDirection: 'row', alignItems: 'center', marginTop: dimensions.padding.medium },
  fileIcon: { width: 42, height: 42, borderRadius: dimensions.radius.small, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceLight },
  fileIconText: { color: colors.text, fontSize: dimensions.fontSize.medium },
  fileInfo: { flex: 1, marginHorizontal: dimensions.padding.small },
  fileName: { color: colors.text, fontSize: dimensions.fontSize.medium, fontWeight: 'bold' },
  fileMeta: { color: colors.textMuted, fontSize: dimensions.fontSize.small, marginTop: 3 },
  section: { marginTop: dimensions.padding.large, padding: dimensions.padding.medium, borderRadius: dimensions.radius.medium, backgroundColor: colors.surface },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: dimensions.fontSize.medium, fontWeight: 'bold' },
  sectionValue: { color: colors.textSecondary, fontSize: dimensions.fontSize.small },
  timeline: { height: 26, marginTop: dimensions.padding.medium, borderRadius: dimensions.radius.small, backgroundColor: colors.surfaceLight, overflow: 'hidden' },
  selection: { position: 'absolute', top: 0, bottom: 0, backgroundColor: colors.primary },
  helper: { color: colors.textMuted, fontSize: dimensions.fontSize.small, lineHeight: 18, marginTop: dimensions.padding.small },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: dimensions.padding.medium },
  stepperTitle: { color: colors.textSecondary, fontSize: dimensions.fontSize.small },
  stepperControls: { flexDirection: 'row', alignItems: 'center' },
  stepButton: { width: 32, height: 32, borderRadius: dimensions.radius.small, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceLight },
  disabled: { opacity: 0.35 },
  stepText: { color: colors.text, fontSize: dimensions.fontSize.large },
  stepValue: { color: colors.text, width: 52, textAlign: 'center', fontSize: dimensions.fontSize.small, fontWeight: 'bold' },
  audioButton: { flexDirection: 'row', alignItems: 'center', marginTop: dimensions.padding.medium },
  audioIcon: { color: colors.text, fontSize: 24, width: 36 },
  audioText: { color: colors.textSecondary, fontSize: dimensions.fontSize.small },
  caption: { minHeight: 86, color: colors.text, fontSize: dimensions.fontSize.medium, lineHeight: 22, padding: dimensions.padding.small, marginTop: dimensions.padding.small, borderRadius: dimensions.radius.small, backgroundColor: colors.surfaceLight, textAlignVertical: 'top' },
  primary: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: dimensions.radius.medium, backgroundColor: colors.primary, paddingHorizontal: dimensions.padding.medium, marginTop: dimensions.padding.large },
  primaryText: { color: colors.background, fontSize: dimensions.fontSize.medium, fontWeight: 'bold' },
  footer: { color: colors.textMuted, fontSize: dimensions.fontSize.small, textAlign: 'center', marginTop: dimensions.padding.small },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: dimensions.padding.large },
  logo: { color: colors.text, fontSize: dimensions.fontSize.huge, fontWeight: '900', letterSpacing: 6 },
  emptyTitle: { color: colors.text, fontSize: dimensions.fontSize.title, fontWeight: 'bold', marginTop: dimensions.padding.large },
  emptyText: { color: colors.textMuted, fontSize: dimensions.fontSize.small, textAlign: 'center', marginTop: dimensions.padding.small },
});
