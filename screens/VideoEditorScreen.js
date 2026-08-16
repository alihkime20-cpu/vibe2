import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const DEFAULT_DURATION = 30;
const STEP = 1;
const MAX_CAPTION = 150;

const formatTime = (seconds) => {
  const value = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
};

function Preview({ video, start, end, muted, onTime, height }) {
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
    <Pressable onPress={toggle} style={[styles.preview, { height }]}>

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
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const previewHeight = Math.min(windowWidth * 1.15, Math.max(240, windowHeight * 0.38));
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
  const [editedVideo, setEditedVideo] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const cropListenersRef = useRef([]);
  const activeVideo = editedVideo || video;
  const hasPortraitRatio = Boolean(
    activeVideo?.width && activeVideo?.height
      ? Math.abs((activeVideo.width / activeVideo.height) - (9 / 16)) <= 0.025
      : false,
  );
  const cropRequired = !hasPortraitRatio && !editedVideo;

  useEffect(() => {
    setDuration(initialDuration);
    setStart(0);
    setEnd(initialDuration);
  }, [initialDuration]);

  const cleanupCropListeners = useCallback(() => {
    cropListenersRef.current.forEach((listener) => listener?.remove?.());
    cropListenersRef.current = [];
  }, []);

  useEffect(() => cleanupCropListeners, [cleanupCropListeners]);

  const openCropEditor = useCallback(() => {
    try {
      const { default: VideoTrim, showEditor } = require('react-native-video-trim');
      cleanupCropListeners();
      setIsCropping(true);

      const onFinish = VideoTrim.onFinishTrimming.addListener(({ outputPath, duration: outputDuration }) => {
        cleanupCropListeners();
        setIsCropping(false);
        setEditedVideo({
          ...video,
          uri: outputPath,
          fileName: `${video.fileName || 'vibe-video'}`.replace(/\\.[^/.]+$/, '') + '-9x16.mp4',
          duration: outputDuration,
          width: 9,
          height: 16,
        });
        Alert.alert('تم تجهيز الفيديو', 'تم حفظ نسخة القص الجديدة. الفيديو الأصلي محفوظ كما هو.');
      });

      const onCancel = VideoTrim.onCancel.addListener(() => {
        cleanupCropListeners();
        setIsCropping(false);
      });

      const onError = VideoTrim.onError.addListener(({ message }) => {
        cleanupCropListeners();
        setIsCropping(false);
        Alert.alert('تعذر قص الفيديو', message || 'حدث خطأ أثناء إنشاء النسخة الجديدة.');
      });

      cropListenersRef.current = [onFinish, onCancel, onError];
      showEditor(video.uri, {
        theme: 'dark',
        headerText: 'قص الفيديو إلى 9:16',
        enableEditTools: true,
        closeWhenFinish: true,
        saveToPhoto: false,
        openDocumentsOnFinish: false,
        openShareSheetOnFinish: false,
        enablePreciseTrimming: true,
        maxDuration: 60 * 1000,
        saveButtonText: 'حفظ النسخة',
        cancelButtonText: 'إلغاء',
        trimmingText: 'جارٍ إنشاء فيديو 9:16...',
        enableSaveDialog: true,
        saveDialogTitle: 'حفظ الفيديو',
        saveDialogMessage: 'سيتم إنشاء نسخة جديدة من الفيديو بعد القص.',
        alertOnFailToLoad: true,
        alertOnFailTitle: 'تعذر فتح الفيديو',
        alertOnFailMessage: 'تحقق من أن الملف فيديو صالح ثم حاول مرة أخرى.',
      });
    } catch (error) {
      setIsCropping(false);
      Alert.alert(
        'محرر القص غير متاح',
        'يحتاج محرر الفيديو إلى EAS Development Build جديد؛ لن يعمل داخل Expo Go العادي.',
      );
    }
  }, [cleanupCropListeners, video]);

  const adjustStart = (delta) => setStart((value) => Math.max(0, Math.min(value + delta, end - STEP)));
  const adjustEnd = (delta) => setEnd((value) => Math.min(duration, Math.max(value + delta, start + STEP)));
  const publishLater = () => {
    if (cropRequired) {
      Alert.alert('أكمل تجهيز الفيديو', 'يجب قص الفيديو إلى 9:16 قبل الانتقال إلى النشر.');
      return;
    }
    Alert.alert('جاهز للمرحلة التالية', 'تم تجهيز فيديو 9:16 والوصف محليًا. لن يتم رفع الفيديو قبل ربط Backend.');
  };

  if (!video?.uri) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.logo}>VIBE</Text>
          <Text style={styles.emptyTitle}>لم يتم اختيار فيديو</Text>
          <Text style={styles.emptyText}>ارجع إلى شاشة الرفع واختر فيديو للبدء.</Text>
          <Pressable onPress={onBack} style={styles.primary}><Text style={styles.primaryText}>العودة إلى الرفع</Text></Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { height: 65 + insets.top, paddingTop: insets.top }]}>

          <Pressable onPress={onBack} style={styles.headerAction}><Text style={styles.headerActionText}>رجوع</Text></Pressable>
          <Text style={styles.headerTitle}>تحرير الفيديو</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Preview video={activeVideo} start={start} end={end} muted={muted} onTime={setCurrentTime} height={previewHeight} />
          <View style={styles.fileRow}>
            <View style={styles.fileIcon}><Text style={styles.fileIconText}>▶</Text></View>
            <View style={styles.fileInfo}><Text numberOfLines={1} style={styles.fileName}>{video.fileName || 'vibe-video.mp4'}</Text><Text style={styles.fileMeta}>{formatTime(currentTime)} من {formatTime(duration)}</Text></View>
          </View>

          <View style={styles.section}>
            <View style={styles.heading}><Text style={styles.sectionTitle}>نسبة الفيديو</Text><Text style={styles.sectionValue}>{editedVideo ? '9:16 جاهز' : hasPortraitRatio ? '9:16 صحيح' : 'مطلوب القص'}</Text></View>
            <Text style={styles.helper}>سيظهر الفيديو في VIBE عموديًا بنسبة 9:16. الفيديو الأصلي لا يُحذف.</Text>
            <Pressable disabled={isCropping} onPress={openCropEditor} style={[styles.cropButton, isCropping && styles.disabled]}>
              <Text style={styles.cropButtonText}>{isCropping ? 'جارٍ فتح محرر القص...' : editedVideo ? 'إعادة قص الفيديو' : 'فتح أداة القص 9:16'}</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.heading}><Text style={styles.sectionTitle}>قص المدة</Text><Text style={styles.sectionValue}>{formatTime(start)} – {formatTime(end)}</Text></View>
            <View style={styles.timeline}><View style={[styles.selection, { left: `${(start / duration) * 100}%`, right: `${100 - (end / duration) * 100}%` }]} /></View>
            <Text style={styles.helper}>يمكنك ضبط بداية ونهاية المقطع قبل حفظ النسخة النهائية.</Text>
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
          <Pressable onPress={publishLater} style={[styles.primary, cropRequired && styles.disabled]}><Text style={styles.primaryText}>{cropRequired ? 'يجب تجهيز 9:16 أولًا' : 'التالي'}</Text></Pressable>
          <Text style={styles.footer}>لن يتم رفع الفيديو أو نشره قبل ربط الخادم.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  content: { padding: dimensions.padding.medium, paddingBottom: dimensions.padding.large + 24 },
  preview: { borderRadius: dimensions.radius.large, overflow: 'hidden', backgroundColor: colors.surface },
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
  cropButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: dimensions.radius.medium, borderWidth: 1, borderColor: colors.primary, backgroundColor: 'rgba(255,255,255,0.04)', marginTop: dimensions.padding.medium, paddingHorizontal: dimensions.padding.small },
  cropButtonText: { color: colors.text, fontSize: dimensions.fontSize.small, fontWeight: 'bold' },
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
