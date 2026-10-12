# Semantic Cycle Exchange — Projects submission draft

Prepared for manual entry. Status: **NOT SUBMISSION-READY** until the new Windows Chrome
wallet checks, standard merge and verified public publication are complete. Website URLs
below are planned destinations, not already published proof. No Portal action has occurred.

| Field | Value |
| --- | --- |
| Title | Semantic Cycle Exchange |
| One-line summary | A three-party digital service exchange with AI-assessed compatibility, explicit owner commitments and inspectable finalized onchain outcomes. |
| Repository | https://github.com/halihalibt/semantic-cycle-exchange |
| Website — planned; do not submit until verified live | https://halihalibt.github.io/semantic-cycle-exchange/ |
| Verification entry — planned | https://halihalibt.github.io/semantic-cycle-exchange/?w=1 |
| Contract | https://explorer-studio.genlayer.com/address/0x84e9284448D4cd16dcBBCbd8104449B11209C6F0 |
| Network | Stable Studionet, Chain ID 61999 |
| Proof materials — unique to B | https://github.com/halihalibt/semantic-cycle-exchange/blob/phase-b2c-staged-transaction-integration/docs/FINAL_ONCHAIN_EVIDENCE_INDEX.md |
| Supplemental information — unique to B | https://github.com/halihalibt/semantic-cycle-exchange/blob/phase-b2c-staged-transaction-integration/docs/ACCELERATED_FINAL_DELIVERY_REPORT.md |
| Complete canonical source | https://github.com/halihalibt/semantic-cycle-exchange/blob/phase-b2c-staged-transaction-integration/intelligent-contract/contracts/semantic_cycle_accord.py |
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

Verification instructions (after publication):

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
2026-10-15 05:16:08 UTC+8. Intent #8 cancellation is independently verified from its raw receipt and current CANCELLED state. New Windows Chrome wallet-fix acceptance and production acceptance are
NOT RUN at this checkpoint. Never replace these states with a blanket “all live tests pass”.

Portal compliance:

The retrieved current public Explorer form requires a website before review. The website
is not yet published, so B is blocked now. The authenticated live category's eligibility,
quota and server validation remain UNKNOWN. No public guideline explicitly demanded a live
positive expiration test; that does not waive a stronger requirement if the live form/reviewer
states one. Two categories cannot count the same work twice: this B submission must claim
only the additional working product value, disclose the shared primitive, and not duplicate
A's contribution narrative. All proof/supplementary URLs above are disjoint from A's URLs.
The contract link may be shared, as instructed. Submit manually only after the gates pass.
