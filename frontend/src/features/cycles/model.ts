import type { Assessment, Cycle, Intent } from '../../lib/genlayer/types';
import type { WriteArgs, Triple } from '../../lib/genlayer/write-spec';
import { prepareWrite } from '../../lib/genlayer/write-spec';
import { PROMPT_HASH } from '../../lib/genlayer/config';
/** Rotation preserves selected direction. Never sort all three or reverse. */
export function rotate<T extends { intent_id: string }>(records: T[]): T[] {
  if (records.length !== 3 || new Set(records.map(r => r.intent_id)).size !== 3) throw new Error('EXACTLY_THREE_DISTINCT_INTENTS');
  const first = records.reduce((best, r, i) => BigInt(r.intent_id) < BigInt(records[best].intent_id) ? i : best, 0);
  return [...records.slice(first), ...records.slice(0, first)];
}
export function assessmentArgs(records: Intent[]): WriteArgs['assess_cycle'] {
  if (records.length !== 3) throw new Error('EXACTLY_THREE_REQUIRED');
  const ids = records.map(r => r.intent_id) as Triple<string>;
  return [ids, records.map(r => r.version) as Triple<string>, ids.map((id, i) => [id, ids[(i + 1) % 3]]) as Triple<[string, string]>];
}
export function verifyCycleMapping(cycle: Cycle) {
  prepareWrite('assess_cycle', [cycle.intent_ids as Triple<string>, cycle.versions as Triple<string>, cycle.edges as Triple<[string,string]>]);
  if (cycle.owners.length !== 3 || new Set(cycle.owners.map(o => o.toLowerCase())).size !== 3 || cycle.terms.length !== 3 || cycle.confirmations.length !== 3 || cycle.confirmations.some(x => typeof x !== 'boolean') || String(cycle.confirmations.filter(Boolean).length) !== cycle.confirmation_count) throw new Error('CANONICAL_MAPPING_MISMATCH');
  if (rotate(cycle.intent_ids.map(intent_id => ({ intent_id })))[0].intent_id !== cycle.intent_ids[0]) throw new Error('CANONICAL_MAPPING_MISMATCH');
  cycle.terms.forEach((term, i) => {
    if (term[0] !== cycle.intent_ids[i] || term[1].toLowerCase() !== cycle.owners[i].toLowerCase() || term[6] !== cycle.versions[i] || term[8] !== cycle.edges[i][1]) throw new Error('CANONICAL_MAPPING_MISMATCH');
  });
  return cycle;
}
export function verifyAssessment(assessment: Assessment) {
  if (assessment.prompt_sha256 !== PROMPT_HASH || assessment.prompt_version !== 'SCA3-CANONICAL-CLASSIFICATION-V1') throw new Error('CANONICAL_PROMPT_MISMATCH');
  prepareWrite('assess_cycle', [assessment.intent_ids as Triple<string>, assessment.versions as Triple<string>, assessment.edges as Triple<[string,string]>]);
  if (rotate(assessment.intent_ids.map(intent_id => ({ intent_id })))[0].intent_id !== assessment.intent_ids[0]) throw new Error('CANONICAL_MAPPING_MISMATCH');
  if (assessment.decisions.length !== 3 || assessment.decisions.some(d => !['FIT','NO_FIT','UNSURE'].includes(d)) || assessment.decisions.every(d => d === 'FIT') !== (assessment.result === 'MATCHED') || assessment.result === 'NOT_MATCHED' && (assessment.cycle_id !== '0' || assessment.cycle_status !== 'NONE')) throw new Error('CONTRADICTORY_ASSESSMENT');
  return assessment;
}
