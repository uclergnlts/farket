import { Alert, Linking, ScrollView, Share, StyleSheet, Text } from 'react-native';
import type { DStrings } from '../i18n';
import { pad, type DLang, type Entry } from '../model';
import { entriesCsv } from '../report';
import type { Settings as SettingsT } from '../storage';
import { c } from '../theme';
import { Btn, Card, Chip, Row, t } from '../ui';
import { LangPicker } from './Onboarding';

const HOURS = [18, 19, 20, 21, 22];
export const PRIVACY_URL = 'https://farket.uclergnlts.com/app-privacy/';

export function Settings({ s, settings, entries, synced, premium, onPremium, onLang, onReminder, onEditChild, onDeleteAll, onBack }: {
  s: DStrings; settings: SettingsT; entries: Entry[]; synced: boolean; premium: boolean; onPremium: () => void;
  onLang: (l: DLang) => void; onReminder: (on: boolean, hour: number) => void;
  onEditChild: () => void; onDeleteAll: () => void; onBack: () => void;
}) {
  const r = settings.reminder;
  return (
    <ScrollView contentContainerStyle={st.body}>
      <Text style={t.h1}>{s.settings}</Text>
      <Card>
        <Text style={t.label}>{s.language}</Text>
        <LangPicker lang={settings.lang} onChange={onLang} />
      </Card>
      <Card>
        <Text style={t.label}>{s.reminder}</Text>
        <Row>
          <Chip label={s.reminderOn} on={r.on} onPress={() => onReminder(true, r.hour)} />
          <Chip label={s.reminderOff} on={!r.on} onPress={() => onReminder(false, r.hour)} />
        </Row>
        {r.on && (
          <>
            <Text style={t.label}>{s.reminderTime}</Text>
            <Row>
              {HOURS.map((h) => (
                <Chip key={h} label={`${pad(h)}:${pad(r.minute)}`} on={r.hour === h} onPress={() => onReminder(true, h)} />
              ))}
            </Row>
          </>
        )}
      </Card>
      <Card>
        <Text style={t.label}>{s.premiumTitle}</Text>
        {premium ? <Text style={t.p}>{s.premiumActive}</Text> : <Btn label={s.premiumSee} outline onPress={onPremium} />}
      </Card>
      <Card>
        <Text style={t.label}>{s.profileTitle}</Text>
        <Btn label={s.profileTitle} outline onPress={onEditChild} />
      </Card>
      <Card>
        <Text style={t.p}>{s.privacyNote}</Text>
        <Text style={t.small}>{synced ? s.synced : s.notSynced}</Text>
        <Text style={t.small}>{s.notDiagnosis}</Text>
        <Btn label={s.privacyLink} outline onPress={() => { Linking.openURL(PRIVACY_URL).catch(() => {}); }} />
        <Text style={t.small}>{s.exportHint}</Text>
        <Btn label={s.exportData} outline onPress={() => { Share.share({ title: 'farket-notes.csv', message: entriesCsv(entries) }).catch(() => {}); }} />
        <Btn label={s.deleteAll} outline onPress={() => Alert.alert(s.deleteAll, s.deleteAllConfirm, [
          { text: s.cancel, style: 'cancel' },
          { text: s.deleteNote, style: 'destructive', onPress: onDeleteAll },
        ])} />
      </Card>
      <Btn label={s.back} onPress={onBack} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  body: { padding: 20, gap: 16, paddingBottom: 48, backgroundColor: c.bg },
});
