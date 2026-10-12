# Semantic Cycle Exchange — Projects submission draft

Prepared for manual Portal entry. **Website PUBLISHED; release acceptance USER-EXECUTED PASS.** PR #4 was standard-merged into main at `12eac692f5d4cdd4b283f51e155aaf414976e07f`; GitHub Pages build/deploy succeeded on workflow run `38315428325`, attempt 2. The user confirmed the published homepage, My Intents, Build Cycle and wallet/navigation functionality. No Portal submission has occurred. Authenticated Portal form eligibility and quota validation remain UNKNOWN.

| Field | Value |
| --- | --- |
| Title | Semantic Cycle Exchange |
| One-line summary | A three-party digital service exchange with AI-assessed compatibility, explicit owner commitments and inspectable finalized onchain outcomes. |
| Repository | https://github.com/halihalibt/semantic-cycle-exchange |
| Website — production (user-accepted) | https://halihalibt.github.io/semantic-cycle-exchange/ |
| Verification entry — production | https://halihalibt.github.io/semantic-cycle-exchange/?w=1 |
| Contract | https://explorer-studio.genlayer.com/address/0x84e9284448D4cd16dcBBCbd8104449B11209C6F0 |
| Network | Stable Studionet, Chain ID 61999 |
| Proof materials — unique to B | https://github.com/halihalibt/semantic-cycle-exchange/blob/main/docs/FINAL_ONCHAIN_EVIDENCE_INDEX.md |
| Supplemental information — unique to B | https://github.com/halihalibt/semantic-cycle-exchange/blob/main/docs/ACCELERATED_FINAL_DELIVERY_REPORT.md |
| Complete canonical source | https://github.com/halihalibt/semantic-cycle-exchange/blob/main/intelligent-contract/contracts/semantic_cycle_accord.py |
| License | MIT |
| Demo video | Optional in retrieved current public Explorer form; no video fabricated/provided |

Description:

Semantic Cycle Exchange turns the Semantic Cycle Accord primitive into an end-to-end
product for people exchanging digital services. Users browse live Intents, manage their
own records, create or update exact offer/need terms, construct a directed three-party ring,
inspect AI Assessments and confirm or decline the resulting commitment. Workspace and
Inspect expose actual finalized state rather than a simulated success screen. The public
Verified Onchain Demo is designed for visitors without a wallet or prior history.

The product contribution beyond the contract is its real SDK integration, owner-specific
workflows, request previews, fresh preflight, separate explicit user confirmation, one-attempt
wallet submission, durable unresolved-submission journal, finality tracking and state
reconciliation. Normal internal navigation preserves the selected wallet session. Reload
restoration checks existing permission/account/network through reads only, never reconnects
after local Disconnect, and never restores a transaction approval. Chain 61999 and the frozen
canonical contract are fixed. The full byte-identical official source is included in this repo.

Verification instructions (on the published site):

1. Open Website plus `?w=1` without connecting a wallet. Check the original Cycle #1 ACTIVE
   case and Assessment #2 NOT_MATCHED case, including source and transaction evidence links.
2. Open `?view=cycle&id=2`: expect ACTIVE, three owner confirmations and the exact ring
   7 → 9 → 10 → 7. Inspect Intents #7/#9/#10: expect CONSUMED.
3. Open `?view=cycle&id=3`: expect ABORTED. Inspect Intent #8: expect CANCELLED.
   Current #12/#13 are reserved by the separate later expiry case; use archived evidence to
   distinguish previous post-decline release from current state.
4. Optionally connect an authorized wallet once on 61999. Navigate Overview → My Intents →
   Build Cycle → Workspace, then F5: expect connection continuity without authorization popup
   for a uniquely rediscovered EIP-6963 provider. Manual Disconnect must survive navigation
   and reload. No signing is needed to verify these behaviors.

Expected outcome:

A visitor can inspect finalized positive and negative/aborted cases without a wallet; an
owner can keep a wallet session while moving among workflows. Any actual write requires a
fresh bound request and deliberate user confirmation. Live E2E actions were USER-EXECUTED;
Work independently verified the 17 transaction receipts via read-only RPC.

Limitations to include in submission notes:

LIVE EXPIRATION POSITIVE TEST — NOT RUN / TIME-GATED; the dedicated Cycle #4 deadline is
2026-10-15 05:16:08 UTC+8. Intent #8 cancellation is independently verified from its raw receipt and current CANCELLED state. New Windows Chrome wallet-fix acceptance was **USER-EXECUTED: 7 PASS / 0 FAIL**, documented in `docs/WINDOWS_CHROME_WALLET_ACCEPTANCE.md`; the user subsequently accepted the public site, checking homepage, My Intents, Build Cycle and wallet navigation. These are not independently reproduced by Work or browser automation. Never replace these states with a blanket “all live tests pass”.

Portal compliance:

The retrieved current public Explorer form requires a website before review. The site is now published and user-accepted at the production URL above; this publication gate is satisfied. The exact authenticated live Portal server-side requirements are not independently known. The authenticated live category's eligibility,
quota and server validation remain UNKNOWN. No public guideline explicitly demanded a live
positive expiration test; that does not waive a stronger requirement if the live form/reviewer
states one. Two categories cannot count the same work twice: this B submission must claim
only the additional working product value, disclose the shared primitive, and not duplicate
A's contribution narrative. All proof/supplementary URLs above are disjoint from A's URLs.
The contract link may be shared, as instructed. User may proceed to the actual authenticated Portal form, checking any stronger required evidence there. Do not mark live positive expiration PASS before the real deadline; do not assert both categories will earn separate credit.
