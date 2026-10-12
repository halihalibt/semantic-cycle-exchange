# PHASE B2-B security boundaries

Production is request-review only. Every successful advisory preflight ends in FEE_UNAVAILABLE and FEE_QUOTE_UNAVAILABLE / ONCHAIN_SUBMISSION_DISABLED. There is no provider, SDK write client, signing callback or transaction executor in the business components. No environment flag or hidden route enables writes. The unchanged B2-A request-boundary is imported by offline tests only; it is not connected to the production App.

WalletPanel reuses the original WalletSession and discovery; the only integration change is an optional state callback. Account/network/revision invalidation blocks previous reviews. My Intents uses the connected actual public address, not a manually entered substitute. Forms lock input during async preflight; form edits invalidate reviews. Duplicate clicks during a pending review are blocked. Repeating a review is safe because no transaction exists. There is no retry of a submitted or unknown transaction.

All seven write methods reuse prepareWrite and the B2-A validators. Reads use the existing fixed-contract, seven-view ReadApi and Worker. No assessments-page endpoint was added. Reserved cancellation reads the associated Cycle and all current records; confirm and decline use the fresh chain-read Snapshot and current reservations. Versions from the loaded Intent/Builder selection are compared against fresh records. Canonical owner/term/version/edge/flag mapping is checked before displaying Cycle actions. Canonical rotation preserves direction; AI semantics remain NOT_EVALUATED in the Builder. Canonical prompt version/digest is checked in the Assessment Viewer.

Expire distinguishes effective expiry from stored cleanup. Duplicate confirmation and already-cleaned expiry previews state expected NO_OP and never mutate confirmation flags/counts. These are advisory expected outcomes, not observed transaction returns. Existing Transactions mock tests still verify actual false-return handling, finality reconciliation, unknown submission and TERMINAL_CONFLICT lockout. Status meanings in review UI are definitions, never simulated receipts.

Owner capacity uses contract unfinished_count across all owner slots, not the current history page. Owner history uses one shared offset and next_offset for both arrays. Explore filters only the current page. No optimistic Intent ID, version increment, Cycle, hash or finalized success is created. All service text uses React text rendering; no dangerouslySetInnerHTML or wallet icons.

Local time is advisory. Existing 30-second freshness/boundary checks fail closed; 1/30-day exact duration previews require a later authoritative contract-time check. Reads across multiple requests are not an atomic snapshot. The contract remains authoritative for snapshot digest/replay/decline markers, time and execution. No frontend advisory result authorizes a write.

Tests run with Mock Provider, Mock RPC, stubbed browser fetch and the unchanged process/worker socket deny boundary. npm install is dependency acquisition, not a blockchain operation. No real wallet was operated, no key/seed was read, and no real RPC write/AI assessment/signature/transaction/deployment/publication was performed. Live reads and browser extension behavior were NOT RUN in B2-B.

Canonical contract/Prompt, Repository A, SDK 1.1.8, Stable Studionet 61999 and RPC are unchanged. No sim_getFeeConfig, new dependencies, backend, database, paid service, merge, B2-C/B3 or Portal submission.


## Later user browser acceptance boundary (2026-10-13)

This document's prior statement that no browser wallet/live read was operated is a factual **Work execution** statement. Separately, the user connected OKX Wallet on 61999 and performed live **read-only** calls and purely advisory request previews in Windows Chrome. No signing, broadcasts or chain writes followed. Recorded screenshots and limitations: [acceptance](PHASE_B2B_WINDOWS_CHROME_ACCEPTANCE.md) and [metadata](../evidence/b2b/windows-chrome-screenshot-manifest.md). The original Work Chromium OPTIONS `ERR_EMPTY_RESPONSE` stays BLOCKED / UNKNOWN, not diagnosed as CORS. This addendum does not authorize a write executor.
