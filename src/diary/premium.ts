// Premium subscription through RevenueCat. The store does the billing; RevenueCat tells us
// whether the "premium" entitlement is active, and its webhook mirrors that to Supabase so the
// server (AI allowance) knows too. Nothing here ever gates the level or the doctor advice.
import { Platform } from 'react-native';
import Purchases, {
  PACKAGE_TYPE, PURCHASES_ERROR_CODE, type CustomerInfo, type PurchasesPackage,
} from 'react-native-purchases';
import { ensureSession, supabase } from '../supabase';

// Public SDK keys from RevenueCat > Project > API keys (safe to ship). Empty = not set up yet.
const RC_KEYS = { ios: '', android: '' };
export const ENTITLEMENT = 'premium';
export const PRODUCT_IDS = { monthly: 'farket_premium_monthly', yearly: 'farket_premium_yearly' } as const;

let ready: Promise<boolean> | null = null;

/** Purchases are tied to the Supabase user id so the webhook can credit the right account. */
export function initPremium(): Promise<boolean> {
  ready ??= (async () => {
    const apiKey = Platform.OS === 'ios' ? RC_KEYS.ios : Platform.OS === 'android' ? RC_KEYS.android : '';
    if (!apiKey) return false;
    try {
      await ensureSession();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return false;
      Purchases.configure({ apiKey, appUserID: data.user.id });
      return true;
    } catch {
      return false;
    }
  })();
  ready.then((ok) => { if (!ok) ready = null; }); // try again next time (e.g. was offline)
  return ready;
}

const active = (info: CustomerInfo) => !!info.entitlements.active[ENTITLEMENT];

export async function isPremium(): Promise<boolean> {
  if (!(await initPremium())) return false;
  try { return active(await Purchases.getCustomerInfo()); } catch { return false; }
}

export function onPremiumChange(cb: (on: boolean) => void) {
  initPremium().then((ok) => { if (ok) Purchases.addCustomerInfoUpdateListener((i) => cb(active(i))); });
}

export interface Plans { monthly?: PurchasesPackage; yearly?: PurchasesPackage }

export async function getPlans(): Promise<Plans> {
  if (!(await initPremium())) return {};
  try {
    const pkgs = (await Purchases.getOfferings()).current?.availablePackages ?? [];
    return {
      monthly: pkgs.find((p) => p.packageType === PACKAGE_TYPE.MONTHLY || p.product.identifier.startsWith(PRODUCT_IDS.monthly)),
      yearly: pkgs.find((p) => p.packageType === PACKAGE_TYPE.ANNUAL || p.product.identifier.startsWith(PRODUCT_IDS.yearly)),
    };
  } catch {
    return {};
  }
}

/** True when the store offers this plan with a free first period (the 7-day trial). */
export const hasTrial = (p?: PurchasesPackage) => !!p && p.product.introPrice?.price === 0;

export type BuyResult = 'ok' | 'cancelled' | 'failed';

export async function subscribe(p: PurchasesPackage): Promise<BuyResult> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(p);
    return active(customerInfo) ? 'ok' : 'failed';
  } catch (e) {
    return (e as { code?: string }).code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ? 'cancelled' : 'failed';
  }
}

export async function restore(): Promise<boolean> {
  if (!(await initPremium())) return false;
  try { return active(await Purchases.restorePurchases()); } catch { return false; }
}
