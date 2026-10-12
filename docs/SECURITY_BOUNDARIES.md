# Security boundaries

## Network, wallet and transaction scope

The application targets only Stable Studionet 61999 and
`0x84e9284448D4cd16dcBBCbd8104449B11209C6F0`, using genlayer-js@1.1.8.
Public view reads work without a wallet. Write paths require explicit connection,
an exact request preview, fresh preflight and separate confirmation before a wallet
request. The browser wallet controls signing; the application does not hold keys.

Account/network events invalidate old approvals. Reload recovery checks existing
permissions without a new permission request and never restores transaction consent.
Unknown submissions remain locked in a persistent journal; they are not automatically
retried. This protection depends on retained browser storage and Web Locks.

Live writes send native value zero and require successful gas estimation and zero
observed gas price under the user-confirmed Studionet premise. This is not a general
fee quotation, paid-network integration or audit certification.

## Contract rules and untrusted data

Offer/need text is escaped React content, not executable HTML or remote instructions.
The protocol limits each field to 512 UTF-8 bytes, validity to 1–30 days and unfinished
Intents to five per owner. Three distinct owners and Intents form an exact directed
ring. Only FIT / FIT / FIT creates a pending commitment. All owners independently
confirm immutable terms; stale versions and conflicting reservations reject.
The confirmation deadline is min(creation + 72 hours, earliest Intent expiration).

AI assessment remains vulnerable to systematic semantic errors and prompt injection.
Frontend checks do not replace the contract's authoritative checks. Unexpected
contract storage faults rely on GenVM rollback; offline simulations do not prove
full production WASM rollback.

## Observation and evidence limits

Latest-final reads distinguish effective and stored statuses. Page counts must not
be described as global totals. Separate reads are not an atomic historical snapshot.
RPC failure is surfaced; cached data is labeled and never replaced by fixture success.
Receipt verification checks identity, calldata, consensus, execution and actual state.

Automated tests are offline, with Mock Providers, fixtures and retained real receipts.
Windows Chrome wallet acceptance was USER-EXECUTED 7 PASS, and published-site acceptance
was user-reported. These are not independently executed browser automation or
multi-browser certification. Original screenshot metadata is separate from public
image availability. See [evidence](FINAL_ONCHAIN_EVIDENCE_INDEX.md).

All seven writes have application paths, but positive live `expire_cycle` execution
remains **NOT RUN / TIME-GATED** for Cycle #4, deadline **2026-10-15 05:16:08 UTC+8**.

## Product limits

ACTIVE is accepted commitment, not fulfillment. There are no payments, escrow,
custody, tokens, dispute resolution, automatic settlement, global matching or
service-delivery guarantees. The app is a Studionet service-exchange implementation,
not a security-certified or production-chain settlement system.
