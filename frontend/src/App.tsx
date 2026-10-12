import { useRef, useState } from 'react';
import { BrowserTransactionContext } from './features/transactions/BrowserTransactionContext';
import { BrowserTransactions, type WalletBinding } from './lib/genlayer/live/runtime';
import { SubmissionJournal } from './lib/genlayer/live/journal';
import { api } from './lib/genlayer/api';
import { Home,Demo,Inspect } from './pages';
import { WalletPanel } from './WalletPanel';
import type { WalletState } from './lib/wallet/session';
import { ExploreIntents, MyIntents } from './features/intents/IntentPages';
import { CreateIntent, IntentDetail } from './features/intents/IntentEditor';
import { CycleBuilder } from './features/cycles/CycleBuilder';
import { CycleWorkspace } from './features/cycles/CycleWorkspace';
import { AssessmentViewer } from './features/assessments/AssessmentViewer';
import { uint } from './lib/genlayer/validation';
export function App({search=window.location.search}: {search?:string}) {
  const params=new URLSearchParams(search);const mode=params.get('w')==='1'?'demo':params.get('view')??'home';
  const [wallet,setWallet]=useState<WalletState>({status:'NOT_INSTALLED',revision:0});
  const binding=useRef<WalletBinding>({state:wallet});
  const runtime=useRef<BrowserTransactions | null>(null);
  // Construction is inert: no wallet, RPC, storage read or signature request.
  if(!runtime.current)runtime.current=new BrowserTransactions(()=>binding.current,api,new SubmissionJournal({getItem:k=>window.localStorage.getItem(k),setItem:(k,v)=>window.localStorage.setItem(k,v),removeItem:k=>window.localStorage.removeItem(k)}));
  const transactions=runtime.current;
  const id=params.get('id')??'1';let error='';if(['intent','assessment','cycle'].includes(mode)){try{uint(id);}catch(e){error=e instanceof Error?e.message:String(e);}}
  const nav=[['home','?','Overview'],['intents','?view=intents','Explore'],['my','?view=my','My Intents'],['builder','?view=builder','Build Cycle'],['assessment','?view=assessment&id=1','Assessment'],['cycle','?view=cycle&id=1','Workspace'],['demo','?w=1','Onchain demo'],['inspect','?view=inspect','Inspect']];
  return <BrowserTransactionContext.Provider value={transactions}><div className="app"><header><a className="brand" href="?">SCA<span>—3</span></a><nav aria-label="Main navigation">{nav.map(([key,href,label])=><a key={key} aria-current={mode===key?'page':undefined} href={href}>{label}</a>)}</nav><span className="network-tag">STUDIONET 61999</span></header><WalletPanel onState={setWallet} onBinding={next=>{binding.current=next;transactions.transactions.invalidateIdentity();}}/><main>
    {error?<p role="alert" className="error">{error}</p>:mode==='demo'?<Demo/>:mode==='inspect'?<Inspect/>:mode==='intents'?<ExploreIntents/>:mode==='my'?<MyIntents wallet={wallet}/>:mode==='create'?<CreateIntent wallet={wallet}/>:mode==='intent'?<IntentDetail key={id} id={id} wallet={wallet}/>:mode==='builder'?<CycleBuilder wallet={wallet}/>:mode==='assessment'?<AssessmentViewer key={id} id={id}/>:mode==='cycle'?<CycleWorkspace key={id} id={id} wallet={wallet}/>:<Home/>}
  </main><footer><strong>Semantic Cycle Accord</strong><span>Three-party commitments · Stable Studionet · manual transactions</span></footer></div></BrowserTransactionContext.Provider>;
}
