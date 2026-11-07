import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Answer } from '../../scoring';
import { ANSWERS, answerText, baselineQuestions, baselineResult } from '../baseline';
import type { DStrings } from '../i18n';
import type { Baseline as BaselineT, DLang, Level } from '../model';
import { c, radius } from '../theme';
import { Btn, Card, t } from '../ui';
import { levelColor } from './Gauge';

const asLevel: Record<BaselineT['risk'], Level> = { low: 'low', medium: 'mid', high: 'high' };

/** One question per screen, three big answers. The result and its advice are always free. */
export function Baseline({ s, lang, ageMonths, today, onDone, onCancel }: {
  s: DStrings; lang: DLang; ageMonths: number; today: string;
  onDone: (b: BaselineT) => void; onCancel: () => void;
}) {
  const qs = baselineQuestions(ageMonths, lang);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<BaselineT | null>(null);

  const answer = (a: Answer) => {
    const next = { ...answers, [qs[i].id]: a };
    setAnswers(next);
    if (i + 1 < qs.length) setI(i + 1);
    else setResult(baselineResult(ageMonths, next, today));
  };

  if (result) {
    const level = asLevel[result.risk];
    return (
      <ScrollView contentContainerStyle={st.body}>
        <Text style={t.h1}>{s.baselineResultTitle}</Text>
        <Card style={{ borderColor: levelColor[level], borderWidth: 1.5 }}>
          <Text style={t.label}>{s.gaugeTitle}</Text>
          <Text style={[t.h1, { color: levelColor[level] }]}>{s.gaugeLevel[level]}</Text>
          <Text style={t.p}>{s.baselineResult[result.risk]}</Text>
        </Card>
        {result.regression && (
          <Card style={st.alert}>
            <Text style={[t.h2, { color: c.high }]}>{s.regressionAlertTitle}</Text>
            <Text style={t.p}>{s.regressionAlertText}</Text>
          </Card>
        )}
        <Text style={t.small}>{s.notDiagnosis}</Text>
        <Btn label={s.baselineDone} onPress={() => onDone(result)} />
      </ScrollView>
    );
  }

  const q = qs[i];
  return (
    <ScrollView contentContainerStyle={st.body}>
      <Text style={t.label}>{`${i + 1} / ${qs.length}`}</Text>
      <View style={st.track}>
        <View style={[st.fill, { flex: i / qs.length }]} />
        <View style={{ flex: 1 - i / qs.length }} />
      </View>
      <Text style={t.h2}>{q.text}</Text>
      {ANSWERS.map((a) => (
        <Pressable key={a} accessibilityRole="button" onPress={() => answer(a)}
          style={({ pressed }) => [st.answer, (pressed || answers[q.id] === a) && st.answerOn]}>
          <Text style={st.answerText}>{answerText(a, lang)}</Text>
        </Pressable>
      ))}
      <Btn label={i > 0 ? s.back : s.cancel} outline onPress={() => (i > 0 ? setI(i - 1) : onCancel())} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  body: { padding: 20, gap: 16, paddingBottom: 48 },
  track: { height: 8, borderRadius: 4, backgroundColor: c.line, flexDirection: 'row', overflow: 'hidden' },
  fill: { backgroundColor: c.brand },
  answer: { minHeight: 60, borderRadius: radius.card, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.card, justifyContent: 'center', paddingHorizontal: 18 },
  answerOn: { borderColor: c.brand, backgroundColor: c.brandSoft },
  answerText: { fontSize: 17, color: c.ink, fontWeight: '500' },
  alert: { borderColor: c.high, borderWidth: 1.5 },
});
