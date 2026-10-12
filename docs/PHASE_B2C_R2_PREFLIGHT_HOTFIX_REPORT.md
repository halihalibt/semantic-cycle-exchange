# B2-C-R2 PREFLIGHT HOTFIX REPORT

Status: minimal hotfix complete; ready for a user-operated Windows Chrome preflight retry. Remain Draft; no merge or publication.

## Baseline and root cause

PR #4 and local checkout matched `cadbc4defc7c069394419e7648ea5fd77e467b87` before edits and again immediately before publishing this checkpoint. B main remained `a98d3dcbefcef6e37b11fb41a2ef9e11050c5b78`; A main remained `8a09380c06f12afd6ac85197737b0018cd8e594f`.

Application source: `frontend/src/features/transactions/review.ts`, `reviewRequest`. The previous enumerable `Review.parameters.args` contains real SDK BigInt arguments. In React 19.2.0 development Performance Tracks, `addValueToProperties` classifies short primitive arrays and directly invokes `JSON.stringify(value)` without a BigInt replacer. The review passes through `TransactionReview`/`LiveTransactionReview` props. React's passive commit profiling can traverse it and throw outside the application's async preflight try/catch. Its interrupted commit explains the subsequent scheduler error; this is not evidence of a bad transaction encoding or RPC fee failure.

This was reproduced with the actual Create Intent form, production browser runtime/executor, installed React 19.2.0, SDK 1.1.8, mocked finalized reads/RPC/provider and outbound socket denial. Enabling Chrome's timing API availability **before external React loads** produced `TypeError: Do not know how to serialize a BigInt` at installed `react-dom-client.development.js:3862`, through `addObjectDiffToProperties`, `logComponentRender` and `commitPassiveMountOnFiber`. See `evidence/b2c-r2/reproduction-before.txt`. The original jsdom suite did not enter this timing path. Initial timing setup inside the test/config alone was insufficient because the external React module had already loaded; the Node preload is necessary.

This reproduction is jsdom plus Chrome-like timing capability, not Chrome or OKX acceptance. The original failure can occur during React's review-prop commit rather than the underlying async prepare itself; the user's reported button timing does not establish a failing RPC.

## Minimal production changes

- `review.ts`: retain the complete recursively frozen canonical parameters, including all BigInt values, as directly accessible `review.parameters`; make only that property non-enumerable so React's performance prop traversal does not inspect it. No decimal conversion, Number coercion, global BigInt prototype patch or dependency upgrade. Review arguments and identity remain enumerable and immutable. Transaction preparation still uses the unchanged `review.args` and unchanged `prepareWrite`.
- `LiveTransactionReview.tsx`: store only the UI approval fields in `ready`, reset previous UI readiness/acknowledgement on a fresh attempt, and display returned operation diagnostics. Existing thrown failures and timeout messages remain caught and visible; busy state clears and unsigned failures remain retryable.

The non-enumerable property is deliberate: access canonical data explicitly through `review.parameters`, not by spreading or JSON-serializing the entire Review. Production runtime, fingerprints, Snapshot generation, SDK calldata/envelope, state validation and signing boundaries are byte-unchanged.

## Seven new regression cases

1. Actual Create Intent form → immutable preview → fresh preflight → PREFLIGHT_READY, with the confirmation button disabled and zero wallet submissions.
2. Gas-estimate failure: visible alert, busy cleared, no approval, explicit retry succeeds unsigned.
3. Finalized-read failure: same failure/retry behavior.
4. Bounded preflight timeout: visible STAGED_TIMEOUT, retry succeeds unsigned.
5. Create Intent parameters above Number.MAX_SAFE_INTEGER: exact BigInt, frozen data, unchanged fingerprint, displayed decimal and SDK envelope bytes.
6. Assessment nested BigInt arrays: same immutable canonical/encoding checks.
7. A returned failed operation: visible diagnostic/status and no approval or wallet submission.

`frontend/tests/preflight-hotfix.test.tsx` contains the cases. `frontend/tests/preflight-performance.mjs` enables the external React timing path before module initialization. Run from frontend:

```sh
npm test -- --maxWorkers=2
node --import ./tests/preflight-performance.mjs --import ./tests/deny-network.mjs ./node_modules/vitest/vitest.mjs run --maxWorkers=2
```

No original tests, package/lockfile, network configuration, SDK, canonical contract or source in Repository A was edited.

## Final validation

| Check | Result |
| --- | --- |
| Full standard offline Vitest | PASS: 504 / 0 FAIL / 0 SKIP / 0 TODO |
| Full React Performance Tracks offline Vitest | PASS: 504 / 0 FAIL / 0 SKIP / 0 TODO |
| Original 497 assertions retained; seven added | PASS; historical names and file bytes checked |
| Typecheck, lint, build, canonical integrity | PASS |
| R1 production import graphs, SDK bytes, mock isolation and A source comparison | PASS |
| Frozen baseline safety/encoding/fingerprint/Snapshot/read-write files | PASS: 54 historical files identical |
| Whitespace diff check | PASS |
| Real Chromium automation | NOT RUN: no installed executable; Playwright install failed with invalid/truncated download |
| Windows Chrome + OKX + real Studionet preflight | NOT RUN here; user retry required |
| Real signing, broadcasting, deployment, publication, Portal | NOT RUN / prohibited |

An initial full performance run at default concurrency had four test timeouts (500 passed). Its raw logs are retained as `performance-first.*`. Re-running with two workers, unchanged assertions and unchanged timeout thresholds passed all 504. The standard full run also passed. Build retains the existing advisory chunk-size warning.

Evidence: `evidence/b2c-r2/vitest.*`, `performance-vitest.*`, `performance-regression.txt`, `typecheck.txt`, `lint.txt`, `build.txt`, `integrity.txt`, `production-integrity.txt`, `frozen-integrity.json`, `diff-check.txt`, `chromium-install.txt`.

## User retry

Update the existing PR branch to this checkpoint, restart the local Vite server, and hard-refresh Chrome to discard the failed React runtime. Connect OKX on Stable Studionet 61999; create a new preview and click Run fresh preflight. Expected: PREFLIGHT_READY with explicit confirmation disabled until acknowledged, or a visible preflight error. Stop at preflight for this hotfix verification. No signing or broadcast is needed to verify the repair.

PR #4 remains the original Draft PR. Latest HEAD is the commit containing this report and is independently returned in the final execution report. STOP after saving this checkpoint.
