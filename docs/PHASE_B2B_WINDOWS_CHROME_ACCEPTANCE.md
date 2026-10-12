# PHASE B2-B — Windows Chrome user-executed acceptance closure

**Scope:** additive evidence record for the authorized B2-B Draft PR #3, frozen implementation SHA `c5239afcdedfbb752abad150d87244a80aa5818a` on `phase-b2b-business-workflows`; Repository B main `4e6772a923b40c71f1cc61f860f2f75acefb10b6`. This document is not a new software implementation or transaction audit. Source/SDK/contract were not changed.

**Provenance:** USER-EXECUTED Windows Chrome, local Vite deployment `/semantic-cycle-exchange/`, real browser extension **OKX Wallet**. Tests are shown by user-supplied screenshots and statements in the ChatGPT conversation. The Work execution report's prior browser `NOT RUN` remains a correct historical description of **Work's** environment; this subsequent, separate user acceptance does not rewrite that history. 31 screenshot file hashes/dimensions are recorded in [the screenshot manifest](../evidence/b2b/windows-chrome-screenshot-manifest.md). The PNG binaries remain in the user conversation, not in GitHub.

## Acceptance matrix

| Check | Classification | Evidence and constraints |
|---|---|---|
| Home and Explore actual latest-final reads | USER-EXECUTED PASS | Finalized read timestamps, contract stats, 6 historical Intents, screenshot of Studio HTTP 200 |
| Explore results/filter/pagination | USER-EXECUTED PASS | #1–#3 CONSUMED, #4–#6 OPEN; CONSUMED filter displays only #1–#3; no next page with 6 |
| EIP-6963 provider discovery + OKX connection | USER-EXECUTED PASS (OKX only) | `CONNECTED · Chain 61999`; observed wallet public address; MetaMask NOT RUN |
| My Intents/Owner/Cycle history | USER-EXECUTED PASS | 2 historical Intents (#1 CONSUMED, #4 OPEN), 1 ACTIVE Cycle and effective unfinished count from read |
| Create/update/cancel Intent | USER-EXECUTED PASS (PREVIEW ONLY) | `create_intent`, `update_intent` id 4/version 1, `cancel_intent` id 4/version 1, appropriate fields and acknowledgement, fee unavailable/submission disabled |
| Directed Builder `4→5→6→4` | USER-EXECUTED PASS | Three different owners, OPEN/Version 1, directed edges and rotation displayed |
| `assess_cycle` review | USER-EXECUTED PASS (PREVIEW ONLY) | Exact IDs, versions and directed edges; semantic result `NOT_EVALUATED`; no new AI call |
| Assessment #1 and #2 finalized views | USER-EXECUTED PASS | #1 MATCHED FIT/FIT/FIT + Cycle #1; #2 NOT_MATCHED FIT/FIT/NO_FIT with cycle_id 0; no invented free-form AI explanation |
| Cycle #1 finalized Workspace | USER-EXECUTED PASS | ACTIVE stored/effective, 3/3 confirmations and frozen owner/term/snapshot/edge mapping; ACTIVE **not** service delivery |
| ACTIVE Cycle inappropriate actions | USER-EXECUTED PASS (PREVIEW PREFLIGHT) | Confirm, Decline, Expire each returns `CYCLE_NOT_PENDING`; no real action called |
| Missing Cycle #2 | USER-EXECUTED PASS | `No Cycle found.`; no invented record |
| 390px responsive visual samples | USER-EXECUTED PASS (SCOPED) | Cycle header, 3 stacked owners and action warning, Create form, Builder; no apparent clipping/overlap; *not* a full WCAG or browser matrix |
| Horizontal overflow in 390px Create and Builder | USER-EXECUTED PASS (SCOPED) | User executed `document.documentElement.scrollWidth > document.documentElement.clientWidth`, both `false` |
| Offline RPC handling | USER-EXECUTED PASS | `RPC unavailable`, `RPC worker unavailable.`, explicit previous observation / cached—not a new read |
| Offline → restored connection | USER-EXECUTED PASS | Without page reload, click Refresh returns new finalized timestamp; new HTTP 200 fetch and old warning cleared |
| Keyboard Explore filter | USER-EXECUTED PASS (SCOPED) | Tab focus visible, arrow-key CONSUMED filter shows only #1–#3 |
| Full keyboard/a11y, screenreader, touch targets and multiple browsers | PARTIAL / NOT RUN | Some mobile helper text and controls are small; no full audit |
| Real HTTP 429/5xx, MetaMask, real PENDING Cycle action | NOT RUN | Synthetic/mock tests are not live-browser proof |
| Wallet signature, broadcast, real B2-B writes/AI assessment, deployment | NOT RUN (PROHIBITED) | No new finalized transaction or real write result claimed |
| Work Chromium original OPTIONS `net::ERR_EMPTY_RESPONSE` | BLOCKED / UNKNOWN | Historical failure is preserved in B1 evidence; no proof of general CORS |

## Findings and forward constraints

- Page navigation uses full navigation links; the wallet component remounts, so the user had to reconnect to review subsequent requests. This is a known UX limitation, **not** proof of an account/chain guard bypass. Do not claim seamless session persistence.
- Mobile helper text and checkbox labels can be small at 390px. Address in a later separately authorized UX improvement; record scoped browser layout pass only.
- Some action buttons appear enabled after connecting/acknowledging even for an ACTIVE Cycle; fresh read-based preflight then returns `CYCLE_NOT_PENDING`. This is accurate fail-closed preview behavior but has a UX affordance limitation. No live transaction path exists.
- One same-wallet review preview is valid only for that wallet revision; navigation/reconnect invalidates prior in-memory previews. Do not infer a persistent signed workflow.
- Real RPC 429 is NOT RUN. Offline behavior is not equivalent to the rate-limit case. Network restored HTTP 200 is a *new* successful read, whereas earlier 200 requests shown in a retained log during Offline are historical.
- The existing `258 PASS / 0 FAIL / 0 SKIP` is **Work offline test-log evidence**, not a new Windows test run. Preserve historical failed runs and the earlier Work `NOT RUN` browser matrix without rewriting their provenance.
- Verified B1 `?w=1` Demo code and history remain unchanged, but **full B2-B rerun of every B1 Demo case is NOT RUN**. B1's prior Windows acceptance remains separate evidence.

**B2-B acceptance conclusion:** the user-tested core workflows passed their bounded browser-read and preview checks. This establishes neither a ready-to-write DApp nor full accessibility certification. No production source changes, no SDK upgrade, no wallet signing, no chain writes, no merge, no publishing. **STOP at Draft PR #3 pending independent review and user authorization.**
