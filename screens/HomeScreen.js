import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>VIBE</Text>

        <View style={styles.headerTabs}>
          <Text style={styles.activeTab}>لك</Text>
          <Text style={styles.tab}>يتابع</Text>
        </View>
      </View>

      <View style={styles.feed}>
        <Text style={styles.vibe}>VIBE</Text>

        <Text style={styles.title}>
          ستظهر الفيديوهات هنا
        </Text>

        <Text style={styles.subtitle}>
          سنبني Feed الفيديوهات العمودي في الخطوة التالية
        </Text>
      </View>
    </SafeAreaView>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: dimensions.padding.large,
  },

  vibe: {
    color: colors.text,
    fontSize: dimensions.fontSize.huge,
    fontWeight: '900',
    letterSpacing: 8,
  },

  title: {
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
    marginTop: 20,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
    textAlign: 'center',
    marginTop: 8,
  },
});