# Semantic Cycle Exchange — Projects

## Submission fields

| Field | Value |
| --- | --- |
| Title | Semantic Cycle Exchange |
| Summary | A published application for discovering, assessing and committing to three-party digital-service exchanges. |
| Repository | https://github.com/halihalibt/semantic-cycle-exchange |
| Website | https://halihalibt.github.io/semantic-cycle-exchange/ |
| Wallet-free verification | https://halihalibt.github.io/semantic-cycle-exchange/?w=1 |
| Contract | https://explorer-studio.genlayer.com/address/0x84e9284448D4cd16dcBBCbd8104449B11209C6F0 |
| Network | Stable Studionet, Chain ID 61999 |
| Proof materials | https://github.com/halihalibt/semantic-cycle-exchange/blob/main/docs/FINAL_ONCHAIN_EVIDENCE_INDEX.md |
| Supplemental information | https://github.com/halihalibt/semantic-cycle-exchange/blob/main/DEMO.md |
| Complete canonical source | https://github.com/halihalibt/semantic-cycle-exchange/blob/main/intelligent-contract/contracts/semantic_cycle_accord.py |
| License | MIT |

## Description

Semantic Cycle Exchange helps people arrange exchanges in which A supplies B,
B supplies C and C supplies A. Users browse live service Intents, manage their own
records, specify offers and needs, build a directed ring, inspect GenLayer's
compatibility decisions and confirm or decline the resulting snapshot-bound
commitment. A public wallet-free demonstration exposes real positive, incompatible,
accepted, declined and cancelled cases.

The application uses the reusable Semantic Cycle Accord primitive. Its additional
contribution is a working user interface and integration: public discovery,
owner-specific workflows, exact request previews, fresh preflight, deliberate
wallet confirmation, single-attempt submission, durable unresolved-submission
locks, consensus finality checks and actual-state reconciliation. Internal
navigation preserves the wallet session. Reload recovery verifies already
permitted accounts and network without restoring transaction consent; manual
Disconnect persists. The integration fixes chain 61999, the deployed contract
and genlayer-js@1.1.8. Complete byte-identical official contract source is included.

## Public verification

Open the website or `?w=1` without a wallet. Assessment #1 is MATCHED and Cycle #1
is ACTIVE with three confirmations. Assessment #2 is NOT_MATCHED with a NO_FIT
edge and no linked Cycle. Inspect `?view=cycle&id=2` for the full frontend E2E:
ACTIVE, ring 7 → 9 → 10 → 7, and Intents #7/#9/#10 CONSUMED. Inspect
`?view=cycle&id=3` for ABORTED after a participant decline, and
`?view=intent&id=8` for CANCELLED. The Demo guide and evidence index contain exact
public deep links and supporting transactions. No new state or signature is
required to inspect these cases.

## Validation and limitations

The released automated suite records **541 PASS**. Live browser actions were
USER-EXECUTED in Windows Chrome + OKX; **17 historical application receipts** were
separately retrieved and verified through read-only RPC. Wallet continuity
acceptance was USER-EXECUTED **7 PASS**; published-site acceptance was user-reported.
GitHub Pages build and deployment succeeded. These are not independent browser
automation or a claim of cross-browser coverage. Raw transaction evidence and
checksums are public; original application E2E screenshot bytes are not published.

All seven writes have UI paths, but positive live `expire_cycle` execution remains
**NOT RUN / TIME-GATED**. Dedicated Cycle #4 was PENDING, ring 12 → 13 → 14 → 12,
with deadline **2026-10-15 05:16:08 UTC+8** (`1792012568`). MATCHED/ACTIVE are
compatibility/consent states, not proof of service delivery. No payments, escrow,
custody, dispute resolution or automatic fulfillment are implemented. The
zero-fee Studionet write premise is not a general network-fee guarantee.

The Intelligent Contracts entry claims the shared reusable primitive; this entry
claims the application value. Its proof and supplementary URLs are disjoint from
A's URLs. The shared contract link is intentional. Different links alone do not
establish separate reward eligibility; authenticated form requirements and category
acceptance have not been verified. These fields are prepared for manual entry;
no Portal submission or approval is recorded. Proposed document refinements become
the main-branch submission texts only after their documentation PRs are merged.
