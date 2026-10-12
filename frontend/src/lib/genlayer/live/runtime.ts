import { Transactions, type Operation } from '../transaction';
import { StagedExecutor } from '../staged/executor';
import type { ReadPort } from '../staged/preflight';
import type { Provider } from '../../wallet/provider';
import type { WalletState } from '../../wallet/session';
import { reviewCurrent, type Review } from '../../../features/transactions/review';
import { SubmissionJournal } from './journal';
import { readRpc, zeroFeePlan, type ReadRpc } from './rpc';
import { sdk118Submission } from './sdk118';
export interface WalletBinding { state: WalletState; provider?: Provider }
export class BrowserTransactions {
  readonly transactions=new Transactions();readonly executor: StagedExecutor;
  private sequence=0;private accounts=new Map<string,string>();
  constructor(private wallet: () => WalletBinding, reads: ReadPort, readonly journal: SubmissionJournal, rpc: ReadRpc = readRpc(), now: () => number = () => Date.now()/1000, timeoutMs=22000) {
    this.executor=new StagedExecutor(this.transactions,{mode:'STUDIO_ZERO_FEE',reads,wallet,quote:async(binding,write,identity)=>{
      if(!write || !identity)throw new Error('TRANSACTION_IDENTITY_REQUIRED');
      const pending=journal.pending(identity.account);
      if(pending)throw new Error(`UNRESOLVED_SUBMISSION_LOCKED${pending.hash ? ': '+pending.hash : ': wallet outcome unknown'}`);
      return zeroFeePlan(rpc,binding,write,identity,now);
    },balance:async()=>{throw new Error('ZERO_FEE_MODE_HAS_NO_BALANCE_QUOTE');},submission:(provider,identity,write,revision)=>sdk118Submission(provider,identity,write,revision,rpc,journal,now),receipt:hash=>rpc('eth_getTransactionByHash',[hash]),now,timeoutMs});
  }
  async prepare(review: Review) {
    if(!reviewCurrent(review,this.wallet().state))throw new Error('FRESH_PREVIEW_REQUIRED');
    const key=`browser-${++this.sequence}`;
    const ready=await this.executor.prepare(key,review.method,review.args,0n);
    this.accounts.set(key,review.account);
    const plan=this.executor.approvedPlan(key);
    return {...ready,key,gasUnits:plan?.gasUnits.toString()};
  }
  cancelApproval(key: string) {
    const status=this.transactions.get(key).status;
    if(['VALIDATING','PREFLIGHT_READY','FEE_UNAVAILABLE'].includes(status))this.transactions.blockedBeforeForwarding(key);
    else if(status==='AWAITING_USER_SIGNATURE')this.transactions.unknown(key);
  }
  async confirm(key: string, token: string) { return this.executor.confirm(key,token,true); }
  async observe(key: string): Promise<Operation> {
    const op=await this.executor.track(key,10,1000);
    if(op.hash && ['FINALIZED_SUCCESS','FINALIZED_FAILURE'].includes(op.status))await this.journal.settled(this.accounts.get(key)!,op.hash);
    return op;
  }
}
