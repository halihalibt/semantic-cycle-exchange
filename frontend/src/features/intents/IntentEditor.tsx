import { useState } from 'react';
import { api } from '../../lib/genlayer/api';
import { useRead } from '../../hooks';
import { ReadState } from '../../components';
import type { Intent } from '../../lib/genlayer/types';
import type { WalletState } from '../../lib/wallet/session';
import { validateCancellation, validateCapacity, validateExpiry, validateOwned } from '../../lib/genlayer/write-validation';
import type { TextFields } from '../../lib/genlayer/write-spec';
import { advisory, caller, reviewRequest, type Review } from '../transactions/review';
import { TransactionReview } from '../transactions/TransactionReview';
import { IntentCard } from './IntentCard';
import { verifyCycleMapping } from '../cycles/model';
const fieldNames = ['Offer description','Offer limitations','Need description','Need requirements'];
export function CreateIntent({wallet}: {wallet:WalletState}) { return <><section className="page-header"><h1>Create an Intent.</h1><p className="lead">Describe what you provide and what you need. Review only; chain submission is disabled.</p></section><IntentForm wallet={wallet}/></>; }
export function IntentDetail({id,wallet}: {id:string;wallet:WalletState}) {
  const state = useRead(signal => api.getIntent(id,signal)); const item = state.data?.data;
  return <><section className="page-header"><h1>Intent #{id}</h1></section><ReadState state={state}>{item && (item.found ? <><IntentCard item={item}/><IntentForm key={`${item.intent_id}-${item.version}-${state.data?.fetchedAt}`} wallet={wallet} item={item}/></> : <p>No Intent found.</p>)}</ReadState></>;
}
export function IntentForm({wallet,item}: {wallet:WalletState;item?:Intent}) {
  const [fields,setFields] = useState<TextFields>(item ? [item.offer_description,item.offer_limitations,item.need_description,item.need_requirements] : ['','','','']);
  const [days,setDays] = useState('7'); const [expires,setExpires] = useState(item?.expires_at ?? '');
  const [ack,setAck] = useState(false); const [review,setReview] = useState<Review>(); const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  function invalidate() { setReview(undefined); setError(''); }
  async function request(cancel = false) {
    if (busy) return; setBusy(true); setError(''); setReview(undefined);
    try {
      const owner = caller(wallet);
      if (!item) {
        if (!/^(?:[1-9]|[12][0-9]|30)$/.test(days)) throw new Error('Validity must be a whole number from 1 to 30 days.');
        const history = await api.getOwnerRecords(owner);
        const ctx = advisory(history.fetchedAt); validateCapacity(history.data,owner,ctx);
        const expiry = String(BigInt(ctx.now) + BigInt(days)*86400n); validateExpiry(expiry,ctx);
        setReview(reviewRequest('create_intent',[...fields,expiry],wallet,'Preview only. No Intent ID will be created. 1 and 30 day boundaries require a fresh contract-time check; choose an interior duration for an advisory preview.'));
      } else {
        const observation = await api.getIntent(item.intent_id); if (!observation.data.found) throw new Error('INTENT_NOT_FOUND');
        const current = observation.data; const ctx = advisory(observation.fetchedAt);
        if (cancel) {
          if (!ack) throw new Error('Read and acknowledge the cancellation consequences first.');
          let reservation;
          if (current.status === 'RESERVED') {
            const c = await api.getCycle(current.cycle_id); if (!c.data.found) throw new Error('CYCLE_NOT_FOUND');
            const records = [];
            for (const id of c.data.intent_ids) { const r = await api.getIntent(id); if (!r.data.found) throw new Error('INTENT_NOT_FOUND'); records.push(r.data); }
            reservation = {cycle:verifyCycleMapping(c.data),records};
          }
          const effect = validateCancellation(current,item.intent_id,item.version,owner,ctx,reservation);
          setReview(reviewRequest('cancel_intent',[item.intent_id,item.version],wallet,effect.abortsPendingCycle ? 'DANGER: RESERVED cancellation may ABORT the entire three-party PENDING Cycle and release eligible reservations. Review only; no cancellation performed.' : 'Cancel this OPEN Intent. Review only; no cancellation performed.'));
        } else {
          validateOwned(current,item.intent_id,item.version,owner,ctx,true); validateExpiry(expires,ctx);
          setReview(reviewRequest('update_intent',[item.intent_id,item.version,...fields,expires],wallet,'Expected version comes from the loaded record and must still match the fresh read. The displayed version remains unchanged.'));
        }
      }
    } catch(e) { setError(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  }
  return <section className="section"><h2>{item ? 'Review an update' : 'Your service terms'}</h2><form className="business-form" onSubmit={e => {e.preventDefault();void request();}}>
    {fields.map((text,i) => <label key={i}>{fieldNames[i]}<textarea disabled={busy} required={i===0 || i===2} value={text} onChange={e=>{const next=[...fields] as TextFields;next[i]=e.target.value;setFields(next);invalidate();}}/><span>{Array.from(text).length} / 512 Unicode characters · {new TextEncoder().encode(text).length} / 512 UTF-8 bytes</span></label>)}
    {item ? <label>Expires at (Unix seconds)<input disabled={busy} inputMode="numeric" value={expires} onChange={e=>{setExpires(e.target.value);invalidate();}}/></label> : <label>Validity in days (1–30)<input disabled={busy} type="number" min="1" max="30" step="1" value={days} onChange={e=>{setDays(e.target.value);invalidate();}}/></label>}
    <button disabled={busy || wallet.status !== 'CONNECTED'}>{busy ? 'Reading current records…' : item ? 'Review update request' : 'Review create request'}</button>
  </form>{item && <div className="danger-panel"><h2>Cancel Intent</h2><p>{item.stored_status === 'RESERVED' ? 'DANGER: cancelling a RESERVED Intent may make the entire three-party Cycle ABORTED. A current PENDING reservation is required.' : 'Cancelling an OPEN Intent removes it from future exchange proposals.'}</p><label className="check"><input disabled={busy} type="checkbox" checked={ack} onChange={e=>{setAck(e.target.checked);invalidate();}}/>I understand the cancellation consequences and want a second review preview.</label><button className="secondary" disabled={!ack || busy || wallet.status !== 'CONNECTED'} onClick={()=>void request(true)}>Review cancellation request</button></div>}
    {error && <p className="error" role="alert">{error}</p>}<TransactionReview review={review} wallet={wallet}/>
  </section>;
}
