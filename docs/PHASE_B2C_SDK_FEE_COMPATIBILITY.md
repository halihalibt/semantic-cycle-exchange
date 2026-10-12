# PHASE B2-C — SDK 1.1.8 and fee compatibility

**FEE_QUOTE_UNAVAILABLE remains mandatory.** Findings use installed exact package runtime, TypeScript declarations, line-numbered source and mocked execution. Current docs provide context, not missing 1.1.8 capabilities.

Evidence: sdk-118-source-excerpts.txt and boundaries-and-lock.log. Installed dist/index.js SHA256 `577032b22e6077b671a7d27ba8d6dac58eb90ed5892f2a05b11eefc6eef29dd2`; declaration SHA256 `24c849737a5b083858152e62f5ab38286e0b0b3035d4098446e1b804ed0e8820`.

| Capability | Actual locked-version finding |
|---|---|
| writeContract | address/functionName/args/kwargs/value/leaderOnly/consensusMaxRotations/account; no feeValue/distribution arguments; Studio injected-account path returns provider hash |
| EIP-1193 | createClient accepts public account and provider.request; wallet methods go to provider; reads/nonce/gas to HTTP; constructor offers no general custom RPC transport injection |
| Network | SDK assertChainMatch skips Studio; application independently enforces 61999 |
| Wrapper | Consensus `0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575`; addTransaction sender/recipient/5 validators/3 rotations/RLP data; inner canonical contract |
| Calldata | decodeInputData callData/abi.calldata.decode return Map; seven exact bigint arg orders verified; false leaderOnly/no kwargs |
| Retry | V5/V6 ABI fallback exists; one-attempt boundary blocks second send |
| Gas | eth_estimateGas returns bigint; internal write catches errors and substitutes 200000; failed gasPrice can delegate pricing to wallet; neither is a complete quote |
| Closure compatibility | Replacing returned client estimator does not affect internally captured write client; retained failures prove this. Bridge explicitly estimates exact envelope, refuses sentinel/mismatches/omitted gasPrice; second internal fallback is rejected |
| Balance | eth_getBalance available; fresh budget arithmetic tested with mocks, not live complete-fee affordability |
| Status/finality | waitForTransactionReceipt defaults ACCEPTED; explicit FINALIZED required; simplifier maps statusName to status_name and removes substantial data; EVM 0x1 insufficient |
| Execution/return | Complete Studio transaction has result_name and leader receipt/result bytes. Decode prefix and calldata; missing bytes stay UNKNOWN. Idle quorum validators do not override leader success |
| Fee policy | Runtime lacks estimateTransactionFees, estimateTransactionFeesForWrite, getCurrentFeePolicy, waitForFinalization; Stable feeManagerContract null; no evidenced complete AI/GenVM/Validator/Consensus/rotation/appeal distribution via locked write interface |

General staged tests model complete distributions/budgets. The actual SDK bridge refuses nonzero feeValue/distribution rather than discarding them. Its zero-allocation tests are MOCK_ONLY, not a production free policy. Production feeQuote still returns unavailable without RPC or AI simulation.

## Bounded current read-only queries

Three calls capped at 12 seconds each exited 0: eth_chainId `0xf22f` (61999), eth_gasPrice `0x0`, eth_getBalance returned a quantity for the known public wallet. Exact request/response/UTC evidence: readonly-probes.json. Zero gasPrice does not establish full zero fees or lasting price guarantees. No current live estimate/simulation/faucet/AI/signature. sim_getFeeConfig was not called; earlier -32601 remains historical, not a new observation.

## Official references and blocker

- [SDK reference](https://docs.genlayer.com/api-references/genlayer-js)
- [Writing data](https://docs.genlayer.com/developers/decentralized-applications/writing-data)
- [Fee profiling](https://docs.genlayer.com/developers/decentralized-applications/fee-profiling-and-estimation)

Current fee profiling describes representative profiles plus live prices/caps, estimateTransactionFees, then distribution/feeValue submission. Installed 1.1.8 lacks those APIs/arguments. This cannot justify unsupported arguments, gas fallback, upgrading SDK or expensive per-click simulations.

Closure requires authoritative exact-network total-fee semantics under 1.1.8 and supported wallet-envelope mapping, or retaining the blocker. No actual fee/profile/free-policy/budget invented. Not ready for live signature acceptance.
