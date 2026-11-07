import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { DStrings } from '../i18n';
import { getPlans, hasTrial, restore, subscribe, type Plans } from '../premium';
import { c, radius } from '../theme';
import { Btn, Card, t } from '../ui';

type Pick = 'yearly' | 'monthly';

/** Plain and calm: price, renewal and how to cancel are all on screen before the button. */
export function Paywall({ s, premium, onDone, onBack }: {
  s: DStrings; premium: boolean; onDone: () => void; onBack: () => void;
}) {
  const [plans, setPlans] = useState<Plans | null>(null);
  const [pick, setPick] = useState<Pick>('yearly');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { getPlans().then(setPlans); }, []);

  const chosen = plans?.[pick];
  const buy = async () => {
    if (!chosen) return;
    setBusy(true); setMsg(null);
    const r = await subscribe(chosen);
    setBusy(false);
    if (r === 'ok') onDone(); else if (r === 'failed') setMsg(s.premiumFailed);
  };
  const doRestore = async () => {
    setBusy(true); setMsg(null);
    const ok = await restore();
    setBusy(false);
    if (ok) onDone(); else setMsg(s.premiumRestoreNone);
  };

  const option = (k: Pick) => {
    const p = plans?.[k];
    if (!p) return null;
    const on = pick === k;
    const price = p.product.priceString;
    return (
      <Pressable key={k} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setPick(k)}
        style={[st.plan, on && st.planOn]}>
        <View style={[st.radio, on && st.radioOn]} />
        <Text style={[t.p, st.flex, on && st.bold]}>{k === 'yearly' ? s.premiumYearly(price) : s.premiumMonthly(price)}</Text>
        {k === 'yearly' && <Text style={st.badge}>{s.premiumBestValue}</Text>}
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={st.body}>
      <Text style={t.h1}>{s.premiumTitle}</Text>
      {premium ? (
        <Card><Text style={t.p}>{s.premiumActive}</Text></Card>
      ) : (
        <>
          <Card>
            {s.premiumBenefits.map((b) => (
              <View key={b} style={st.benefit}>
                <Text style={st.tick}>✓</Text>
                <Text style={[t.p, st.flex]}>{b}</Text>
              </View>
            ))}
          </Card>
          <Text style={t.small}>{s.premiumFreeNote}</Text>

          {plans === null && <ActivityIndicator color={c.brand} />}
          {plans && !plans.yearly && !plans.monthly && <Card><Text style={t.p}>{s.premiumUnavailable}</Text></Card>}
          {plans && (plans.yearly || plans.monthly) && (
            <>
              {option('yearly')}
              {option('monthly')}
              {hasTrial(chosen) && <Text style={t.small}>{s.premiumTrialNote}</Text>}
              <Text style={t.small}>{s.premiumRenewNote}</Text>
              <Btn label={hasTrial(chosen) ? s.premiumStartTrial : s.premiumContinue} disabled={busy || !chosen} onPress={buy} />
            </>
          )}
          {msg && <Text style={[t.small, st.center]}>{msg}</Text>}
          <Btn label={s.premiumRestore} outline disabled={busy} onPress={doRestore} />
        </>
      )}
      <Btn label={premium ? s.back : s.premiumNotNow} outline onPress={onBack} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  body: { padding: 20, gap: 14, paddingBottom: 48 },
  flex: { flex: 1 },
  bold: { fontWeight: '600' },
  center: { textAlign: 'center' },
  benefit: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tick: { color: c.brand, fontSize: 18, fontWeight: '700', lineHeight: 24 },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 16, borderRadius: radius.card, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.card },
  planOn: { borderColor: c.brand, backgroundColor: c.brandSoft },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.line },
  radioOn: { borderColor: c.brand, borderWidth: 6 },
  badge: { fontSize: 12, fontWeight: '700', color: '#fff', backgroundColor: c.brand, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
});
