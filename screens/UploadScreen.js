import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatBytes(bytes) {
  if (!bytes) return 'غير متاح';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(milliseconds) {
  if (!milliseconds) return 'غير متاح';
  const totalSeconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function VideoPreview({ uri }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = false;
  });

  const togglePlayback = useCallback(() => {
    if (player.playing) player.pause();
    else player.play();
  }, [player]);

  return (
    <Pressable onPress={togglePlayback} style={styles.previewPressable}>
      <VideoView
        player={player}
        style={styles.previewVideo}
        contentFit="cover"
        nativeControls
        allowsFullscreen
      />
      <View pointerEvents="none" style={styles.previewHint}>
        <Text style={styles.previewHintText}>اضغط للتشغيل أو الإيقاف</Text>
      </View>
    </Pressable>
  );
}

export default function UploadScreen({ onNext }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    return () => {
      setCameraOpen(false);
    };
  }, []);

  const chooseFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('الصلاحية مطلوبة', 'اسمح للتطبيق بالوصول إلى معرض الصور لاختيار فيديو.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedVideo(result.assets[0]);
      setCameraOpen(false);
    }
  }, []);

  const openCamera = useCallback(async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert('الصلاحية مطلوبة', 'اسمح للتطبيق باستخدام الكاميرا لتسجيل فيديو.');
        return;
      }
    }
    setSelectedVideo(null);
    setCameraOpen(true);
  }, [cameraPermission?.granted, requestCameraPermission]);

  const recordVideo = useCallback(async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    try {
      const result = await cameraRef.current.recordAsync({ maxDuration: 60 });
      if (result?.uri) {
        setSelectedVideo({
          uri: result.uri,
          fileName: `vibe-${Date.now()}.mp4`,
          mimeType: 'video/mp4',
          duration: null,
          fileSize: null,
        });
        setCameraOpen(false);
      }
    } catch (error) {
      Alert.alert('تعذر التسجيل', 'حدثت مشكلة أثناء تسجيل الفيديو. حاول مرة أخرى.');
    } finally {
      setIsRecording(false);
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    cameraRef.current?.stopRecording();
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  if (cameraOpen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cameraHeader}>
          <Pressable onPress={() => setCameraOpen(false)} style={styles.closeButton}>
            <Text style={styles.closeText}>إلغاء</Text>
          </Pressable>
          <Text style={styles.cameraTitle}>تصوير فيديو</Text>
          <View style={styles.headerSpacer} />
        </View>
        <CameraView ref={cameraRef} style={styles.camera} mode="video" facing="back" />
        <View style={styles.cameraControls}>
          <Text style={styles.cameraHint}>مدة الفيديو القصوى دقيقة واحدة</Text>
          <Pressable
            onPress={isRecording ? stopRecording : recordVideo}
            style={[styles.recordButton, isRecording && styles.recordingButton]}
          >
            <View style={styles.recordButtonInner} />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>VIBE</Text>
        <Text style={styles.headerTitle}>إنشاء فيديو</Text>
      </View>

      {!selectedVideo ? (
        <View style={styles.emptyState}>
          <View style={styles.uploadIconCircle}>
            <Text style={styles.uploadIcon}>＋</Text>
          </View>
          <Text style={styles.title}>أضف فيديو جديدًا</Text>
          <Text style={styles.subtitle}>
            اختر فيديو من جهازك أو سجّل لحظة جديدة بالكاميرا
          </Text>

          <Pressable onPress={chooseFromLibrary} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>اختيار من المعرض</Text>
          </Pressable>
          <Pressable onPress={openCamera} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>فتح الكاميرا</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.selectedState}>
          <VideoPreview uri={selectedVideo.uri} />
          <View style={styles.fileHeader}>
            <View style={styles.fileIcon}>
              <Text style={styles.fileIconText}>▶</Text>
            </View>
            <View style={styles.fileDetails}>
              <Text numberOfLines={1} style={styles.fileName}>
                {selectedVideo.fileName || 'vibe-video.mp4'}
              </Text>
              <Text style={styles.fileType}>
                {selectedVideo.mimeType || 'فيديو'}
              </Text>
            </View>
            <Pressable onPress={clearSelection} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>حذف</Text>
            </Pressable>
          </View>

          <View style={styles.infoGrid}>
            <InfoItem label="المدة" value={formatDuration(selectedVideo.duration)} />
            <InfoItem label="الحجم" value={formatBytes(selectedVideo.fileSize)} />
            <InfoItem label="الأبعاد" value={selectedVideo.width && selectedVideo.height ? `${selectedVideo.width}×${selectedVideo.height}` : 'غير متاح'} />
          </View>

          <Text style={styles.nextHint}>
            سيُفتح محرر الفيديو في الخطوة التالية. لا يتم رفع الملف إلى الخادم بعد.
          </Text>
          <Pressable onPress={() => onNext?.(selectedVideo)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>متابعة إلى التحرير</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: dimensions.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: '900',
    letterSpacing: 4,
  },
  headerTitle: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.medium,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimensions.padding.large,
  },
  uploadIconCircle: {
    width: 92,
    height: 92,
    borderRadius: dimensions.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadIcon: {
    color: colors.text,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '300',
  },
  title: {
    color: colors.text,
    fontSize: dimensions.fontSize.title,
    fontWeight: 'bold',
    marginTop: dimensions.padding.large,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: dimensions.padding.small,
    marginBottom: dimensions.padding.large,
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: dimensions.radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: dimensions.padding.medium,
    marginTop: dimensions.padding.small,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: dimensions.radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: dimensions.padding.medium,
    marginTop: dimensions.padding.small,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
  selectedState: {
    flex: 1,
    padding: dimensions.padding.medium,
  },
  previewPressable: {
    height: SCREEN_WIDTH * 1.15,
    maxHeight: 430,
    borderRadius: dimensions.radius.large,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  previewVideo: {
    flex: 1,
  },
  previewHint: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    padding: dimensions.padding.small,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  previewHintText: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    textAlign: 'center',
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: dimensions.padding.medium,
  },
  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: dimensions.radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  fileIconText: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
  },
  fileDetails: {
    flex: 1,
    marginHorizontal: dimensions.padding.small,
  },
  fileName: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
  fileType: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
    marginTop: 3,
  },
  removeButton: {
    paddingHorizontal: dimensions.padding.small,
    paddingVertical: 8,
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: dimensions.fontSize.small,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dimensions.padding.medium,
    padding: dimensions.padding.medium,
    borderRadius: dimensions.radius.medium,
    backgroundColor: colors.surface,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
  },
  infoValue: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    fontWeight: 'bold',
    marginTop: 5,
  },
  nextHint: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: dimensions.padding.medium,
  },
  cameraHeader: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: dimensions.padding.medium,
    backgroundColor: colors.background,
  },
  cameraTitle: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: dimensions.padding.small,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.medium,
  },
  headerSpacer: {
    width: 42,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    alignItems: 'center',
    paddingVertical: dimensions.padding.large,
    backgroundColor: colors.background,
  },
  cameraHint: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
    marginBottom: dimensions.padding.medium,
  },
  recordButton: {
    width: 76,
    height: 76,
    borderRadius: dimensions.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.text,
  },
  recordingButton: {
    borderColor: colors.danger,
  },
  recordButtonInner: {
    width: 58,
    height: 58,
    borderRadius: dimensions.radius.round,
    backgroundColor: colors.danger,
  },
});
