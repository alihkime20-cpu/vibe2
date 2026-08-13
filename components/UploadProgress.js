import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function UploadProgress({
  progress = 0,
  status = 'جارٍ رفع الفيديو...',
}) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.percent}>{safeProgress}%</Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.progress,
            { width: `${safeProgress}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: dimensions.radius.medium,
    padding: dimensions.padding.medium,
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  status: {
    color: colors.text,
    fontSize: dimensions.fontSize.small,
  },

  percent: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    fontWeight: 'bold',
  },

  track: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: dimensions.radius.round,
    overflow: 'hidden',
  },

  progress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.round,
  },
});