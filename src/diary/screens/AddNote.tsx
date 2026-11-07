import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { dayLabel } from '../format';
import type { DStrings } from '../i18n';
import {
  addDays, CATEGORIES, newId, type Category, type DLang, type Entry, type Frequency, type Kind,
} from '../model';
import { templatesForAge, type Template } from '../templates';
import { c } from '../theme';
import { Btn, Card, Check, Chip, Row, t } from '../ui';

/** How far back a note can be dated; older memories are less reliable. */
const MAX_DAYS_BACK = 60;

export function AddNote({ s, lang, childId, ageMonths, today, rtl, onSave, onCancel }: {
  s: DStrings; lang: DLang; childId: string; ageMonths: number; today: string; rtl: boolean;
  onSave: (e: Entry) => void; onCancel: () => void;
}) {
  const [date, setDate] = useState(today);
  const [text, setText] = useState('');
  const [kind, setKind] = useState<Kind>('concern');
  const [frequency, setFrequency] = useState<Frequency>('once');
  const [category, setCategory] = useState<Category | null>(null);
  const [regression, setRegression] = useState(false);
  const templates = templatesForAge(ageMonths);
  const oldest = addDays(today, -MAX_DAYS_BACK);

  const useTemplate = (tp: Template) => {
    setText(tp.text[lang]);
    setKind(tp.kind);
    setCategory(tp.category);
    setRegression(!!tp.regression);
  };

  const save = () => {
    const now = new Date().toISOString();
    onSave({
      id: newId(), childId, date, text: text.trim(), frequency, kind, category,
      // A lost skill is always a worry, whatever the parent tapped.
      regression, createdAt: now, updatedAt: now, deletedAt: null,
      ...(regression ? { kind: 'concern' as Kind } : {}),
    });
  };

  // In Arabic the arrows point the other way: "earlier" is to the right.
  const earlier = rtl ? '›' : '‹';
  const later = rtl ? '‹' : '›';

  return (
    <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
      <Text style={t.h1}>{s.newNote}</Text>

      <Card>
        <Text style={t.label}>{s.dateLabel}</Text>
        <View style={st.dateRow}>
          <Pressable accessibilityRole="button" disabled={date <= oldest} onPress={() => setDate(addDays(date, -1))} style={st.arrow}>
            <Text style={[st.arrowText, date <= oldest && st.off]}>{earlier}</Text>
          </Pressable>
          <Text style={[t.h2, st.dateText]}>{dayLabel(date, today, s)}</Text>
          <Pressable accessibilityRole="button" disabled={date >= today} onPress={() => setDate(addDays(date, 1))} style={st.arrow}>
            <Text style={[st.arrowText, date >= today && st.off]}>{later}</Text>
          </Pressable>
        </View>
      </Card>

      {templates.length > 0 && (
        <View style={st.gap}>
          <Text style={t.label}>{s.quickNotes}</Text>
          <Row>
            {templates.map((tp) => (
              <Chip key={tp.id} label={tp.text[lang]} on={text === tp.text[lang]}
                tone={tp.kind === 'positive' ? 'good' : 'warn'} onPress={() => useTemplate(tp)} />
            ))}
          </Row>
        </View>
      )}

      <Card>
        <Text style={t.label}>{s.whatDidYouSee}</Text>
        <TextInput style={[st.input, rtl && st.rtlText]} value={text} onChangeText={setText} multiline maxLength={1000}
          placeholder={s.notePlaceholder} placeholderTextColor={c.muted} />
        <Text style={t.small}>{s.dictateHint}</Text>
      </Card>

      <Card>
        <Text style={t.label}>{s.kindLabel}</Text>
        <Row>
          <Chip label={s.kind.concern} tone="warn" on={kind === 'concern'} onPress={() => setKind('concern')} />
          <Chip label={s.kind.positive} tone="good" on={kind === 'positive'}
            onPress={() => { setKind('positive'); setRegression(false); }} />
        </Row>
        <Text style={t.label}>{s.frequencyLabel}</Text>
        <Row>
          {(['once', 'few', 'daily'] as Frequency[]).map((f) => (
            <Chip key={f} label={s.frequency[f]} on={frequency === f} onPress={() => setFrequency(f)} />
          ))}
        </Row>
        {kind === 'concern' && (
          <Check label={s.regressionLabel} on={regression} onPress={() => setRegression(!regression)} />
        )}
      </Card>

      <Card>
        <Text style={t.label}>{s.categoryLabel} {s.categoryOptional}</Text>
        <Row>
          {CATEGORIES.map((k) => (
            <Chip key={k} label={s.category[k]} on={category === k} onPress={() => setCategory(category === k ? null : k)} />
          ))}
        </Row>
      </Card>

      <Btn label={s.save} disabled={text.trim().length === 0} onPress={save} />
      <Btn label={s.cancel} outline onPress={onCancel} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  body: { padding: 20, gap: 16, paddingBottom: 48 },
  gap: { gap: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { flex: 1, textAlign: 'center' },
  arrow: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 32, color: c.brand },
  off: { color: c.line },
  input: { minHeight: 110, borderWidth: 1.5, borderColor: c.line, borderRadius: 12, padding: 14, fontSize: 17, color: c.ink, textAlignVertical: 'top', backgroundColor: c.card },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
