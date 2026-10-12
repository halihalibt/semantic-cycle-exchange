# B2-C-R1 user-operated live E2E plan

Status: READY FOR USER-OPERATED ACCEPTANCE; NOT EXECUTED BY WORK. PR #4 remains Draft. Do not merge, publish, deploy or submit Portal as part of this checkpoint.

Use the R1 branch locally: `cd frontend`, `npm ci`, `npm run dev`. Open the displayed localhost URL in desktop Chrome/Edge or another browser supporting Web Locks, localStorage and an EIP-1193 provider. Secure localhost supports Web Locks. Remote HTTP origins without Web Locks fail closed. Read-only pages need no wallet.

Choose your wallet provider; manually connect and verify Stable Studionet 61999. The user-confirmed test premise is zero fees. No separate total-fee investigation is required. Gas estimation and transaction format remain mandatory; a failed estimate blocks the wallet request. Native value and gasPrice are zero, Gas limit is the successful estimate; a genuine 200000 estimate is accepted without a fallback.

Every write uses existing business actions: review exact parameters → Run fresh preflight → tick separate authorization → Confirm and request wallet → manually decide in wallet → hash → bounded read-only finality checks → finalized state reconciliation. Check existing transaction only reads. Refresh business records after finalized success. Never repeat a possibly forwarded request.

| Method | User-operated acceptance |
| --- | --- |
| create_intent | Create new personal service terms with an interior validity such as 7 days. Verify returned ID, owner, version 1, OPEN and exact text in finalized reads. |
| update_intent | Use your own OPEN record, fresh expected version, valid expiry. Verify the returned/new version and every edited field. |
| cancel_intent | Acknowledge consequences. Verify CANCELLED. A RESERVED cancellation also requires ABORTED cycle and correct release of all reservations. |
| assess_cycle | Select three OPEN records owned by distinct accounts you control, in intended ring direction; own at least one. Verify actual Assessment result, canonical Snapshot and returned IDs; MATCHED additionally requires real PENDING/reserved state. NOT_MATCHED creates no Cycle. |
| confirm_cycle | Review all frozen terms and Snapshot using the correct owner. Confirm on each of three owners by separate manual wallet switches/reverification; third accepted confirmation must produce ACTIVE and all three CONSUMED. A duplicate confirmed owner is verified NO_OP only when its false return and actual state agree. |
| decline_cycle | Use a separate PENDING case, both acknowledgements. Verify ABORTED, reservation release and permanent identical-Snapshot block. Do not sacrifice the already archived positive example. |
| expire_cycle | Use a genuinely eligible PENDING Cycle past its actual contract deadline (3 days); do not change clocks or constants to manufacture eligibility. Verify EXPIRED and release; already cleaned EXPIRED is a false-return NO_OP. This operation may require waiting or a separately identified eligible case. |

Record each method's exact arguments, account, contract, hash, FINALIZED / MAJORITY_AGREE / SUCCESS (or failure), decoded return and actual finalized state. Screenshots and Explorer links support the record, but a hash or EVM status=0x1 alone is insufficient. No R1 transaction exists until the user executes it.

Unknowns are persistent: the journal is saved before possible forwarding and guarded with Web Locks. Keep the current tab/review until reconciliation; if bounded polling expires, click Check existing transaction. A late wallet hash can update the same in-memory operation. After navigation/reload, an unresolved account remains blocked; any known saved hash is included in the error. This patch intentionally has no UI unlock, hashless discovery or full checkpoint restoration. Such a case needs independent read-only evidence recovery, never a fresh send. Do not clear storage to bypass the lock. Different devices/browser profiles cannot share this browser-local journal.

Local time and multi-request reads remain advisory and non-atomic; the contract is authoritative. No browser wallet compatibility or new onchain acceptance is certified by the offline tests.
