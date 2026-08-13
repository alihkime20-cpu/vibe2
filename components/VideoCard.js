import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function VideoCard() {
  return (
    <View style={styles.container}>
      <View style={styles.videoPlaceholder}>
        <Text style={styles.vibeText}>VIBE</Text>
        <Text style={styles.placeholderText}>
          Video
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.username}>@vibe_user</Text>

        <Text style={styles.description}>
          هذا مثال لوصف الفيديو #VIBE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },

  vibeText: {
    color: colors.text,
    fontSize: dimensions.fontSize.huge,
    fontWeight: '900',
    letterSpacing: 5,
  },

  placeholderText: {
    color: colors.textMuted,
    marginTop: dimensions.padding.small,
  },

  info: {
    position: 'absolute',
    left: dimensions.padding.medium,
    bottom: dimensions.padding.large,
  },

  username: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },

  description: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    marginTop: dimensions.padding.small,
  },
});