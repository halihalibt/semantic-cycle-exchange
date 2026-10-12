# B1 security and protocol boundaries

Stable Studionet 61999 and the frozen existing deployment are the sole target.
The adapter's only network operations are finalized public view reads. No accounts
are requested, keys generated, wallet signatures solicited, writes simulated or
transactions sent. The bundled SDK contains write capabilities, but the application
never invokes or exposes them; transport enforcement independently rejects writes.

Untrusted service descriptions render as escaped React text. No HTML injection,
remote images or execution of offer/need instructions is implemented. Source links
and Explorer URLs use frozen repository/transaction evidence. Public wallet addresses
are protocol participants already present in Repository A's published evidence.
No private screenshots or credentials are copied.

Read limits: IDs/offsets are u64, pagination 1–50; current effective status is distinct
from stored status. Stats page counts must not be represented as global totals.
Future write forms must honor 512 UTF-8 bytes per text field, 1–30 day validity,
five effectively unfinished Intents per owner, exact directed ring and three-owner
snapshot confirmations. The confirmation deadline is min(creation+72h, earliest
Intent expiry). These rules are documented, not implemented as write UX in B1.

Seven writes are documented only: create_intent, update_intent, cancel_intent,
assess_cycle, confirm_cycle, decline_cycle, expire_cycle. Complete signatures and
semantics remain in the included canonical source. B1 has no payments, token,
custody, reputation, arbitration, automatic settlement, global matching or delivery
guarantee. ACTIVE is acceptance of a commitment, never proof of delivered services.

Tests of timeout, rate limiting and network failures use deterministic local mocks.
They do not claim a real HTTP 429 was intentionally induced. No stress traffic is
sent. Browser/live verification limitations are recorded in the acceptance report.
