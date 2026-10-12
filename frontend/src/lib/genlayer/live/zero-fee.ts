import type { StagedFee } from '../staged/fee-budget';
import { fingerprint, frozen } from '../staged/immutable';
/** Operational premise confirmed by the user, not a fee quotation or certification. */
export interface ZeroFeePlan {
  status: 'USER_CONFIRMED_STUDIONET_ZERO_FEE'; chain: 61999;
  binding: string; expiresAt: number; gasUnits: bigint; gasPriceWei: 0n; nativeValue: 0n;
}
export function zeroFeeBudget(plan: StagedFee | ZeroFeePlan | undefined, binding: string, now: number): Readonly<ZeroFeePlan> {
  if (!plan || plan.status !== 'USER_CONFIRMED_STUDIONET_ZERO_FEE' || plan.chain !== 61999 || plan.binding !== binding || !Number.isFinite(plan.expiresAt) || now >= plan.expiresAt || typeof plan.gasUnits !== 'bigint' || plan.gasUnits <= 0n || plan.gasUnits > 30000000n || plan.gasPriceWei !== 0n || plan.nativeValue !== 0n) throw new Error('INVALID_STUDIONET_ZERO_FEE_PLAN');
  return frozen(plan);
}
export function sameZeroFee(a: ZeroFeePlan, b: ZeroFeePlan) {
  // Expiration may renew after the fresh recheck; the approved parameters may not change.
  if (fingerprint({...a,expiresAt:0}) !== fingerprint({...b,expiresAt:0})) throw new Error('TRANSACTION_PARAMETERS_CHANGED');
}
