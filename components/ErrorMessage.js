import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function ErrorMessage({
  message = 'حدث خطأ غير متوقع.',
  onRetry,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>!</Text>

      <Text style={styles.title}>حدث خطأ</Text>

      <Text style={styles.message}>
        {message}
      </Text>

      {onRetry && (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: dimensions.padding.large,
  },

  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.danger,
    color: colors.text,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 50,
  },

  title: {
    color: colors.text,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
    marginTop: 16,
  },

  message: {
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.small,
    textAlign: 'center',
    marginTop: 8,
  },

  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: dimensions.radius.medium,
    marginTop: 20,
  },

  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
});