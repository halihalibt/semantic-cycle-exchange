import { abi, decodeInputData } from 'genlayer-js';
import { CONTRACT } from '../config';
import { address } from '../../wallet/provider';
import type { prepareWrite } from '../write-spec';
import { fingerprint, frozen } from './immutable';
export interface ReceiptEvidence {
  finalized: boolean; consensus: 'MAJORITY_AGREE' | 'OTHER' | 'UNKNOWN';
  execution: 'SUCCESS' | 'FAILURE' | 'UNKNOWN'; hasReturn: boolean; returnValue?: unknown;
}
const statusNames: Record<string,string> = {'0':'UNINITIALIZED','1':'PENDING','2':'PROPOSING','3':'COMMITTING','4':'REVEALING','5':'ACCEPTED','6':'UNDETERMINED','7':'FINALIZED','8':'CANCELED','9':'APPEAL_REVEALING','10':'APPEAL_COMMITTING','11':'READY_TO_FINALIZE','12':'VALIDATORS_TIMEOUT','13':'LEADER_TIMEOUT'};
const resultNames: Record<string,string> = {'0':'IDLE','1':'AGREE','2':'DISAGREE','3':'TIMEOUT','4':'DETERMINISTIC_VIOLATION','5':'NO_MAJORITY','6':'MAJORITY_AGREE','7':'MAJORITY_DISAGREE'};
function enumName(value: unknown, names: Record<string,string>) { return typeof value === 'number' || typeof value === 'bigint' || typeof value === 'string' && /^\d+$/.test(value) ? names[String(value)] : typeof value === 'string' && !value.startsWith('0x') ? value : undefined; }
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string,unknown> : {}; }
function consistent(values: unknown[]) {
  const present = values.filter(v => v !== undefined && v !== null);
  if (new Set(present.map(fingerprint)).size > 1) throw new Error('TERMINAL_CONFLICT');
  return present[0];
}
function bytes(value: unknown): Uint8Array | undefined {
  if (typeof value === 'string') return Uint8Array.from(atob(value), c => c.charCodeAt(0));
  if (Array.isArray(value) && value.every(v => Number.isInteger(v) && v >= 0 && v <= 255)) return Uint8Array.from(value);
  return undefined;
}
/** Uses complete Studio transaction evidence, not EVM status=0x1 or votes alone.
 * Simplified SDK receipts that discard calldata/result bytes remain UNKNOWN. */
export function receiptEvidence(value: unknown, hash: string, account: string, write: ReturnType<typeof prepareWrite>): ReceiptEvidence {
  const unknown: ReceiptEvidence = { finalized:false, consensus:'UNKNOWN', execution:'UNKNOWN', hasReturn:false };
  if (!value) return unknown;
  const r = object(value);
  const actualHash = consistent([r.hash, r.transactionHash, r.tx_id]);
  if (typeof actualHash !== 'string' || actualHash.toLowerCase() !== hash.toLowerCase()) throw new Error('RECEIPT_HASH_MISMATCH');
  const sender = consistent([r.from_address,r.from,r.sender].map(v => v === undefined ? v : address(v)));
  const recipient = consistent([r.to_address,r.to,r.recipient].map(v => v === undefined ? v : address(v)));
  if (sender !== address(account) || recipient !== address(CONTRACT)) throw new Error('RECEIPT_IDENTITY_MISMATCH');
  const status = consistent([r.status_name,r.statusName,enumName(r.status,statusNames)]);
  if (status !== 'FINALIZED') return unknown;
  const result = consistent([r.result_name,r.resultName,enumName(r.result,resultNames)]);
  const consensus = result === 'MAJORITY_AGREE' ? 'MAJORITY_AGREE' : result === undefined ? 'UNKNOWN' : 'OTHER';
  let input: unknown;
  if (typeof r.tx_data === 'string') {
    const decoded = decodeInputData((r.tx_data.startsWith('0x') ? r.tx_data : '0x'+r.tx_data) as `0x${string}`, CONTRACT);
    if (decoded?.type === 'call' && !decoded.leaderOnly && 'callData' in decoded) input = decoded.callData;
  } else {
    const calldata = object(r.data).calldata;
    const raw = bytes(typeof calldata === 'string' ? calldata : object(calldata).raw);
    if (raw) input = abi.calldata.decode(raw);
  }
  if (!(input instanceof Map)) return { ...unknown, finalized:true, consensus };
  if (input.get('method') !== write.functionName || fingerprint(input.get('args')) !== fingerprint(write.args) || [...input.keys()].some(k => !['method','args'].includes(k)) || r.leader_only === true) throw new Error('RECEIPT_CALLDATA_MISMATCH');
  const receipts = object(r.consensus_data).leader_receipt;
  const leaders = (Array.isArray(receipts) ? receipts : [receipts]).map(object).filter(x => x.mode === 'leader');
  if (!leaders.length) return { ...unknown, finalized:true, consensus };
  const topExecution = consistent([r.tx_execution_result_name,r.txExecutionResultName,enumName(r.tx_execution_result ?? r.txExecutionResult,{'0':'NOT_VOTED','1':'FINISHED_WITH_RETURN','2':'FINISHED_WITH_ERROR'})]);
  const exec = consistent([...leaders.map(x => x.execution_result),topExecution === 'FINISHED_WITH_RETURN' ? 'SUCCESS' : topExecution === 'FINISHED_WITH_ERROR' ? 'ERROR' : undefined]);
  const execution = exec === 'SUCCESS' ? 'SUCCESS' : ['ERROR','REVERT','FAILURE'].includes(String(exec)) ? 'FAILURE' : 'UNKNOWN';
  const results = leaders.map(x => {
    const encoded = bytes(typeof x.result === 'string' ? x.result : undefined);
    if (encoded) {
      if (encoded[0] !== 0) return { hasReturn:false };
      return { hasReturn:true, value:abi.calldata.decode(encoded.slice(1)) };
    }
    const resultObject = object(x.result), payload = object(resultObject.payload), raw = bytes(payload.raw);
    return resultObject.status === 'return' && raw ? { hasReturn:true, value:abi.calldata.decode(raw) } : { hasReturn:false };
  });
  const returns = results.filter(x => x.hasReturn);
  const returnValue = consistent(returns.map(x => x.value === null ? { nullReturn:true } : x.value));
  return frozen({ finalized:true, consensus, execution, hasReturn:returns.length === leaders.length,
    returnValue: returnValue && typeof returnValue === 'object' && 'nullReturn' in returnValue ? null : returnValue instanceof Map ? Object.fromEntries(returnValue) : returnValue });
}
