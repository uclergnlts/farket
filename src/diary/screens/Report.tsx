import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { dt } from '../i18n';
import type { DStrings } from '../i18n';
import type { Baseline, Child, DLang, Entry } from '../model';
import { buyReport, getReportProduct } from '../premium';
import { buildReportHtml, reportEntries } from '../report';
import { LANG_NAMES } from '../model';
import type { PurchasesStoreProduct } from 'react-native-purchases';
import { Btn, Card, Chip, Row, t } from '../ui';

const RANGES = [30, 60, 90];

/** Premium makes unlimited summaries; without it, one summary can be bought on its own. */
export function Report({ s, lang, child, entries, baseline, today, premium, onPremium, onBack }: {
  s: DStrings; lang: DLang; child: Child; entries: Entry[]; baseline: Baseline | null; today: string;
  premium: boolean; onPremium: () => void; onBack: () => void;
}) {
  const [days, setDays] = useState(30);
  const [reportLang, setReportLang] = useState<DLang>(lang);
  const [product, setProduct] = useState<PurchasesStoreProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const count = reportEntries(entries, today, days).length;

  useEffect(() => { if (!premium) getReportProduct().then(setProduct); }, [premium]);

  const make = async () => {
    const html = buildReportHtml({ s: dt[reportLang], lang: reportLang, child, entries, baseline, today, days });
    if (Platform.OS === 'web') { await Print.printAsync({ html }); return; }
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    else await Print.printAsync({ uri });
  };

  const create = async () => {
    setBusy(true); setMsg(null);
    try {
      if (!premium) {
        if (!product) return;
        const r = await buyReport(product);
        if (r !== 'ok') { if (r === 'failed') setMsg(s.premiumFailed); return; }
      }
      await make();
    } catch {
      setMsg(s.reportFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={st.body}>
      <Text style={t.h1}>{s.reportTitle}</Text>
      <Text style={t.p}>{s.reportIntro}</Text>
      <Card>
        <Text style={t.label}>{s.dateLabel}</Text>
        <Row>{RANGES.map((n) => <Chip key={n} label={s.reportDays(n)} on={days === n} onPress={() => setDays(n)} />)}</Row>
        <Text style={t.label}>{s.reportLang}</Text>
        <Row>
          {[...new Set<DLang>([lang, 'en'])].map((l) => (
            <Chip key={l} label={LANG_NAMES[l]} on={reportLang === l} onPress={() => setReportLang(l)} />
          ))}
        </Row>
      </Card>
      {count === 0 ? <Card><Text style={t.p}>{s.reportEmpty}</Text></Card> : premium ? (
        <Btn label={s.reportCreate} disabled={busy} onPress={create} />
      ) : (
        <>
          {product
            ? <Btn label={s.reportBuy(product.priceString)} disabled={busy} onPress={create} />
            : <Card><Text style={t.p}>{s.premiumUnavailable}</Text></Card>}
          <Text style={t.small}>{s.reportIncluded}</Text>
          <Btn label={s.premiumSee} outline onPress={onPremium} />
        </>
      )}
      {msg && <Text style={t.small}>{msg}</Text>}
      <Text style={t.small}>{s.notDiagnosis}</Text>
      <Btn label={s.back} outline onPress={onBack} />
    </ScrollView>
  );
}

const st = StyleSheet.create({ body: { padding: 20, gap: 16, paddingBottom: 48 } });
