import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  answerLabels, domains, MAX_MONTHS, MIN_MONTHS, questionsForAge, score,
  type Answer, type Lang, type Result,
} from './src/scoring';
import { t } from './src/i18n';
import { fetchReport, saveScreening } from './src/supabase';
import { buy, getPrices, type ReportKind } from './src/purchases';
import type { PurchasesStoreProduct } from 'react-native-purchases';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Step = 'consent' | 'age' | 'quiz' | 'result';

export default function App() {
  const [lang, setLang] = useState<Lang>('tr');
  const [step, setStep] = useState<Step>('consent');
  const [monthsText, setMonthsText] = useState('');
  const [months, setMonths] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [prices, setPrices] = useState<Partial<Record<ReportKind, PurchasesStoreProduct>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qs = useMemo(() => questionsForAge(months), [months]);
  const s = t[lang];

  const restart = () => {
    setStep('age'); setIndex(0); setAnswers({}); setResult(null); setMonthsText('');
    setScreeningId(null); setReport(null); setError(null);
  };

  const answer = (a: Answer) => {
    const next = { ...answers, [qs[index].id]: a };
    setAnswers(next);
    if (index + 1 < qs.length) setIndex(index + 1);
    else {
      const r = score(months, next);
      setResult(r); setStep('result');
      saveScreening(months, next, r).then(setScreeningId).catch(() => setError(s.saveFailed));
    }
  };

  useEffect(() => {
    if (screeningId) getPrices().then(setPrices).catch(() => setPrices({}));
  }, [screeningId]);

  const getReport = async (kind: ReportKind) => {
    if (!screeningId) return;
    setError(null);
    const product = prices[kind];
    if (product) {
      const paid = await buy(product);
      if (paid === 'cancelled') return;
      if (paid === 'failed') { setError(s.purchaseFailed); return; }
    }
    setBusy(true);
    // The store confirms the purchase to our server a few seconds after payment.
    let res = await fetchReport(screeningId, kind, lang);
    for (let i = 0; i < 6 && 'error' in res && res.error === 'payment_required' && product; i++) {
      await wait(2500);
      res = await fetchReport(screeningId, kind, lang);
    }
    setBusy(false);
    if ('content' in res) setReport(res.content);
    else setError(res.error === 'busy' ? s.reportBusy : s.reportFailed);
  };

  const monthsNum = parseInt(monthsText, 10);
  const ageMsg = !monthsText ? null
    : isNaN(monthsNum) ? s.ageInvalid
    : monthsNum < MIN_MONTHS ? s.ageTooYoung
    : monthsNum > MAX_MONTHS ? s.ageTooOld : null;

  return (
    <SafeAreaView style={st.root}>
      <StatusBar style="dark" />
      <View style={st.langRow}>
        {(['tr', 'en'] as Lang[]).map((l) => (
          <Pressable key={l} onPress={() => setLang(l)}>
            <Text style={[st.lang, lang === l && st.langOn]}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={st.body}>
        {step === 'consent' && (
          <>
            <Text style={st.h1}>{s.title}</Text>
            <Text style={st.p}>{s.intro}</Text>
            <Text style={st.note}>{s.disclaimer}</Text>
            <Text style={st.note}>{s.consent}</Text>
            <Btn label={s.agree} onPress={() => setStep('age')} />
          </>
        )}

        {step === 'age' && (
          <>
            <Text style={st.h2}>{s.ageQ}</Text>
            <TextInput style={st.input} keyboardType="number-pad" value={monthsText}
              onChangeText={setMonthsText} placeholder="24" />
            {ageMsg && <Text style={st.note}>{ageMsg}</Text>}
            <Btn label={s.start} disabled={!monthsText || !!ageMsg}
              onPress={() => { setMonths(monthsNum); setIndex(0); setStep('quiz'); }} />
          </>
        )}

        {step === 'quiz' && qs[index] && (
          <>
            <Text style={st.progress}>{index + 1} / {qs.length} · {domains[qs[index].domain][lang]}</Text>
            <Text style={st.h2}>{qs[index][lang]}</Text>
            {(['yes', 'sometimes', 'no'] as Answer[]).map((a) => (
              <Btn key={a} label={answerLabels[a][lang]} onPress={() => answer(a)} outline />
            ))}
            {index > 0 && <Pressable onPress={() => setIndex(index - 1)}><Text style={st.link}>{s.back}</Text></Pressable>}
          </>
        )}

        {step === 'result' && result && (
          <>
            <View style={[st.badge, { backgroundColor: riskColor[result.risk] }]}>
              <Text style={st.badgeText}>{s.risk[result.risk]}</Text>
            </View>
            <Text style={st.p}>{s.next[result.risk]}</Text>
            {result.limitedAge && <Text style={st.note}>{s.limitedAge}</Text>}
            {result.topDomains.length > 0 && (
              <>
                <Text style={st.h3}>{s.focus}</Text>
                {result.topDomains.slice(0, 3).map((d) => (
                  <Text key={d.domain} style={st.p}>• {domains[d.domain][lang]}</Text>
                ))}
              </>
            )}
            {report ? (
              <View style={st.report}><Text style={st.p}>{report}</Text></View>
            ) : (
              <>
                <Btn label={busy ? s.reportLoading : `${s.shortReport}${prices.short ? ` · ${prices.short.priceString}` : ''}`}
                  onPress={() => getReport('short')} disabled={busy || !screeningId} />
                <Btn label={`${s.detailedReport}${prices.detailed ? ` · ${prices.detailed.priceString}` : ''}`}
                  onPress={() => getReport('detailed')} disabled={busy || !screeningId} outline />
              </>
            )}
            {error && <Text style={st.error}>{error}</Text>}
            <Text style={st.note}>{s.disclaimer}</Text>
            <Btn label={s.again} onPress={restart} outline />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const riskColor = { low: '#2e7d32', medium: '#ef8f00', high: '#c62828' };

function Btn({ label, onPress, outline, disabled }: { label: string; onPress: () => void; outline?: boolean; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={[st.btn, outline && st.btnOutline, disabled && { opacity: 0.4 }]}>
      <Text style={[st.btnText, outline && st.btnOutlineText]}>{label}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fffaf5' },
  body: { padding: 20, gap: 14 },
  langRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingHorizontal: 20, paddingTop: 8 },
  lang: { color: '#999', fontWeight: '600' },
  langOn: { color: '#5b3cc4' },
  h1: { fontSize: 26, fontWeight: '700', color: '#2b2350' },
  h2: { fontSize: 20, fontWeight: '600', color: '#2b2350', lineHeight: 28 },
  h3: { fontSize: 16, fontWeight: '700', color: '#2b2350', marginTop: 8 },
  p: { fontSize: 16, color: '#333', lineHeight: 23 },
  note: { fontSize: 13, color: '#666', lineHeight: 19 },
  progress: { fontSize: 13, color: '#5b3cc4', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, fontSize: 18, backgroundColor: '#fff' },
  btn: { backgroundColor: '#5b3cc4', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#5b3cc4' },
  btnOutlineText: { color: '#5b3cc4' },
  link: { color: '#5b3cc4', textAlign: 'center', marginTop: 6 },
  report: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e6e0f7' },
  error: { color: '#c62828', fontSize: 14 },
  badge: { padding: 18, borderRadius: 14, alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
