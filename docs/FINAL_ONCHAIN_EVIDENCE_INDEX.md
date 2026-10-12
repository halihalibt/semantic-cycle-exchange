# Verified application onchain evidence

The original browser operations were **USER-EXECUTED** in Windows Chrome + OKX.
Independent read-only verification retrieved 13 provided hashes plus four Explorer-discovered hashes via the Stable Studio RPC, decoded exact
method/arguments with installed SDK 1.1.8, verified hash/contract binding, and retained
sender, leader result, consensus votes and raw transaction evidence.

[Machine-readable index and current finalized reads](../evidence/final-delivery/onchain-index.json)
· [complete read-only request/response log](../evidence/final-delivery/readonly-rpc-calls.json)
· [reproducible read-only probe](../frontend/final-read-probe.mjs).
Each individual receipt has a SHA256 entry. The retained offline regression parses all 17
through the production receipt-verification code. Receipt verification did not send transactions.

| Evidence | Result |
| --- | --- |
| create_intent #7, #9, #10, #11, #12, #13 | FINALIZED / MAJORITY_AGREE / SUCCESS; returned exact Intent ID |
| update_intent #7 | FINALIZED / MAJORITY_AGREE / SUCCESS; returned version 2 |
| assess_cycle → Assessment #3 / Cycle #2 | FINALIZED / MAJORITY_AGREE / SUCCESS; actual MATCHED result |
| confirm_cycle #2, owners A/B/C | Three separate bound accounts; FINALIZED / MAJORITY_AGREE / SUCCESS; each returned true |
| assess_cycle → Assessment #4 / Cycle #3 | FINALIZED / MAJORITY_AGREE / SUCCESS; actual MATCHED result |
| decline_cycle #3 | FINALIZED / MAJORITY_AGREE / SUCCESS; successful null return, actual ABORTED state |
| Intent #8 cancellation | Explorer-discovered create/cancel receipts now FINALIZED / MAJORITY_AGREE / SUCCESS; cancellation exact args [8,1], null return; current state CANCELLED |

Each hash, account, contract and full exact arguments is in the machine-readable index.
Explorer links use `https://explorer-studio.genlayer.com/tx/<hash>`; The actual Explorer server-rendered contract/address page was independently read;
[listing provenance](../evidence/final-delivery/explorer-listing-provenance.json) records the
source, HTML digest and transaction table. This is not Chrome visual acceptance or a screenshot.

Latest-final observations archived on 2026-10-12 (UTC):

| Object | Observed state |
| --- | --- |
| Cycle #1 | ACTIVE, 3 / 3 confirmations; original Verified Onchain Demo preserved |
| Cycle #2 | ACTIVE, 3 / 3 confirmations; Intents #7 / #9 / #10 CONSUMED |
| Cycle #3 | ABORTED, 0 / 3 confirmations |
| Intent #8 | CANCELLED |
| Intent #11 | OPEN, no current cycle |
| Intents #12 / #13 / #14 | RESERVED by later Cycle #4 |
| Cycle #4 | PENDING, 0 / 3 confirmations; ring 12 → 13 → 14 → 12 |

The user's earlier post-decline reading showed #11/#12/#13 released. That is historical
USER-EXECUTED evidence; the current #12/#13 reservation is caused by the subsequent expiry
case and does not contradict it. Verification did not independently recover a raw intermediate
read proving all three OPEN immediately after decline. Preserve that distinction.

Cycle #4 snapshot:
`b710987581187442258dbd6865959bbf2d9bc81fae2a65e334a580fc93f2c594`.
Actual onchain confirmation_deadline: **1792012568**, **2026-10-15 05:16:08 UTC+8**.
**LIVE EXPIRATION POSITIVE TEST — NOT RUN / TIME-GATED**. No time manipulation,
contract change or early expiration request occurred. Use the actual eligible chain time;
a positive cleanup test requires a fresh manually confirmed `expire_cycle` request
and verification of its boolean return and finalized actual state. No positive live
expiration result is included in this evidence.

Original screenshot bytes for these application E2E actions are not published in this
evidence set. User statements remain labelled USER-EXECUTED; no public screenshot
verification is claimed. Earlier browser screenshot metadata remains in the
[B2-B manifest](../evidence/b2b/windows-chrome-screenshot-manifest.md), and original
protocol screenshot metadata is retained in the protocol evidence index.
The [wallet acceptance record](WINDOWS_CHROME_WALLET_ACCEPTANCE.md) separately records
the seven user-reported Chrome checks and published-site acceptance.

Independently discovered supplement: create Intent #8, cancel Intent #8, create Intent #14,
and Assessment #5 / Cycle #4. All four are FINALIZED / MAJORITY_AGREE / SUCCESS and pass
the same bound receipt checks. Exact hashes/results are in the index and individual raw files.
Cancel #8: `0xbc0cf2b63958b9000bb80b0c6a15933584ab8fc33737eef7a66fa058dfc2b349`.
Assessment #5 returns MATCHED / cycle_id 4; this is preparation, not expire_cycle execution.

## Case navigation and transaction details

See the [wallet-free public demo guide](../DEMO.md) for expected outcomes and
[original protocol evidence](https://github.com/halihalibt/semantic-cycle-accord-genlayer/blob/main/docs/PHASE_4C_E2E_EVIDENCE_INDEX.md)
for the first positive/negative cases. Archived checkpoint reports remain available
for reproducibility; their statuses describe their original observation window.

| Application action | Explorer | Retained raw record |
| --- | --- | --- |
| update-7 / `update_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0x1be34dde1a051205063c3312deb0935be3745670e2fbdbb3188e1ebb425c24c6) | [JSON](../evidence/final-delivery/update-7.json) |
| create-7 / `create_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0x52923b7ccf1ab4cc568f1f87846083c17c3ee2e519904857782a766f184661fa) | [JSON](../evidence/final-delivery/create-7.json) |
| create-10 / `create_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0x7daac86d3e17f5ccd637972610c56cf7cfd268f45f2f8dd3030677679331bfcf) | [JSON](../evidence/final-delivery/create-10.json) |
| create-9 / `create_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0xd18ac0762e3ff379560fd5e8f980295982134837962c054bfbb3d1c9d5bf7f05) | [JSON](../evidence/final-delivery/create-9.json) |
| confirm-2-a / `confirm_cycle` | [Transaction](https://explorer-studio.genlayer.com/tx/0xb0cf0ea42ea3901d12e3f99e46bf689f667df70fb480ad384551aacea36568ed) | [JSON](../evidence/final-delivery/confirm-2-a.json) |
| assessment-3 / `assess_cycle` | [Transaction](https://explorer-studio.genlayer.com/tx/0x29b2a75465b46864eb3bfdeadf4c54c3739c118c15099a4c8453dcd91eb46c48) | [JSON](../evidence/final-delivery/assessment-3.json) |
| confirm-2-b / `confirm_cycle` | [Transaction](https://explorer-studio.genlayer.com/tx/0x9694ff7b0a43ce2f40b22d7ad000b1914150a499dbe98eeca91669d513a90876) | [JSON](../evidence/final-delivery/confirm-2-b.json) |
| confirm-2-c / `confirm_cycle` | [Transaction](https://explorer-studio.genlayer.com/tx/0x49d8ffb9d9d4b887110f44a1d0576fd7948c0d0dfec86bcce06ca837592a936e) | [JSON](../evidence/final-delivery/confirm-2-c.json) |
| create-11 / `create_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0xb1ea3ba9ba4e267f534098987d1cd1421788233d6547d305f12b7683cad867ba) | [JSON](../evidence/final-delivery/create-11.json) |
| create-12 / `create_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0xc88df37d8b481b71e1bd93b98e0989455f0263ea0350e4457c8c74c4a328eb71) | [JSON](../evidence/final-delivery/create-12.json) |
| create-13 / `create_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0x7b6d3553c21987b829a1dda41c355890f8df301dbeb740caaa5e65623516f55e) | [JSON](../evidence/final-delivery/create-13.json) |
| assessment-4 / `assess_cycle` | [Transaction](https://explorer-studio.genlayer.com/tx/0x32f3a6f3f5a59c4a48cbca57ecda61bd36fd57789c5f0c3142ed6e3bf06ae26e) | [JSON](../evidence/final-delivery/assessment-4.json) |
| decline-3 / `decline_cycle` | [Transaction](https://explorer-studio.genlayer.com/tx/0xfd9abb76faae58049ebb86049c1712c52f21238b198b5e4f15c65f98aaf81c7a) | [JSON](../evidence/final-delivery/decline-3.json) |
| create-8 / `create_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0x86c6fb22e5e44dd6365e121efa6efeaa8b5232b9bea26de3fd4cf59c1e5dc9f5) | [JSON](../evidence/final-delivery/create-8.json) |
| cancel-8 / `cancel_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0xbc0cf2b63958b9000bb80b0c6a15933584ab8fc33737eef7a66fa058dfc2b349) | [JSON](../evidence/final-delivery/cancel-8.json) |
| create-14 / `create_intent` | [Transaction](https://explorer-studio.genlayer.com/tx/0x7bab2d243d4a983f999234b9fc1c8d3478bfa82dfe324352e6d264196c3e42a2) | [JSON](../evidence/final-delivery/create-14.json) |
| assessment-5-cycle-4 / `assess_cycle` | [Transaction](https://explorer-studio.genlayer.com/tx/0xd8157fec047a37150356dc22c8f8f2d8ca8c5518319ba58b5b7b5d9ada069c2b) | [JSON](../evidence/final-delivery/assessment-5-cycle-4.json) |
