# PHASE B1-R1 — checkpoint recovery, B1 remains BLOCKED

This change saves the existing local B1 implementation to Repository B only.
No dependency installation, feature redevelopment, test rerun, Chromium diagnosis,
network read, transaction, website deployment, Repository A edit or merge is part
of R1. The original failed browser evidence is retained without alteration.

Account: halihalibt. Repository: semantic-cycle-exchange.
main / prior branch HEAD: 1ac07943412b8eb0acf192a89758178bbfe3ef26.
Existing branch: phase-b1-readonly-foundation.
Repository A frozen source: 8a09380c06f12afd6ac85197737b0018cd8e594f.
No local .git metadata existed; selected-file diff was inspected against the
remote baseline using git diff --no-index. GitHub Git Data publication uses that
baseline as parent and a non-force expected-HEAD branch update; no project reset
or reinitialization is performed. LICENSE is unchanged byte-for-byte.

Preserved prior results: Node SDK 1.1.8/all seven public views/nine finalized
reads PASS; 34 offline tests PASS; clean npm ci/typecheck/lint/build/source checks
PASS. R1 verifies source identity and selected-file integrity again only; it does
not claim fresh executions of the original tests. Canonical source is 32040 bytes,
SHA256 88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442.

Status: BLOCKED — browser live read verification incomplete.
Chromium emitted one fixed-contract type=read/latest-final request. No observable
HTTP response was obtained in the 25-second UI assertion window. Root cause is
UNKNOWN; CORS denial has not been established. Full browser Demo NOT VERIFIED;
responsive browser acceptance NOT RUN. Mock tests, Node readings and static UI
are never substitutes for browser real-chain PASS. No acceptance gate is relaxed.

Publication contains existing source/tests/docs/public RPC evidence plus these
recovery notes. node_modules, dist, browser binaries, temporary caches, keys and
credentials are excluded. The Draft PR title explicitly contains PHASE B1 and
BLOCKED; it is not marked ready or merged. Actual commit SHA, remote verification,
file count and PR URL are returned by the R1 execution result.

Next separately authorized recovery: investigate the browser transport on the
same implementation, SDK, contract and network; then complete real Home/Demo,
missing-record, wallet-free and responsive browser gates. Do not redesign,
introduce a backend/proxy, change network/SDK or re-execute contract business E2E.
B1 remains incomplete and cannot be recommended for merge.
