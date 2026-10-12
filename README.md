# Semantic Cycle Exchange

Semantic Cycle Exchange is a published application for arranging three-party
digital-service exchanges. People publish what they can offer and what they need,
assemble a directed exchange, inspect GenLayer's compatibility assessment, and
explicitly accept or decline the resulting commitment.

[Open the application](https://halihalibt.github.io/semantic-cycle-exchange/) ·
[Inspect verified examples without a wallet](https://halihalibt.github.io/semantic-cycle-exchange/?w=1) ·
[Demo guide](DEMO.md)

## The problem

Two people may not have a direct service match. A third participant can complete
the exchange: A supplies B, B supplies C, and C supplies A. Natural-language offers
also carry practical restrictions—file formats, scope and deadlines—that simple
keyword matching misses. The application makes the full ring, assessment and
individual consent visible in one workflow.

## How it works

1. Publish or browse versioned **Intents** with an offer, limitations, need,
   requirements and expiry.
2. Choose three Intents owned by different participants and arrange their direction.
3. Review exact IDs, versions and edges, then request an AI assessment as a participant.
4. Inspect the three decisions. Only `FIT / FIT / FIT` creates a pending Cycle.
5. Each owner reviews and confirms the same snapshot, or declines while eligible.
   Three confirmations make the Cycle ACTIVE.

**ACTIVE records accepted terms; it does not establish completed service delivery.**

## Try the live application

The application is [published on GitHub Pages](https://halihalibt.github.io/semantic-cycle-exchange/).
Explore, Assessment, Workspace, Inspect and the Verified Onchain Demo support
wallet-free public reads. Connect a browser wallet on Stable Studionet 61999 to
manage your own Intents or prepare a write. Inspecting existing cases requires
no signature or new transaction.

| Entry | Purpose |
| --- | --- |
| [Explore](https://halihalibt.github.io/semantic-cycle-exchange/?view=intents) | Browse public Intents |
| [Verified Onchain Demo](https://halihalibt.github.io/semantic-cycle-exchange/?w=1) | Original positive and incompatible cases |
| [Cycle #2](https://halihalibt.github.io/semantic-cycle-exchange/?view=cycle&id=2) | Frontend E2E: ACTIVE with three confirmations |
| [Cycle #3](https://halihalibt.github.io/semantic-cycle-exchange/?view=cycle&id=3) | Matched commitment declined by a participant |
| [Intent #8](https://halihalibt.github.io/semantic-cycle-exchange/?view=intent&id=8) | CANCELLED Intent |

## Core features

- Public Intent discovery and owner-specific history and management.
- Three-party Cycle Builder with exact direction, version and eligibility checks.
- Assessment inspection showing labels, immutable terms and the linked Cycle.
- Explicit confirmation, decline and deadline-dependent cleanup workflows.
- Wallet session continuity across internal navigation, with guarded reload recovery.
- Exact request preview, fresh preflight, single-attempt submission, finality
  verification and actual-state reconciliation.
- Persistent unresolved-submission journal to prevent ambiguous sends being retried.

## AI assessment and explicit commitments

The [Semantic Cycle Accord protocol](https://github.com/halihalibt/semantic-cycle-accord-genlayer)
is the reusable primitive. GenLayer's Leader assesses all three directed edges;
Validators independently classify the same snapshot and compare every label.
`NO_FIT` or `UNSURE` prevents commitment creation. Compatibility never replaces
consent: three distinct owners must confirm the exact snapshot before ACTIVE.

This repository contributes the user-facing product: discovery and owner workflows,
ring construction, SDK integration, transaction review and submission, wallet
continuity, reconciliation and public verification. It uses the same deployed
primitive, with its [complete official source included here](intelligent-contract/contracts/semantic_cycle_accord.py).

## Technical architecture

React, TypeScript and Vite provide query-based routes under
`/semantic-cycle-exchange/`. A restricted read adapter uses latest-final contract
views. Wallet-provider discovery and the transaction runtime are separate from
public reads. There is no application backend or private-key service.

| Fixed integration | Value |
| --- | --- |
| Network | Stable GenLayer Studionet, Chain ID 61999 |
| RPC | https://studio.genlayer.com/api |
| SDK | genlayer-js@1.1.8 |
| Contract | [0x84e9284448D4cd16dcBBCbd8104449B11209C6F0](https://explorer-studio.genlayer.com/address/0x84e9284448D4cd16dcBBCbd8104449B11209C6F0) |

See [architecture](docs/ARCHITECTURE.md) and [security boundaries](docs/SECURITY_BOUNDARIES.md).

## Wallet and transaction safety

Initial account permission is requested only after explicit connection. Internal
navigation retains the session. Reload recovery uses already authorized accounts
and chain reads for a uniquely identified EIP-6963 provider; local Disconnect
persists. Account or network changes invalidate old previews and approvals.
Legacy injected providers do not silently recover across reloads.

A write requires an exact preview, fresh preflight and deliberate confirmation
before the wallet request. Submission is attempted once. An unknown outcome stays
locked in a durable journal; navigation, timeout or refresh cannot authorize a
retry. A transaction hash or an EVM-style success flag alone is not final success:
receipt identity, calldata, consensus, execution return and actual state are checked.

The current write path is restricted to the user-confirmed zero-fee Studionet premise,
requires a successful gas estimate and an observed gas price of zero, and sends
native value zero. It is not a general fee quotation or a production-network guarantee.

## Verified onchain case studies

| Case | Outcome |
| --- | --- |
| Original positive | Assessment #1 MATCHED; Cycle #1 ACTIVE, 3 / 3 confirmations |
| Semantic incompatibility | Assessment #2 NOT_MATCHED; NO_FIT prevents a linked Cycle |
| Frontend E2E | Assessment #3 MATCHED; Cycle #2 ACTIVE; Intents #7 / #9 / #10 CONSUMED |
| Decline | Assessment #4 MATCHED; Cycle #3 ABORTED |
| Cancellation | Intent #8 CANCELLED |

[Demo guide and exact transaction links](DEMO.md) ·
[onchain evidence index](docs/FINAL_ONCHAIN_EVIDENCE_INDEX.md).

The released application suite records **541 automated tests PASS**. Browser
wallet continuity acceptance was **USER-EXECUTED: 7 PASS** in Windows Chrome + OKX;
the published-site acceptance was also user-reported. These are distinct from
independent RPC verification of **17 historical transaction receipts** and from
offline Mock Provider tests. See [browser acceptance provenance](docs/WINDOWS_CHROME_WALLET_ACCEPTANCE.md).

## Complete Intelligent Contract source

[The full canonical contract](intelligent-contract/contracts/semantic_cycle_accord.py)
is 32,040 bytes and byte-identical to Repository A's production source, including
all seven writes, seven views, canonical prompt and consensus logic.
SHA256: `88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442`.
[Source provenance](intelligent-contract/SOURCE_PROVENANCE.md) identifies its frozen origin.

## Local development

Use Node.js **>=22.12.0** and the committed lockfile. No dependency upgrade is needed.

```sh
cd frontend
npm ci
npm run dev
```

Open Vite's printed URL with the `/semantic-cycle-exchange/` base path.
Add `?w=1` for verified examples or `?view=inspect` for ID lookup.

```sh
npm run typecheck
npm run lint
npm test
npm run integrity
npm run build
```

Unit tests block outgoing network access. They use mocks and retained receipts,
not new onchain transactions. Public reads expose RPC errors and label cached
observations rather than replacing failures with fixtures.

## Current limitations

There are no payments, escrow, custody, automatic service delivery, dispute
resolution or automatic global matching. Semantic errors remain possible.
Separate latest-final reads are not an atomic historical snapshot; page-level
counts are not global totals. Browser acceptance does not establish multi-browser
or extension-version coverage.

Live positive `expire_cycle` execution is **NOT RUN / TIME-GATED**. Dedicated Cycle #4
was PENDING, ring `12 → 13 → 14 → 12`, with deadline **2026-10-15 05:16:08 UTC+8**
(`1792012568`). All seven writes have UI paths; this is not a claim that all seven
have passed positive live execution. Historical checkpoint documents and raw
records remain available at their original paths for reproducibility.

## License

[MIT](LICENSE).
