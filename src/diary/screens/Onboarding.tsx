import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { DStrings } from '../i18n';
import { LANG_NAMES, LANGS, newId, type Child, type DLang, type Sex } from '../model';
import { c } from '../theme';
import { Btn, Card, Check, Chip, Row, t } from '../ui';

export function LangPicker({ lang, onChange }: { lang: DLang; onChange: (l: DLang) => void }) {
  return (
    <Row>
      {LANGS.map((l) => <Chip key={l} label={LANG_NAMES[l]} on={l === lang} onPress={() => onChange(l)} />)}
    </Row>
  );
}

export function Welcome({ s, lang, onLang, onNext }: {
  s: DStrings; lang: DLang; onLang: (l: DLang) => void; onNext: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={st.body}>
      <LangPicker lang={lang} onChange={onLang} />
      <Text style={[t.h1, st.top]}>{s.welcomeTitle}</Text>
      {s.welcomePoints.map((p, i) => (
        <View key={i} style={st.point}>
          <View style={st.num}><Text style={st.numText}>{i + 1}</Text></View>
          <Text style={[t.p, st.flex]}>{p}</Text>
        </View>
      ))}
      <Text style={t.small}>{s.notDiagnosis}</Text>
      <Btn label={s.start} onPress={onNext} />
    </ScrollView>
  );
}

export function Consent({ s, onAgree }: { s: DStrings; onAgree: () => void }) {
  const [adult, setAdult] = useState(false);
  return (
    <ScrollView contentContainerStyle={st.body}>
      <Text style={t.h1}>{s.consentTitle}</Text>
      <Text style={t.p}>{s.consentText}</Text>
      <Text style={t.small}>{s.consentAi}</Text>
      <Check label={s.adultConfirm} on={adult} onPress={() => setAdult(!adult)} />
      <Btn label={s.agree} disabled={!adult} onPress={onAgree} />
    </ScrollView>
  );
}

const PRETERM_WEEKS = [0, 2, 4, 6, 8, 10, 12];

export function ProfileForm({ s, today, initial, onSave, onCancel }: {
  s: DStrings; today: Date; initial: Child | null; onSave: (c: Child) => void; onCancel?: () => void;
}) {
  const [nickname, setNickname] = useState(initial?.nickname ?? '');
  const [year, setYear] = useState<number | null>(initial?.birthYear ?? null);
  const [month, setMonth] = useState<number | null>(initial?.birthMonth ?? null);
  const [sex, setSex] = useState<Sex>(initial?.sex ?? 'unspecified');
  const [weeksEarly, setWeeksEarly] = useState(initial?.weeksEarly ?? 0);
  const thisYear = today.getFullYear();
  const years = [0, 1, 2, 3, 4, 5].map((i) => thisYear - i);
  // No birth month in the future.
  const monthOk = (m: number) => !(year === thisYear && m > today.getMonth() + 1);
  const valid = nickname.trim().length > 0 && year !== null && month !== null && monthOk(month);

  return (
    <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
      <Text style={t.h1}>{s.profileTitle}</Text>
      <Card>
        <Text style={t.label}>{s.nicknameLabel}</Text>
        <TextInput style={st.input} value={nickname} onChangeText={setNickname} maxLength={40}
          placeholder="Elif" placeholderTextColor={c.muted} />
        <Text style={t.small}>{s.nicknameHint}</Text>
      </Card>
      <Card>
        <Text style={t.label}>{s.birthLabel}</Text>
        <Row>{years.map((y) => <Chip key={y} label={String(y)} on={y === year} onPress={() => setYear(y)} />)}</Row>
        <Row>
          {s.months.map((name, i) => monthOk(i + 1) && (
            <Chip key={name} label={name} on={month === i + 1} onPress={() => setMonth(i + 1)} />
          ))}
        </Row>
      </Card>
      <Card>
        <Text style={t.label}>{s.sexLabel}</Text>
        <Row>
          {(['girl', 'boy', 'unspecified'] as Sex[]).map((x) => (
            <Chip key={x} label={s.sex[x]} on={sex === x} onPress={() => setSex(x)} />
          ))}
        </Row>
      </Card>
      <Card>
        <Text style={t.label}>{s.pretermLabel}</Text>
        <Row>
          {PRETERM_WEEKS.map((w) => (
            <Chip key={w} label={w === 0 ? s.pretermNo : s.weeksEarly(w)} on={weeksEarly === w} onPress={() => setWeeksEarly(w)} />
          ))}
        </Row>
      </Card>
      <Btn label={s.save} disabled={!valid} onPress={() => onSave({
        id: initial?.id ?? newId(), nickname: nickname.trim(), birthYear: year!, birthMonth: month!, sex, weeksEarly,
      })} />
      {onCancel && <Btn label={s.cancel} outline onPress={onCancel} />}
    </ScrollView>
  );
}

export const st = StyleSheet.create({
  body: { padding: 20, gap: 16, paddingBottom: 48 },
  top: { marginTop: 12 },
  flex: { flex: 1 },
  point: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  num: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' },
  numText: { color: c.brand, fontWeight: '700' },
  input: { borderWidth: 1.5, borderColor: c.line, borderRadius: 12, paddingHorizontal: 14, minHeight: 48, fontSize: 17, color: c.ink, backgroundColor: c.card },
});
