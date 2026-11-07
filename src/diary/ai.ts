// Asks the server for an area suggestion. The gauge never depends on it.
import { ensureSession, supabase } from '../supabase';
import type { Category } from './model';

export type Suggestion =
  | { category: Category | null; urgent: boolean }
  | { error: 'limit' | 'offline' | 'failed' };

export async function suggestCategory(text: string, ageMonths: number): Promise<Suggestion> {
  try {
    await ensureSession();
    const { data, error } = await supabase.functions.invoke('diary-categorize', {
      body: { text, age_months: ageMonths },
    });
    if (!error && data && 'category' in data) {
      return { category: (data.category ?? null) as Category | null, urgent: data.urgent === true };
    }
    const status = (error as { context?: { status?: number } } | null)?.context?.status;
    if (status === 429) return { error: 'limit' };
    return { error: status ? 'failed' : 'offline' };
  } catch {
    return { error: 'offline' };
  }
}
