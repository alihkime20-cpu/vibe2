import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import VideoEditorScreen from './screens/VideoEditorScreen';
import ProfileScreen from './screens/ProfileScreen';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const renderScreen = () => {
    if (screen === 'home') {
      return <HomeScreen />;
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
      <View style={styles.bottomBar}>

        <NavButton
          icon="⌂"
          text="الرئيسية"
          active={screen === 'home'}
          onPress={() => setScreen('home')}
        />

        <NavButton
          icon="⌕"
          text="بحث"
          active={screen === 'search'}
          onPress={() => setScreen('search')}
        />

        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => setScreen('upload')}
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
    height: 75,
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
});