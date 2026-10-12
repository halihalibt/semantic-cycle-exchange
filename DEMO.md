# Local read-only Demo

## Current final-delivery status

The original `?w=1` verified cases remain intact. Additional finalized cases can be inspected
at `?view=cycle&id=2` (ACTIVE) and `?view=cycle&id=3` (ABORTED). See the
[final evidence index](docs/FINAL_ONCHAIN_EVIDENCE_INDEX.md) for historical/current distinctions.
The new wallet-continuity implementation still needs the [short Windows Chrome check](docs/WINDOWS_CHROME_WALLET_ACCEPTANCE.md).
PR #4 is Draft/unmerged, Pages is not enabled/published, and live positive expiry remains
NOT RUN / TIME-GATED. These are the current states; older execution statements above remain
historical provenance. No production browser PASS or Portal submission is claimed.



The browser Demo is not yet live-verified. B1 is BLOCKED at its first browser read;
Node-side SDK reads passed. Do not call this a published or production-ready app.

Use Node LTS, then run from frontend: npm ci, npm run dev. Open the printed local
URL under /semantic-cycle-exchange/. Add ?w=1 for both real examples, or
?view=inspect for a decimal Intent/Cycle/Assessment ID lookup. No wallet is needed.
Use the overview Refresh control once and wait for a live finalized timestamp.
Do not interpret historical metadata as a fresh result when RPC is unavailable.

Positive expected observation: Assessment #1 MATCHED, ring 1→3→2→1, FIT FIT FIT;
Cycle #1 ACTIVE with 3 confirmations and snapshot
48e1c68d358f67368c5d8b478e9d450401be06cdf91e90b6b8b94932d2951ede.
Negative: Assessment #2 NOT_MATCHED, 4→6→5→4, FIT FIT NO_FIT, cycle_id=0/NONE;
SVG required versus PNG-only offered. Cycle #2 does not exist at this checkpoint.
ACTIVE does not prove delivered services.

No wallet, signing or transaction step is part of this path. Live browser Home,
Demo and responsive checks must be completed before B1 can be accepted.
See docs/PHASE_B1_REPORT.md and docs/PHASE_B1_TEST_AND_ACCEPTANCE.md.

## B1-R3 current browser acceptance clarification

The initial "browser Demo is not yet live-verified" paragraph above is the historical **Work Chromium** status. On 2026-10-12, the **user independently ran the same B1 app in Windows Chrome**: Home Studio HTTP 200 real finalized results, both positive/negative `?w=1` cases, missing Cycle #2, 390px visual responsive layout and Offline error with cached-data label were screenshot-supported PASS. See [R3 acceptance](docs/PHASE_B1_R3_WINDOWS_CHROME_ACCEPTANCE.md). Work Chromium's separate `ERR_EMPTY_RESPONSE` remains BLOCKED, cause UNKNOWN. This is a **local read-only Demo**, not an already published website, not a multi-browser claim and not authorization for signing or chain writes.

## B2-B business flow previews

Use `?view=intents`, `?view=my`, `?view=create`, `?view=intent&id=N`, `?view=builder`, `?view=assessment&id=N` and `?view=cycle&id=N` locally to inspect business workflows. The original `?w=1` and `?view=inspect` remain available. Request review never sends a transaction; all writes remain disabled. Wallet-dependent forms require the existing public-account connection on Stable Studionet. B2-B browser execution is NOT RUN; do not treat offline fixture tests as new onchain evidence. See docs/PHASE_B2B_USER_FLOWS.md.


## B2-B subsequent user browser evidence (2026-10-13)

The original B1 and B2-B Work browser `NOT RUN` lines above are retained as their historical execution-state reports. Separately, the **user** ran the frozen B2-B app in Windows Chrome and screenshot-verified real read-only Explore/My Intents, connected OKX Wallet on chain 61999, positive/negative Assessment views, ACTIVE Cycle, seven-method request-preview flows, scoped mobile/keyboard checks, Offline/cache and recovery. See [B2-B acceptance](docs/PHASE_B2B_WINDOWS_CHROME_ACCEPTANCE.md) and [hash manifest](evidence/b2b/windows-chrome-screenshot-manifest.md). This is not Work browser execution, not public deployment, not proof of real transaction support, and does not replace B1's earlier Verified Demo acceptance or Work Chromium's retained BLOCKED/UNKNOWN evidence. PR #3 remains Draft.
