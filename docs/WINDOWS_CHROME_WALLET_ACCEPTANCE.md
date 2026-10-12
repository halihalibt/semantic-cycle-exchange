# Windows Chrome + OKX — final wallet acceptance

Status: NOT RUN for the newly fixed build. Existing user-executed live E2E remains valid.
This is the only browser release gate; expiry is a separate time-gated live test.
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
