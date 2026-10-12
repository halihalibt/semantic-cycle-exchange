# B1 — BLOCKED / STOP

A frozen main 8a09380c06f12afd6ac85197737b0018cd8e594f.
B public halihalibt/semantic-cycle-exchange, main and remote
phase-b1-readonly-foundation HEAD 1ac07943412b8eb0acf192a89758178bbfe3ef26.
Branch exists; code NOT PUSHED; Draft PR NOT CREATED.
Local implementation is in this directory. SDK exactly 1.1.8, Stable 61999,
canonical existing contract 0x84e9284448D4cd16dcBBCbd8104449B11209C6F0.
Source exact 32040 bytes/SHA256 88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442.
Node real nine finalized reads/all seven views PASS; local tests 34 PASS,
typecheck/lint/build/source check/clean npm ci PASS.
Critical browser gate: emitted read without observed response, Home timeout.
Browser Demo/responsive tests NOT RUN. B1 not complete; no PR recommendation.
Read docs/PHASE_B1_REPORT.md and evidence/b1/browser-smoke.json before continuing.
Only browser/transport diagnosis should be authorized next. Do not redesign,
change SDK/network/contract, sign/send writes, alter A, publish website or merge.


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
