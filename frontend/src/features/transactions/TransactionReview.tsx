import type { WalletState } from '../../lib/wallet/session';
import { WRITE_PARAMETERS } from '../../lib/genlayer/write-spec';
import { json, reviewCurrent, type Review } from './review';
export function TransactionReview({ review, wallet }: { review?: Review; wallet: WalletState }) {
  if (!review) return null;
  const current = reviewCurrent(review, wallet);
  return <section className="transaction-review" aria-label="Transaction review" aria-live="polite">
    <p className="eyebrow">REQUEST PREVIEW · NO TRANSACTION SENT</p><h2>{review.method}</h2>
    <p role="status">{current ? review.operation.status : 'BLOCKED — wallet identity changed; review again'}</p>
    <p className="notice">{review.notice}</p>
    <dl><dt>Contract</dt><dd><code>{review.parameters.address}</code></dd><dt>Account</dt><dd><code>{review.account}</code></dd><dt>Network</dt><dd>Stable Studionet 61999</dd></dl>
    <pre aria-label="Exact method parameters">{json(Object.fromEntries(WRITE_PARAMETERS[review.method].map((name, i) => [name, review.parameters.args[i]])))}</pre>
    <p><strong>{review.fee.status}</strong> · {review.fee.reason}</p><p><strong>ONCHAIN_SUBMISSION_DISABLED</strong></p>
    <p>No signature, broadcast, transaction hash or finalized outcome exists for this preview. Refresh finalized state to inspect actual records. Local validation uses an advisory clock; contract revalidation remains authoritative.</p>
  </section>;
}
