# Semantic Cycle Accord — Intelligent Contracts submission draft

Prepared for manual entry. The public Semantic Cycle Exchange application using this standalone primitive has now been deployed and user-accepted at https://halihalibt.github.io/semantic-cycle-exchange/ (deployment SHA `12eac692f5d4cdd4b283f51e155aaf414976e07f`). Do not claim Portal submission, approval or points.
Repository A remains at its frozen main. This submission describes the reusable contract
created before the application, not a contract extracted from a submitted Project.

| Field | Ready-to-enter value |
| --- | --- |
| Title | Semantic Cycle Accord |
| One-line summary | A reusable GenLayer primitive that turns three owners' natural-language service offers and needs into an AI-assessed, snapshot-bound commitment cycle. |
| Repository | https://github.com/halihalibt/semantic-cycle-accord-genlayer |
| Contract | https://explorer-studio.genlayer.com/address/0x84e9284448D4cd16dcBBCbd8104449B11209C6F0 |
| Network | Stable Studionet, Chain ID 61999 |
| Canonical source | https://github.com/halihalibt/semantic-cycle-accord-genlayer/blob/8a09380c06f12afd6ac85197737b0018cd8e594f/contracts/semantic_cycle_accord.py |
| Proof materials | https://github.com/halihalibt/semantic-cycle-accord-genlayer/blob/8a09380c06f12afd6ac85197737b0018cd8e594f/docs/PHASE_4C_E2E_EVIDENCE_INDEX.md |
| Supplemental information | https://github.com/halihalibt/semantic-cycle-accord-genlayer/blob/8a09380c06f12afd6ac85197737b0018cd8e594f/README.md |
| License | MIT |

Description:

Semantic Cycle Accord addresses a trust problem in three-party service exchange: each
participant describes an offer and a need in natural language, so deterministic text matching
cannot decide whether the directed exchange is acceptable. The reusable contract assesses
each directed edge through GenLayer AI-validator consensus, binds the assessment to a
canonical snapshot of exact owners, terms and versions, and creates a pending commitment
only for a matched cycle. Each distinct owner must confirm the same snapshot before the
cycle becomes ACTIVE. A decline aborts the pending cycle and releases its reservations.
Version checks, reservation rules and deadlines prevent stale approval and conflicting use
of the same Intent.

Integration:

Create/update/cancel Intents using the canonical ABI. Read current finalized records,
construct a directed three-owner ring, and invoke assess_cycle with the exact ring, expected
versions and snapshot. Read the resulting Assessment/Cycle, then obtain each owner's
separate confirm_cycle decision; decline_cycle and expire_cycle provide exit paths. The
canonical source and Repository A documentation are authoritative for exact parameters.
The primitive can be integrated independently of Semantic Cycle Exchange; no application
backend or wallet/session code is embedded in the contract.

Validation disclosure:

The original A evidence includes an AI-matched ACTIVE cycle, a NO_FIT/NOT_MATCHED assessment,
and three owner confirmations. Subsequent user-operated application E2E whose transaction receipts were independently
read and verified by Work includes Cycle #2 ACTIVE and Cycle #3 ABORTED. The final wallet UX Chrome acceptance was user-reported 7/7 PASS; a later published-site browser acceptance was also user-reported PASS. Complete frozen source:
32,040 bytes, SHA256 `88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442`.
No new deployment or source change occurred in this delivery.

LIVE EXPIRATION POSITIVE TEST — NOT RUN / TIME-GATED. Cycle #4's genuine deadline is
2026-10-15 05:16:08 UTC+8. Do not claim live expiration was executed. The existing expiry
logic has offline coverage. Intent #8 is currently CANCELLED; its cancellation receipt hash has been independently recovered and verified.

Current Portal public UI requirements and eligibility limits:
[retrieval provenance](../evidence/final-delivery/portal-requirements.json).
The public guidelines reject duplicate counting of the same work. This A submission claims
only the independent reusable primitive; the B application must justify its additional product
value. Different evidence URLs alone do not establish eligibility for two rewards.
Authenticated category/quota/server validation remains UNKNOWN; apply any stronger live form
requirement, including expiration if explicitly required. No acceptance is promised.
