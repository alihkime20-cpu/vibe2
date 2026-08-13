import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

export default function BottomTabBar({ activeTab, onTabPress }) {
  const tabs = [
    { id: 'home', icon: '⌂', label: 'الرئيسية' },
    { id: 'search', icon: '⌕', label: 'البحث' },
    { id: 'upload', icon: '+', label: 'نشر' },
    { id: 'notifications', icon: '♡', label: 'الإشعارات' },
    { id: 'profile', icon: '♙', label: 'حسابي' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                tab.id === 'upload' && styles.uploadButton,
              ]}
            >
              <Text
                style={[
                  styles.icon,
                  active && styles.activeIcon,
                  tab.id === 'upload' && styles.plus,
                ]}
              >
                {tab.icon}
              </Text>
            </View>

            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 78,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: dimensions.padding.small,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
  },

  icon: {
    color: colors.textMuted,
    fontSize: dimensions.iconSize.large,
  },

  activeIcon: {
    color: colors.text,
  },

  label: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  activeLabel: {
    color: colors.text,
  },

  uploadButton: {
    width: 42,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },

  plus: {
    color: colors.background,
    fontSize: 27,
    fontWeight: 'bold',
    lineHeight: 30,
  },
});