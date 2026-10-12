import { useState } from 'react';
import { api } from '../../lib/genlayer/api';
import { useRead } from '../../hooks';
import { JsonDetails, ReadState } from '../../components';
import type { WalletState } from '../../lib/wallet/session';
import { IntentCard } from './IntentCard';
export function ExploreIntents() {
  const [offset, setOffset] = useState('0');
  return <><section className="page-header"><p className="eyebrow">LIVE CONTRACT RECORDS</p><h1>Explore Intents.</h1><p className="lead">Find the next edge in a three-party service exchange.</p><a className="button" href="?view=create">Create an Intent preview</a></section><IntentPage key={offset} offset={offset} setOffset={setOffset}/></>;
}
function IntentPage({offset, setOffset}: {offset: string; setOffset: (value: string) => void}) {
  const state = useRead(signal => api.getIntentsPage(offset, 20, signal));
  const [filter, setFilter] = useState('ALL'); const d = state.data?.data;
  return <ReadState state={state}>{d && <><p>Offset {offset} → {d.next_offset} · {d.total} total historical Intents</p>
    <label>Filter this page by effective status<select value={filter} onChange={e => setFilter(e.target.value)}>{['ALL','OPEN','RESERVED','EXPIRED','CONSUMED','CANCELLED'].map(s => <option key={s}>{s}</option>)}</select></label><p>This filters only the loaded page. It is not global search.</p>
    <div className="intent-grid">{d.records.filter(r => filter === 'ALL' || r.status === filter).map(item => <IntentCard key={item.intent_id} item={item}/>)}</div>{d.records.length === 0 && <p>No records on this page.</p>}
    <div className="actions"><button className="secondary" disabled={offset === '0'} onClick={() => setOffset('0')}>First page</button><button disabled={!d.has_more || state.loading || !!state.error} onClick={() => setOffset(d.next_offset)}>Next page</button></div><JsonDetails value={d}/></>}</ReadState>;
}
export function MyIntents({wallet}: {wallet: WalletState}) {
  return <><section className="page-header"><h1>My Intents.</h1><p className="lead">Records owned by your connected public wallet address.</p></section>{wallet.status !== 'CONNECTED' || !wallet.account || wallet.chain !== '61999' ? <p className="notice">Connect and verify a wallet on Stable Studionet 61999 to read your records.</p> : <OwnerHistory key={`${wallet.account}-${wallet.revision}`} owner={wallet.account}/>}</>;
}
function OwnerHistory({owner}: {owner: string}) { const [offset, setOffset] = useState('0'); return <OwnerPage key={offset} owner={owner} offset={offset} setOffset={setOffset}/>; }
function OwnerPage({owner,offset,setOffset}: {owner:string;offset:string;setOffset:(value:string)=>void}) {
  const state = useRead(async signal => {const r=await api.getOwnerRecords(owner, offset, 20, signal);if(r.data.owner.toLowerCase()!==owner.toLowerCase())throw new Error('OWNER_MISMATCH');return r;}); const d = state.data?.data;
  return <ReadState state={state}>{d && <><code>{d.owner}</code><p>{d.unfinished_count} / 5 effective unfinished Intents · {d.intent_total} historical Intents · {d.cycle_total} historical Cycles</p>
    <p>Shared offset {offset} → {d.next_offset}. The contract slices both histories with the same offset and limit; either list may be empty. There is no separate history index.</p>
    <h2>Intent history</h2><div className="intent-grid">{d.intents.map(item => <IntentCard key={item.intent_id} item={item}/>)}</div>{!d.intents.length && <p>No Intents in this history range.</p>}
    <h2>Cycle history</h2>{d.cycles.map(c => <p key={c.cycle_id}><a href={`?view=cycle&id=${c.cycle_id}`}>Cycle #{c.cycle_id}</a> · Effective {c.status} · Stored {c.stored_status}</p>)}{!d.cycles.length && <p>No Cycles in this history range.</p>}
    <div className="actions"><button className="secondary" disabled={offset === '0'} onClick={() => setOffset('0')}>First page</button><button disabled={!d.has_more || state.loading || !!state.error} onClick={() => setOffset(d.next_offset)}>Next shared range</button></div><JsonDetails value={d}/></>}</ReadState>;
}
