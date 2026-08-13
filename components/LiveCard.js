import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function LiveCard({
  username = '@vibe_user',
  viewers = 0,
  title = 'بث مباشر',
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.preview}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.avatar}>V</Text>
        </View>

        <View style={styles.viewerBadge}>
          <Text style={styles.viewerText}>👁 {viewers}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.username}>{username}</Text>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    backgroundColor: colors.surface,
    borderRadius: dimensions.radius.medium,
    overflow: 'hidden',
    marginRight: dimensions.padding.medium,
  },

  preview: {
    height: 190,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  liveText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },

  center: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatar: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },

  viewerBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },

  viewerText: {
    color: colors.text,
    fontSize: 10,
  },

  info: {
    padding: 10,
  },

  username: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },

  title: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
});