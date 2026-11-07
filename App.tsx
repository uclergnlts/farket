// Farket Takip: a development diary for parents of children aged 0-4.
// Phase 1: profile, notes (local first, backed up to Supabase), quick notes, reminder, 6 languages.
import { getLocales } from 'expo-localization';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { dt } from './src/diary/i18n';
import { computeGauge, correctedAgeMonths, isRtl, pickLang, ymd, type Child, type DLang, type Entry } from './src/diary/model';
import { allowNotifications, scheduleReminder } from './src/diary/reminder';
import { AddNote } from './src/diary/screens/AddNote';
import { Gauge } from './src/diary/screens/Gauge';
import { Home } from './src/diary/screens/Home';
import { Consent, ProfileForm, Welcome } from './src/diary/screens/Onboarding';
import { Settings } from './src/diary/screens/Settings';
import {
  deleteEverything, emptyState, isSynced, loadState, saveState, sync, type DiaryState,
} from './src/diary/storage';
import { c } from './src/diary/theme';

type Screen = 'welcome' | 'consent' | 'profile' | 'home' | 'add' | 'settings' | 'editChild' | 'gauge';

const deviceLang = () => pickLang(getLocales().map((l) => l.languageCode));

export default function App() {
  const [state, setState] = useState<DiaryState | null>(null);
  const [screen, setScreen] = useState<Screen>('welcome');
  const ref = useRef<DiaryState | null>(null);
  const syncing = useRef(false);

  const runSync = useCallback(async () => {
    if (syncing.current || !ref.current) return;
    syncing.current = true;
    const before = ref.current;
    const after = await sync(before);
    syncing.current = false;
    if (after === before || !ref.current) return;
    // Merge: anything changed while we were syncing stays pending.
    const cur = ref.current;
    const cleared = before.pending.entryIds.filter((id) => !after.pending.entryIds.includes(id));
    const merged: DiaryState = {
      ...cur,
      lastSyncAt: after.lastSyncAt,
      pending: {
        child: cur.child === before.child ? after.pending.child : cur.pending.child,
        settings: cur.settings === before.settings ? after.pending.settings : cur.pending.settings,
        entryIds: cur.pending.entryIds.filter((id) =>
          !cleared.includes(id) || cur.entries.find((e) => e.id === id) !== before.entries.find((e) => e.id === id)),
      },
    };
    ref.current = merged;
    setState(merged);
    await saveState(merged);
    if (!isSynced(merged)) setTimeout(runSync, 0);
  }, []);

  const commit = useCallback((next: DiaryState) => {
    ref.current = next;
    setState(next);
    saveState(next).catch(() => {});
    runSync();
  }, [runSync]);

  useEffect(() => {
    loadState(deviceLang()).then((s) => {
      ref.current = s;
      setState(s);
      setScreen(!s.settings.consentAt ? 'welcome' : s.child ? 'home' : 'profile');
      runSync();
    });
  }, [runSync]);

  if (!state) {
    return <View style={[st.root, st.center]}><ActivityIndicator color={c.brand} /></View>;
  }

  const s = dt[state.settings.lang];
  const rtl = isRtl(state.settings.lang);
  const now = new Date();
  const today = ymd(now);
  const synced = isSynced(state);

  const setLang = (lang: DLang) => {
    const settings = { ...state.settings, lang };
    commit({ ...state, settings, pending: { ...state.pending, settings: true } });
    const r = settings.reminder;
    if (r.on) scheduleReminder(true, r.hour, r.minute, dt[lang].reminderTitle, dt[lang].reminderBody).catch(() => {});
  };

  const setReminder = async (on: boolean, hour: number) => {
    const allowed = on ? await allowNotifications() : false;
    const base = ref.current ?? state;
    const reminder = { ...base.settings.reminder, on: on && allowed, hour };
    const next = { ...base, settings: { ...base.settings, reminder, reminderAsked: true }, pending: { ...base.pending, settings: true } };
    commit(next);
    scheduleReminder(reminder.on, reminder.hour, reminder.minute, s.reminderTitle, s.reminderBody).catch(() => {});
  };

  const saveChild = (child: Child) => {
    commit({ ...state, child, pending: { ...state.pending, child: true } });
    setScreen('home');
  };

  const addEntry = (e: Entry) => {
    const next: DiaryState = {
      ...state, entries: [...state.entries, e],
      pending: { ...state.pending, entryIds: [...state.pending.entryIds, e.id] },
    };
    commit(next);
    setScreen('home');
    if (e.regression) Alert.alert(s.regressionAlertTitle, s.regressionAlertText, [{ text: s.ok }]);
    // Ask for the reminder after the first note, when its value is obvious.
    else if (!next.settings.reminderAsked && Platform.OS !== 'web') {
      Alert.alert(s.reminder, s.reminderAsk, [
        { text: s.reminderAskNo, style: 'cancel', onPress: () => {
          const cur = ref.current ?? next;
          commit({ ...cur, settings: { ...cur.settings, reminderAsked: true } });
        } },
        { text: s.reminderAskYes, onPress: () => setReminder(true, 20) },
      ]);
    }
  };

  const deleteEntry = (id: string) => {
    const stamp = new Date().toISOString();
    commit({
      ...state,
      entries: state.entries.map((e) => (e.id === id ? { ...e, deletedAt: stamp, updatedAt: stamp } : e)),
      pending: { ...state.pending, entryIds: [...new Set([...state.pending.entryIds, id])] },
    });
  };

  const deleteAll = async () => {
    const ok = await deleteEverything(state);
    if (!ok) { Alert.alert(s.deleteAll, s.notSynced); return; }
    scheduleReminder(false, 0, 0, '', '').catch(() => {});
    const fresh = emptyState(state.settings.lang);
    ref.current = fresh;
    setState(fresh);
    setScreen('welcome');
  };

  let body: React.ReactNode = null;
  if (screen === 'welcome') {
    body = <Welcome s={s} lang={state.settings.lang} onLang={setLang} onNext={() => setScreen('consent')} />;
  } else if (screen === 'consent') {
    body = <Consent s={s} onAgree={() => {
      commit({ ...state, settings: { ...state.settings, consentAt: new Date().toISOString() }, pending: { ...state.pending, settings: true } });
      setScreen(state.child ? 'home' : 'profile');
    }} />;
  } else if (screen === 'profile' || screen === 'editChild' || !state.child) {
    body = <ProfileForm s={s} today={now} initial={state.child} onSave={saveChild}
      onCancel={screen === 'editChild' ? () => setScreen('settings') : undefined} />;
  } else if (screen === 'add') {
    body = <AddNote s={s} lang={state.settings.lang} childId={state.child.id} rtl={rtl}
      ageMonths={correctedAgeMonths(state.child, today)} today={today}
      onSave={addEntry} onCancel={() => setScreen('home')} />;
  } else if (screen === 'gauge') {
    // Premium and the paywall arrive with subscriptions; until then the breakdown stays locked.
    body = <Gauge s={s} gauge={computeGauge(state.entries, today)} premium={false}
      onPremium={() => {}} onBack={() => setScreen('home')} />;
  } else if (screen === 'settings') {
    body = <Settings s={s} settings={state.settings} synced={synced} onLang={setLang}
      onReminder={(on, hour) => setReminder(on, hour)} onEditChild={() => setScreen('editChild')}
      onDeleteAll={deleteAll} onBack={() => setScreen('home')} />;
  } else {
    body = <Home s={s} child={state.child} entries={state.entries} today={today} synced={synced}
      onAdd={() => setScreen('add')} onDelete={deleteEntry} onSettings={() => setScreen('settings')} onGauge={() => setScreen('gauge')} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={st.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView style={[st.root, { direction: rtl ? 'rtl' : 'ltr' }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
});
