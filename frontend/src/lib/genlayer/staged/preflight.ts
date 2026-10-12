import type { ReadApi } from '../api';
import type { Cycle, Intent, Observation, OwnerRecords } from '../types';
import { prepareWrite, type WriteArgs, type WriteMethod } from '../write-spec';
import { validateAssessment, validateCancellation, validateCapacity, validateExpiration, validateExpiry, validateOwned, validatePending } from '../write-validation';
import { verifyCycleMapping } from '../../../features/cycles/model';
import { frozen } from './immutable';
import { checkCycleSnapshot } from './snapshot';
export type ReadPort = Pick<ReadApi, 'getIntent' | 'getCycle' | 'getAssessment' | 'getOwnerRecords'>;
export interface Preflight { records: Intent[]; cycle?: Cycle; owner?: OwnerRecords; oldestRead: number; checkedAt: number; advisoryOnly: true }
export async function freshPreflight<M extends WriteMethod>(reads: ReadPort, method: M, args: WriteArgs[M], account: string, now: () => number): Promise<Preflight> {
  prepareWrite(method, args);
  const times: number[] = [];
  const unwrap = <T>(observation: Observation<T>): T => {
    const fetched = Date.parse(observation.fetchedAt) / 1000, current = now();
    if (observation.source !== 'live finalized' || !Number.isFinite(fetched) || fetched > current || current - fetched >= 30) throw new Error('FRESH_FINALIZED_READ_REQUIRED');
    times.push(fetched); return observation.data;
  };
  const intent = async (id: string) => { const r = unwrap(await reads.getIntent(id)); if (!r.found || r.intent_id !== id) throw new Error('INTENT_NOT_FOUND'); return r; };
  const cycleRead = async (id: string) => { const r = unwrap(await reads.getCycle(id)); if (!r.found || r.cycle_id !== id) throw new Error('CYCLE_NOT_FOUND'); verifyCycleMapping(r); checkCycleSnapshot(r); if(BigInt(r.created_at)>BigInt(Math.floor(now())))throw new Error('SNAPSHOT_MISMATCH'); return r; };
  const clock = () => ({ now: String(Math.floor(now())), observedAt: String(Math.floor(Math.min(...times))), marginSeconds: '30' });
  let records: Intent[] = [], cycle: Cycle | undefined, owner: OwnerRecords | undefined;
  switch (method) {
    case 'create_intent': {
      const a = args as WriteArgs['create_intent'];
      owner = unwrap(await reads.getOwnerRecords(account));
      validateCapacity(owner, account, clock()); validateExpiry(a[4], clock()); break;
    }
    case 'update_intent': {
      const a = args as WriteArgs['update_intent']; records = [await intent(a[0])];
      validateOwned(records[0], a[0], a[1], account, clock(), true); validateExpiry(a[6], clock()); break;
    }
    case 'cancel_intent': {
      const a = args as WriteArgs['cancel_intent'], item = await intent(a[0]); records = [item];
      if (item.stored_status === 'RESERVED') { cycle = await cycleRead(item.cycle_id); records = await Promise.all(cycle.intent_ids.map(intent)); }
      validateCancellation(item, a[0], a[1], account, clock(), cycle ? { cycle, records } : undefined); break;
    }
    case 'assess_cycle': {
      const a = args as WriteArgs['assess_cycle']; records = await Promise.all(a[0].map(intent));
      validateAssessment(a, records, account, clock()); break;
    }
    case 'confirm_cycle': case 'decline_cycle': {
      const a = args as WriteArgs['confirm_cycle']; cycle = await cycleRead(a[0]); records = await Promise.all(cycle.intent_ids.map(intent));
      validatePending(cycle, a[1], records, account, clock()); break;
    }
    case 'expire_cycle': {
      const a = args as WriteArgs['expire_cycle']; cycle = await cycleRead(a[0]);
      records = await Promise.all(cycle.intent_ids.map(intent)); validateExpiration(cycle, clock()); break;
    }
  }
  const checkedAt = now(), oldestRead = Math.min(...times);
  if (checkedAt - oldestRead >= 30) throw new Error('FRESH_FINALIZED_READ_REQUIRED');
  return frozen({ records, cycle, owner, oldestRead, checkedAt, advisoryOnly: true });
}
