/** OFFLINE ENGINEERING ONLY. Not imported by App, WalletPanel, routes or Worker.
 * Production feeQuote always fails closed. No production send adapter is installed. */
import type { WalletState } from '../../wallet/session';
import { accounts, address, chainId, type Provider } from '../../wallet/provider';
import { Transactions, type Identity, type Operation } from '../transaction';
import { prepareWrite, type WriteArgs, type WriteMethod } from '../write-spec';
import { freshPreflight, type Preflight, type ReadPort } from './preflight';
import { feeBudget, sameFee, type StagedFee } from './fee-budget';
import { fingerprint, frozen } from './immutable';
import { receiptEvidence, type ReceiptEvidence } from './receipt';
import { reconcile } from './reconcile';
export interface SubmissionPort {
  submit(write: ReturnType<typeof prepareWrite>, fee: StagedFee, finalCheck: () => void): Promise<unknown>;
  readonly forwarded: boolean; readonly knownHash: unknown;
}
export interface StagedDependencies {
  mode: 'MOCK_ONLY'; reads: ReadPort; wallet(): { state: WalletState; provider?: Provider };
  quote(binding: string): Promise<StagedFee | undefined>; balance(account: string): Promise<bigint>;
  submission(provider: Provider, identity: Identity, write: ReturnType<typeof prepareWrite>, revision: () => number): SubmissionPort;
  receipt(hash: string): Promise<unknown>; now(): number; timeoutMs: number;
}
interface Context {
  method: WriteMethod; args: WriteArgs[WriteMethod]; write: ReturnType<typeof prepareWrite>;
  identity: Identity; provider: Provider; binding: string; before?: Preflight; fee?: StagedFee; budget: bigint;
  submitting: boolean; observing: boolean; evidence?: ReceiptEvidence; confirmation?: string;
}
function bounded<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve,reject) => { const timer=setTimeout(() => reject(new Error('STAGED_TIMEOUT')),ms); p.then(v=>{clearTimeout(timer);resolve(v);},e=>{clearTimeout(timer);reject(e);}); });
}
/** Reuses Transactions, including unknown submission and terminal conflict locks. */
export class StagedExecutor {
  private contexts = new Map<string,Context>();
  private locks = new Set<string>();
  private token = 0;
  constructor(readonly transactions: Transactions, private deps: StagedDependencies) {
    if (deps.mode !== 'MOCK_ONLY' || !Number.isSafeInteger(deps.timeoutMs) || deps.timeoutMs < 1 || deps.timeoutMs > 30000) throw new Error('OFFLINE_ONLY');
  }
  private get(key: string) { const c=this.contexts.get(key); if(!c)throw new Error('UNKNOWN_OPERATION');return c; }
  private identity(c: Context) {
    const w=this.deps.wallet();
    if (w.provider !== c.provider || w.state.status !== 'CONNECTED' || w.state.chain !== '61999' || !w.state.account || address(w.state.account)!==c.identity.account || w.state.revision!==c.identity.revision) throw new Error('FRESH_PREFLIGHT_REQUIRED');
  }
  private async verify(c: Context) {
    this.identity(c);
    const id=chainId(await bounded(c.provider.request({method:'eth_chainId'}),this.deps.timeoutMs)); this.identity(c);
    const a=accounts(await bounded(c.provider.request({method:'eth_accounts'}),this.deps.timeoutMs)); this.identity(c);
    if(id!==61999n || a[0]!==c.identity.account)throw new Error('FRESH_PREFLIGHT_REQUIRED');
  }
  async prepare<M extends WriteMethod>(key: string, method: M, args: WriteArgs[M], budget: bigint): Promise<{operation:Operation; confirmation?:string}> {
    const w=this.deps.wallet(), captured=frozen(args), write=frozen(prepareWrite(method,captured));
    if(!w.provider || w.state.status!=='CONNECTED' || w.state.chain!=='61999' || !w.state.account)throw new Error('CONNECTED_STUDIONET_WALLET_REQUIRED');
    const identity={account:address(w.state.account),chain:w.state.chain,revision:w.state.revision};
    const binding=fingerprint([write,identity]), lock=fingerprint([write,identity.account]);
    if(this.locks.has(lock))throw new Error('DUPLICATE_REQUEST_BLOCKED');
    this.transactions.begin(key,method,identity);this.locks.add(lock);
    const c:Context={method,args:captured,write,identity,provider:w.provider,binding,budget,submitting:false,observing:false};this.contexts.set(key,c);
    try {
      c.before=await bounded(freshPreflight(this.deps.reads,method,captured,identity.account,this.deps.now),this.deps.timeoutMs);await this.verify(c);
      const quote=await bounded(this.deps.quote(binding),this.deps.timeoutMs);this.identity(c);
      if(!quote){this.transactions.prepared(key,false);return {operation:this.transactions.get(key)};}
      const balance=await bounded(this.deps.balance(identity.account),this.deps.timeoutMs);this.identity(c);
      c.fee=feeBudget(quote,binding,this.deps.now(),balance,budget);
      if(this.deps.now()-c.before.oldestRead>=30)throw new Error('FRESH_PREFLIGHT_REQUIRED');
      this.transactions.prepared(key,true);c.confirmation='offline-confirmation-'+(++this.token);
      return {operation:this.transactions.get(key),confirmation:c.confirmation};
    }catch(e){this.transactions.blockedBeforeForwarding(key);throw e;}
  }
  async confirm(key: string, confirmation: string, explicitUserAction: boolean): Promise<Operation> {
    const c=this.get(key);
    if(c.submitting || !explicitUserAction || !c.confirmation || c.confirmation!==confirmation || this.transactions.get(key).status!=='PREFLIGHT_READY')throw new Error('EXPLICIT_FRESH_CONFIRMATION_REQUIRED');
    c.submitting=true;c.confirmation=undefined;
    let port:SubmissionPort|undefined;
    try {
      this.identity(c);
      const fresh=await bounded(freshPreflight(this.deps.reads,c.method,c.args,c.identity.account,this.deps.now),this.deps.timeoutMs);this.identity(c);
      // Any change invalidates the user's previously approved records, not just versions.
      if(fingerprint([c.before?.records,c.before?.cycle,c.before?.owner])!==fingerprint([fresh.records,fresh.cycle,fresh.owner]))throw new Error('ONCHAIN_STATE_CHANGED');
      await this.verify(c);
      const next=feeBudget(await bounded(this.deps.quote(c.binding),this.deps.timeoutMs),c.binding,this.deps.now(),await bounded(this.deps.balance(c.identity.account),this.deps.timeoutMs),c.budget);this.identity(c);
      sameFee(c.fee!,next);c.before=fresh;
      const finalCheck=()=>{this.identity(c);if(!['PREFLIGHT_READY','AWAITING_USER_SIGNATURE'].includes(this.transactions.get(key).status) || this.deps.now()-fresh.oldestRead>=30 || this.deps.now()>=next.expiresAt)throw new Error('FRESH_PREFLIGHT_REQUIRED');};
      finalCheck();port=this.deps.submission(c.provider,c.identity,c.write,()=>this.deps.wallet().state.revision);
      this.transactions.signatureRequestedForMock(key,c.identity,true);
      const sending=port.submit(c.write,next,finalCheck);
      // A late hash may resolve UNKNOWN, but may never trigger another send.
      void sending.then(hash=>{if(port?.forwarded && typeof hash==='string' && /^0x[\da-f]{64}$/i.test(hash) && ['AWAITING_USER_SIGNATURE','SUBMISSION_UNKNOWN'].includes(this.transactions.get(key).status))this.transactions.hashObserved(key,hash);},()=>{});
      const hash=await bounded(sending,this.deps.timeoutMs);
      if(!port.forwarded)throw new Error('SUBMISSION_NOT_FORWARDED');
      if(typeof hash!=='string' || !/^0x[\da-f]{64}$/i.test(hash)){this.transactions.unknown(key);return this.transactions.get(key);}
      if(this.transactions.get(key).hash) { if(this.transactions.get(key).hash?.toLowerCase()!==hash.toLowerCase())this.transactions.conflict(key); }
      else this.transactions.hashObserved(key,hash);
    }catch(e){
      const status=this.transactions.get(key).status;
      if(!port?.forwarded)this.transactions.blockedBeforeForwarding(key);
      else if(e && typeof e==='object' && 'code' in e && e.code===4001 && status==='AWAITING_USER_SIGNATURE')this.transactions.rejected(key);
      else if(['AWAITING_USER_SIGNATURE','SUBMISSION_UNKNOWN'].includes(status))this.transactions.unknown(key);
      // If a valid late hash already arrived, preserve it and its submitted state.
    }
    return this.transactions.get(key);
  }
  /** Explicit one-shot read. Caller may schedule bounded reads; never a write retry. */
  async observe(key: string): Promise<Operation> {
    const c=this.get(key), op=this.transactions.get(key);
    if(c.observing)throw new Error('OBSERVATION_IN_PROGRESS');
    if(!op.hash || ['TERMINAL_CONFLICT','USER_REJECTED'].includes(op.status))return op;
    c.observing=true;
    try {
      const raw=await bounded(this.deps.receipt(op.hash),this.deps.timeoutMs);
      const e=receiptEvidence(raw,op.hash,c.identity.account,c.write);
      if(c.evidence?.finalized && !e.finalized && raw)throw new Error('TERMINAL_CONFLICT');
      if(c.evidence && (c.evidence.consensus!=='UNKNOWN' && e.consensus!=='UNKNOWN' && c.evidence.consensus!==e.consensus || c.evidence.execution!=='UNKNOWN' && e.execution!=='UNKNOWN' && c.evidence.execution!==e.execution || c.evidence.hasReturn && e.hasReturn && fingerprint(c.evidence.returnValue)!==fingerprint(e.returnValue)))throw new Error('TERMINAL_CONFLICT');
      if(['FINALIZED_SUCCESS','FINALIZED_FAILURE'].includes(op.status))return op;
      if(!raw)return op; // Missing evidence is unknown, never a fake failure/success.
      c.evidence=frozen({finalized:e.finalized || !!c.evidence?.finalized,consensus:e.consensus==='UNKNOWN' ? c.evidence?.consensus??'UNKNOWN' : e.consensus,execution:e.execution==='UNKNOWN' ? c.evidence?.execution??'UNKNOWN' : e.execution,hasReturn:e.hasReturn || !!c.evidence?.hasReturn,returnValue:e.hasReturn ? e.returnValue : c.evidence?.returnValue});
      if(!e.finalized){this.transactions.consensusPending(key);return this.transactions.get(key);}
      const merged=c.evidence;
      this.transactions.terminalObserved(key,{finalized:true,execution:merged.consensus==='MAJORITY_AGREE' ? merged.execution : 'UNKNOWN',returnValue:merged.hasReturn ? merged.returnValue : undefined});
      if(this.transactions.get(key).status==='TERMINAL_CONFLICT')return this.transactions.get(key);
      const outcome=await bounded(reconcile(this.deps.reads,c.method,c.args,c.identity.account,c.before!,merged,this.deps.now),this.deps.timeoutMs);
      this.transactions.reconciled(key,outcome,true);
    }catch(e){if(e instanceof Error && e.message==='TERMINAL_CONFLICT')this.transactions.conflict(key);}
    finally{c.observing=false;}
    return this.transactions.get(key);
  }
}
