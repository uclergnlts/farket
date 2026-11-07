import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { dayLabel } from '../format';
import type { DStrings } from '../i18n';
import {
  computeGauge, correctedAgeMonths, gaugeProgress, GAUGE_MIN_DAYS, GAUGE_MIN_NOTES, liveEntries, parseYmd, sortEntries, weekStrip,
  type Child, type Entry,
} from '../model';
import { c, radius } from '../theme';
import { Btn, Card, t } from '../ui';
import { levelColor } from './Gauge';

export function Home({ s, child, entries, today, synced, onAdd, onDelete, onSettings, onGauge }: {
  s: DStrings; child: Child; entries: Entry[]; today: string; synced: boolean;
  onAdd: () => void; onDelete: (id: string) => void; onSettings: () => void; onGauge: () => void;
}) {
  const live = sortEntries(liveEntries(entries));
  const progress = gaugeProgress(entries, today);
  // Half the bar is notes, half is days, so it never looks finished before both are.
  const done = ((GAUGE_MIN_NOTES - progress.notesLeft) / GAUGE_MIN_NOTES + (GAUGE_MIN_DAYS - progress.daysLeft) / GAUGE_MIN_DAYS) / 2;

  const confirmDelete = (e: Entry) =>
    Alert.alert(s.deleteNoteConfirm, e.text, [
      { text: s.cancel, style: 'cancel' },
      { text: s.deleteNote, style: 'destructive', onPress: () => onDelete(e.id) },
    ]);

  return (
    <View style={st.flex}>
      <ScrollView contentContainerStyle={st.body}>
        <View style={st.header}>
          <View style={st.flex}>
            <Text style={t.h2}>{child.nickname}</Text>
            <Text style={t.small}>{s.ageMonths(correctedAgeMonths(child, today))}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={s.settings} onPress={onSettings} style={st.gear}>
            <Text style={st.gearText}>⚙︎</Text>
          </Pressable>
        </View>

        {progress.ready ? (() => {
          const g = computeGauge(entries, today);
          return (
            <Pressable accessibilityRole="button" onPress={onGauge}>
              <Card style={{ borderColor: levelColor[g.level], borderWidth: 1.5 }}>
                <Text style={t.label}>{s.gaugeTitle}</Text>
                <Text style={[t.h1, { color: levelColor[g.level] }]}>{s.gaugeLevel[g.level]}</Text>
                <Text style={t.p}>{s.gaugeLevelText[g.level]}</Text>
                <Text style={[t.p, st.link]}>{s.gaugeOpen}</Text>
                <Text style={t.small}>{s.notDiagnosis}</Text>
              </Card>
            </Pressable>
          );
        })() : (
          <Card>
            <Text style={t.label}>{s.gaugeTitle}</Text>
            <View style={st.track}>
              <View style={[st.fill, { flex: done }]} />
              <View style={{ flex: 1 - done }} />
            </View>
            <Text style={t.p}>{s.gaugeForming(progress.notesLeft, progress.daysLeft)}</Text>
            <Text style={t.small}>{s.notDiagnosis}</Text>
          </Card>
        )}

        <View style={st.week}>
          {weekStrip(entries, today).map((d) => (
            <View key={d.date} style={st.day}>
              <Text style={[t.small, st.center]}>{parseYmd(d.date).getDate()}</Text>
              <View style={[st.dot, d.count > 0 && st.dotOn, d.date === today && st.dotToday]} />
            </View>
          ))}
        </View>

        <Text style={t.label}>{s.recentNotes}</Text>
        {live.length === 0 && (
          <Card>
            <Text style={t.h2}>{s.emptyTitle}</Text>
            <Text style={t.p}>{s.emptyText}</Text>
          </Card>
        )}
        {live.map((e) => (
          <Pressable key={e.id} onLongPress={() => confirmDelete(e)} accessibilityHint={s.deleteNote}
            style={[st.note, e.kind === 'positive' ? st.notePos : st.noteWorry]}>
            <Text style={t.p}>{e.text}</Text>
            <Text style={t.small}>
              {[dayLabel(e.date, today, s), s.frequency[e.frequency], e.category ? s.category[e.category] : null]
                .filter(Boolean).join(' · ')}
            </Text>
            {e.regression && <Text style={[t.small, st.reg]}>{s.regressionLabel}</Text>}
          </Pressable>
        ))}
        <Text style={[t.small, st.center]}>{synced ? s.synced : s.notSynced}</Text>
      </ScrollView>
      <View style={st.footer}>
        <Btn label={s.addNote} onPress={onAdd} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 20, gap: 14, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  gearText: { fontSize: 20, color: c.muted },
  track: { height: 10, borderRadius: 5, backgroundColor: c.line, flexDirection: 'row', overflow: 'hidden' },
  fill: { backgroundColor: c.brand, borderRadius: 5 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 6, width: 36 },
  center: { textAlign: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: c.brand },
  dotOn: { backgroundColor: c.brand },
  dotToday: { width: 18, height: 18, borderRadius: 9 },
  note: { borderRadius: radius.card, borderWidth: 1.5, padding: 14, gap: 4 },
  notePos: { backgroundColor: c.goodSoft, borderColor: c.good },
  noteWorry: { backgroundColor: c.warnSoft, borderColor: c.warn },
  reg: { color: c.high, fontWeight: '600' },
  link: { color: c.brand, fontWeight: '600' },
  footer: { padding: 16, paddingTop: 8, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line },
});
