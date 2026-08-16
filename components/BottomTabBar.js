import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const TABS = [
  { id: 'home', icon: '⌂', label: 'الرئيسية' },
  { id: 'create', icon: '+', label: 'إنشاء' },
  { id: 'notifications', icon: '♡', label: 'الإشعارات' },
  { id: 'profile', icon: '♙', label: 'حسابي' },
];

export default function BottomTabBar({ activeTab, onTabPress, bottomInset = 0 }) {
  return (
    <View style={[styles.container, { paddingBottom: bottomInset + 6 }]}>
      {TABS.map((tab) => {
        const isCreate = tab.id === 'create';
        const active = activeTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            onPress={() => onTabPress(tab.id)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={[styles.iconContainer, isCreate && styles.createButton]}>
              <Text style={[styles.icon, active && styles.activeIcon, isCreate && styles.createIcon]}>
                {tab.icon}
              </Text>
            </View>
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 78,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 7,
    paddingHorizontal: dimensions.padding.small,
  },
  tab: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    height: 36,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.textMuted,
    fontSize: dimensions.iconSize.large,
    lineHeight: 30,
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
    fontWeight: '700',
  },
  createButton: {
    width: 48,
    height: 38,
    minWidth: 48,
    borderRadius: 11,
    backgroundColor: colors.text,
  },
  createIcon: {
    color: colors.background,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 33,
  },
  pressed: {
    opacity: 0.68,
  },
});
