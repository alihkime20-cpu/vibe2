import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function LiveScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>البث المباشر</Text>

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startText}>🔴 ابدأ بث</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.liveIcon}>🔴</Text>

        <Text style={styles.heading}>
          البثوث المباشرة
        </Text>

        <Text style={styles.subtitle}>
          ستظهر هنا البثوث المباشرة عندما يبدأ المستخدمون بالبث
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
    paddingHorizontal: dimensions.padding.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  title: {
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },

  startButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: dimensions.radius.medium,
  },

  startText: {
    color: colors.text,
    fontSize: dimensions.fontSize.small,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: dimensions.padding.large,
  },

  liveIcon: {
    fontSize: 50,
    marginBottom: 20,
  },

  heading: {
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});