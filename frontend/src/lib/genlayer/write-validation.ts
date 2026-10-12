import type { Cycle, Intent, OwnerRecords } from './types';
import { uint } from './validation';
import { address } from '../wallet/provider';
import { prepareWrite, type WriteArgs } from './write-spec';
export const DAY = 86400n;
/** Local advisory clock only. Always read again before a later-phase write. */
export interface AdvisoryTime { now: string; observedAt: string; marginSeconds: string }
function time(ctx: AdvisoryTime): { now: bigint; margin: bigint } {
  const now = uint(ctx.now, false), observed = uint(ctx.observedAt, false), margin = uint(ctx.marginSeconds);
  if (observed > now || now - observed >= margin) throw new Error('FRESH_READ_REQUIRED');
  return { now, margin };
}
export function validateExpiry(expiresAt: string, ctx: AdvisoryTime) {
  const { now, margin } = time(ctx), delta = uint(expiresAt) - now;
  if (delta < DAY || delta > 30n * DAY) throw new Error('INVALID_VALIDITY');
  if (delta - DAY <= margin || 30n * DAY - delta <= margin) throw new Error('FRESH_READ_REQUIRED');
  return { advisoryOnly: true as const };
}
function unexpired(expiresAt: string, ctx: AdvisoryTime) {
  const { now, margin } = time(ctx), deadline = uint(expiresAt);
  if (deadline <= now) throw new Error('INTENT_EXPIRED');
  if (deadline - now <= margin) throw new Error('FRESH_READ_REQUIRED');
}
export function validateCapacity(records: OwnerRecords, caller: string, ctx: AdvisoryTime) {
  time(ctx);
  if (address(records.owner) !== address(caller)) throw new Error('OWNER_MISMATCH');
  // The authoritative bounded unfinished_count is independent of paginated history.
  if (uint(records.unfinished_count, false) >= 5n) throw new Error('OWNER_CAPACITY');
}
export function validateOwned(item: Intent, id: string, version: string, caller: string, ctx: AdvisoryTime, update: boolean) {
  if (uint(item.intent_id) !== uint(id)) throw new Error('INTENT_MISMATCH');
  if (address(item.owner) !== address(caller)) throw new Error('UNAUTHORIZED');
  if (uint(item.version) !== uint(version)) throw new Error('STALE_VERSION');
  unexpired(item.expires_at, ctx);
  if (item.status !== item.stored_status || !['OPEN', ...(update ? [] : ['RESERVED'])].includes(item.status)) throw new Error('INTENT_UNAVAILABLE');
  if (update && uint(item.version) === (1n << 64n) - 1n) throw new Error('VERSION_OVERFLOW');
  if (item.status === 'OPEN' && uint(item.cycle_id, false) !== 0n) throw new Error('RESERVATION_MISMATCH');
}
export function validateAssessment(args: WriteArgs['assess_cycle'], records: Intent[], caller: string, ctx: AdvisoryTime) {
  prepareWrite('assess_cycle', args);
  if (records.length !== 3) throw new Error('EXACTLY_THREE_REQUIRED');
  const owners = records.map(r => address(r.owner));
  if (new Set(owners).size !== 3) throw new Error('DUPLICATE_OWNER');
  if (!owners.includes(address(caller))) throw new Error('UNAUTHORIZED');
  records.forEach((r, i) => {
    if (r.intent_id !== args[0][i]) throw new Error('INTENT_ORDER_MISMATCH');
    if (uint(r.version) !== uint(args[1][i])) throw new Error('STALE_VERSION');
    unexpired(r.expires_at, ctx);
    if (r.status !== 'OPEN' || r.stored_status !== 'OPEN' || uint(r.cycle_id, false) !== 0n) throw new Error('INTENT_UNAVAILABLE');
  });
  return { topologyValid: true as const, semanticResult: 'NOT_EVALUATED' as const, replayCheck: 'CONTRACT_ONLY' as const };
}
/** suppliedSnapshot must equal the snapshot returned in the current contract view.
 * No local digest is generated. Contract revalidates canonical JSON and replay state. */
export function validatePending(cycle: Cycle, suppliedSnapshot: string, records: Intent[], caller: string, ctx: AdvisoryTime) {
  prepareWrite('confirm_cycle', [cycle.cycle_id, suppliedSnapshot]);
  if (cycle.snapshot_id !== suppliedSnapshot) throw new Error('SNAPSHOT_MISMATCH');
  if (cycle.status !== 'PENDING' || cycle.stored_status !== 'PENDING') throw new Error('CYCLE_NOT_PENDING');
  unexpired(cycle.confirmation_deadline, ctx);
  const owners = cycle.owners.map(address);
  if (owners.length !== 3 || new Set(owners).size !== 3 || !owners.includes(address(caller))) throw new Error('UNAUTHORIZED');
  if (records.length !== 3 || cycle.terms.length !== 3 || cycle.confirmations.length !== 3 || cycle.confirmations.some(x => typeof x !== 'boolean')) throw new Error('SNAPSHOT_MISMATCH');
  prepareWrite('assess_cycle', [cycle.intent_ids as [string,string,string], cycle.versions as [string,string,string], cycle.edges as [[string,string],[string,string],[string,string]]]);
  records.forEach((r, i) => {
    unexpired(r.expires_at, ctx);
    if (r.status !== 'RESERVED' || r.stored_status !== 'RESERVED' || r.cycle_id !== cycle.cycle_id) throw new Error('RESERVATION_MISMATCH');
    const values = [r.intent_id, address(r.owner), r.offer_description, r.offer_limitations, r.need_description, r.need_requirements, r.version, r.expires_at, cycle.intent_ids[(i + 1) % 3]];
    if (r.intent_id !== cycle.intent_ids[i] || r.version !== cycle.versions[i] || address(r.owner) !== owners[i] || JSON.stringify(values) !== JSON.stringify(cycle.terms[i])) throw new Error('SNAPSHOT_MISMATCH');
  });
  return { duplicateConfirmation: cycle.confirmations[owners.indexOf(address(caller))], declineBlocksIdenticalSnapshot: true as const };
}
export function validateCancellation(item: Intent, id: string, version: string, caller: string, ctx: AdvisoryTime, reservation?: { cycle: Cycle; records: Intent[] }) {
  validateOwned(item, id, version, caller, ctx, false);
  if (item.status === 'RESERVED') {
    if (!reservation || reservation.cycle.cycle_id !== item.cycle_id || !reservation.records.some(r => r.intent_id === item.intent_id && JSON.stringify(r) === JSON.stringify(item))) throw new Error('RESERVATION_MISMATCH');
    validatePending(reservation.cycle, reservation.cycle.snapshot_id, reservation.records, caller, ctx);
    return { abortsPendingCycle: true };
  }
  return { abortsPendingCycle: false };
}
export function validateExpiration(cycle: Cycle, ctx: AdvisoryTime) {
  const { now, margin } = time(ctx);
  if (cycle.stored_status === 'EXPIRED') return { expectedNoop: true, permissionless: true };
  if (cycle.stored_status !== 'PENDING') throw new Error('CYCLE_NOT_PENDING');
  const deadline = uint(cycle.confirmation_deadline);
  if (now < deadline) throw new Error('DEADLINE_NOT_REACHED');
  if (now - deadline <= margin) throw new Error('FRESH_READ_REQUIRED');
  return { expectedNoop: false, permissionless: true };
}
