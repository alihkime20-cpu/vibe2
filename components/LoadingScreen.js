import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function LoadingScreen({
  message = 'جارٍ التحميل...',
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>VIBE</Text>

      <ActivityIndicator
        size="large"
        color={colors.primary}
      />

      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    color: colors.text,
    fontSize: dimensions.fontSize.huge,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 30,
  },

  message: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    marginTop: 15,
  },
});