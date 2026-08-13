import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function ProfileHeader({
  username = '@vibe_user',
  name = 'Vibe User',
  followers = 0,
  following = 0,
  videos = 0,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>V</Text>
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.username}>{username}</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.number}>{videos}</Text>
          <Text style={styles.label}>فيديو</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.number}>{followers}</Text>
          <Text style={styles.label}>متابع</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.number}>{following}</Text>
          <Text style={styles.label}>يتابع</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: dimensions.padding.large,
    backgroundColor: colors.background,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },

  avatarText: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
  },

  name: {
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
    marginTop: 12,
  },

  username: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    marginTop: 4,
  },

  stats: {
    flexDirection: 'row',
    marginTop: 20,
  },

  stat: {
    alignItems: 'center',
    marginHorizontal: 18,
  },

  number: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },

  label: {
    color: colors.textMuted,
    fontSize: dimensions.fontSize.small,
    marginTop: 4,
  },
});