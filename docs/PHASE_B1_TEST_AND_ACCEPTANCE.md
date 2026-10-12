# B1 acceptance — BLOCKED

| Check | Result | Evidence |
| --- | --- | --- |
| B owner/public/main/README/MIT | PASS | preflight.json; main 1ac07943412b8eb0acf192a89758178bbfe3ef26 |
| A frozen main | PASS | 8a09380c06f12afd6ac85197737b0018cd8e594f |
| Canonical copy / size / SHA256 | PASS | cmp + verify-source.mjs; 32040 bytes |
| SDK exact installed version / chain preset | PASS | 1.1.8; sdk-node-probe.json |
| Chain ID eth_chainId | PASS | 0xf22f |
| Native finalized SDK Node reads, all seven views | PASS | live-sdk-reads.json; nine requests |
| Clean npm ci from lock | PASS | actual clean installation, ignore-scripts |
| TypeScript | PASS | tsc --noEmit |
| Lint | PASS | final eslint run after mjs globals correction |
| Offline unit/component tests | PASS | 34 passed, 0 failed, 2 files |
| Production build | PASS | Vite build; worker bundled |
| Positive/negative component rendering | PASS OFFLINE | explicit deterministic test fixtures |
| Missing records / IDs / u64 / pagination | PASS OFFLINE | adapter/component tests |
| 429/cooldown / timeout / cancellation / bounded retries | PASS OFFLINE | adapter tests; no live quota stress |
| Stored vs effective / archived vs live vs cached | PASS OFFLINE | component and decoding tests |
| No write transport / fixtures absent from UI imports | PASS | transport tests + source inspection |
| HTTP CORS preflight localhost | PASS HTTP ONLY | OPTIONS 200; not browser SDK PASS |
| Real browser Home finalized read | BLOCKED | emitted request; no observed response; 25s UI timeout |
| Real browser positive/negative Demo | NOT RUN | hard STOP after Home blocker |
| Real browser missing Cycle #2 | NOT RUN | hard STOP |
| Responsive visual inspection / screenshots | NOT RUN | hard STOP before screenshot step |
| Draft PR / GitHub code publication | NOT RUN | hard STOP; remote branch exists at baseline only |

No unresolved failing local test is hidden. Live browser compatibility remains a
critical gate. B1 is not complete or recommended for merge. Historical regression
counts from Repository A are not represented as new B1 tests. No live 429, service
delivery, signature, deployment or write operation occurred.


## B1-R1 checkpoint recovery — supersedes publication status only

The preceding NOT PUSHED / no PR statements are preserved observations from the
original blocked B1 run. B1-R1 separately authorizes saving this existing local
implementation to the existing branch and opening a BLOCKED Draft PR. It does
not unblock browser acceptance. See PHASE_B1_R1_RECOVERY.md in docs/ for this
checkpoint's scope; the returned GitHub HEAD/PR identifies its publication.

Current B1 status remains **BLOCKED — browser live read verification incomplete**.
Chromium emitted the fixed-contract read request; no observable HTTP response
was obtained within the 25-second verification window. Root cause UNKNOWN;
CORS is not established. Browser full Demo NOT VERIFIED and responsive browser
acceptance NOT RUN. Original Node reads and 34 test results are historical B1
PASS evidence, not rerun results or a replacement for browser validation.
