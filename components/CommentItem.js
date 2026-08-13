import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function CommentItem({
  username = '@vibe_user',
  comment = 'تعليق رائع 🔥',
}) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>V</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.comment}>{comment}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    marginLeft: 10,
  },

  username: {
    color: colors.text,
    fontSize: dimensions.fontSize.small,
    fontWeight: 'bold',
  },

  comment: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    marginTop: 3,
    lineHeight: 18,
  },
});