import { useEffect, useRef, useState } from 'react';
import type { WalletState } from '../../lib/wallet/session';
import type { Operation } from '../../lib/genlayer/transaction';
import { CONTRACT } from '../../lib/genlayer/config';
import { WRITE_PARAMETERS } from '../../lib/genlayer/write-spec';
import type { BrowserTransactions } from '../../lib/genlayer/live/runtime';
import { reviewCurrent, json, type Review } from './review';
export function LiveTransactionReview({review,wallet,runtime}: {review:Review;wallet:WalletState;runtime:BrowserTransactions}) {
  const [ready,setReady]=useState<{key:string;confirmation?:string;gasUnits?:string}>();const [operation,setOperation]=useState<Operation>();
  const [ack,setAck]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const working=useRef(false),active=useRef(true),key=useRef<string | undefined>(undefined);
  const current=reviewCurrent(review,wallet);
  useEffect(()=>{active.current=true;return()=>{active.current=false;if(key.current)runtime.cancelApproval(key.current);};},[runtime]);
  useEffect(()=>{if(!current && key.current)runtime.cancelApproval(key.current);},[current,runtime]);
  async function prepare() {
    if(working.current || !current)return;working.current=true;setBusy(true);setError('');setAck(false);setReady(undefined);setOperation(undefined);
    try {
      const r=await runtime.prepare(review);key.current=r.key;
      if(!active.current){runtime.cancelApproval(r.key);return;}
      setReady({key:r.key,confirmation:r.confirmation,gasUnits:r.gasUnits});setOperation(r.operation);
      if(r.operation.error)setError(r.operation.error);
    }catch(e){if(active.current)setError(e instanceof Error?e.message:'PREFLIGHT_FAILED');}
    finally{working.current=false;if(active.current)setBusy(false);}
  }
  async function confirm() {
    if(working.current || !current || !ack || !ready?.confirmation)return;
    working.current=true;setBusy(true);setAck(false);setError('');
    try {
      let op=await runtime.confirm(ready.key,ready.confirmation);
      if(active.current)setOperation(op);
      if(op.hash)op=await runtime.observe(ready.key);
      if(active.current){setOperation(op);if(op.error)setError(op.error);}
    }catch(e){if(active.current)setError(e instanceof Error?e.message:'WALLET_REQUEST_FAILED');}
    finally{working.current=false;if(active.current)setBusy(false);}
  }
  async function observe() {
    if(working.current || !ready)return;working.current=true;setBusy(true);setError('');
    try{const op=await runtime.observe(ready.key);if(active.current){setOperation(op);if(op.error)setError(op.error);}}
    catch(e){if(active.current)setError(e instanceof Error?e.message:'READ_FAILED');}
    finally{working.current=false;if(active.current)setBusy(false);}
  }
  const status=operation?.status ?? 'PREVIEW';
  return <section className="transaction-review" aria-label="Transaction review" aria-live="polite">
    <p className="eyebrow">TRANSACTION REVIEW · STABLE STUDIONET 61999</p><h2>{review.method}</h2>
    <p role="status">{current ? status : 'BLOCKED — wallet identity changed; review again'}</p>
    <p className="notice">{review.notice.replace('Preview only. No Intent ID will be created.', 'A finalized successful transaction creates an Intent.').replace('Review only; no cancellation performed.', 'Cancelling requires your explicit confirmation.').replace('Review only.', 'Proceed only if you accept these consequences.').replace('No AI assessment was requested.', 'An AI assessment starts only after you confirm and sign.')}</p>
    <dl><dt>Contract</dt><dd><code>{CONTRACT}</code></dd><dt>Account</dt><dd><code>{review.account}</code></dd><dt>Network</dt><dd>Stable Studionet 61999</dd></dl>
    <pre aria-label="Exact method parameters">{json(Object.fromEntries(WRITE_PARAMETERS[review.method].map((name,i)=>[name,review.parameters.args[i]])))}</pre>
    <p>User-confirmed zero-fee test environment. Native value is 0. Gas limit must pass estimation. This premise applies only to Stable Studionet 61999.</p>
    {ready?.gasUnits&&<p>Gas limit: {ready.gasUnits} · gas price: 0 · native value: 0</p>}
    {(!ready || ['FAILED_BEFORE_SUBMISSION','USER_REJECTED'].includes(status)) && <button disabled={busy||!current} onClick={()=>void prepare()}>Run fresh preflight</button>}
    {ready && status==='PREFLIGHT_READY' && <><label className="check"><input type="checkbox" checked={ack} disabled={busy||!current} onChange={e=>setAck(e.target.checked)}/>I confirm this exact method, account, contract and parameters, and authorize one wallet request.</label><button disabled={busy||!current||!ack} onClick={()=>void confirm()}>Confirm and request wallet</button></>}
    {busy&&<p>Checking records or waiting for the wallet. No write is retried automatically.</p>}
    {operation?.hash&&<p>Transaction hash <code>{operation.hash}</code></p>}
    {operation?.outcome&&<p>Verified outcome: {operation.outcome}</p>}
    {ready && ['SUBMITTED','PENDING_CONSENSUS','RECONCILIATION_REQUIRED','SUBMISSION_UNKNOWN'].includes(status)&&<button disabled={busy} onClick={()=>void observe()}>Check existing transaction (read only)</button>}
    {status==='SUBMISSION_UNKNOWN'&&<p className="notice">Submission outcome is unknown. Keep the wallet request and check the existing transaction. Do not send again. This account remains locked across reloads while unresolved.</p>}
    {['SUBMITTED','PENDING_CONSENSUS','RECONCILIATION_REQUIRED'].includes(status)&&<p>Success requires FINALIZED, MAJORITY_AGREE, SUCCESS and matching finalized contract state.</p>}
    {error&&<p role="alert" className="error">{error}</p>}
    <p>Local time and reads are advisory. The contract revalidates all changes. Refresh actual finalized records after completion.</p>
  </section>;
}
