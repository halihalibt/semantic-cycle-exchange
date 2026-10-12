# SCA-3 V1 — ACCELERATED FINAL DELIVERY REPORT

**Engineering/evidence checkpoint complete. Release gate pending targeted user Chrome acceptance.**
No new onchain write, signature, deployment or Portal submission was performed by Work.

## 1. Wallet reconnection root cause

Top navigation and links inside business pages used native `<a href="?...">` navigation.
The browser reloaded the entire document, losing the App's React state and constructing a new
WalletSession and BrowserTransactions. WalletPanel had no read-only reload recovery and its
original identity events only disconnected the account, requiring another explicit connection.
This is a code-confirmed cause, not a browser network/CORS hypothesis.

## 2. Implementation

| File | Change |
| --- | --- |
| frontend/src/navigation.ts | Same-origin/same-path query links use pushState; popstate updates the page. Modifier clicks, downloads, external paths and target=_blank retain native behavior |
| frontend/src/App.tsx | Integrates navigation while keeping App, WalletPanel, wallet binding, transaction runtime and journal instance mounted |
| frontend/src/WalletPanel.tsx | Remembers a minimal session-only provider selection hint after deliberate successful connection; waits for rediscovery and validates a unique matching provider; local Disconnect persists |
| frontend/src/lib/wallet/preference.ts | Stores rdns/name or an explicit disconnected marker in sessionStorage, with guarded parsing. No account, signature, key, seed or transaction authorization is stored |
| frontend/src/lib/wallet/session.ts | Silent recovery reads accounts/chain twice with provider/revision guards; identity events immediately invalidate prior state, then verify already permitted account/network using reads; disconnection stays DISCONNECTED |
| frontend/tests/wallet-navigation.test.tsx | 20 new Mock Provider/jsdom regressions |
| frontend/tests/final-live-evidence.test.js | 17 new hash-bound real receipt regressions through the production receipt parser |
| .github/workflows/pages.yml | Minimal main-branch Pages build/deploy preparation; no branch deployment occurs before merge |

No router package, SDK upgrade, canonical source modification or new backend was introduced.
Query deep links under `/semantic-cycle-exchange/` remain the route model, so there is no
new server rewrite dependency or invented `/builder` path.

## 3. Automated wallet acceptance

PASS offline: deliberate first connection; Overview → My Intents → Build Cycle → Workspace
continuity; history back/forward; business-page links; authorized reload via reads only;
unauthorized/no-selection pages without permission requests; local Disconnect across reload;
verified account switch; wrong-chain blocking and read-only return; provider errors/disconnect;
stale completion rejection; silent identity drift; ambiguous/legacy/missing provider refusal;
old preflight refusal after account change; UNKNOWN journal retention across navigation,
Disconnect and remount; query deep link and wallet-free access.

All 20 are jsdom/Mock Provider checks. They are not Windows Chrome or OKX-extension PASS.

## 4. Real Chrome acceptance

**NOT RUN for the new wallet fix**. No usable Chrome/Chromium executable was available.
Historical user-executed browser/onchain evidence is preserved independently.
Use [the 4–6 minute checklist](WINDOWS_CHROME_WALLET_ACCEPTANCE.md). No transaction
needs to be repeated, and no new signature is needed. This is the remaining merge gate.

## 5. Final regression/security audit

**541 PASS / 0 FAIL / 0 SKIP / 0 TODO**: all 504 original tests unchanged + 20 wallet/navigation
checks + 17 independent live-receipt checks. The timing-enabled full suite also passes 541.

npm ci, TypeScript, ESLint, full Vitest, React Performance Tracks suite, production build,
canonical integrity, installed SDK/package/lock byte integrity, production/read-worker import
graphs and diff check PASS. [Machine verification](../evidence/final-delivery/verification.json)
retains command logs and complete results. Initial probe-only lint failure (missing explicit
Node Buffer import) was fixed; the original log is retained and final lint passes.

Frozen-file comparison verifies all original tests plus canonical copy, SDK dependency inputs,
network config, production submission adapter, journal, staged executor/receipt/reconciliation
and request boundary remained byte-identical. Account/provider/network/revision changes
invalidate previews/approvals. No permission request during restore, no signature/broadcast
retry, no authorization resurrection, no journal deletion from navigation, no bypass of
Web Locks/UNKNOWN locks, and no relaxation of finality or actual-state reconciliation.
No BLOCKER/HIGH safety defect was found in the scoped code/diff review. Browser compatibility
of the newly fixed flow remains unverified and is a release blocker, not an offline PASS.

## 6. Onchain evidence closure

[Evidence index](FINAL_ONCHAIN_EVIDENCE_INDEX.md): 17/17 hashes (13 supplied + 4 independently discovered) independently read,
decoded and confirmed FINALIZED / MAJORITY_AGREE / SUCCESS with actual sender, contract,
arguments, return and consensus raw data archived. Current reads prove Cycle #2 ACTIVE (3/3),
Cycle #3 ABORTED, #7/#9/#10 CONSUMED and #8 CANCELLED.

#11 is OPEN. #12/#13 were subsequently reserved by the separate Cycle #4 test, with #14.
User's prior release reading remains USER-EXECUTED historical evidence; no raw intermediate
OPEN reading was reconstructed. Intent #8 cancellation receipt hash is independently verified:
`0xbc0cf2b63958b9000bb80b0c6a15933584ab8fc33737eef7a66fa058dfc2b349`. Screenshot
original bytes/public manifests were not independently retrieved in this delivery; no images
or hashes were invented. Explorer server-rendered HTML listing was independently read and is separate from Chrome visual acceptance.

## 7. PR #4

Existing PR only: https://github.com/halihalibt/semantic-cycle-exchange/pull/4.
State: **OPEN / DRAFT / UNMERGED**. Early saved code/evidence checkpoint:
`865ef09ce657de363d31cab895d99dae8dea4a0e`; this report and final evidence follow-up build
on that exact tree without additional production-code changes. The final response records
the final documentation/evidence commit SHA, and PR metadata is authoritative for current HEAD.
No duplicate PR, Squash, Rebase or Force Push was used.

## 8. Merge

Merge Commit SHA: **NONE / NOT MERGED**. Standard merge authorization already exists, but
new Chrome acceptance has not passed the user's stated gate. Leave Draft and stop for the
targeted browser result. After PASS, recheck exact PR HEAD, B main and A baseline, unresolved
reviews/CI and final diff; convert Ready and merge with a standard Merge Commit only.

## 9. Repository B main

Unchanged: `a98d3dcbefcef6e37b11fb41a2ef9e11050c5b78`.
The code in this delivery resides only on the existing PR branch.

## 10. Website release

**NOT PUBLISHED / NOT RUN**. GitHub reports `has_pages=false`, no gh-pages branch and no
existing workflow; the user-described Pages publication scheme had not yet been configured.
A minimal standard GitHub Pages workflow is now prepared in this PR. It builds and checks
before deploying main, uses the existing Vite base and publishes only the built dist artifact.

Planned URL (not live verified): `https://halihalibt.github.io/semantic-cycle-exchange/`.
Production deployment Commit SHA: **NONE**. HTTPS, production navigation/wallet reload,
readonly demo and signing-gate acceptance remain NOT RUN. Pages setup requires the repository
Settings → Pages → Source = GitHub Actions once; the selected GitHub connector exposes no
Pages administration action here. No public deployment was triggered before merge/browser PASS.
GitHub's official workflow guidance: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages.

## 11. Repository A unchanged

GitHub and local clean checkout match `8a09380c06f12afd6ac85197737b0018cd8e594f`.
A is public; no A files, branches or commits were written. Its canonical source is byte-identical
to B's complete official copy: 32,040 bytes; SHA256
`88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442`.
Chain 61999, contract `0x84e9284448D4cd16dcBBCbd8104449B11209C6F0`, SDK 1.1.8 unchanged.

## 12. Dual submission drafts

[Intelligent Contracts ready-to-enter draft](SUBMISSION_INTELLIGENT_CONTRACTS_FINAL.md)
and [Projects ready-to-enter draft](SUBMISSION_PROJECTS_FINAL.md) include titles, summary,
description, usage/verification steps, repository/source/contract links, disjoint proof and
supplementary URLs, MIT licensing and accurate live-test limitations.

Current official Portal public UI was inspected via read-only HTTP. The standalone contract
must justify reuse and real trust value; the application must be a working product with actual
contract integration. The public form requires a website before review. The guidelines forbid
duplicate counting; distinct URLs do not make overlapping claims eligible. A describes the
primitive created before B; B describes the additional product value and discloses the shared
core. Reviewer acceptance of both categories is not guaranteed. See
[provenance and inspection limits](../evidence/final-delivery/portal-requirements.json).
B is blocked by website/browser release status. Authenticated eligibility/quota/server validation
remains UNKNOWN. No Portal button was clicked.

## 13. expire_cycle

**LIVE EXPIRATION POSITIVE TEST — NOT RUN / TIME-GATED**.
Cycle #4: PENDING, ring 12 → 13 → 14 → 12, 0/3; deadline **2026-10-15 05:16:08 UTC+8**.
Snapshot `b710987581187442258dbd6865959bbf2d9bc81fae2a65e334a580fc93f2c594`.
No early expiry request, fake clock or source/network modification occurred. This does not
pause engineering/docs; apply a submission blocker if the authenticated live form or reviewer
explicitly requires the live positive test. Public retrieved guidelines did not specify it.

## 14. Remaining risks/blockers

- Release blocker: new Windows Chrome + actual OKX navigation/reload/identity acceptance NOT RUN.
- Publication blocker: merge gate pending and Pages not enabled. Production URL/SHA not available.
- Evidence gap: raw prior screenshot/intermediate post-decline release reads UNKNOWN.
- TIME-GATED: live positive expiration; stronger authenticated submission requirements UNKNOWN.
- Provider metadata is self-reported, not cryptographic identity. Only unique rediscovered EIP-6963
  hints restore; legacy injection preserves SPA state but needs explicit reconnection on reload.
- Existing browser-local journal cannot coordinate separate profiles/devices. Unknown submissions
  remain locked after reload; never clear localStorage or re-send to resolve an uncertain outcome.
- Existing large Vite chunk warning is advisory. No code/test safety restriction was reduced.

## 15. Minimum user actions

1. Update the existing local PR branch and perform the linked Chrome checklist; return row-wise
   PASS/FAIL. No real write is necessary. This provides the missing authorized merge evidence.
2. After browser PASS, set Pages Source to GitHub Actions if still disabled. The already authorized
   merge/release can then proceed and record the real deployed commit/URL and production acceptance.
3. After the genuine deadline, manually run the existing expiry case if required for full live
   acceptance. Intent #8 evidence is already complete; no repeat cancellation is needed.
4. Only after the relevant gates pass, use the supplied drafts for the two manual Portal submissions.

Execution stops here for the new browser evidence. No approval is being requested again for
engineering, standard merge or publication; the remaining dependency is actual verification.
