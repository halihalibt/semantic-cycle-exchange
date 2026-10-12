# Public demonstration guide

Open the [published application](https://halihalibt.github.io/semantic-cycle-exchange/)
or [Verified Onchain Demo](https://halihalibt.github.io/semantic-cycle-exchange/?w=1).
All inspection steps below work **without connecting a wallet, signing or creating
new state**. The app reads the existing contract on Stable Studionet 61999.
Use Refresh for a new finalized observation; if RPC is unavailable, an error or
cached observation is not a new successful read.

## Case 1 — Positive GenLayer consensus

**Demonstrates:** compatible natural-language terms followed by three-owner consent.

Open [Assessment #1](https://halihalibt.github.io/semantic-cycle-exchange/?view=assessment&id=1)
and [Cycle #1](https://halihalibt.github.io/semantic-cycle-exchange/?view=cycle&id=1).
Expect MATCHED, FIT / FIT / FIT, ring `1 → 3 → 2 → 1`, and ACTIVE with 3 / 3 confirmations.

Evidence: [assessment](https://explorer-studio.genlayer.com/tx/0xc71701f70199e4d65565adb2bbee2592e4e463f3fbf81b25d99b10c9de703968),
[owner A confirmation](https://explorer-studio.genlayer.com/tx/0x48c3a1d262adba989c1f37520b871919b619a61e9bb721e14eeffeac6ca1b34b),
[owner B confirmation](https://explorer-studio.genlayer.com/tx/0x4736fce42672766d2b589eab8a73d8bee56caf202c7ceaf1c83ada8b9fbd4531),
[owner C confirmation](https://explorer-studio.genlayer.com/tx/0xcc310816d39b379189690be115241f594719c44959351232908b9ab85ee8ef82).

ACTIVE establishes accepted terms, not delivery of copy, logo or chart services.

## Case 2 — Semantic incompatibility

**Demonstrates:** a NO_FIT edge prevents commitment creation.

Open [Assessment #2](https://halihalibt.github.io/semantic-cycle-exchange/?view=assessment&id=2).
Expect NOT_MATCHED, FIT / FIT / NO_FIT, ring `4 → 6 → 5 → 4`, `cycle_id=0` and cycle status NONE.
The SVG requirement conflicts with a PNG-only offer.

Evidence: [negative assessment](https://explorer-studio.genlayer.com/tx/0x0bb517817a4dd54ec6afb1b1d04223fb78804ed3f6e561f2ca65ca31d2b3234f).
No Cycle was generated from this assessment. Cycle #2 exists today because a
later, separate Assessment #3 created it; its existence does not contradict this result.

## Case 3 — Full frontend E2E

**Demonstrates:** real owner workflows, an updated Intent, semantic matching and
three independent confirmations through the application.

Open [Assessment #3](https://halihalibt.github.io/semantic-cycle-exchange/?view=assessment&id=3)
and [Cycle #2](https://halihalibt.github.io/semantic-cycle-exchange/?view=cycle&id=2).
Expect MATCHED, FIT / FIT / FIT, ring `7 → 9 → 10 → 7`, ACTIVE and 3 / 3 confirmations.
Inspect [Intent #7](https://halihalibt.github.io/semantic-cycle-exchange/?view=intent&id=7),
[Intent #9](https://halihalibt.github.io/semantic-cycle-exchange/?view=intent&id=9) and
[Intent #10](https://halihalibt.github.io/semantic-cycle-exchange/?view=intent&id=10): all are CONSUMED by Cycle #2.

Evidence: [Intent #7 update](https://explorer-studio.genlayer.com/tx/0x1be34dde1a051205063c3312deb0935be3745670e2fbdbb3188e1ebb425c24c6), [assessment](https://explorer-studio.genlayer.com/tx/0x29b2a75465b46864eb3bfdeadf4c54c3739c118c15099a4c8453dcd91eb46c48),
[owner A confirmation](https://explorer-studio.genlayer.com/tx/0xb0cf0ea42ea3901d12e3f99e46bf689f667df70fb480ad384551aacea36568ed), [owner B confirmation](https://explorer-studio.genlayer.com/tx/0x9694ff7b0a43ce2f40b22d7ad000b1914150a499dbe98eeca91669d513a90876),
[owner C confirmation](https://explorer-studio.genlayer.com/tx/0x49d8ffb9d9d4b887110f44a1d0576fd7948c0d0dfec86bcce06ca837592a936e).

The confirmations belong to three distinct bound accounts. This case establishes
committed service terms, not subsequent fulfillment.

## Case 4 — Declined commitment

**Demonstrates:** semantic compatibility does not force participants to accept.

Open [Assessment #4](https://halihalibt.github.io/semantic-cycle-exchange/?view=assessment&id=4)
and [Cycle #3](https://halihalibt.github.io/semantic-cycle-exchange/?view=cycle&id=3).
Expect the Assessment to remain MATCHED while Cycle #3 is ABORTED with 0 / 3 confirmations.

Evidence: [assessment](https://explorer-studio.genlayer.com/tx/0x32f3a6f3f5a59c4a48cbca57ecda61bd36fd57789c5f0c3142ed6e3bf06ae26e), [authorized participant decline](https://explorer-studio.genlayer.com/tx/0xfd9abb76faae58049ebb86049c1712c52f21238b198b5e4f15c65f98aaf81c7a).

The user's historical observation showed Intents #11/#12/#13 released after decline;
an independently recovered raw intermediate read for all three OPEN records is not
available. Later Intents #12/#13 were reused by the separate Cycle #4, so their
current RESERVED state is not evidence of failed decline cleanup.

## Case 5 — Intent cancellation

**Demonstrates:** an owner can cancel an eligible offer/need record.

Open [Intent #8](https://halihalibt.github.io/semantic-cycle-exchange/?view=intent&id=8).
Expect CANCELLED, version 1 and no linked Cycle.

Evidence: [creation](https://explorer-studio.genlayer.com/tx/0x86c6fb22e5e44dd6365e121efa6efeaa8b5232b9bea26de3fd4cf59c1e5dc9f5), [cancellation with exact arguments [8, 1]](https://explorer-studio.genlayer.com/tx/0xbc0cf2b63958b9000bb80b0c6a15933584ab8fc33737eef7a66fa058dfc2b349).
Cancellation is not an assessment, service delivery or a cycle decline.

## Verification provenance and limits

All linked case transactions were independently checked as FINALIZED /
MAJORITY_AGREE / SUCCESS from read-only RPC evidence. The browser actions were
USER-EXECUTED. The [evidence index](docs/FINAL_ONCHAIN_EVIDENCE_INDEX.md) links retained
raw transactions, exact arguments, decoded returns and checksums, including 17
application receipts and the separate original positive/negative protocol cases.

The released automated suite records 541 PASS. Windows Chrome + OKX wallet
continuity acceptance was USER-EXECUTED 7 PASS; published-site acceptance was also
user-reported. Those declarations are not independent browser automation.
Original image availability and historical screenshot provenance are described
in the evidence index and [browser acceptance record](docs/WINDOWS_CHROME_WALLET_ACCEPTANCE.md).

Positive live `expire_cycle` execution remains **NOT RUN / TIME-GATED**. Dedicated
[Cycle #4](https://halihalibt.github.io/semantic-cycle-exchange/?view=cycle&id=4) was
PENDING with ring `12 → 13 → 14 → 12`, snapshot
`b710987581187442258dbd6865959bbf2d9bc81fae2a65e334a580fc93f2c594`
and actual deadline **2026-10-15 05:16:08 UTC+8** (`1792012568`). The recorded
MATCHED Assessment #5 prepares that case; it is not expiration execution. Effective
expiry can appear in later reads without a stored cleanup transaction.
