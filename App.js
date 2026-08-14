import React, { useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import VideoEditorScreen from './screens/VideoEditorScreen';
import ProfileScreen from './screens/ProfileScreen';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState('home');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const renderScreen = () => {
    if (screen === 'home') {
      return <HomeScreen onOpenSearch={() => setScreen('search')} />;
    }

    if (screen === 'search') {
      return (
        <View style={styles.screen}>
          <Text style={styles.title}>البحث</Text>
          <View style={styles.searchBox}>
            <Text style={styles.searchText}>🔍  ابحث عن فيديو أو مستخدم</Text>
          </View>
        </View>
      );
    }

    if (screen === 'live') {
      return <LivePlaceholder onBack={() => setScreen('home')} />;
    }

    if (screen === 'upload') {
      return (
        <UploadScreen
          onNext={(video) => {
            setSelectedVideo(video);
            setScreen('editor');
          }}
        />
      );
    }

    if (screen === 'editor') {
      return (
        <VideoEditorScreen
          video={selectedVideo}
          onBack={() => setScreen('upload')}
        />
      );
    }

    if (screen === 'notifications') {
      return (
        <View style={styles.screen}>
          <Text style={styles.title}>الإشعارات</Text>
          <Text style={styles.empty}>لا توجد إشعارات حاليًا</Text>
        </View>
      );
    }

    if (screen === 'profile') {
      return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* شريط التنقل */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 6 }]}>

        <NavButton
          icon="⌂"
          text="الرئيسية"
          active={screen === 'home'}
          onPress={() => setScreen('home')}
        />

        <TouchableOpacity
          style={styles.plusButton}
          accessibilityRole="button"
          accessibilityLabel="إنشاء محتوى"
          onPress={() => setCreateMenuOpen(true)}
        >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>

        <NavButton
          icon="♡"
          text="الإشعارات"
          active={screen === 'notifications'}
          onPress={() => setScreen('notifications')}
        />

        <NavButton
          icon="♙"
          text="حسابي"
          active={screen === 'profile'}
          onPress={() => setScreen('profile')}
        />

      </View>

      <CreateMenu
        bottomInset={insets.bottom}
        visible={createMenuOpen}
        onClose={() => setCreateMenuOpen(false)}
        onCreateVideo={() => {
          setCreateMenuOpen(false);
          setScreen('upload');
        }}
        onStartLive={() => {
          setCreateMenuOpen(false);
          setScreen('live');
        }}
      />
    </View>
  );
}

function CreateMenu({ visible, bottomInset, onClose, onCreateVideo, onStartLive }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.createSheet, { paddingBottom: bottomInset + 24 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>إنشاء محتوى</Text>
          <Text style={styles.sheetSubtitle}>اختر الطريقة التي تريد أن تبدأ بها</Text>
          <Pressable onPress={onCreateVideo} style={({ pressed }) => [styles.createOption, pressed && styles.optionPressed]}>
            <View style={styles.optionIcon}><Text style={styles.optionIconText}>▶</Text></View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>إنشاء فيديو</Text>
              <Text style={styles.optionSubtitle}>اختر فيديو أو سجّل لحظة جديدة</Text>
            </View>
            <Text style={styles.optionArrow}>‹</Text>
          </Pressable>
          <Pressable onPress={onStartLive} style={({ pressed }) => [styles.createOption, pressed && styles.optionPressed]}>
            <View style={[styles.optionIcon, styles.liveIcon]}><Text style={styles.optionIconText}>●</Text></View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>بدء بث مباشر</Text>
              <Text style={styles.optionSubtitle}>الميزة ستكون متاحة قريبًا</Text>
            </View>
            <Text style={styles.optionArrow}>‹</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>إلغاء</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function LivePlaceholder({ onBack }) {
  return (
    <View style={styles.liveScreen}>
      <Text style={styles.liveBadge}>● LIVE</Text>
      <Text style={styles.liveTitle}>البث المباشر</Text>
      <Text style={styles.liveMessage}>سيتم تجهيز البث المباشر قريبًا.</Text>
      <Text style={styles.liveHint}>لا توجد خدمة بث حقيقية مرتبطة حاليًا.</Text>
      <TouchableOpacity onPress={onBack} style={styles.liveBackButton}>
        <Text style={styles.liveBackText}>العودة للرئيسية</Text>
      </TouchableOpacity>
    </View>
  );
}

function NavButton({ icon, text, active, onPress }) {
  return (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <Text style={[styles.navIcon, active && styles.active]}>
        {icon}
      </Text>

      <Text style={[styles.navText, active && styles.active]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  content: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 55,
    paddingHorizontal: 18,
  },

  title: {
    color: '#fff',
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },

  videoBox: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  vibe: {
    color: '#fff',
    fontSize: 45,
    fontWeight: '900',
    letterSpacing: 7,
  },

  placeholder: {
    color: '#777',
    marginTop: 10,
  },

  searchBox: {
    height: 55,
    backgroundColor: '#1b1b1b',
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  searchText: {
    color: '#999',
    fontSize: 15,
  },

  uploadButton: {
    height: 180,
    backgroundColor: '#171717',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },

  uploadIcon: {
    color: '#fff',
    fontSize: 55,
  },

  uploadText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  description: {
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
  },

  empty: {
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#222',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },

  username: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 35,
  },

  number: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  statText: {
    color: '#888',
    marginTop: 5,
    fontSize: 12,
  },

  bottomBar: {
    minHeight: 75,
    paddingTop: 6,
    backgroundColor: '#050505',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1b1b1b',
  },

  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
  },

  navIcon: {
    color: '#777',
    fontSize: 27,
  },

  navText: {
    color: '#777',
    fontSize: 10,
    marginTop: 2,
  },

  active: {
    color: '#fff',
  },

  plusButton: {
    width: 48,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  plus: {
    color: '#000',
    fontSize: 30,
    lineHeight: 32,
    fontWeight: 'bold',
  },

  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  createSheet: {
    paddingTop: 10,
    paddingHorizontal: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#111',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#555',
    marginBottom: 18,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  sheetSubtitle: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  createOption: {
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: '#1b1b1b',
    marginBottom: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionPressed: {
    opacity: 0.72,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  liveIcon: {
    backgroundColor: '#ff3040',
  },
  optionIconText: {
    color: '#000',
    fontSize: 22,
  },
  optionCopy: {
    flex: 1,
    marginHorizontal: 12,
  },
  optionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  optionSubtitle: {
    color: '#888',
    fontSize: 11,
    marginTop: 5,
  },
  optionArrow: {
    color: '#777',
    fontSize: 28,
  },
  cancelButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
    marginTop: 4,
  },
  cancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  liveScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000',
  },
  liveBadge: {
    color: '#ff3040',
    fontSize: 14,
    fontWeight: '900',
  },
  liveTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 16,
  },
  liveMessage: {
    color: '#ddd',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 14,
  },
  liveHint: {
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  liveBackButton: {
    minHeight: 50,
    minWidth: 190,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  liveBackText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
});