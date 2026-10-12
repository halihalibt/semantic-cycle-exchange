import { address } from '../wallet/provider';
import type { WriteMethod } from './write-spec';
export type TxStatus = 'IDLE' | 'VALIDATING' | 'PREFLIGHT_READY' | 'FEE_UNAVAILABLE' | 'AWAITING_USER_SIGNATURE' | 'USER_REJECTED' | 'SUBMISSION_UNKNOWN' | 'SUBMITTED' | 'PENDING_CONSENSUS' | 'FINALIZED_SUCCESS' | 'FINALIZED_FAILURE' | 'RECONCILIATION_REQUIRED' | 'FAILED_BEFORE_SUBMISSION' | 'BLOCKED' | 'TERMINAL_CONFLICT';
export interface Identity { account: string; chain: string; revision: number }
export interface Operation { key: string; method: WriteMethod; identity?: Identity; status: TxStatus; hash?: string; outcome?: 'CHANGED' | 'NO_OP' | 'FAILED'; reconciliation?: 'SUCCESS' | 'FAILURE'; terminalExecution?: 'SUCCESS' | 'FAILURE'; terminalReturn?: boolean; error?: string }
const pending: TxStatus[] = ['AWAITING_USER_SIGNATURE', 'SUBMISSION_UNKNOWN', 'SUBMITTED', 'PENDING_CONSENSUS', 'RECONCILIATION_REQUIRED', 'TERMINAL_CONFLICT'];
export class Transactions {
  private operations = new Map<string, Operation>();
  get(key: string): Operation { const op = this.operations.get(key); if (!op) throw new Error('UNKNOWN_OPERATION'); return { ...op, identity: op.identity && { ...op.identity } }; }
  private set(op: Operation) { this.operations.set(op.key, op); return this.get(op.key); }
  begin(key: string, method: WriteMethod, identity: Identity) {
    if (!key || this.operations.has(key)) throw new Error('OPERATION_KEY_ALREADY_USED');
    if (identity.chain !== '61999' || !Number.isSafeInteger(identity.revision) || identity.revision < 0) throw new Error('INVALID_IDENTITY');
    return this.set({ key, method, identity: { ...identity, account: address(identity.account) }, status: 'VALIDATING' });
  }
  prepared(key: string, mockFeeAvailable: boolean) {
    const op = this.require(key, ['VALIDATING']);
    return this.set({ ...op, status: mockFeeAvailable ? 'PREFLIGHT_READY' : 'FEE_UNAVAILABLE' });
  }
  private require(key: string, states: TxStatus[]) { const op = this.get(key); if (!states.includes(op.status)) throw new Error('INVALID_TRANSITION'); return op; }
  /** Pure state transition; only the executor owns an authorized provider boundary. */
  signatureRequestedForMock(key: string, current: Identity, deliberateAction: boolean) {
    return this.signatureRequested(key, current, deliberateAction);
  }
  signatureRequested(key: string, current: Identity, deliberateAction: boolean) {
    const op = this.require(key, ['PREFLIGHT_READY']);
    if (!deliberateAction || !op.identity || address(current.account) !== op.identity.account || current.chain !== op.identity.chain || current.revision !== op.identity.revision) throw new Error('FRESH_PREFLIGHT_REQUIRED');
    return this.set({ ...op, status: 'AWAITING_USER_SIGNATURE' });
  }
  productionSubmission(key: string) { const op = this.require(key, ['PREFLIGHT_READY', 'FEE_UNAVAILABLE', 'VALIDATING']); return this.set({ ...op, identity: undefined, status: 'BLOCKED' }); }
  rejected(key: string) { const op = this.require(key, ['AWAITING_USER_SIGNATURE']); return this.set({ ...op, identity: undefined, status: 'USER_REJECTED' }); }
  failedBeforeSubmission(key: string) { const op = this.require(key, ['VALIDATING', 'PREFLIGHT_READY', 'FEE_UNAVAILABLE']); return this.set({ ...op, identity: undefined, status: 'FAILED_BEFORE_SUBMISSION' }); }
  blockedBeforeForwarding(key: string) { const op = this.require(key, ['VALIDATING', 'PREFLIGHT_READY', 'FEE_UNAVAILABLE', 'AWAITING_USER_SIGNATURE', 'SUBMISSION_UNKNOWN', 'BLOCKED']); return this.set({ ...op, identity: undefined, status: 'FAILED_BEFORE_SUBMISSION' }); }
  conflict(key: string) { const op = this.get(key); if (!op.hash) throw new Error('HASH_REQUIRED'); return this.set({ ...op, identity: undefined, status: 'TERMINAL_CONFLICT' }); }
  unknown(key: string) { const op = this.require(key, ['AWAITING_USER_SIGNATURE', 'SUBMISSION_UNKNOWN']); return this.set({ ...op, identity: undefined, status: 'SUBMISSION_UNKNOWN' }); }
  hashObserved(key: string, hash: string) {
    const op = this.require(key, ['AWAITING_USER_SIGNATURE', 'SUBMISSION_UNKNOWN', 'SUBMITTED']);
    if (!/^0x[\da-f]{64}$/i.test(hash) || op.hash && op.hash.toLowerCase() !== hash.toLowerCase()) throw new Error('INVALID_HASH');
    return this.set({ ...op, hash, status: 'SUBMITTED' });
  }
  consensusPending(key: string) { return this.set({ ...this.require(key, ['SUBMITTED', 'PENDING_CONSENSUS']), status: 'PENDING_CONSENSUS' }); }
  terminalObserved(key: string, evidence: { finalized: boolean; execution: 'SUCCESS' | 'FAILURE' | 'UNKNOWN'; returnValue?: unknown }) {
    const op = this.require(key, ['SUBMITTED', 'PENDING_CONSENSUS', 'RECONCILIATION_REQUIRED']);
    if (op.status === 'RECONCILIATION_REQUIRED' && !evidence.finalized) throw new Error('FINALITY_REGRESSION');
    if (!evidence.finalized) return this.consensusPending(key);
    const boolMethod = op.method === 'confirm_cycle' || op.method === 'expire_cycle';
    const incomingExecution = evidence.execution === 'UNKNOWN' ? undefined : evidence.execution;
    const incomingReturn = boolMethod && evidence.execution === 'SUCCESS' && typeof evidence.returnValue === 'boolean' ? evidence.returnValue : undefined;
    // Finalized execution/boolean evidence cannot be silently reclassified.
    // Conflicts retain the original evidence and hash, and require independent review.
    if ((op.terminalExecution && incomingExecution && op.terminalExecution !== incomingExecution) ||
        (op.terminalReturn !== undefined && incomingReturn !== undefined && op.terminalReturn !== incomingReturn)) {
      return this.set({ ...op, identity: undefined, status: 'TERMINAL_CONFLICT' });
    }
    const terminalExecution = op.terminalExecution ?? incomingExecution;
    const terminalReturn = op.terminalReturn ?? incomingReturn;
    const reconciliation = terminalExecution === 'FAILURE' ? 'FAILURE' as const :
      terminalExecution === 'SUCCESS' && (!boolMethod || terminalReturn !== undefined) ? 'SUCCESS' as const : undefined;
    const outcome = terminalExecution === 'FAILURE' ? 'FAILED' as const :
      boolMethod && terminalReturn === false ? 'NO_OP' as const :
      boolMethod && terminalReturn === true ? 'CHANGED' as const : undefined;
    return this.set({ ...op, status: 'RECONCILIATION_REQUIRED', terminalExecution, terminalReturn, reconciliation, outcome });
  }
  reconciled(key: string, observedOutcome: 'CHANGED' | 'NO_OP' | 'FAILED', verified: boolean) {
    const op = this.require(key, ['RECONCILIATION_REQUIRED']);
    if (!verified || !op.reconciliation || op.outcome && op.outcome !== observedOutcome || op.reconciliation === 'FAILURE' && observedOutcome !== 'FAILED' || op.reconciliation === 'SUCCESS' && observedOutcome === 'FAILED') throw new Error('RECONCILIATION_REQUIRED');
    return this.set({ ...op, identity: undefined, outcome: observedOutcome, status: op.reconciliation === 'SUCCESS' ? 'FINALIZED_SUCCESS' : 'FINALIZED_FAILURE' });
  }
  diagnostic(key: string, message: string) { return this.set({ ...this.get(key), error: message }); }
  invalidateIdentity() {
    for (const op of this.operations.values()) {
      if (pending.includes(op.status)) this.set({ ...op, identity: undefined, status: op.status === 'AWAITING_USER_SIGNATURE' ? 'SUBMISSION_UNKNOWN' : op.status });
      else if (['VALIDATING', 'PREFLIGHT_READY', 'FEE_UNAVAILABLE'].includes(op.status)) this.set({ ...op, identity: undefined, status: 'BLOCKED' });
    }
  }
}
