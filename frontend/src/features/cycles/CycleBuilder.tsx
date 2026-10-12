import { useState } from 'react';
import { api } from '../../lib/genlayer/api';
import type { Intent, Observation } from '../../lib/genlayer/types';
import type { WalletState } from '../../lib/wallet/session';
import { uint } from '../../lib/genlayer/validation';
import { validateAssessment } from '../../lib/genlayer/write-validation';
import { advisory, caller, reviewRequest, type Review } from '../transactions/review';
import { TransactionReview } from '../transactions/TransactionReview';
import { assessmentArgs, rotate } from './model';
import { DirectedRing } from './DirectedRing';
export function CycleBuilder({wallet}: {wallet:WalletState}) {
  const [ids,setIds]=useState(['','','']); const [records,setRecords]=useState<Observation<Intent>[]>();
  const [review,setReview]=useState<Review>(); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function load(preview:boolean) {
    if(busy)return;setBusy(true);setError('');setReview(undefined);
    try {
      ids.forEach(id=>uint(id)); if(new Set(ids).size!==3)throw new Error('DUPLICATE_INTENT');
      const fresh:Observation<Intent>[]=[];
      for(const id of ids){const r=await api.getIntent(id);if(!r.data.found)throw new Error(`INTENT_NOT_FOUND: ${id}`);fresh.push({...r,data:r.data});}
      if(preview){
        if(!records)throw new Error('LOAD_SELECTION_FIRST');
        const args=assessmentArgs(records.map(r=>r.data));
        validateAssessment(args,fresh.map(r=>r.data),caller(wallet),advisory(fresh[0].fetchedAt));
        setReview(reviewRequest('assess_cycle',args,wallet,'Topology valid; semantic result NOT_EVALUATED. No AI assessment was requested. Contract rotation preserves direction and never reverses the ring.'));
      } else setRecords(fresh);
    }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
  }
  const selected=records?.map(r=>r.data);
  return <><section className="page-header"><h1>Build a three-party Cycle.</h1><p className="lead">Choose three distinct owners in the direction you intend. Structural validity does not establish AI compatibility.</p></section>
    <form className="business-form" onSubmit={e=>{e.preventDefault();void load(false);}}>{ids.map((id,i)=><label key={i}>Intent ID {['A','B','C'][i]}<input disabled={busy} inputMode="numeric" required value={id} onChange={e=>{const next=[...ids];next[i]=e.target.value;setIds(next);setRecords(undefined);setReview(undefined);setError('');}}/></label>)}<button disabled={busy}>Load selected Intents</button></form>
    {selected&&<><h2>Selected direction</h2><p>{selected.map(r=>r.intent_id).concat(selected[0].intent_id).join(' → ')}</p><DirectedRing records={selected}/><p>Expected canonical rotation: {rotate(selected).map(r=>r.intent_id).concat(rotate(selected)[0].intent_id).join(' → ')}. This is a local direction preview; actual assessment order must come from the contract.</p><p>Expected versions: {selected.map(r=>r.version).join(' / ')}. Preflight re-reads all three records and rejects version drift.</p><button disabled={busy||wallet.status!=='CONNECTED'} onClick={()=>void load(true)}>Validate and review assessment request</button></>}
    {error&&<p role="alert" className="error">{error}</p>}<TransactionReview review={review} wallet={wallet}/></>;
}
