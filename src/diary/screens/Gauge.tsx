import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { DStrings } from '../i18n';
import type { Gauge as GaugeData, Level } from '../model';
import { c, radius } from '../theme';
import { Btn, Card, t } from '../ui';

const LEVELS: Level[] = ['low', 'mid', 'high'];
export const levelColor: Record<Level, string> = { low: c.good, mid: c.warn, high: c.high };

/**
 * The level, why it is that level and what to do are always free: a parent must never
 * pay to learn that they should see a doctor. Only the full area breakdown is Premium.
 */
export function Gauge({ s, gauge, premium, onPremium, onBack }: {
  s: DStrings; gauge: GaugeData; premium: boolean;
  onPremium: () => void; onBack: () => void;
}) {
  const repeating = gauge.stats.filter((x) => x.repeating);
  const max = Math.max(1, ...gauge.stats.map((x) => x.concerns + x.positives));

  return (
    <ScrollView contentContainerStyle={st.body}>
      <Text style={t.h1}>{s.gaugeTitle}</Text>

      <Card>
        <View style={st.scale}>
          {LEVELS.map((l) => (
            <View key={l} style={[st.step, { borderColor: levelColor[l] }, gauge.level === l && { backgroundColor: levelColor[l] }]}>
              <Text style={[st.stepText, { color: gauge.level === l ? '#fff' : levelColor[l] }]}>{s.gaugeLevel[l]}</Text>
            </View>
          ))}
        </View>
        <Text style={t.p}>{s.gaugeLevelText[gauge.level]}</Text>
        <Text style={t.small}>{s.gaugeWindow}</Text>
      </Card>

      {gauge.regression && (
        <Card style={st.alert}>
          <Text style={[t.h2, { color: c.high }]}>{s.regressionAlertTitle}</Text>
          <Text style={t.p}>{s.regressionAlertText}</Text>
        </Card>
      )}

      <Card>
        <Text style={t.label}>{s.gaugeWhy}</Text>
        {repeating.length === 0 && <Text style={t.p}>{s.gaugeWhyNone}</Text>}
        {repeating.map((x) => (
          <View key={x.category} style={st.why}>
            <View style={[st.dot, { backgroundColor: levelColor[gauge.level] }]} />
            <View style={st.flex}>
              <Text style={t.p}>{s.category[x.category]}</Text>
              <Text style={t.small}>{s.gaugeRepeat(x.concernDays)}</Text>
            </View>
          </View>
        ))}
        {gauge.baselineHeld && <Text style={t.small}>{s.gaugeBaseline}</Text>}
        {gauge.uncategorized > 0 && <Text style={t.small}>{s.gaugeUncategorized(gauge.uncategorized)}</Text>}
      </Card>

      <Card>
        <Text style={t.label}>{s.gaugeAreas}</Text>
        {premium ? gauge.stats.map((x) => (
          <View key={x.category} style={st.area}>
            <Text style={t.p}>{s.category[x.category]}</Text>
            <View style={st.track}>
              <View style={{ flex: x.concerns / max, backgroundColor: c.warn }} />
              <View style={{ flex: x.positives / max, backgroundColor: c.good }} />
              <View style={{ flex: 1 - (x.concerns + x.positives) / max }} />
            </View>
            <Text style={t.small}>{s.gaugeAreaLine(x.concerns, x.positives)}</Text>
          </View>
        )) : (
          <>
            <Text style={t.p}>{s.premiumLocked}</Text>
            <Btn label={s.premiumSee} outline onPress={onPremium} />
          </>
        )}
      </Card>

      <Text style={t.small}>{s.notDiagnosis}</Text>
      <Btn label={s.back} outline onPress={onBack} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  body: { padding: 20, gap: 16, paddingBottom: 48 },
  flex: { flex: 1 },
  scale: { flexDirection: 'row', gap: 8 },
  step: { flex: 1, minHeight: 44, borderRadius: radius.chip, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 16, fontWeight: '700' },
  alert: { borderColor: c.high, borderWidth: 1.5 },
  why: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  area: { gap: 4 },
  track: { height: 10, borderRadius: 5, backgroundColor: c.line, flexDirection: 'row', overflow: 'hidden' },
});
