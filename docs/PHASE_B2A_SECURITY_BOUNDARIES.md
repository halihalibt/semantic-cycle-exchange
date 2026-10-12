# B2-A security boundaries

Only fake EIP-1193 providers and fully mocked SDK HTTP responses were operated. No real wallet, private key, seed phrase, signing request, blockchain write, simulation, AI estimate, deployment or production publication was performed.

Production UI offers explicit provider selection and user-triggered account connection only. Mount/discovery requests no accounts. Wallet metadata is untrusted text, icons are not rendered, and local IDs prevent spoofed UUID replacement. Account, chain, connect and disconnect events invalidate identity; connection completion is revision-checked. Local disconnect removes app listeners and does not claim wallet permission revocation. EIP-1193 has no standard extension-uninstall notification; disconnect/errors are handled, and future writes require fresh identity verification.

All business forms, signing and write executors are absent from UI. Fee quotes remain unavailable. Transaction states rehearse mocks only, preserve known hashes, lock local operation keys, prevent automatic retry, distinguish unknown submission, finality, execution and state reconciliation, and mark false returns NO_OP. A wallet callback can invalidate unsigned preflight. Account changes during signature waiting become SUBMISSION_UNKNOWN.

The original B1 read worker, transport guard, pages and evidence remain byte-for-byte unchanged. Wallet code has no SDK writer import. Pure validators treat local time as advisory and fail closed near validity/deadline boundaries. Actual contract time, snapshots, replay markers, canonical integrity and semantics remain authoritative.

Offline runner preloads a socket/fetch deny boundary, also loaded in each Vitest worker. The first harness run exposed missing worker propagation through a localhost port-9 assertion (ECONNREFUSED); this diagnostic is retained. No real RPC was contacted. The final harness blocks actual sockets and any unmocked fetch. HTTP 429/5xx, price changes and SDK fallback tests are synthetic.

No automatic chain add/switch, WalletConnect, signing SDK replacement, paid backend, vendor patch, sim_getFeeConfig, merge, B2-B/B2-C or Portal action.


## Post-audit security patch — offline-only

The mock-only SDK request boundary now verifies the explicit expected write method and full nested arguments, the frozen Studio consensus system destination, the embedded canonical contract, the account/chain/revision and zero native value. Invalid outer or inner calldata fails closed before calling the fake provider's send. The single-attempt latch remains set before asynchronous checks to reject SDK fallback rebroadcasts.

The transaction state machine preserves the first recorded finalized execution/boolean evidence and known hash. Contradictory later evidence transitions to TERMINAL_CONFLICT, retains earlier evidence and blocks reconciliation pending independent review. Incomplete later observations do not erase a known outcome.

Added offline regression test source, but **post-patch tests have NOT RUN** in this GitHub-only session. Previous 163 PASS belongs only to parent commit 342a6c49e3c02b257721b465ef1f5d297caa0b36. The production UI still has no signing or broadcast executor; live transactions remain forbidden.
