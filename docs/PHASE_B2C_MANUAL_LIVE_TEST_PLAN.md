# PHASE B2-C — future manual live test plan

**PREPARATION ONLY / NOT EXECUTED. CURRENT BUILD MUST STOP BEFORE SIGNING.** Fees unresolved; no reachable production write adapter. This plan is not authorization and does not rerun completed A deployment/E2E. No URL/env/debug toggle may unlock it. Later independently reviewed implementation and explicit authorization required.

## Entry conditions

1. Independently review Draft PR #4/head/tests; decide merging separately.
2. Establish complete fee policy/distribution/feeValue mapping or authoritative total-fee-free evidence for exactly SDK 1.1.8 / Stable 61999, covering GenVM, AI, Validators, Consensus, rotations and appeals. GasPrice 0/default gas/balance alone insufficient. Unresolved => STOP.
3. Review and authorize concrete future production integration and unknown/reload recovery. Current bridge is mock-isolated only.
4. User selects own browser wallet and reads full account/chain. Never disclose/import a private key or seed. Confirm contract `0x84e9284448D4cd16dcBBCbd8104449B11209C6F0`, source SHA256 `88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442`.

## Per-transaction future procedure

| Step | User action/evidence | Signature | Chain write |
|---|---|---|---|
| Preview | Exact ordered args, contract, actual fresh records/versions/Snapshot/permissions | No | No |
| Identity | Verify full public signer/provider/chain 61999; changes require fresh review | No | No |
| Fees | Record verified policy/source/distribution/fee value/gas/total maximum/expiry/fresh balance | No | No |
| Explicit confirmation | Acknowledge exact business consequences and immutable request/budget once | No | No |
| Wallet confirmation | User personally checks and signs wallet request matching approved account/chain/value/fee/encoded recipient | **Yes** | Not until accepted/broadcast |
| Broadcast/hash | One authorized provider attempt; save original id/hash/outcome; do not retry timeout | Prior signature | **Yes** if broadcast succeeds |
| Tracking | Read exact hash/status/full receipt/Explorer; ACCEPTED/SUBMITTED not final | No | No |
| Reconciliation | FINALIZED plus independent MAJORITY_AGREE/execution/decoded return and fresh actual views | No | No |

Locked SDK outer wallet `to` is Consensus `0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575`; decoded inner recipient canonical contract, sender selected wallet, 5 initial validators/3 rotations, leaderOnly false, no unexpected kwargs/value. Zero native value in mock bridge does not prove free consensus fees. Any evidenced different supported fee mapping needs independent review; never silently discard/replace fees. Unsupported distribution => STOP.

## Seven scenarios

Use real newly returned ids/versions, never mock fixture ids or fabricated ACTIVE/Assessments. Three participant wallets must belong to user or separately authorized holders; Work never signs for them. Use separate Intent sets/Cycles when state transitions would invalidate later scenarios.

| Method | User operation | Actual required result |
|---|---|---|
| create_intent | Exact four texts, real expiry 1–30 days clear of boundaries, owner capacity | Returned id/owner/version 1/exact terms |
| update_intent | Own OPEN record/current version, exact edits/expiry | Returned next version and exact actual edited record |
| cancel_intent | Own OPEN; reserved case separately acknowledges ABORT/releases | CANCELLED; reserved case ABORTED Cycle/three releases |
| assess_cycle | Three distinct owners' real OPEN ids, directed ring/versions, acknowledge AI cost | Actual Assessment/Prompt/Snapshot; NOT_MATCHED no Cycle, MATCHED PENDING/reservations |
| confirm_cycle | Each participant separately loads pending Snapshot and signs; optional separate duplicate case | Owner flag; third true ACTIVE/three CONSUMED; duplicate false NO_OP |
| decline_cycle | Separate pending Cycle, acknowledge permanent identical-Snapshot prohibition | ABORTED/releases; marker stays contract-authoritative |
| expire_cycle | Separate pending Cycle, wait real chain deadline (up to three days or earlier expiry); never falsify clock | EXPIRED cleanup/releases; repeat false NO_OP |

AI outcomes must be observed, not promised from fixtures. Do not re-assess an already-used identical Snapshot.

## Evidence user returns

For each separately authorized real transaction: hash/Explorer URL, method/ordered args, full public signer/chain, verified fee policy/quote/budget screenshot, original wallet outcome, FINALIZED status, complete transaction/receipt if available, consensus, leader execution/decoded return, finalized get_intent/get_assessment/get_cycle/owner records for affected ids, UTC observation and final-state screenshots. No secrets/unrelated wallet data. A click screenshot is not finality.

## STOP conditions

- FEE_QUOTE_UNAVAILABLE / ONCHAIN_SUBMISSION_DISABLED / unsupported fees / changed-expired policy / insufficient verified budget / unexplained 200000-gas sentinel.
- Wrong account/network/provider/contract/Consensus/args/value; changed version/content/Snapshot/reservation or wallet after review.
- Missing/unknown hash or timeout after possible broadcast, disconnect/reload during unresolved submission: keep original operation, independently inspect evidence, **never automatically resend**.
- ACCEPTED without FINALIZED, missing consensus/execution/return/raw evidence, receipt identity mismatch, state mismatch or TERMINAL_CONFLICT. No fake success/replacement transaction.

Current eligibility: **NO**. Fee closure plus independently authorized production activation come first.
