# B1 read-only architecture

React + TypeScript + Vite provide three query-based screens: overview, `?w=1`
verified positive/negative examples, and `?view=inspect` ID inspection. The Vite
base is `/semantic-cycle-exchange/`; no deployment workflow is included.

`ReadApi` provides all seven public views. IDs/offsets are validated with BigInt,
limited to u64, and encoded by the exact SDK. Decoded numeric fields are normalized
to decimal strings. SDK jsonSafeReturn converts small integers to safe numbers and
large integers to exact decimal strings; unsafe numbers are rejected by our decoder.
SDK CalldataEncodable is validated against fields in the frozen source, not an
invented ABI. Immutable snapshot JSON is displayed verbatim without parsing its
integer identifiers through unsafe JavaScript number conversions.

One queue serializes reads. Each operation owns a short-lived module Worker.
Inside that isolated Worker, the unmodified SDK `createClient().readContract()`
does calldata encoding/decoding with `TransactionHashVariant.LATEST_FINAL`.
Because SDK 1.1.8 does not accept a fetch/transport/AbortSignal injection, the
Worker wraps its own global fetch. The main page's fetch is untouched. The wrapper
permits only POST `gen_call`, type=read, exact address/RPC and latest-final.
No account, provider, wallet connection or write API is exported by ReadApi.

Timeout: 20 seconds at transport, 22 seconds outer Worker deadline. Route/unmount
cancellation terminates the in-flight Worker; queued aborted requests never start.
SDK transport retries are zero. The queue allows at most one retry for an explicit
HTTP 5xx. Other RPC/application errors and HTTP 429 are not automatically retried.
Retry-After seconds/dates are retained when exposed by CORS and impose a cooldown.
No quota is assumed; missing Retry-After is not replaced with a claimed server quota.

Overview starts one read; Demo performs three sequential reads, without automatic
polling or transaction downloads. Observation timestamps identify actual completed
reads; manual refresh keeps prior data visibly marked cached on failure/loading.
The three Demo reads are independent latest-final observations, not an atomic
historical snapshot. Historical votes and transaction links are separate archived
metadata. Fixtures are imported only by tests, never by the production UI.
