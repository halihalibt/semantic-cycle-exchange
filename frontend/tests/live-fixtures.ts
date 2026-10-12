import { vi } from 'vitest';
import { harness } from './staged-fixtures';
import type { WriteMethod } from '../src/lib/genlayer/write-spec';
import { BrowserTransactions } from '../src/lib/genlayer/live/runtime';
import { SubmissionJournal, type Exclusive } from '../src/lib/genlayer/live/journal';
import type { ReadRpc } from '../src/lib/genlayer/live/rpc';
import { reviewRequest } from '../src/features/transactions/review';
import { now } from './business-fixtures';
export function memoryStorage() {
  const data=new Map<string,string>();return {data,getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};
}
export function mockExclusive(): Exclusive {
  const busy=new Set<string>();return async(name,task)=>{if(busy.has(name))throw new Error('ANOTHER_TAB_SUBMISSION_IN_PROGRESS');busy.add(name);try{return await task();}finally{busy.delete(name);}};
}
export async function liveHarness(method: WriteMethod='create_intent') {
  const h=await harness(method),storage=memoryStorage(),exclusive=mockExclusive(),journal=new SubmissionJournal(storage,exclusive);
  const rpc=vi.fn<ReadRpc>(async method=>{
    if(method==='eth_estimateGas')return '0x5208';if(method==='eth_gasPrice')return '0x0';if(method==='eth_getTransactionCount')return '0x0';if(method==='eth_getTransactionByHash')return h.receipt;
    throw new Error('UNMOCKED_RPC');
  });
  const runtime=new BrowserTransactions(()=>({state:h.session.state,provider:h.provider}),h.reads,journal,rpc,()=>h.deps.now(),50);
  const review=reviewRequest(method,h.args,h.session.state,'Exact terms require explicit approval.');
  return {h,storage,exclusive,journal,rpc,runtime,review,now,prepare:()=>runtime.prepare(review)};
}
