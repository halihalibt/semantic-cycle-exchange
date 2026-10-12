import { sha256, stringToHex } from 'viem';
import { CONTRACT } from '../config';
import type { Cycle, Term } from '../types';
import { uint } from '../validation';
/** Verify a contract-provided snapshot; never use this to create a proposal or id.
 * Integer slots are emitted as exact decimal JSON tokens, including u64 values. */
export function checkSnapshot(canonical: string, snapshot: string, terms: Term[]) {
  const rows = terms.map(t => '['+t.map((v,i) => [0,6,7,8].includes(i) ? uint(v).toString() : JSON.stringify(i === 1 ? v.toLowerCase() : v)).join(',')+']').join(',');
  const expected = '["SCA-3-V1",61999,'+JSON.stringify(CONTRACT.toLowerCase())+',['+rows+']]';
  if (canonical !== expected || sha256(stringToHex(canonical)).slice(2) !== snapshot) throw new Error('SNAPSHOT_MISMATCH');
}
export function checkCycleSnapshot(cycle: Cycle) {
  checkSnapshot(cycle.canonical_snapshot,cycle.snapshot_id,cycle.terms);
  const deadline = [uint(cycle.created_at,false)+3n*86400n,...cycle.terms.map(t=>uint(t[7]))].reduce((a,b)=>a<b?a:b);
  if(uint(cycle.confirmation_deadline)!==deadline)throw new Error('SNAPSHOT_MISMATCH');
}
