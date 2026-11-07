import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { c, radius } from './theme';

export function Btn({ label, onPress, outline, disabled }: {
  label: string; onPress: () => void; outline?: boolean; disabled?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled}
      style={({ pressed }) => [s.btn, outline && s.btnOutline, (disabled || pressed) && { opacity: disabled ? 0.4 : 0.8 }]}>
      <Text style={[s.btnText, outline && s.btnOutlineText]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, on, onPress, tone }: {
  label: string; on?: boolean; onPress: () => void; tone?: 'warn' | 'good';
}) {
  const border = on ? (tone === 'warn' ? c.warn : tone === 'good' ? c.good : c.brand) : c.line;
  const bg = on ? (tone === 'warn' ? c.warnSoft : tone === 'good' ? c.goodSoft : c.brandSoft) : c.card;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!on }} onPress={onPress}
      style={[s.chip, { borderColor: border, backgroundColor: bg }]}>
      <Text style={[s.chipText, on && { color: c.ink, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

export const Row = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) =>
  <View style={[s.row, style]}>{children}</View>;

export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) =>
  <View style={[s.card, style]}>{children}</View>;

export function Check({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={onPress} style={s.check}>
      <View style={[s.box, on && s.boxOn]}>{on && <Text style={s.tick}>✓</Text>}</View>
      <Text style={s.checkText}>{label}</Text>
    </Pressable>
  );
}

export const t = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '700', color: c.ink, lineHeight: 34 },
  h2: { fontSize: 20, fontWeight: '600', color: c.ink, lineHeight: 27 },
  // No uppercase: it breaks Turkish (i → I instead of İ) and does nothing in Arabic.
  label: { fontSize: 14, fontWeight: '600', color: c.muted },
  p: { fontSize: 16, color: c.ink, lineHeight: 24 },
  small: { fontSize: 13, color: c.muted, lineHeight: 19 },
});

const s = StyleSheet.create({
  btn: { backgroundColor: c.brand, minHeight: 52, paddingHorizontal: 20, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  btnOutline: { backgroundColor: c.card, borderWidth: 1.5, borderColor: c.brand },
  btnOutlineText: { color: c.brand },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: radius.chip, borderWidth: 1.5, justifyContent: 'center' },
  chipText: { fontSize: 15, color: c.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: 16, gap: 10 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  box: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: c.brand, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: c.brand },
  tick: { color: '#fff', fontWeight: '700', fontSize: 15 },
  checkText: { flex: 1, fontSize: 16, color: c.ink, lineHeight: 22 },
});
