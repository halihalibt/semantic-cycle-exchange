# Windows Chrome + OKX — final wallet acceptance

Current release acceptance: **USER-EXECUTED 7 PASS / 0 FAIL**, followed by
user-reported published-site acceptance. See the completion record below.
This is not independently reproduced browser automation; extension versions and
new screenshot bytes were not supplied. Live positive expiry remains time-gated.

## Historical pre-release checklist

The following instructions and merge/publication steps describe the original
pre-release checklist. They are retained for provenance, not current release blockers.
No new transaction is required for this checklist. Do not click **Confirm and request wallet**.

Update the existing local checkout (the dependencies have not changed):

```powershell
git fetch origin
git checkout phase-b2c-staged-transaction-integration
git pull --ff-only
cd frontend
npm run dev
```

If your terminal is already inside `frontend`, omit `cd frontend`.
Open the localhost URL printed by Vite, retaining `/semantic-cycle-exchange/`.
If Git reports uncommitted changes or divergence, keep them; do not reset/force-pull.

| Check | Action | Expected result |
| --- | --- | --- |
| First connection | Expand Wallet connection, select the discovered OKX provider, Connect once on 61999 | Your actual account and chain appear |
| Internal navigation | Overview → My Intents → Build Cycle → Workspace → Explore → Assessment → Onchain demo → Inspect | Account remains connected; no wallet authorization popup; pages change normally |
| History | Browser Back twice, then Forward | URL/page and navigation highlight update; same wallet remains connected |
| Authorized reload/deep link | F5, then paste the localhost base plus `?view=my` in the same tab | Account recovers without authorization popup if OKX exposes one unambiguous EIP-6963 provider and retains permission |
| Explicit disconnect | Disconnect locally, navigate, then F5 | DISCONNECTED; no automatic reconnect or authorization popup |
| Account change | Connect again, create an existing safe request preview and Run fresh preflight; switch account inside OKX | Old preview/preflight is invalid; new verified account appears. Never confirm/send the request |
| Wrong network | Switch OKX away from 61999, then back | Writes blocked on the other network; return is verified via reads and requires a fresh preview/preflight |
| No wallet/permission | Open base plus `?w=1` in Chrome Guest or a profile without wallet permission | Read-only demo works; no automatic wallet connection popup |

Target duration: about 4–6 minutes. Return **PASS/FAIL per row**, actual Chrome/OKX versions if available, and any error text. One screenshot of the account remaining connected on Workspace after navigation plus one after F5 is enough for scoped provenance. No new signing or onchain transaction is needed.

Legacy `window.ethereum` injection alone deliberately does not restore after reload:
its provider identity is not persistently distinguishable. SPA navigation still preserves it.
If OKX appears only as “Injected wallet (unverified)”, report that fact; refresh recovery
must not be reported PASS for that path. Missing/ambiguous providers remain disconnected.

Do not intentionally create an unknown/pending transaction to test a lock. Offline regression
covers persistence and the unchanged submission boundary; keep any existing unresolved record.
Do not clear site localStorage to troubleshoot, because it contains the submission journal.

After these checks pass, complete the already authorized final recheck and standard merge of
PR #4. If Pages is still disabled, in repository Settings → Pages set Source to GitHub Actions;
then use the prepared main-branch Pages workflow. Recheck the actual deployment URL/build SHA
and the same navigation/read-only checks on production before marking publication accepted.

## User-operated completion checkpoint — 2026-10-13 (UTC+8)

**USER-EXECUTED / USER-REPORTED Windows Chrome + OKX wallet acceptance: 7 PASS / 0 FAIL / 0 NOT RUN** for the exact wallet-continuity functionality in PR #4. This report was supplied directly by the user after running the updated local build; it is not an independently rerun Work Chromium session. No new signing or blockchain transaction was requested or required.

| User-reported scenario | Outcome |
| --- | --- |
| Internal page navigation retains wallet session | PASS |
| Browser backward / forward retains correct session | PASS |
| F5 reload safely recovers authorized wallet session | PASS |
| Explicit disconnect persists; no automatic reconnect | PASS |
| Account switching updates the verified account | PASS |
| Wrong-network safety intercept blocks writes | PASS |
| Read-only Onchain Demo works without connected wallet | PASS |

Scope: the above seven cases are the user's own Windows Chrome acceptance declarations. The original first-connection step was part of establishing the wallet session but was not reported as a separate test row. The source report did not include new raw screenshots, browser extension version numbers, or an independent Chrome automation trace; do not invent any. Maintain the separate **LIVE POSITIVE EXPIRATION — NOT RUN / TIME-GATED** gate for Cycle #4. All live transaction receipts documented elsewhere remain independent historical evidence and are not relabeled as newly executed tests.

## Published-site acceptance

The user subsequently reported PASS for the published application, including the
homepage, My Intents, Build Cycle and wallet/navigation functionality. GitHub Pages
build and deployment succeeded in [run 38315428325, attempt 2](https://github.com/halihalibt/semantic-cycle-exchange/actions/runs/38315428325/attempts/2).
This is user-operated acceptance and recorded CI deployment, not an independent
production browser automation trace.
