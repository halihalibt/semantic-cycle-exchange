# Application architecture

Semantic Cycle Exchange is a static React / TypeScript / Vite application using
**genlayer-js@1.1.8**, Stable Studionet **61999**, and the existing contract
`0x84e9284448D4cd16dcBBCbd8104449B11209C6F0`. The product has no application backend,
key store or matching administrator. The complete contract is included under
[intelligent-contract](../intelligent-contract/contracts/semantic_cycle_accord.py).

## Public contract reads

`ReadApi` exposes all seven public views independently of a connected wallet.
One queue serializes reads; each operation owns a short-lived module Worker.
The Worker uses SDK calldata encoding/decoding and `LATEST_FINAL` observations.
Its fetch wrapper permits only read `gen_call` requests to the fixed RPC/contract;
the main page's fetch is untouched. Test fixtures are not production fallbacks.

IDs and offsets are validated as u64-compatible BigInts. Numeric results become
exact decimal strings; unsafe JavaScript numbers are rejected. Immutable snapshot
JSON is displayed without parsing its identifiers through lossy number conversions.

Transport timeout is 20 seconds; the outer Worker deadline is 22 seconds.
Cancellation terminates an in-flight Worker, and aborted queued reads never start.
SDK retries are zero; the read queue permits at most one retry for explicit HTTP
5xx. Other errors, including 429, are not automatically retried. Exposed Retry-After
headers impose a cooldown. Manual refresh labels previous data as cached on failure.
Multiple record reads are independent latest-final observations, not one atomic snapshot.

## Wallet providers and session continuity

EIP-6963 announcements support explicit provider selection; an EIP-1193 injected
provider is a legacy fallback. Provider metadata is a discovery hint, not proof of
wallet authenticity. Initial connection requests permission only after a user action.
Accounts and chain identity are verified and bound to a session revision.

The App, WalletSession and transaction runtime remain mounted across same-origin,
same-path query navigation. History back/forward updates routing through popstate.
External links, modified clicks and downloads retain normal browser behavior.

SessionStorage holds only an EIP-6963 provider selection hint or a disconnected
marker. Reload restoration requires a unique rediscovered provider and checks
already permitted accounts and chain through reads; it does not restore a transaction
approval. Ambiguous, absent or legacy-only providers require explicit connection.
Disconnect persists, and identity events invalidate old previews before re-verification.

## Exact preview and fresh preflight

Seven write specifications build method-specific parameters with the fixed contract,
account, chain and native value zero. Input and eligibility checks cover ownership,
versions, effective status, capacity, ring direction, snapshot and deadlines.
A review binds the exact parameters to the current wallet identity and revision.
Fresh preflight rereads authoritative state; confirmation repeats the relevant
checks and rejects changed identity or transaction parameters before forwarding.

The live mode is the user-confirmed zero-fee Studionet premise. It requires an
actual successful `eth_estimateGas`, positive bounded gas units and an observed
`eth_gasPrice` of zero. Failure is not replaced with an assumed SDK fallback quote.
This restricted mode does not establish a general fee schedule or production-chain support.

## Explicit wallet confirmation and one-attempt submission

A separate confirmation action is required before forwarding a wallet request.
SDK 1.1.8 encoding and the submission boundary bind the account, chain, target,
method, arguments and fee parameters. Stale asynchronous work cannot forward after
identity invalidation. The send latch allows one attempt, without automatic broadcast retries.
Wallet rejection and a known pre-forward failure are distinguished from ambiguous
outcomes after forwarding.

Before forwarding, a persistent localStorage journal records the unresolved attempt.
It is scoped by account, chain and contract. Web Locks prevent simultaneous sends
from different tabs. The journal can retain AWAITING_WALLET, UNKNOWN or HASH_OBSERVED.
Timeout, refresh, navigation and account changes do not clear an ambiguous attempt.
Missing/corrupt storage or unavailable submission locks block sending. An unknown
outcome is not permission to resubmit; clearing browser storage can defeat this safeguard.

## Consensus finality and actual-state reconciliation

Read-only tracking retrieves complete Studio transaction evidence. It verifies
hash, sender, contract and exact calldata, then checks FINALIZED, MAJORITY_AGREE,
Leader execution and decoded return. Simplified receipts missing necessary evidence
remain UNKNOWN. A hash, votes or status 0x1 alone cannot establish successful execution.

Method-specific reconciliation reads actual records and compares them with expected
returns and mutations. MATCHED is distinct from ACTIVE, and protocol state is distinct
from transaction finality. The retained 17-receipt regression exercises the production
parser offline; it is not a new live execution or measurement of model accuracy.

## Routing and deployment

GitHub Pages serves the Vite build at `/semantic-cycle-exchange/`. Routes use query
parameters such as `?view=intents`, `?view=assessment&id=3`, `?view=cycle&id=2` and `?w=1`,
so deep links need no server rewrite. The existing Pages workflow verifies typecheck,
lint, tests, source integrity and build, then deploys main. Documentation proposal
branches do not change the already published application.

## Trust and verification boundaries

Service text renders as escaped React content. Browser wallets retain control of
keys and signatures; the app stores no seed or private key. RPC observations and
provider behavior are external dependencies. The contract enforces final business
rules; frontend preflight reduces errors but cannot replace contract checks.

See [security boundaries](SECURITY_BOUNDARIES.md), [verified cases](../DEMO.md),
[onchain evidence](FINAL_ONCHAIN_EVIDENCE_INDEX.md) and
[user-executed browser acceptance](WINDOWS_CHROME_WALLET_ACCEPTANCE.md).
The dedicated positive expiration test remains NOT RUN / TIME-GATED; its deadline
is 2026-10-15 05:16:08 UTC+8. Historical engineering checkpoints remain available
at their original paths and describe their original test scope.
