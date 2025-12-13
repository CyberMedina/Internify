import React from 'react';
import { View, ScrollView, ViewStyle, RefreshControl, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeTop?: boolean;
  safeBottom?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export default function ScreenContainer({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  safeTop = false,
  safeBottom = true,
  refreshing,
  onRefresh,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  const paddingTop = safeTop ? insets.top : 0;
  const paddingBottom = safeBottom ? insets.bottom : 0;

  if (scroll) {
    return (
      <ScrollView
        style={[{ flex: 1, backgroundColor: colors.card, paddingTop }, style]}
        contentContainerStyle={[{ paddingBottom: spacing(4) + paddingBottom }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
            colors={[colors.primary]}
          />
        ) : undefined}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: colors.card, paddingTop, paddingBottom }, style]}>
      {children}
    </View>
  );
}
