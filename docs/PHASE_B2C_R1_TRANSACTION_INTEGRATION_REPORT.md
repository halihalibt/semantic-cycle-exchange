# SCA-3 V1 — B2-C-R1 TRANSACTION INTEGRATION REPORT

Status: ENGINEERING / OFFLINE ACCEPTANCE PASS; READY FOR USER-OPERATED LIVE E2E. Remain Draft PR #4, unmerged and unpublished. No new live wallet or blockchain execution is claimed.

## Authoritative checkpoint

- Account: `halihalibt`.
- A main verified through GitHub: `8a09380c06f12afd6ac85197737b0018cd8e594f`; local read-only checkout remains clean.
- B main: `a98d3dcbefcef6e37b11fb41a2ef9e11050c5b78`.
- Audited PR baseline: `6132f7372234664d7ee1891278ea0b0b66da24db`.
- Existing branch: `phase-b2c-staged-transaction-integration`; existing [Draft PR #4](https://github.com/halihalibt/semantic-cycle-exchange/pull/4). Exact final R1 HEAD is recorded in PR metadata/body and the execution response after the expected-head lease succeeds; a commit cannot embed its own SHA.
- Network: Stable Studionet 61999 only. SDK: unchanged `genlayer-js@1.1.8`.
- Contract: `0x84e9284448D4cd16dcBBCbd8104449B11209C6F0`.
- Canonical source: 32040 bytes; SHA256 `88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442`. Prompt SHA256 unchanged `8a7b279a3594397802c71fef4df9b4d30db1ff528177d0bf05c80a62397192d3`.

## Independent safety audit and fixes

[Pre-implementation audit](PHASE_B2C_R1_INDEPENDENT_AUDIT.md) reviewed the frozen PR rather than relying on its report. This is an independent R1 review of prior work, not a claim of a second human/delegated reviewer.

Existing argument order, canonical destination, Consensus wrapping, identity checks, raw receipt binding and actual-state reconciliation passed review. Activation blockers fixed: SDK writeContract gas fallback / ABI fallback path, Mock-only fee gate, absence of a production adapter, and memory-only unknown-send locking. Added error visibility and preserved known hashes even when journal storage fails after a wallet returns a hash. Renewing an explicitly rejected/pre-forward failed request cannot bypass a subsequent identical pending request.

Final audit: no identified blocker to scoped user-operated E2E. Real browser/extension acceptance remains outstanding; offline results do not establish actual signing success.

## Seven production write integrations

| Write | Existing page | Integration / offline evidence |
| --- | --- | --- |
| create_intent | Create Intent / IntentForm | CONNECTED wallet → immutable preview → fresh finalized owner-capacity/expiry reads → confirmation → single wallet request → bound receipt → actual new ID/owner/version/text/status |
| update_intent | Intent detail / IntentForm | Exact expected version and editable terms; ownership/status/version/expiry verified twice; actual new version and terms reconciled |
| cancel_intent | IntentForm cancellation | Existing consequence acknowledgement; RESERVED case additionally validates frozen cycle and release of all reservations |
| assess_cycle | CycleBuilder | Selected directed ring preserved, exact versions/edges and distinct owners; actual Assessment and Snapshot checked; MATCHED additionally verifies reservations/PENDING Cycle |
| confirm_cycle | CycleWorkspace / CycleActions | Exact frozen Snapshot and owner; true/false distinguished; ACTIVE requires three confirmations and all CONSUMED records |
| decline_cycle | CycleActions | Both prior acknowledgements retained; ABORTED and released reservations reconciled; permanent Snapshot consequence displayed |
| expire_cycle | CycleActions | Permissionless actual deadline check; stored cleanup distinguished from effective expiry; false NO_OP verified rather than presented as a new write effect |

All seven were exercised through actual React business-page actions with Mock Provider / Mock RPC and the production adapter, through FINALIZED_SUCCESS and actual-state reconciliation. URL/env flags do not select a different mode. Read-only pages remain wallet-free.

## SDK 1.1.8 compatibility and zero-fee treatment

The installed SDK writeContract API has no supported explicit gas-limit/complete fee-quote arguments. Its internal closure catches gas-estimation failures and may resend a fallback addTransaction ABI. The R1 adapter uses the installed SDK ABI, calldata encoder and transaction serializer, followed by its supported `client.request({ method: 'eth_sendTransaction', params: [envelope] })` API. It does not inject invented writeContract fee/gas options or monkey-patch the package.

Tests compared each of the seven production envelopes byte-for-byte with actual installed SDK writeContract Mock output. Outer addTransaction sender/canonical recipient/default validators/rotations, leaderOnly=false, inner method/arguments and legacy transaction fields all match. A separate strict `eth_estimateGas` call supplies the Gas limit; failure/malformed/zero/excessive estimates throw. A genuine 200000 result is accepted with RPC provenance, never supplied as fallback. Nonce uses a strict read-only request. The provider envelope contains value=0x0, gasPrice=0x0, type=0x0, chainId=0xf22f and the verified gas/nonce.

`USER_CONFIRMED_STUDIONET_ZERO_FEE` is a distinct operational policy, fixed to 61999, rather than a fabricated quote. No fictitious coverage/distribution/balance budget is supplied. Historical MOCK_ONLY fee tests remain untouched and are excluded from production policy selection. The observed gasPrice parameter must be exactly zero; a nonzero/unavailable parameter fails closed. This parameter check is not a separate fee investigation. There were no live R1 RPC probes.

## Submission, identity and unknown-result safety

Fresh preflight and identity readback occur at preparation, final confirmation and the strict forwarding boundary. Changes to wallet provider, account, chain, revision, arguments, frozen records, Snapshot or estimated parameters invalidate approval. Page load, preview, checkbox acknowledgement, observations and error handling never initiate signing. The second button requires the explicit checkbox and a fresh per-operation confirmation token.

Before possible wallet forwarding, localStorage records the unresolved request under canonical chain/contract/account. Web Locks serialize concurrent tabs. Missing storage/locks fails closed; no unlocked fallback. The existing boundary latches before asynchronous checks, freezes and decodes the complete envelope, and forwards at most once. Unknown hashes, errors and timeouts never trigger rebroadcast. Late valid hashes may resolve the same operation. Explicit rejection/pre-forward failures permit a new manual preflight; ambiguous submissions do not. A persistence failure after wallet hash observation preserves the known hash and an unresolved lock.

Receipt checking uses complete raw Studio transaction evidence. EVM status=0x1, a hash, ACCEPTED, READY_TO_FINALIZE or plausible local changes do not establish success. FINALIZED + MAJORITY_AGREE + leader SUCCESS and method-specific finalized chain effects are required. Conflicting evidence locks TERMINAL_CONFLICT; missing data/timeouts preserve pending/reconciliation states. Eleven reduced archived A transaction records were also parsed offline with original-file SHA256 provenance; these are historical evidence, not R1 live transactions.

## Final verification

| Check | Result |
| --- | --- |
| npm ci | PASS, exit 0 |
| TypeScript | PASS, exit 0 |
| ESLint | PASS, exit 0 |
| Vitest complete | **497 PASS / 0 FAIL / 0 SKIP / 0 TODO** |
| All original 410 tests and assertions | Preserved byte-for-byte; baseline 410 PASS |
| New tests | 87 PASS: production SDK/React wiring, boundary failures, identity/parameters, explicit action, duplicates, persistent/cross-tab locks, timeout/late hash, errors, archived receipt decoding |
| Production build | PASS, exit 0; Vite chunk-size advisory remains |
| Canonical / A source / Prompt | PASS; exact source bytes and A clean state |
| SDK / package / lockfile | PASS, unchanged frozen versions and installed distribution SHA256 |
| Production import graph | PASS; BrowserTransactions/executor/strict boundary reachable; Mock SDK rehearsal excluded |
| Read worker graph | PASS; write adapter/boundary unreachable |
| Network isolation | Existing socket denial and unmocked-fetch denial retained and used for the entire test process |
| git diff --check | PASS |
| New live browser wallet signature / broadcast / onchain write | **NOT RUN / FORBIDDEN IN THIS EXECUTION** |
| Headless real browser | NOT RUN; no installed Chromium/Chrome executable; React UI exercised in jsdom |
| Deployment / site publication / main merge / Portal | NOT RUN / FORBIDDEN |

Raw results: [verification](../evidence/b2c-r1/verification.json), [complete Vitest](../evidence/b2c-r1/vitest.json), [production graph/integrity](../evidence/b2c-r1/production-integrity.txt), baseline and intermediate runs plus command logs under `evidence/b2c-r1/`. Earlier intermediate TypeScript failures were corrected: missing explicit ref initializer, inferred never callback, and explicit chainId extension of viem's RPC type; the supported SDK request overload now compiles without an unsafe unknown cast.

## Remaining practical limits and recommendation

Production UI in this branch **can request a real signature** after the user's deliberate confirmation. It has not been deployed/published, and main has not been changed. Work did not select/connect any actual wallet and made no actual send.

Keep the active tab/review until reconciliation. Pending hashes can be checked repeatedly through bounded read-only polling. After navigation/reload, the durable journal blocks unresolved requests but this minimal patch does not restore the full operation/preflight checkpoint, discover hashless broadcasts or expose a journal-clear button. Saved known hashes appear in the lock diagnostic; such a case requires independent read-only recovery. Clearing storage or using another browser/profile/device bypasses browser-local persistence and is outside its guarantees. Local time/multi-request reads remain advisory/non-atomic; contract validation remains authoritative. Real provider gas/wallet/receipt compatibility is still to be established by the user.

Recommend entering [user-operated local real-chain E2E](PHASE_B2C_R1_MANUAL_E2E_PLAN.md), with explicit wallet decisions made by the user. Do not label all seven live operations PASS until actual evidence exists; expire_cycle additionally needs a genuinely deadline-eligible case. No additional full-fee investigation is proposed. STOP at this engineering checkpoint.
