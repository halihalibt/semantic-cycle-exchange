# PHASE B2-C — tests and acceptance

**410 PASS OFFLINE / 0 FAIL / 0 SKIP, 11 files.** All 258 old tests/denial setup are byte-for-byte unchanged. New: 78 executor/lifecycle tests + 74 fee/receipt/SDK/security tests = 152. Every test provider/RPC/fee/receipt is simulated. MOCK PASS never means LIVE PASS.

| Actual command | Exit | Evidence under evidence/b2c |
|---|---:|---|
| npm ci | 0 | npm-ci.log; 361 packages; lock preserved |
| npm test baseline | 0 | test-baseline.log; 258 PASS |
| npm run typecheck | 0 | typecheck.log |
| npm run lint | 0 | lint.log |
| npm test, default + JSON reporters | 0 | test-final.log / vitest-final.json; 410 PASS |
| npm run build | 0 | build.log; local build only |
| npm run integrity | 0 | integrity.log; frozen canonical bytes/hash |
| node scripts/verify-b2c.mjs | 0 | boundaries-and-lock.log; frozen source/lock/old tests, production graph and file allowlist |
| git diff --check | 0 | diff-check.log |

verification.json records actual commands/exits. scripts/verify-b2c.py reproduces the consolidated run. npm ci is dependency acquisition outside the offline execution boundary. Original tests/deny-network.mjs preloads socket/fetch denial in process and every worker; the original socket-egress test passes. RPC mocks reject unexpected methods. No real writes, signing or simulation in tests.

| Acceptance group | Actual status | Coverage |
|---|---|---|
| Seven workflows | PASS MOCK | Each method: fresh preflight, immutable encoding, confirmation, one send, hash, full receipt, actual fixture state; missing effects and unavailable fees rejected |
| Wallet safety | PASS MOCK | Disconnect/wrong network/account/provider/revision change; provider outage, rejection, stale async, duplicate click, silent identity mismatch |
| Fee safety | PASS MOCK | Six coverage categories, distribution sum, negatives, binding/expiry/policy changes, fresh balance, insufficient balance/budget, immutable quote |
| Submission | PASS MOCK | Wrong sender/target/wrapper/validators/rotations, calldata/args/kwargs/leaderOnly, native value/unexpected fields; single attempt, pre/post-forward timeouts, missing/invalid hash, reconnect unknown, late hash |
| Locked SDK bridge | PASS MOCK | Actual seven SDK writes with fake RPC/provider and zero mock distribution; nonzero distribution, ambiguous gas sentinel, primary/second estimate error, changed/missing gasPrice blocked |
| Finality/state | PASS MOCK | SUBMITTED/ACCEPTED/READY_TO_FINALIZE not success; consensus/execution separate; missing/incomplete/foreign/conflicting receipts, boolean NO_OP, post-success conflict; bounded/cancelled polling; MATCHED/NOT_MATCHED, third confirmation, reserved cancellation, failure-state reconciliation |
| Production isolation | PASS STATIC | App/Worker graph reaches no staged module/send boundary; no route/env/toggle bypass |
| UI | PASS OFFLINE | 53 original business-page + 6 B1 page tests unchanged; existing previews and disabled gates preserved |
| Browser B2-C | NOT RUN | No Chromium executable/cache; browser-availability.log; no repair loop |
| Prior B2-B Windows Chrome | HISTORICAL USER PASS | Separate earlier user acceptance; not rerun here |
| Three current Studio reads | PASS READ-ONLY | chain id / gasPrice / balance; readonly-probes.json; not a total-fee quote |
| Live signing/broadcast/write/AI/E2E | NOT RUN / FORBIDDEN | No authorization or verified production fees |

## Retained failures

development-history.json maps raw logs to actual exits. First typecheck exit 2: callback inferred never, corrected explicit void. Third typecheck exit 2: new test non-null assertion/Hash typing, corrected. Second full suite exit 1: **383 PASS / 17 FAIL / 0 SKIP** because replacing returned SDK estimator did not intercept its internally captured client. Fixed engineering bridge with exact-envelope estimation and fail-closed sentinel checks; assertions not weakened. Third suite 400 PASS; final added tracking/SDK fallback regressions => 410 PASS. First suite 328 PASS. All historical/interim evidence retained.

The test runner's displayed clock can differ from system UTC in verification.json; neither is a blockchain timestamp. No unresolved failure/skipped test. Offline engineering accepted; live fees/browser acceptance outstanding.
