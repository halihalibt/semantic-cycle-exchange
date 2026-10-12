# PHASE B1-R3 — Windows Chrome acceptance (2026-10-12)

**Scope:** Evidence-only addendum to Draft PR #1. User-executed Windows Chrome test, screenshot-supported; **not** a Work Chromium retest. SDK 1.1.8, Studionet 61999, canonical deployed contract unchanged.

| Check | Result | Private screenshot |
| --- | --- | --- |
| Home latest-final read | USER-EXECUTED PASS; Studio HTTP 200; 6 Intents, 2 Assessments, 1 Cycle, 1 active | 01, 02, 09 |
| Positive case | USER-EXECUTED PASS; Assessment #1 MATCHED FIT/FIT/FIT; Cycle #1 ACTIVE, confirmations 3/3 | 03 |
| Negative case | USER-EXECUTED PASS; Assessment #2 NOT_MATCHED FIT/FIT/NO_FIT, cycle_id 0 | 04 |
| Missing Cycle #2 | USER-EXECUTED PASS; explicit finalized not-found message | 05 |
| Responsive viewport | USER-EXECUTED VISUAL PASS at 390px; no obvious horizontal overflow | 06–08 |
| Offline handling | USER-EXECUTED PASS; RPC unavailable / worker unavailable; previous observation labeled cached | 10 |

Ten user-provided PNG files were checked against ZIP integrity, SHA256, byte size and dimensions in the current assistant session. Original screenshots remain private and are **not** uploaded. See `evidence/b1/windows-chrome-acceptance-manifest.json` for the publicly visible metadata; reviewers cannot independently recompute image hashes without the originals.

Original Work Chromium `OPTIONS net::ERR_EMPTY_RESPONSE` remains **BLOCKED; root cause UNKNOWN**, not established CORS. The user Windows Chrome success does not retroactively turn Work's failure into PASS. The 34 offline tests and nine Node SDK reads were previously reported PASS but **not rerun in R3**. Live HTTP 429 and induced timeouts remain NOT RUN (offline tests only). This stage did not deploy, sign, write transactions, change production code, upgrade the SDK or publish a website.

**Disposition:** Windows Chrome read-only acceptance PASS on user evidence. Existing Draft PR #1 remains pending independent review; no merge or B2 approval.
