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
  <details><summary>Transaction status meanings</summary><p>Definitions only. This request preview cannot advance to signing, submission or finality.</p><dl>{Object.entries(STATUS_MEANINGS).map(([status,meaning])=><div key={status}><dt>{status}</dt><dd>{meaning}</dd></div>)}</dl></details>
  </section>;
}

const STATUS_MEANINGS = {
  VALIDATING: 'Checking request and current records.', PREFLIGHT_READY: 'Preflight passed; this does not establish AI compatibility or authorize a write.',
  FEE_UNAVAILABLE: 'A verified total fee quote is unavailable; the request cannot proceed.',
  AWAITING_USER_SIGNATURE: 'A wallet request is waiting for a deliberate user signature.', USER_REJECTED: 'The user rejected the wallet request.',
  SUBMISSION_UNKNOWN: 'Submission outcome is unknown. Do not automatically retry.', SUBMITTED: 'A real transaction hash was observed; this is not finality.',
  PENDING_CONSENSUS: 'Waiting for consensus and a finalized receipt.', RECONCILIATION_REQUIRED: 'Finalized execution and actual contract state must be reconciled.',
  FINALIZED_SUCCESS: 'Finalized success with verified state reconciliation; false boolean returns are NO_OP.', FINALIZED_FAILURE: 'Finalized failure with verified reconciliation.',
  TERMINAL_CONFLICT: 'Contradictory finalized evidence. Locked pending independent review; no retry.', BLOCKED: 'Safety boundary prevents proceeding.',
};
