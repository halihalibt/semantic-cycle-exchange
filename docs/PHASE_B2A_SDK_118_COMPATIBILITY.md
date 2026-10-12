# B2-A SDK 1.1.8 compatibility — WIP checkpoint

Installed package, not current documentation, is authoritative. `npm ci --ignore-scripts --no-audit --no-fund` retained the existing dependency lock. No SDK or transitive dependency upgrade was made.

| Capability | Installed evidence | Type / mock runtime | Live |
| --- | --- | --- | --- |
| createClient provider + public address account | dist/index.d.ts ClientConfig; dist/index.js getCustomTransportConfig | PASS OFFLINE | NOT RUN |
| Seven writeContract methods | dist/index-C3Ul1Rte.d.ts writeContract; dist/index.js contractActions/_sendTransaction | PASS OFFLINE; all seven encoded envelopes inspected | NOT RUN |
| u64 / nested ring calldata | CalldataEncodable supports bigint and arrays; abi.calldata encoder | PASS OFFLINE | NOT RUN |
| Return from writeContract | declaration is Promise<any>; Studio runtime returns provider hash | Fake hash only; never finality or method return | NOT RUN |
| estimateTransactionGas | typed bigint; RPC eth_estimateGas | PASS OFFLINE; not total GenVM/AI fee | NOT RUN |
| estimateTransactionFees / estimateTransactionFeesForWrite / getCurrentFeePolicy | absent from installed client types and runtime | NOT SUPPORTED | NOT RUN |
| waitForTransactionReceipt | SDK defaults to ACCEPTED; explicit FINALIZED tested | PASS OFFLINE; simplified status_name differs from statusName type | NOT RUN |
| waitForFinalization | absent | NOT SUPPORTED | NOT RUN |
| connect | exported client method uses global window.ethereum and wallet-specific flow | Source inspected; deliberately not used | NOT RUN |

SDK calldata decode returns Map. The simplified receipt maps statusName to status_name. SDK ClientConfig references an undeclared EthereumProvider type; existing skipLibCheck remains unchanged. Local provider interfaces are strict, and runtime mock tests supply evidence beyond compilation.

Studio skips SDK assertChainMatch. SDK write failure may trigger an alternate addTransaction ABI retry. The isolated singleRequestBoundary checks account/chain/revision and latches before asynchronous work, preventing a second provider submission. It is used only in offline tests and is not a production write executor.

SDK gas estimation failure falls back to 200000 gas. Gas price retrieval can delegate selection to the wallet on failure. Neither behavior is a safe confirmed total fee quote. No allocation profile, fee service or AI budget is measured. Production feeQuote always returns FEE_QUOTE_UNAVAILABLE with usableForSubmission=false. Mock policy arithmetic is explicitly MOCK_ONLY.

The original mock failures are preserved in evidence/b2a/tests-first.txt and tests-second.txt; corrected Map/receipt assertions follow shipped runtime semantics. No vendor internals were patched. Official documentation URLs for writing-data/contracts could not be fetched in the initial session; no unsupported newer-documentation API is assumed. EIP-6963 specification was read.

Real MetaMask/OKX extension compatibility, real prices, AI fee adequacy, signing, submission and finalization remain NOT RUN. This checkpoint is not production-ready writing.
