// Local-first storage: everything is written to the phone at once, then backed up
// to Supabase when there is a connection. A note never waits for the network.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureSession, supabase } from '../supabase';
import type { Child, DLang, Entry } from './model';

export const CONSENT_VERSION = 'diary-1';
const KEY = 'farket_diary_v1';

export interface Settings {
  lang: DLang;
  consentAt: string | null;
  reminder: { on: boolean; hour: number; minute: number };
  reminderAsked: boolean;
}

export interface DiaryState {
  settings: Settings;
  child: Child | null;
  entries: Entry[];
  /** What still has to reach the server. */
  pending: { child: boolean; settings: boolean; entryIds: string[] };
  lastSyncAt: string | null;
}

export const emptyState = (lang: DLang): DiaryState => ({
  settings: { lang, consentAt: null, reminder: { on: false, hour: 20, minute: 0 }, reminderAsked: false },
  child: null,
  entries: [],
  pending: { child: false, settings: false, entryIds: [] },
  lastSyncAt: null,
});

export async function loadState(fallbackLang: DLang): Promise<DiaryState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return { ...emptyState(fallbackLang), ...JSON.parse(raw) };
  } catch {
    // A broken local copy must never lock the parent out; start fresh.
  }
  return emptyState(fallbackLang);
}

export const saveState = (s: DiaryState) => AsyncStorage.setItem(KEY, JSON.stringify(s));

export const isSynced = (s: DiaryState) =>
  !s.pending.child && !s.pending.settings && s.pending.entryIds.length === 0;

/**
 * Pushes pending changes. Returns the state with the pending list cleared for what
 * went through; on any network error the state is returned unchanged and retried later.
 */
export async function sync(s: DiaryState): Promise<DiaryState> {
  if (isSynced(s) || !s.child || !s.settings.consentAt) return s;
  try {
    await ensureSession();
    const next: DiaryState = { ...s, pending: { ...s.pending, entryIds: [...s.pending.entryIds] } };

    if (s.pending.child) {
      const c = s.child;
      const { error } = await supabase.from('children').upsert({
        id: c.id, nickname: c.nickname, birth_year: c.birthYear, birth_month: c.birthMonth,
        sex: c.sex, gestation_weeks: 40 - c.weeksEarly,
      });
      if (error) throw error;
      next.pending.child = false;
    }

    if (s.pending.settings) {
      const st = s.settings;
      const { error } = await supabase.from('diary_profiles').upsert({
        language: st.lang,
        reminder_hour: st.reminder.on ? st.reminder.hour : null,
        reminder_minute: st.reminder.on ? st.reminder.minute : null,
        consent_at: st.consentAt, consent_version: CONSENT_VERSION,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      next.pending.settings = false;
    }

    const rows = s.entries.filter((e) => s.pending.entryIds.includes(e.id)).map((e) => ({
      id: e.id, child_id: e.childId, entry_date: e.date, body: e.text, frequency: e.frequency,
      kind: e.kind, category: e.category, regression: e.regression,
      created_at: e.createdAt, updated_at: e.updatedAt, deleted_at: e.deletedAt,
    }));
    if (rows.length) {
      const { error } = await supabase.from('diary_entries').upsert(rows);
      if (error) throw error;
      next.pending.entryIds = next.pending.entryIds.filter((id) => !rows.some((r) => r.id === id));
    }
    next.lastSyncAt = new Date().toISOString();
    return next;
  } catch {
    return s;
  }
}

/** Deletes the child (notes go with it on the server) and wipes the phone copy. */
export async function deleteEverything(s: DiaryState): Promise<boolean> {
  try {
    if (s.child) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { error } = await supabase.from('children').delete().eq('id', s.child.id);
        if (error) return false;
        await supabase.from('diary_profiles').delete().eq('user_id', data.session.user.id);
      }
    }
    await AsyncStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
