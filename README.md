# Semantic Cycle Accord

Three digital-service offers. Three needs. One directed agreement.

This application uses the existing SCA-3 V1 GenLayer Intelligent Contract to inspect
three-party service exchange commitments. Each provider supplies the next participant.
Independent Leader/Validator classification evaluates every edge; exactly three FIT
decisions can create a pending Cycle. All three owners must confirm the same snapshot.
**ACTIVE means accepted commitment, not delivered services.**

B1 includes a React/TypeScript/Vite read-only dashboard, wallet-free verified positive
and negative examples, ID inspection, all seven typed public views, exact SDK lock,
complete canonical contract source, integrity checks, tests and provenance reports.
There are no payments, custody, tokens, arbitration or automatic global matching.

## Run locally

Requires maintained Node.js LTS (validated with 24.19.0 / npm 11.9.0).

```sh
cd frontend
npm ci
npm run dev
```

Open the printed local URL. Demo: `/semantic-cycle-exchange/?w=1`.
Record lookup: `/semantic-cycle-exchange/?view=inspect`.
No wallet connection is required. The application reads the actual frozen contract;
RPC failure is shown explicitly and never replaced with test fixtures.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run integrity
```

`node live-probe.mjs` is a separate, opt-in, nine-request Node SDK check against the
real network. Unit tests are offline and never call RPC. Read the reports before
interpreting local test results as live browser evidence.

## Network and evidence

- Stable Studionet only: chain **61999**, https://studio.genlayer.com/api.
- Existing contract: `0x84e9284448D4cd16dcBBCbd8104449B11209C6F0`.
- Repository A frozen commit: `8a09380c06f12afd6ac85197737b0018cd8e594f`.
- Positive: Assessment #1, FIT/FIT/FIT, ring 1→3→2→1, Cycle #1 ACTIVE.
- Negative: Assessment #2, FIT/FIT/NO_FIT, ring 4→6→5→4, no linked Cycle.
- SDK: exactly **genlayer-js 1.1.8**, installed types/runtime verified.

The complete byte-identical contract is in
[intelligent-contract/contracts/semantic_cycle_accord.py](intelligent-contract/contracts/semantic_cycle_accord.py).
[Provenance](intelligent-contract/SOURCE_PROVENANCE.md) documents hashes/deployment.

Read [Demo](DEMO.md), [architecture](docs/ARCHITECTURE.md),
[SDK compatibility](docs/STABLE_SDK_COMPATIBILITY.md),
[acceptance](docs/PHASE_B1_TEST_AND_ACCEPTANCE.md), [report](docs/PHASE_B1_REPORT.md)
and [checkpoint](WORK_CHECKPOINT.md).

Historical transaction metadata remains separate from current finalized observations.
Consensus vote counts come from archived transaction evidence, not fabricated contract
fields. Stored and effective statuses can differ after expiry. Protocol effective
status counts describe the requested page; cumulative counters are global.

No write UX, wallet signing, deployment, public website release or Portal submission
is included. MIT License.


## B2-A foundation — WIP / INCOMPLETE

Optional explicit browser-provider selection and account connection are implemented alongside the read-only pages. Signing and transaction submission remain disabled. Seven write specifications, validation and transaction safety are offline foundations; total fees are unavailable. See [B2-A execution report](docs/PHASE_B2A_EXECUTION_REPORT.md) and [acceptance matrix](docs/PHASE_B2A_TEST_AND_ACCEPTANCE.md). Real wallet/write compatibility is not established.

## B2-B business request previews

The product now includes Explore Intents, connected-owner history, Intent forms, a directed three-party Builder, Assessment lookup and a Cycle Workspace. All seven write methods stop at exact request review with **FEE_QUOTE_UNAVAILABLE / ONCHAIN_SUBMISSION_DISABLED**. No signing or broadcast executor is exposed. See [user flows](docs/PHASE_B2B_USER_FLOWS.md), [implementation](docs/PHASE_B2B_IMPLEMENTATION_REPORT.md), [test/acceptance results](docs/PHASE_B2B_TEST_AND_ACCEPTANCE.md) and [security boundaries](docs/PHASE_B2B_SECURITY_BOUNDARIES.md). Final 258 tests passed offline; new browser visual/keyboard acceptance is still pending.


## B2-B Windows Chrome user-executed acceptance addendum (2026-10-13)

The previous B2-B `NOT RUN` browser statements describe the **Work/offline execution checkpoint**, and are preserved verbatim for provenance. Later, the user independently completed scoped Windows Chrome acceptance of the frozen B2-B build. See [the user-executed acceptance matrix](docs/PHASE_B2B_WINDOWS_CHROME_ACCEPTANCE.md) and [the 31 screenshot SHA256 metadata entries](evidence/b2b/windows-chrome-screenshot-manifest.md). Screenshots are user-conversation attachments, **not** files publicly hosted by this GitHub repo; no independent in-GitHub image verification is claimed. Live read-only observations, wallet connection and write-request **previews** passed; no actual B2-B write, signing, broadcast or AI assessment was performed.

Any older statement that B2-A is `WIP / INCOMPLETE` or that the app has "no write UX" is a **historical phase/status statement**: B2-A was subsequently merged, and B2-B now has **preview-only write UX** while all real signing and submission remain disabled. Do not interpret the presence of request previews as a live-write product. The older Work Chromium `ERR_EMPTY_RESPONSE` remains BLOCKED with UNKNOWN root cause, not a proven CORS defect. PR #3 remains Draft, unmerged.

## B2-C staged transaction engineering

B2-B PR #3 was subsequently merged at frozen main `a98d3dcbefcef6e37b11fb41a2ef9e11050c5b78`; historical Draft statements above remain. B2-C adds isolated execution, exact SDK guards, complete mock fee budgets, readonly finality tracking and seven-method state reconciliation. **410 offline tests pass (258 unchanged + 152 new); FEE GATE BLOCKED.** No staged code or send boundary reachable from production; signing/broadcast/writes disabled. Browser B2-C NOT RUN; live execution NOT RUN. [Report](docs/PHASE_B2C_EXECUTION_REPORT.md), [tests](docs/PHASE_B2C_TEST_AND_ACCEPTANCE.md), [SDK/fees](docs/PHASE_B2C_SDK_FEE_COMPATIBILITY.md), [security](docs/PHASE_B2C_SECURITY_BOUNDARIES.md), [future manual plan](docs/PHASE_B2C_MANUAL_LIVE_TEST_PLAN.md). [PR #4](https://github.com/halihalibt/semantic-cycle-exchange/pull/4) remains Draft/unmerged.
