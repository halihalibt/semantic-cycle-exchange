import type { WalletState } from '../../lib/wallet/session';
import { prepareWrite, type WriteArgs, type WriteMethod } from '../../lib/genlayer/write-spec';
import { feeQuote } from '../../lib/genlayer/fees';
import { Transactions, type Operation } from '../../lib/genlayer/transaction';
import { frozen } from '../../lib/genlayer/staged/immutable';
import type { AdvisoryTime } from '../../lib/genlayer/write-validation';
export function caller(wallet: WalletState): string {
  if (wallet.status !== 'CONNECTED' || !wallet.account || wallet.chain !== '61999') throw new Error('CONNECTED_STUDIONET_WALLET_REQUIRED');
  return wallet.account;
}
export function advisory(fetchedAt: string, now = Math.floor(Date.now() / 1000)): AdvisoryTime {
  const observed = Math.floor(Date.parse(fetchedAt) / 1000);
  if (!Number.isSafeInteger(observed) || observed < 0) throw new Error('FRESH_READ_REQUIRED');
  return { now: String(now), observedAt: String(observed), marginSeconds: '30' };
}
export interface Review { args: WriteArgs[WriteMethod]; method: WriteMethod; parameters: ReturnType<typeof prepareWrite>; fee: ReturnType<typeof feeQuote>; operation: Operation; walletRevision: number; account: string; notice: string }
/** Pure blocked request review. No provider, SDK write client or executor. */
export function reviewRequest<M extends WriteMethod>(method: M, args: WriteArgs[M], wallet: WalletState, notice: string): Review {
  const account = caller(wallet);
  const parameters = prepareWrite(method, args);
  const tx = new Transactions();
  tx.begin('review', method, { account, chain: wallet.chain!, revision: wallet.revision });
  tx.prepared('review', false);
  const view = frozen({ args, method, fee: feeQuote(method), operation: tx.get('review'), walletRevision: wallet.revision, account, notice });
  // React 19.2 Performance Tracks JSON-stringifies enumerable primitive arrays.
  // Keep canonical BigInt arguments intact and explicitly accessible, but outside
  // its props traversal. Display rendering still uses the lossless json helper.
  return Object.freeze(Object.defineProperty({ ...view, parameters: frozen(parameters) }, 'parameters', {
    enumerable: false,
  }));
}
export function reviewCurrent(review: Review, wallet: WalletState) {
  return wallet.status === 'CONNECTED' && wallet.chain === '61999' && wallet.revision === review.walletRevision && wallet.account?.toLowerCase() === review.account.toLowerCase();
}
export function json(value: unknown) { return JSON.stringify(value, (_, x) => typeof x === 'bigint' ? x.toString() : x, 2); }
