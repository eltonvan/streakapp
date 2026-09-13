import Purchases, { type CustomerInfo, LOG_LEVEL } from 'react-native-purchases';

const IOS_API_KEY = 'appl_placeholder_ios_key';
const ANDROID_API_KEY = 'goog_placeholder_android_key';
const ENTITLEMENT_ID = 'pro';

export type SubscriptionTier = 'free' | 'pro_yearly' | 'pro_lifetime';

let isConfigured = false;

export async function initPurchases(): Promise<void> {
  if (isConfigured) return;

  await Purchases.configure({
    apiKey: __DEV__ ? IOS_API_KEY : IOS_API_KEY,
    appUserID: null,
  });
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  isConfigured = true;
}

async function getActiveEntitlement(customerInfo: CustomerInfo): Promise<string | undefined> {
  const active = customerInfo.entitlements.active;
  if (!active) return undefined;
  const entitlement = active[ENTITLEMENT_ID];
  if (!entitlement) return undefined;
  return entitlement.productIdentifier;
}

export async function getCurrentTier(): Promise<SubscriptionTier> {
  const info = await Purchases.getCustomerInfo();
  return tierFromEntitlement(await getActiveEntitlement(info));
}

function tierFromEntitlement(productId?: string): SubscriptionTier {
  if (!productId) return 'free';
  if (productId.includes('lifetime')) return 'pro_lifetime';
  if (productId.includes('yearly')) return 'pro_yearly';
  return 'free';
}

export async function purchaseYearly(): Promise<{ success: boolean; tier: SubscriptionTier }> {
  try {
    const offerings = await Purchases.getOfferings();
    const yearlyPackage = offerings.current?.availablePackages.find(
      (p) => p.identifier?.includes('yearly'),
    );
    if (!yearlyPackage) return { success: false, tier: 'free' };

    const { customerInfo } = await Purchases.purchasePackage(yearlyPackage);
    const productId = await getActiveEntitlement(customerInfo);
    const tier = tierFromEntitlement(productId);
    return { success: true, tier };
  } catch {
    return { success: false, tier: 'free' };
  }
}

export async function purchaseLifetime(): Promise<{ success: boolean; tier: SubscriptionTier }> {
  try {
    const offerings = await Purchases.getOfferings();
    const lifetimePackage = offerings.current?.availablePackages.find(
      (p) => p.identifier?.includes('lifetime'),
    );
    if (!lifetimePackage) return { success: false, tier: 'free' };

    const { customerInfo } = await Purchases.purchasePackage(lifetimePackage);
    const productId = await getActiveEntitlement(customerInfo);
    const tier = tierFromEntitlement(productId);
    return { success: true, tier };
  } catch {
    return { success: false, tier: 'free' };
  }
}

export async function restorePurchases(): Promise<{ success: boolean; tier: SubscriptionTier }> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const productId = await getActiveEntitlement(customerInfo);
    const tier = tierFromEntitlement(productId);
    return { success: true, tier };
  } catch {
    return { success: false, tier: 'free' };
  }
}