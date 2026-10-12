import { uint } from './validation';
import { CONTRACT } from './config';
export const WRITE_PARAMETERS = {
  create_intent: ['offer_description', 'offer_limitations', 'need_description', 'need_requirements', 'expires_at'],
  update_intent: ['intent_id', 'expected_version', 'offer_description', 'offer_limitations', 'need_description', 'need_requirements', 'expires_at'],
  cancel_intent: ['intent_id', 'expected_version'],
  assess_cycle: ['intent_ids', 'versions', 'edges'],
  confirm_cycle: ['cycle_id', 'snapshot_id'],
  decline_cycle: ['cycle_id', 'snapshot_id'],
  expire_cycle: ['cycle_id'],
} as const;
export type WriteMethod = keyof typeof WRITE_PARAMETERS;
export type Triple<T> = [T, T, T];
export type TextFields = [offer: string, limitations: string, need: string, requirements: string];
export interface WriteArgs {
  create_intent: [...TextFields, expiresAt: string];
  update_intent: [intentId: string, expectedVersion: string, ...TextFields, expiresAt: string];
  cancel_intent: [intentId: string, expectedVersion: string];
  assess_cycle: [intentIds: Triple<string>, versions: Triple<string>, edges: Triple<[string, string]>];
  confirm_cycle: [cycleId: string, snapshotId: string];
  decline_cycle: [cycleId: string, snapshotId: string];
  expire_cycle: [cycleId: string];
}
export interface WriteReturns {
  create_intent: bigint; update_intent: bigint; cancel_intent: null;
  assess_cycle: { assessment_id: bigint; result: 'MATCHED' | 'NOT_MATCHED'; cycle_id: bigint };
  confirm_cycle: boolean; decline_cycle: null; expire_cycle: boolean;
}
export type Argument = string | bigint | Argument[];
export function validateText(fields: TextFields) {
  if (fields.length !== 4) throw new Error('INVALID_TEXT');
  for (const text of fields) {
    if (typeof text !== 'string') throw new Error('INVALID_TEXT');
    // Python rejects lone surrogates; TextEncoder alone would silently replace them.
    const chars = Array.from(text);
    if (chars.some(c => c.length === 1 && /[\uD800-\uDFFF]/.test(c))) throw new Error('INVALID_TEXT');
    if (chars.length > 512 || new TextEncoder().encode(text).length > 512) throw new Error('TEXT_TOO_LONG');
  }
  // Python str.strip's whitespace set (not JS trim, which includes BOM).
  const isBlank = (value: string) => Array.from(value).every(c => {
    const n = c.codePointAt(0)!;
    return n >= 9 && n <= 13 || n >= 28 && n <= 32 || [133,160,5760,8232,8233,8239,8287,12288].includes(n) || n >= 8192 && n <= 8202;
  });
  if (isBlank(fields[0]) || isBlank(fields[2])) throw new Error('EMPTY_DESCRIPTION');
}
export function prepareWrite<M extends WriteMethod>(method: M, args: WriteArgs[M]): { address: typeof CONTRACT; functionName: M; args: Argument[] } {
  if (!Object.hasOwn(WRITE_PARAMETERS, method) || !Array.isArray(args) || args.length !== WRITE_PARAMETERS[method].length) throw new Error('INVALID_ARGUMENTS');
  const n = (v: unknown) => { if (typeof v !== 'string') throw new Error('INVALID_INTEGER'); return uint(v); };
  let encoded: Argument[];
  switch (method) {
    case 'create_intent': case 'update_intent': {
      const offset = method === 'update_intent' ? 2 : 0;
      const text = args.slice(offset, offset + 4) as TextFields;
      validateText(text);
      encoded = [...args.slice(0, offset).map(n), ...text, n(args[offset + 4])]; break;
    }
    case 'assess_cycle': {
      const [ids, versions, edges] = args as WriteArgs['assess_cycle'];
      if (![ids, versions, edges].every(x => Array.isArray(x) && x.length === 3)) throw new Error('EXACTLY_THREE_REQUIRED');
      const nums = ids.map(n);
      if (new Set(ids).size !== 3) throw new Error('DUPLICATE_INTENT');
      const parsedEdges = edges.map((edge, i) => {
        if (!Array.isArray(edge) || edge.length !== 2 || edge[0] !== ids[i] || edge[1] !== ids[(i + 1) % 3]) throw new Error('INVALID_RING');
        return edge.map(n);
      });
      encoded = [nums, versions.map(n), parsedEdges]; break;
    }
    case 'confirm_cycle': case 'decline_cycle': {
      if (typeof args[1] !== 'string' || !/^[a-f0-9]{64}$/.test(args[1])) throw new Error('INVALID_SNAPSHOT');
      encoded = [n(args[0]), args[1]]; break;
    }
    default: encoded = args.map(n);
  }
  return { address: CONTRACT, functionName: method, args: encoded };
}
