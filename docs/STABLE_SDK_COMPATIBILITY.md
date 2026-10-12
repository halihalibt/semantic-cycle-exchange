# Stable SDK compatibility — B1 BLOCKED checkpoint

Node 24.19.0, npm 11.9.0; genlayer-js exactly 1.1.8, reproducible npm lock.
Installed package types and runtime are authoritative. createClient comes from
`genlayer-js`, studionet from `genlayer-js/chains`, and TransactionHashVariant
from `genlayer-js/types` (not the root export). The preset is chain 61999 and
https://studio.genlayer.com/api. eth_chainId returned 0xf22f.

readContract explicitly uses LATEST_FINAL (latest-final), type=read and no
account/provider. Native SDK calldata encoding and decoding succeeded. With
jsonSafeReturn=false dictionaries decode as Map; jsonSafeReturn=true converts
maps to objects and large integers to strings. UI normalization validates safe
integers and converts integer fields to exact decimal strings.

Seven public views succeeded in nine bounded Node reads, including real positive
Assessment #1, ACTIVE Cycle #1/count 3, negative Assessment #2/FIT FIT NO_FIT,
and missing Cycle #2. Exact raw requests/responses and decoded results are in
../evidence/b1/live-sdk-reads.json. No writes or simulations were performed.
HTTP 429 and timeouts were not induced live; they are offline test cases.

HTTP OPTIONS from localhost:5173 returned 200 with matching allow-origin and
content-type allowed. This is an HTTP preflight observation, not a browser PASS.
The standard Playwright browser download failed; a temporary npm-provided
Chromium 153 executable was recovered outside the project dependencies.
Its initial graphics launch failed; a CPU/headless launch succeeded without
--disable-web-security or certificate/CORS bypasses.

The production app emitted one real finalized gen_call in Chromium. No HTTP
response was observed and the Home live statistics assertion timed out at 25s.
Browser verification is BLOCKED. Root cause is unknown: no CORS denial or HTTP
429 was established. Node success must not be generalized to browser success.
B1 STOP triggered before public GitHub commit/PR or further diagnostics.
Do not introduce a proxy, paid backend, network switch or SDK upgrade.

## B1-R3 subsequent user Windows Chrome evidence — 2026-10-12

The Work Chromium result described above remains **BLOCKED/UNKNOWN** in that Work environment. Separate **USER-EXECUTED Windows Chrome** evidence now demonstrates real `genlayer-js@1.1.8` `latest-final` Studio HTTP 200 reads, Home statistics, positive and negative read-only Demo, and missing Cycle #2; Offline manual Refresh correctly showed an unavailable RPC worker and cached prior data. This does **not** prove the underlying cause of Work's `OPTIONS net::ERR_EMPTY_RESPONSE` (not established CORS). Live 429 and actual induced timeouts remain NOT RUN; existing offline test coverage is not claimed as live evidence. Details: [R3 report](PHASE_B1_R3_WINDOWS_CHROME_ACCEPTANCE.md). No SDK/network/contract changes were made.
