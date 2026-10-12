import type { WriteMethod } from './write-spec';
export interface UnavailableFee { status: 'FEE_QUOTE_UNAVAILABLE'; reason: string; usableForSubmission: false }
/** SDK 1.1.8 has gas estimation, but no evidenced total GenVM/AI allocation quote.
 * This production entry point performs no RPC, simulation or invented pricing. */
export function feeQuote(method: WriteMethod): UnavailableFee {
  return { status: 'FEE_QUOTE_UNAVAILABLE', reason: `${method}: total fee policy / GenVM allocation is not evidenced by SDK 1.1.8.`, usableForSubmission: false };
}
export interface MockFeePolicy { revision: string; gasPriceWei: bigint; gasUnits: bigint; allocationWei: bigint }
export function calculateMockFee(policy: MockFeePolicy) {
  if (!policy.revision || [policy.gasPriceWei, policy.gasUnits, policy.allocationWei].some(x => typeof x !== 'bigint' || x < 0n)) throw new Error('INVALID_MOCK_POLICY');
  return { status: 'MOCK_ONLY' as const, revision: policy.revision, totalWei: policy.gasPriceWei * policy.gasUnits + policy.allocationWei, usableForSubmission: false as const };
}
