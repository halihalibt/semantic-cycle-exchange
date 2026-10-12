import { address } from '../../wallet/provider';
import { PROMPT_HASH } from '../config';
import type { Cycle, Intent, Observation } from '../types';
import { uint } from '../validation';
import type { WriteArgs, WriteMethod } from '../write-spec';
import type { Preflight, ReadPort } from './preflight';
import type { ReceiptEvidence } from './receipt';
import { fingerprint } from './immutable';
import { verifyAssessment, verifyCycleMapping } from '../../../features/cycles/model';
import { checkSnapshot, checkCycleSnapshot } from './snapshot';
import type { Term } from '../types';
export type ReconciledOutcome = 'CHANGED' | 'NO_OP' | 'FAILED';
function id(value: unknown): string { if (typeof value !== 'bigint' || value <= 0n) throw new Error('INVALID_TRANSACTION_RETURN'); return uint(value.toString()).toString(); }
function requireState(condition: boolean) { if (!condition) throw new Error('RECONCILIATION_REQUIRED'); }
/** Check method-specific effects in fresh actual finalized views. No optimistic IDs or flags. */
export async function reconcile<M extends WriteMethod>(reads: ReadPort, method: M, args: WriteArgs[M], account: string, before: Preflight, evidence: ReceiptEvidence, now: () => number): Promise<ReconciledOutcome> {
  const unwrap = <T>(o: Observation<T>) => { const age = now()-Date.parse(o.fetchedAt)/1000; if (o.source !== 'live finalized' || !Number.isFinite(age) || age < 0 || age >= 30) throw new Error('FRESH_FINALIZED_READ_REQUIRED'); return o.data; };
  const intent = async (i: string) => { const r = unwrap(await reads.getIntent(i)); if (!r.found || r.intent_id !== i) throw new Error('RECONCILIATION_REQUIRED'); return r; };
  const cycle = async (i: string) => { const r = unwrap(await reads.getCycle(i)); if (!r.found || r.cycle_id !== i) throw new Error('RECONCILIATION_REQUIRED'); verifyCycleMapping(r); checkCycleSnapshot(r); return r; };
  if (!evidence.finalized || evidence.consensus !== 'MAJORITY_AGREE' || evidence.execution === 'UNKNOWN') throw new Error('RECONCILIATION_REQUIRED');
  if (evidence.execution === 'FAILURE') {
    if (before.owner) requireState(fingerprint(unwrap(await reads.getOwnerRecords(account))) === fingerprint(before.owner));
    for (const r of before.records) requireState(fingerprint(await intent(r.intent_id)) === fingerprint(r));
    if (before.cycle) requireState(fingerprint(await cycle(before.cycle.cycle_id)) === fingerprint(before.cycle));
    return 'FAILED';
  }
  if (!evidence.hasReturn) throw new Error('RECONCILIATION_REQUIRED');
  const value = evidence.returnValue;
  const textMatches = (r: Intent, fields: unknown[]) => fingerprint([r.offer_description,r.offer_limitations,r.need_description,r.need_requirements,r.expires_at]) === fingerprint(fields);
  const stableCycle = (a: Cycle, b: Cycle) => fingerprint([a.cycle_id,a.snapshot_id,a.canonical_snapshot,a.terms,a.intent_ids,a.owners,a.edges,a.versions,a.created_at,a.confirmation_deadline]) === fingerprint([b.cycle_id,b.snapshot_id,b.canonical_snapshot,b.terms,b.intent_ids,b.owners,b.edges,b.versions,b.created_at,b.confirmation_deadline]);
  const stableIntent = (a: Intent, b: Intent) => fingerprint([a.intent_id,a.owner,a.version,a.offer_description,a.offer_limitations,a.need_description,a.need_requirements,a.expires_at]) === fingerprint([b.intent_id,b.owner,b.version,b.offer_description,b.offer_limitations,b.need_description,b.need_requirements,b.expires_at]);
  const released = async (expected: 'ABORTED'|'EXPIRED', cancelled?: string) => {
    if (!before.cycle) throw new Error('RECONCILIATION_REQUIRED');
    const c = await cycle(before.cycle.cycle_id); requireState(stableCycle(before.cycle,c) && c.stored_status === expected);
    for (const prior of before.records) {
      const r = await intent(prior.intent_id); requireState(stableIntent(prior,r));
      if (prior.intent_id === cancelled) requireState(r.stored_status === 'CANCELLED' && r.cycle_id === '0');
      else if (prior.stored_status === 'RESERVED' && prior.cycle_id === c.cycle_id) requireState(['OPEN','EXPIRED'].includes(r.stored_status) && r.cycle_id === '0');
      else requireState(fingerprint(prior) === fingerprint(r));
    }
  };
  switch (method) {
    case 'create_intent': {
      const r = await intent(id(value)), a = args as WriteArgs['create_intent'];
      requireState(address(r.owner) === address(account) && r.version === '1' && r.stored_status === 'OPEN' && r.cycle_id === '0' && textMatches(r,a)); break;
    }
    case 'update_intent': {
      const a = args as WriteArgs['update_intent'], expectedVersion = (uint(a[1])+1n).toString();
      requireState(id(value) === expectedVersion); const r = await intent(a[0]);
      requireState(address(r.owner) === address(account) && r.version === expectedVersion && r.stored_status === 'OPEN' && r.cycle_id === '0' && textMatches(r,a.slice(2))); break;
    }
    case 'cancel_intent': {
      requireState(value === null); const a = args as WriteArgs['cancel_intent'];
      if (before.cycle) await released('ABORTED',a[0]);
      else { const r = await intent(a[0]); requireState(stableIntent(before.records[0],r) && r.stored_status === 'CANCELLED' && r.cycle_id === '0'); } break;
    }
    case 'assess_cycle': {
      if (!value || typeof value !== 'object') throw new Error('INVALID_TRANSACTION_RETURN');
      const result = value as Record<string,unknown>, assessmentId = id(result.assessment_id);
      const raw = unwrap(await reads.getAssessment(assessmentId)); if (!raw.found) throw new Error('RECONCILIATION_REQUIRED');
      const a = verifyAssessment(raw), ring = args as WriteArgs['assess_cycle'];
      // Same directed ring, canonically rotated to the minimum id, never reversed.
      const first = ring[0].reduce((best,v,i) => uint(v)<uint(ring[0][best]) ? i : best,0);
      const rotate = <T>(v: T[]) => [...v.slice(first),...v.slice(0,first)];
      requireState(a.assessment_id === assessmentId && address(a.proposer) === address(account) && a.prompt_sha256 === PROMPT_HASH && fingerprint([a.intent_ids,a.versions,a.edges]) === fingerprint([rotate(ring[0]),rotate(ring[1]),rotate(ring[2])]) && a.result === result.result && typeof result.cycle_id === 'bigint' && a.cycle_id === result.cycle_id.toString());
      const expectedTerms = rotate(before.records).map((r,i,rs) => [r.intent_id,r.owner,r.offer_description,r.offer_limitations,r.need_description,r.need_requirements,r.version,r.expires_at,rs[(i+1)%3].intent_id]);
      checkSnapshot(a.canonical_snapshot,a.snapshot_id,expectedTerms as Term[]);
      if (a.result === 'MATCHED') {
        const c = await cycle(a.cycle_id); requireState(c.snapshot_id === a.snapshot_id && c.canonical_snapshot === a.canonical_snapshot && fingerprint(c.terms) === fingerprint(expectedTerms) && c.stored_status === 'PENDING' && c.confirmation_count === '0');
        for (const prior of before.records) { const r = await intent(prior.intent_id); requireState(stableIntent(prior,r) && r.stored_status === 'RESERVED' && r.cycle_id === c.cycle_id); }
      } else { requireState(a.cycle_id === '0'); for (const prior of before.records) requireState(fingerprint(await intent(prior.intent_id)) === fingerprint(prior)); }
      break;
    }
    case 'confirm_cycle': {
      if (typeof value !== 'boolean' || !before.cycle) throw new Error('INVALID_TRANSACTION_RETURN');
      const c = await cycle(before.cycle.cycle_id), index = c.owners.map(address).indexOf(address(account));
      requireState(stableCycle(before.cycle,c) && index >= 0 && c.confirmations[index] && before.cycle.confirmations[index] === !value && before.cycle.confirmations.every((flag,i) => !flag || c.confirmations[i]));
      requireState(c.stored_status === (c.confirmations.every(Boolean) ? 'ACTIVE' : 'PENDING'));
      for (const prior of before.records) { const r = await intent(prior.intent_id); requireState(stableIntent(prior,r) && r.cycle_id === c.cycle_id && r.stored_status === (c.stored_status === 'ACTIVE' ? 'CONSUMED' : 'RESERVED')); }
      return value ? 'CHANGED' : 'NO_OP';
    }
    case 'decline_cycle': requireState(value === null); await released('ABORTED'); break;
    case 'expire_cycle': {
      if (typeof value !== 'boolean' || !before.cycle) throw new Error('INVALID_TRANSACTION_RETURN');
      if (!value) { requireState(before.cycle.stored_status === 'EXPIRED' && fingerprint(await cycle(before.cycle.cycle_id)) === fingerprint(before.cycle)); for (const prior of before.records) requireState(fingerprint(await intent(prior.intent_id)) === fingerprint(prior)); return 'NO_OP'; }
      requireState(before.cycle.stored_status === 'PENDING'); await released('EXPIRED'); break;
    }
  }
  return 'CHANGED';
}
