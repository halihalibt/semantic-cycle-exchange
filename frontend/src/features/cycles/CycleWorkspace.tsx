import { useState } from 'react';
import { useRead } from '../../hooks';
import { api } from '../../lib/genlayer/api';
import { Badge, JsonDetails, ReadState } from '../../components';
import type { Cycle, Intent } from '../../lib/genlayer/types';
import type { WalletState } from '../../lib/wallet/session';
import { validateExpiration, validatePending } from '../../lib/genlayer/write-validation';
import { advisory, caller, reviewRequest, type Review } from '../transactions/review';
import { TransactionReview } from '../transactions/TransactionReview';
import { verifyCycleMapping } from './model';
import { FrozenTerms } from './DirectedRing';
import { stamp } from '../intents/IntentCard';
export function CycleWorkspace({id,wallet}: {id:string;wallet:WalletState}) {
  const state=useRead(async signal=>{const r=await api.getCycle(id,signal);if(r.data.found)verifyCycleMapping(r.data);return r;});const c=state.data?.data;
  return <><section className="page-header"><h1>Cycle #{id}</h1><p className="lead">Three owners. One immutable snapshot. ACTIVE records a commitment, not service delivery.</p></section><form action="" method="get"><input type="hidden" name="view" value="cycle"/><label>Cycle ID<input name="id" inputMode="numeric" required defaultValue={id}/></label><button>Read Cycle</button></form>
    <ReadState state={{...state,refresh:state.refresh}}>{c&&(c.found?<><p>Effective <Badge value={c.status}/> · Stored <strong>{c.stored_status}</strong></p><p>{c.confirmation_count} / 3 confirmations in canonical owner order</p><p>Actual directed ring: {c.intent_ids.concat(c.intent_ids[0]).join(' → ')}</p><p>Created {stamp(c.created_at)} · Confirmation deadline {stamp(c.confirmation_deadline)}</p><p>Snapshot <code>{c.snapshot_id}</code></p><FrozenTerms terms={c.terms} confirmations={c.confirmations}/>
      {c.status==='EXPIRED'&&c.stored_status==='PENDING'&&<p className="notice">Effective EXPIRED; stored PENDING. Time expiry has not yet performed onchain reservation cleanup.</p>}
      {c.stored_status==='EXPIRED'&&<p>Stored EXPIRED: cleanup already recorded. Repeated expiration returns false / NO_OP.</p>}
      <CycleActions key={`${c.snapshot_id}-${state.data?.fetchedAt}`} cycle={c} wallet={wallet}/><JsonDetails value={c}/></>:<p>No Cycle found.</p>)}</ReadState></>;
}
export function CycleActions({cycle,wallet}: {cycle:Cycle;wallet:WalletState}) {
  const [ack,setAck]=useState(false);const [declineAck,setDeclineAck]=useState(false);const [review,setReview]=useState<Review>();const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function request(method:'confirm_cycle'|'decline_cycle'|'expire_cycle') {
    if(busy)return;setBusy(true);setReview(undefined);setError('');
    try {
      const owner=caller(wallet);const observation=await api.getCycle(cycle.cycle_id);if(!observation.data.found)throw new Error('CYCLE_NOT_FOUND');
      const current=verifyCycleMapping(observation.data);const ctx=advisory(observation.fetchedAt);
      if(current.snapshot_id!==cycle.snapshot_id)throw new Error('SNAPSHOT_MISMATCH');
      if(method==='expire_cycle'){
        const effect=validateExpiration(current,ctx);
        setReview(reviewRequest(method,[current.cycle_id],wallet,effect.expectedNoop?'Expected NO_OP: stored EXPIRED. No local flags or confirmation counts will change.':'Permissionless cleanup preview. Effective expiry does not mean stored cleanup has occurred.'));
      }else{
        if(!ack)throw new Error('Review all three frozen commitments and acknowledge them first.');
        if(method==='decline_cycle'&&!declineAck)throw new Error('Acknowledge the irreversible decline consequences first.');
        const records:Intent[]=[];for(const intentId of current.intent_ids){const r=await api.getIntent(intentId);if(!r.data.found)throw new Error('INTENT_NOT_FOUND');records.push(r.data);}
        const effect=validatePending(current,current.snapshot_id,records,owner,ctx);
        setReview(reviewRequest(method,[current.cycle_id,current.snapshot_id],wallet,method==='decline_cycle'?'IRREVERSIBLE: Cycle becomes ABORTED, eligible RESERVED Intents are released, and the identical Snapshot is permanently blocked from being proposed again. Review only.':effect.duplicateConfirmation?'Expected NO_OP: this canonical owner already confirmed. Confirmation count remains unchanged.':'Review all three commitments for the exact chain-read Snapshot. No confirmation flag has changed.'));
      }
    }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
  }
  return <section className="section"><h2>Review Cycle actions</h2><label className="check"><input disabled={busy} type="checkbox" checked={ack} onChange={e=>{setAck(e.target.checked);setReview(undefined);}}/>I have reviewed all three frozen commitments and the exact Snapshot.</label>
    <button disabled={busy||!ack||wallet.status!=='CONNECTED'} onClick={()=>void request('confirm_cycle')}>Review confirmation request</button>
    <div className="danger-panel"><h3>Decline is irreversible</h3><p>Decline may ABORT this Cycle, release eligible RESERVED Intents, and permanently block the identical Snapshot.</p><label className="check"><input disabled={busy} type="checkbox" checked={declineAck} onChange={e=>{setDeclineAck(e.target.checked);setReview(undefined);}}/>I understand these irreversible consequences.</label><button className="secondary" disabled={busy||!ack||!declineAck||wallet.status!=='CONNECTED'} onClick={()=>void request('decline_cycle')}>Review decline request</button></div>
    <p>Any address may request expiration cleanup after the contract deadline. A repeated false return is NO_OP.</p><button className="secondary" disabled={busy||wallet.status!=='CONNECTED'} onClick={()=>void request('expire_cycle')}>Review expiration cleanup</button>
    {error&&<p role="alert" className="error">{error}</p>}<TransactionReview review={review} wallet={wallet}/></section>;
}
