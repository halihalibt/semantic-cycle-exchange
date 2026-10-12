# PHASE B2-B tests and acceptance

## Actual commands

Executed in frontend with Node v24.19.0. Test runner preloads the unchanged outbound network denial boundary and loads it in every worker.

| Command | Actual final result | Evidence |
|---|---|---|
| npm ci | PASS; 361 packages, lockfile unchanged | evidence/b2b/npm-ci.log |
| npm run typecheck | PASS | evidence/b2b/typecheck.log |
| npm run lint | PASS | evidence/b2b/lint.log |
| npm test | PASS OFFLINE: 258 PASS / 0 FAIL / 0 SKIP; 9 files | evidence/b2b/test-final.log |
| npm run build | PASS; 53 modules | evidence/b2b/build.log |
| npm run integrity | PASS; 32040 bytes, exact frozen SHA256 | evidence/b2b/integrity.log |

Baseline was independently rerun before adding B2-B tests: 170 PASS / 0 FAIL / 0 SKIP, 7 test files (captured in session output; not a historical Windows result). Final suite includes all 170 unchanged tests + 35 business-model and 53 business-pages tests = 88 new tests. No tests deleted, skipped or weakened.

First B2-B suite: 251 PASS / 2 FAIL / 0 SKIP; total 253. Retained in test-first.log. Failures were test-harness issues: an EXPIRED query matched both a select option and a badge, and a mocked copied snapshot response was not updated after fixture mutation. Tests were corrected to target the badge and supply the changed actual mock response. Early TypeScript checking also found test-array inference and un-narrowed found unions; fixed without changing runtime contracts or removing assertions. Second suite: 253 PASS, in test-second.log. Five additional race/response-identity tests led to final 258 PASS.

Expected Mock SDK rejection traces on stderr are intentional tested cases, not real wallet activity. npm emits an environment http-proxy warning; no dependency upgrade was performed.

## B01–B15

| ID | Status | Evidence / scope |
|---|---|---|
| B01 | PASS | Authenticated halihalibt; exact frozen A/B main; clean clone; branch absent before creation; byte-for-byte canonical comparison. |
| B02 | PASS OFFLINE | All 170 original tests pass in final suite; original B1 pages/read transport and B2-A validators/state machine unchanged. |
| B03 | PASS OFFLINE | Create/update/cancel forms; current reads, owner/version/expiry/capacity, UTF-8 and separate RESERVED warning; no optimistic state. |
| B04 | PASS OFFLINE | Real API integration; Mock pagination asserts actual next_offset/shared history range and connected address. Live browser reads NOT RUN. |
| B05 | PASS OFFLINE | A→B→C→A exact parameters, direction-preserving rotation, duplicate/owner/version/state/expiry guards; no semantics claim. |
| B06 | PASS OFFLINE | MATCHED/NOT_MATCHED/UNSURE/missing records; prompt mismatch rejection and actual linked Cycle. |
| B07 | PASS OFFLINE | Frozen commitments, canonical flags, confirm/decline/expire reviews, NO_OP expectation, effective/stored distinction. |
| B08 | PASS OFFLINE | Owner/edge/term/version/flag mapping, fresh Snapshot comparison and query/response identity guards. |
| B09 | PASS OFFLINE | Seven exact method previews; fee unavailable and submission disabled; identity invalidation. |
| B10 | PASS OFFLINE | No production signing/broadcast executor; existing outbound-boundary and fake provider tests PASS. |
| B11 | PASS OFFLINE | 258 PASS / 0 FAIL / 0 SKIP, 9 files; failed runs retained. |
| B12 | PASS | ci/typecheck/lint/build/integrity actual final commands passed. |
| B13 | PARTIAL | Labelled native controls, role=alert/status, React-safe text, responsive CSS. 390px rendered visual layout and real keyboard browser audit NOT RUN. |
| B14 | PASS | Four B2-B docs, appended checkpoint and raw final/failed logs; no fabricated real success. |
| B15 | PASS | Remote branch phase-b2b-business-workflows and open Draft PR #3; checkpoint commits saved; not merged. |

## BLOCKED / NOT RUN

Local Playwright Chromium launch is unavailable: executable missing (browser-availability.log). Rendered 390px/desktop layouts, real keyboard browser navigation and browser extension behavior NOT RUN. Work Chromium's historical OPTIONS net::ERR_EMPTY_RESPONSE remains BLOCKED with UNKNOWN root cause, preserved in B1 evidence; not reclassified as CORS and not retested here. Historical user Windows Chrome B1 acceptance remains historical evidence.

B2-B real chain reads, real signing, AI assessment, broadcast and blockchain writes NOT RUN. No REAL ONCHAIN PASS is claimed. Live HTTP 429/5xx/timeouts NOT RUN; existing synthetic network cases passed. Website publication, deployment, merge, B2-C/B3 and Portal submission are outside scope.

Next permitted handoff: independent audit of Draft PR #3 and offline implementation; separately authorized Windows Chrome mock/read-only visual/keyboard validation at 390px and desktop. Business implementation has no remaining known offline test failure. Browser acceptance remains open. Do not enable live writes to validate this phase.
