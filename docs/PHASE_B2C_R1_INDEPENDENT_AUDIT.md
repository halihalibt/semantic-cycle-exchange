# B2-C-R1 independent audit (before implementation)

Audited PR #4 HEAD `6132f7372234664d7ee1891278ea0b0b66da24db` against B main `a98d3dcbefcef6e37b11fb41a2ef9e11050c5b78`. A main read through GitHub: `8a09380c06f12afd6ac85197737b0018cd8e594f`.

This is a fresh review in the R1 execution, independent of the prior author's claims; no second reviewer or delegated audit is claimed.

| Area | Pre-patch finding |
| --- | --- |
| Seven argument lists | PASS: match complete canonical source, bigint integers, exact ring and Snapshot |
| System wrapping | PASS: fixed SDK Studionet Consensus, five-argument addTransaction, inner canonical target, leaderOnly=false |
| Identity and single attempt | PASS in-memory: WalletSession revisions, provider readbacks, pre-forward latch |
| SDK gas fallback | BLOCKER for activation: writeContract catches estimate errors and uses 200000; no supported explicit gas argument; quotation bridge is MOCK_ONLY |
| ABI retry | BLOCKER for activation without existing latch: SDK may try fallback ABI on ambiguous send error; preserve latch and bypass auto-fallback path |
| Reload/navigation | BLOCKER for activation: unknown-send locks are memory-only; must persist unresolved records before possible wallet forwarding and serialize tabs |
| Finality | PASS: FINALIZED + MAJORITY_AGREE + leader execution, bound calldata/sender/recipient; actual finalized reads required |
| Error visibility | Needs improvement: executor currently catches unresolved observation errors without UI diagnostic |
| Production isolation | PASS for prior scope: no production send path; Mock-only bridge absent from production imports |
| Testing | Prior 410 assertions must remain byte-for-byte unchanged; production activation needs new integration coverage |

Decision: preserve historical MOCK_ONLY path and all old tests. Add distinct user-confirmed Studionet zero-fee policy, strict read-only gas/nonce/receipt transport, SDK-compatible explicit envelope, durable unresolved submission journal and production transaction context. Do not call any live RPC or wallet in this execution. No A/source/Prompt/SDK/network changes.
