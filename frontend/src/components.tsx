import type { ReactNode } from 'react';
import type { Observation } from './lib/genlayer/types';
export function ReadState({state,children}:{state:{loading:boolean;error:string;data?:Observation<unknown>;refresh:()=>void};children:ReactNode}) {
  return <><div className="read-meta"><span>{state.loading?'Reading finalized state…':state.error?'RPC unavailable':state.data?`Live finalized read · ${new Date(state.data.fetchedAt).toLocaleString()}`:'Not fetched'}</span><button className="secondary" onClick={state.refresh} disabled={state.loading}>Refresh</button></div>{state.error&&<p role="alert" className="error">{state.error}</p>}{state.data&&<>{(state.loading||state.error)&&<p className="cached">Previous observation from {state.data.fetchedAt}. This is cached data, not a new successful read.</p>}{children}</>}</>;
}
export function Badge({value}:{value:string}){return <span className={`badge ${['NO_FIT','NOT_MATCHED','EXPIRED','ABORTED'].includes(value)?'negative':'positive'}`}>{value.replaceAll('_',' ')}</span>;}
export function JsonDetails({value}:{value:unknown}){return <details><summary>Complete decoded contract response</summary><pre>{JSON.stringify(value,null,2)}</pre></details>;}
