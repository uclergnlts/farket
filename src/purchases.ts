import { Platform } from 'react-native';
import Purchases, { PRODUCT_CATEGORY, PURCHASES_ERROR_CODE, type PurchasesStoreProduct } from 'react-native-purchases';
import { supabase } from './supabase';

// Filled in once the RevenueCat project exists (public SDK keys, safe to ship).
const RC_KEYS = { ios: '', android: '' };

export const PRODUCT_IDS = {
  short: 'farket_short_report',
  detailed: 'farket_detailed_report',
} as const;
export type ReportKind = keyof typeof PRODUCT_IDS;

let configured = false;

/** Purchases are tied to the Supabase user id so the webhook can credit the right account. */
export async function initPurchases(): Promise<boolean> {
  const apiKey = Platform.OS === 'ios' ? RC_KEYS.ios : Platform.OS === 'android' ? RC_KEYS.android : '';
  if (!apiKey) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  if (!configured) {
    Purchases.configure({ apiKey, appUserID: data.user.id });
    configured = true;
  } else {
    await Purchases.logIn(data.user.id);
  }
  return true;
}

export async function getPrices(): Promise<Partial<Record<ReportKind, PurchasesStoreProduct>>> {
  if (!(await initPurchases())) return {};
  const products = await Purchases.getProducts(Object.values(PRODUCT_IDS), PRODUCT_CATEGORY.NON_SUBSCRIPTION);
  const out: Partial<Record<ReportKind, PurchasesStoreProduct>> = {};
  for (const p of products) {
    if (p.identifier === PRODUCT_IDS.short) out.short = p;
    if (p.identifier === PRODUCT_IDS.detailed) out.detailed = p;
  }
  return out;
}

export type BuyResult = 'ok' | 'cancelled' | 'failed';

export async function buy(product: PurchasesStoreProduct): Promise<BuyResult> {
  try {
    await Purchases.purchaseStoreProduct(product);
    return 'ok';
  } catch (e) {
    const code = (e as { code?: string }).code;
    return code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ? 'cancelled' : 'failed';
  }
}
