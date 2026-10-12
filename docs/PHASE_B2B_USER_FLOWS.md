# PHASE B2-B user flows

All business action buttons review requests only. ONCHAIN_SUBMISSION_DISABLED is permanent in this phase.

| Route | Flow / data source |
|---|---|
| `?view=intents` | Explore actual get_intents_page records; local status filter; actual next_offset; detail links. |
| `?view=my` | Connect/verify a public address via the existing wallet panel; get_owner_records; one shared offset for both Intent and Cycle history. |
| `?view=create` | Four text fields + whole days 1–30; read owner capacity; UTF-8/Unicode and expiry checks; create_intent exact review. |
| `?view=intent&id=N` | get_intent detail, owner/version/current-state update review; Unix-second expiry; separate acknowledged cancellation. RESERVED cancellation reads linked PENDING Cycle and all three reservations and warns whole-Cycle ABORTED. |
| `?view=builder` | Load three exact Intent IDs in selected A→B→C→A direction; display offers/recipient needs, owners, versions, states/expiry; preserve selected direction and preview local minimum-ID rotation. Re-read and validate before assess_cycle review. No AI call. |
| `?view=assessment&id=N` | get_assessment by ID; prompt identity; canonical directed decisions FIT/NO_FIT/UNSURE, result, versions, Snapshot, proposer; actual linked Cycle only. NOT_MATCHED has no Cycle; labels explain the failing edge without inventing an AI rationale. |
| `?view=cycle&id=N` | get_cycle canonical owner/flag mapping, frozen full terms, status and timestamps; acknowledge all three commitments for confirm/decline review; second irreversible acknowledgement for decline; permissionless expiration review. |
| `?w=1` | Original B1 Verified Onchain Demo preserved, with query priority. |
| `?view=inspect` | Original B1 exact Record Inspector preserved. |

Transaction Review shows exact named positional parameters, contract, public account/network, advisory consequences, FEE_UNAVAILABLE, FEE_QUOTE_UNAVAILABLE, ONCHAIN_SUBMISSION_DISABLED and status definitions. No hash is generated. Account changes invalidate review. Form changes clear review. Error messages use role=alert; controls have labels and native keyboard interaction. Cached observations retain timestamps and explicit stale-data notices.

Mobile CSS uses a single column below 800px, wrapping navigation, addresses/hashes and full-width fields. 390px visual/browser verification is NOT RUN; do not infer screenshot acceptance from DOM tests.


## Browser follow-up (2026-10-13; USER-EXECUTED, not Work)

The prior statement that 390px visual verification was NOT RUN belongs to Work's environment. Later the user separately verified the core Windows Chrome flows and sampled mobile 390px Create/Builder/Cycle layouts and native keyboard Explore filtering. Full accessibility and other mobile pages NOT RUN; real signing and RPC writes remain disabled. See [Windows Chrome scope](PHASE_B2B_WINDOWS_CHROME_ACCEPTANCE.md). Wallet selection requires reconnection after full-document navigation, which is a known UX limitation. Preserve the original Work NOT RUN and Chromium BLOCKED/UNKNOWN records.
