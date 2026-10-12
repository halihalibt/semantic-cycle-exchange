# SCA-3 V1 — PHASE B2-C consolidated execution report

**B2-C ENGINEERING COMPLETE / FEE GATE BLOCKED**

Completed the authorized offline engineering scope. No production write adapter is installed. Real signing, broadcasting, chain writes, deployment, publication and Portal submission were NOT RUN and remain prohibited. This is not a live-ready release.

## GitHub baseline and checkpoints

| Item | Verified value |
|---|---|
| Account | halihalibt |
| A main, unchanged | `8a09380c06f12afd6ac85197737b0018cd8e594f` |
| B main, unchanged | `a98d3dcbefcef6e37b11fb41a2ef9e11050c5b78` |
| PR #3 | MERGED by the matching standard merge commit |
| Branch | `phase-b2c-staged-transaction-integration` |
| Draft PR | [#4](https://github.com/halihalibt/semantic-cycle-exchange/pull/4) |
| Initial checkpoint | `de9229733c61c604d96e3190c7bdc42bce7dbadd` |
| Engineering checkpoint | `20b8bba880bc9e69b918a122bacb2dfbac7ae8b4` |
| Final head | Exact PR/branch head returned in final handoff; no self-referential final commit SHA embedded here |

Direct GitHub connector reads verified both main commits, merged PR and independent A source. Canonical A/B source: 32040 identical bytes, SHA256 `88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442`. SDK 1.1.8, Stable Studionet 61999, RPC, contract `0x84e9284448D4cd16dcBBCbd8104449B11209C6F0`, Prompt and dependency lock remain frozen. No comprehensive A re-audit repeated.

## Completed implementation

The staged executor reuses existing Transactions. It captures immutable arguments, runs fresh per-method finalized reads, checks WalletSession state/provider/revision and EIP-1193 identity, validates a complete MOCK_ONLY fee budget, requires explicit one-use confirmation, rechecks records/fees/balance, and makes at most one mock submission. Hashless uncertainty remains locked; a late original hash resolves the same operation. Cancellable bounded tracking reads only. Full Studio receipt evidence separately verifies finality, consensus, execution and return bytes; actual finalized contract views are required before success.

The existing singleRequestBoundary now freezes expected parameters and the SDK envelope; verifies sender, canonical inner target, Consensus destination, validator/rotation settings; rejects leaderOnly, kwargs, unexpected fields and native value; and distinguishes attempted from forwarded. Its latch prevents SDK ABI fallback rebroadcast. The isolated SDK bridge refuses unsupported fee distributions, ambiguous 200000-gas sentinel, unverified gas and missing/changed gasPrice. No staged executor or bridge is reachable from production App or Worker.

Existing pages, routes, Verified Demo and seven request previews remain. Transaction Review adds plain-language advisory-preflight/full-fee/disabled-signing/timeout explanations. No product redesign.

| Method | Fresh preflight / exact encoding | Actual finalized reconciliation |
|---|---|---|
| create_intent | Owner, capacity, fields, expiry | Returned actual id, owner, version 1, exact terms, stored OPEN |
| update_intent | Owner, version/content, OPEN, expiry, overflow | Returned next version, exact edited record |
| cancel_intent | Owner/version; reserved case verifies full pending Snapshot | CANCELLED; reserved case also ABORTED Cycle and three released reservations |
| assess_cycle | Three distinct owners/ids, directed ring, versions, OPEN records | Real returned Assessment/Prompt/proposer/Snapshot; NOT_MATCHED unchanged; MATCHED actual PENDING Cycle/reservations |
| confirm_cycle | Participant, Snapshot, flags, reservations/deadline | Owner flag; third true => ACTIVE plus three CONSUMED; false => verified NO_OP |
| decline_cycle | Participant, Snapshot, pending reservations/deadline | Actual ABORTED Cycle and released records; permanent marker remains contract-only |
| expire_cycle | Permissionless but actual deadline and stored state required | Actual EXPIRED cleanup/releases; false only for already stored EXPIRED |

## Results and remaining limits

Fresh npm ci exit 0; baseline 258 PASS / 0 FAIL / 0 SKIP. Final consolidated verification: **410 PASS / 0 FAIL / 0 SKIP**, 11 files (258 unchanged + 152 new). Typecheck, lint, build, canonical integrity, frozen dependencies/old tests/import graph/outbound denial and diff check exit 0. All interim failures retained.

B2-C browser NOT RUN: no executable/cached Chromium. Historical user Windows Chrome B2-B acceptance is separate. Three bounded live read-only probes succeeded: chain id, gasPrice and balance. No live estimate/simulation/provider operation/signature/new E2E occurred.

Production FEE_QUOTE_UNAVAILABLE and ONCHAIN_SUBMISSION_DISABLED remain closed. Installed 1.1.8 lacks complete total-fee quote/policy/distribution write parameters. Observed gasPrice zero does not establish total AI/Validator/Consensus cost zero. [SDK findings](PHASE_B2C_SDK_FEE_COMPATIBILITY.md), [tests](PHASE_B2C_TEST_AND_ACCEPTANCE.md), [security](PHASE_B2C_SECURITY_BOUNDARIES.md), [future manual plan](PHASE_B2C_MANUAL_LIVE_TEST_PLAN.md).

Known limits: advisory local clock; non-atomic multiple finalized reads; contract-only replay/decline/rollback; no live extension/fee certification; in-memory operation locks with no supported live reload recovery; legitimate 200000-gas estimates conservatively refused too. Concurrent later chain actions can make reconciliation inconclusive. No unresolved offline failure remains.

Next minimum task: independent Draft PR #4 review, then separately authorized **read-only Stable Studionet fee compatibility closure at SDK 1.1.8**, proving complete policy/distribution or authoritative exact-network total-fee-free semantics. Production activation/recovery needs a separately reviewed change and authorization. **Not eligible for manual live signing acceptance yet. STOP with PR Draft, unmerged.**
