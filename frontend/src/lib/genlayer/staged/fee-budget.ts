import { fingerprint, frozen } from './immutable';
/** Deliberately MOCK_ONLY. No conversion to a production quote or native-value override. */
export interface StagedFee {
  status: 'MOCK_ONLY'; policy: string; binding: string; expiresAt: number;
  gasUnits: bigint; gasPriceWei: bigint; feeValueWei: bigint; distribution: bigint[];
  coverage: { genvm: true; ai: true; validators: true; consensus: true; rotations: true; appeals: true };
}
export function feeBudget(quote: StagedFee | undefined, binding: string, now: number, balance: bigint, approvedBudget: bigint): Readonly<StagedFee> {
  if (!quote) throw new Error('FEE_QUOTE_UNAVAILABLE');
  const values = [quote.gasUnits, quote.gasPriceWei, quote.feeValueWei, ...quote.distribution, balance, approvedBudget];
  if (quote.status !== 'MOCK_ONLY' || !quote.policy || quote.binding !== binding || !Number.isFinite(quote.expiresAt) || now >= quote.expiresAt || !quote.distribution.length || values.some(v => typeof v !== 'bigint' || v < 0n) || quote.gasUnits === 0n || quote.distribution.reduce((a,b) => a+b, 0n) !== quote.feeValueWei || ['genvm','ai','validators','consensus','rotations','appeals'].some(k => quote.coverage?.[k as keyof StagedFee['coverage']] !== true)) throw new Error('UNVERIFIED_FEE_POLICY');
  const total = quote.gasUnits * quote.gasPriceWei + quote.feeValueWei;
  if (balance < total || approvedBudget < total) throw new Error('INSUFFICIENT_VERIFIED_FEE_BUDGET');
  return frozen(quote);
}
export function sameFee(previous: StagedFee, next: StagedFee) {
  if (fingerprint(previous) !== fingerprint(next)) throw new Error('FEE_POLICY_CHANGED');
}
