import { CONTRACT } from '../config';
import { address } from '../../wallet/provider';
export interface SubmissionRecord { version: 1; account: string; chain: 61999; contract: string; request: string; status: 'AWAITING_WALLET' | 'UNKNOWN' | 'HASH_OBSERVED'; hash?: string }
export type Exclusive = <T>(name: string, task: () => Promise<T>) => Promise<T>;
export const browserExclusive: Exclusive = async(name,task) => {
  if(!globalThis.navigator?.locks)throw new Error('BROWSER_SUBMISSION_LOCK_UNAVAILABLE');
  return navigator.locks.request(name,{mode:'exclusive',ifAvailable:true},async lock=>{
    if(!lock)throw new Error('ANOTHER_TAB_SUBMISSION_IN_PROGRESS');
    return task();
  });
};
/** Persist BEFORE forwarding. Unresolved records survive account changes and reloads.
 * No timeout, navigation, RPC error or reset button clears an ambiguous submission. */
export class SubmissionJournal {
  constructor(private storage: Pick<Storage,'getItem'|'setItem'|'removeItem'>, private exclusive: Exclusive = browserExclusive) {}
  private key(account: string) { return `sca3:61999:${CONTRACT.toLowerCase()}:${address(account)}`; }
  pending(account: string): SubmissionRecord | undefined {
    const raw=this.storage.getItem(this.key(account));if(raw===null)return;
    let r: SubmissionRecord;try{r=JSON.parse(raw);}catch{throw new Error('SUBMISSION_JOURNAL_CORRUPT');}
    if(!r || r.version!==1 || r.chain!==61999 || r.account!==address(account) || r.contract!==CONTRACT.toLowerCase() || typeof r.request!=='string' || !['AWAITING_WALLET','UNKNOWN','HASH_OBSERVED'].includes(r.status) || (r.hash!==undefined && !/^0x[\da-f]{64}$/i.test(r.hash)))throw new Error('SUBMISSION_JOURNAL_CORRUPT');
    return r;
  }
  private put(r: SubmissionRecord) {
    const key=this.key(r.account), value=JSON.stringify(r);this.storage.setItem(key,value);
    if(this.storage.getItem(key)!==value)throw new Error('SUBMISSION_JOURNAL_UNAVAILABLE');
  }
  async attempt<T>(account: string, request: string, forwarded: () => boolean, task: () => Promise<T>): Promise<T> {
    return this.exclusive(this.key(account),async()=>{
      if(this.pending(account))throw new Error('UNRESOLVED_SUBMISSION_LOCKED');
      const r:SubmissionRecord={version:1,account:address(account),chain:61999,contract:CONTRACT.toLowerCase(),request,status:'AWAITING_WALLET'};
      this.put(r);
      try {
        const value=await task();
        if(typeof value==='string' && /^0x[\da-f]{64}$/i.test(value))this.put({...r,status:'HASH_OBSERVED',hash:value});
        else this.put({...r,status:'UNKNOWN'});
        return value;
      } catch(e) {
        if(!forwarded() || (e && typeof e==='object' && 'code' in e && e.code===4001))this.storage.removeItem(this.key(account));
        else this.put({...r,status:'UNKNOWN'});
        throw e;
      }
    });
  }
  async settled(account: string, hash: string) {
    await this.exclusive(this.key(account),async()=>{
      const r=this.pending(account);
      if(r?.hash?.toLowerCase()===hash.toLowerCase())this.storage.removeItem(this.key(account));
    });
  }
}
