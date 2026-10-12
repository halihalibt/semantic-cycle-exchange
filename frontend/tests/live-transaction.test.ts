// @vitest-environment node
import { it, expect, vi, afterEach } from 'vitest';
import { createClient, decodeInputData } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { decodeFunctionData, type Hex } from 'viem';
import { liveHarness, memoryStorage, mockExclusive } from './live-fixtures';
import { WRITE_PARAMETERS, prepareWrite, type WriteMethod } from '../src/lib/genlayer/write-spec';
import { CONTRACT, NETWORK } from '../src/lib/genlayer/config';
import { owner, now } from './business-fixtures';
import { FakeProvider, MOCK_HASH } from './fake-provider';
import { zeroFeeBudget } from '../src/lib/genlayer/live/zero-fee';
import { zeroFeePlan, readRpc, quantity } from '../src/lib/genlayer/live/rpc';
import { SubmissionJournal, browserExclusive } from '../src/lib/genlayer/live/journal';
import { BrowserTransactions } from '../src/lib/genlayer/live/runtime';
import { singleRequestBoundary } from '../src/lib/wallet/request-boundary';
import { envelope, sdk118Submission } from '../src/lib/genlayer/live/sdk118';
import { fingerprint } from '../src/lib/genlayer/staged/immutable';
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
const methods=Object.keys(WRITE_PARAMETERS) as WriteMethod[];
const sends=(p:FakeProvider)=>p.request.mock.calls.filter(([r])=>r.method==='eth_sendTransaction');
it.each(methods)('%s: actual browser adapter encodes seven methods, finality and chain effects',async method=>{
  const {h,runtime,journal,prepare,rpc}=await liveHarness(method);const ready=await prepare();expect(sends(h.provider)).toHaveLength(0);
  expect((await runtime.confirm(ready.key,ready.confirmation!)).status).toBe('SUBMITTED');expect(sends(h.provider)).toHaveLength(1);
  const tx=(sends(h.provider)[0][0].params as Record<string,unknown>[])[0];expect(tx).toMatchObject({from:owner,to:studionet.consensusMainContract!.address,value:'0x0',gasPrice:'0x0',gas:'0x5208',chainId:'0xf22f',type:'0x0',nonce:'0x0'});
  const outer=decodeFunctionData({abi:studionet.consensusMainContract!.abi,data:tx.data as Hex});expect(outer.args?.[1]).toBe(CONTRACT);
  const inner=decodeInputData(outer.args?.[4] as Hex,CONTRACT);expect(inner?.type).toBe('call');if(!inner || !('callData' in inner) || !(inner.callData instanceof Map))throw new Error('SDK_DECODE');
  expect(inner.callData.get('method')).toBe(method);expect(inner.callData.get('args')).toEqual(prepareWrite(method,h.args).args);
  expect(journal.pending(owner)).toMatchObject({hash:MOCK_HASH,status:'HASH_OBSERVED'});
  h.applySuccess();expect(await runtime.observe(ready.key)).toMatchObject({status:'FINALIZED_SUCCESS',outcome:'CHANGED'});expect(journal.pending(owner)).toBeUndefined();
  expect(rpc.mock.calls.filter(([m])=>m==='eth_estimateGas')).toHaveLength(2);
});
it.each(methods)('%s: explicit adapter envelope equals installed SDK writeContract bytes',async method=>{
  const {h,review,runtime,prepare}=await liveHarness(method);const ready=await prepare();await runtime.confirm(ready.key,ready.confirmation!);
  const actual=sends(h.provider)[0][0];const p=new FakeProvider(),write=prepareWrite(method,review.args),identity={account:owner,chain:'61999',revision:1};
  const boundary=singleRequestBoundary(p,owner,1,()=>1,write);
  vi.stubGlobal('fetch',vi.fn(async(_input,init)=>{const body=JSON.parse(String(init.body));const result=body.method==='eth_estimateGas'?'0x5208':'0x0';return new Response(JSON.stringify({jsonrpc:'2.0',id:body.id,result}));}));
  await createClient({chain:studionet,account:owner as Hex,provider:boundary}).writeContract({...write,value:0n,leaderOnly:false});
  expect(actual).toEqual(sends(p)[0][0]);expect(envelope(write,identity).data).toBe((actual.params as {data:string}[])[0].data);
});
it.each(['estimate error','zero gas','bad gas','excessive gas','gas price nonzero','gas price missing','nonce error'] as const)('%s never reaches wallet forwarding',async kind=>{
  const {h,runtime,prepare,rpc}=await liveHarness();const original=rpc.getMockImplementation()!;
  rpc.mockImplementation(async(m,p)=>{
    if(m==='eth_estimateGas'){if(kind==='estimate error')throw new Error('estimate failed');if(kind==='zero gas')return '0x0';if(kind==='bad gas')return 'garbage';if(kind==='excessive gas')return '0xffffffff';}
    if(m==='eth_gasPrice'){if(kind==='gas price nonzero')return '0x1';if(kind==='gas price missing')return undefined;}
    if(m==='eth_getTransactionCount'&&kind==='nonce error')throw new Error('nonce failed');return original(m,p);
  });
  if(kind==='nonce error'){const r=await prepare();expect((await runtime.confirm(r.key,r.confirmation!)).status).toBe('FAILED_BEFORE_SUBMISSION');}
  else await expect(prepare()).rejects.toThrow();expect(sends(h.provider)).toHaveLength(0);
});
it('genuine 200000 estimate is allowed; failure never becomes the SDK fallback',async()=>{
  const {h,runtime,prepare,rpc}=await liveHarness();const original=rpc.getMockImplementation()!;rpc.mockImplementation(async(m,p)=>m==='eth_estimateGas'?'0x30d40':original(m,p));
  const r=await prepare();await runtime.confirm(r.key,r.confirmation!);expect((sends(h.provider)[0][0].params as {gas:string}[])[0].gas).toBe('0x30d40');
});
it('changing estimated gas after approval fails before signing',async()=>{const {h,runtime,prepare,rpc}=await liveHarness();const r=await prepare(),original=rpc.getMockImplementation()!;rpc.mockImplementation(async(m,p)=>m==='eth_estimateGas'?'0x6000':original(m,p));expect(await runtime.confirm(r.key,r.confirmation!)).toMatchObject({status:'FAILED_BEFORE_SUBMISSION',error:'TRANSACTION_PARAMETERS_CHANGED'});expect(sends(h.provider)).toHaveLength(0);});
it.each(['event account','silent account','silent network','revision','state'] as const)('real path %s invalidates approval',async kind=>{
  const {h,runtime,prepare}=await liveHarness('update_intent');const r=await prepare();
  if(kind==='event account')h.provider.emit('accountsChanged',[]);if(kind==='silent account')h.provider.accounts=['0x'+'2'.repeat(40)];if(kind==='silent network')h.provider.chain='0x1';if(kind==='revision')h.provider.emit('connect');if(kind==='state')h.records[0].offer_description='changed';
  expect((await runtime.confirm(r.key,r.confirmation!)).status).toBe('FAILED_BEFORE_SUBMISSION');expect(sends(h.provider)).toHaveLength(0);
});
it('stale preview cannot approve a new account or revision',async()=>{const {h,runtime,review}=await liveHarness();h.provider.emit('connect');await h.session.connect();await expect(runtime.prepare(review)).rejects.toThrow('FRESH_PREVIEW_REQUIRED');});
it('concurrent confirmation and ABI-shaped error forward at most once',async()=>{
  const {h,runtime,prepare}=await liveHarness();const original=h.provider.request.getMockImplementation()!;h.provider.request.mockImplementation(async r=>{if(r.method==='eth_sendTransaction')throw new Error('invalid pointer in tuple');return original(r);});
  const r=await prepare();const first=runtime.confirm(r.key,r.confirmation!);await expect(runtime.confirm(r.key,r.confirmation!)).rejects.toThrow();expect((await first).status).toBe('SUBMISSION_UNKNOWN');expect(sends(h.provider)).toHaveLength(1);
});
it('wallet rejection clears durable pending record; no resend',async()=>{const {h,runtime,journal,prepare}=await liveHarness();const original=h.provider.request.getMockImplementation()!;h.provider.request.mockImplementation(async r=>{if(r.method==='eth_sendTransaction')throw {code:4001};return original(r);});const r=await prepare();expect((await runtime.confirm(r.key,r.confirmation!)).status).toBe('USER_REJECTED');expect(journal.pending(owner)).toBeUndefined();expect(sends(h.provider)).toHaveLength(1);});
it('timeout after forwarding remains locked after runtime recreation and eventually keeps late hash',async()=>{
  const {h,runtime,storage,exclusive,rpc,journal,prepare,review}=await liveHarness();let release!:(x:unknown)=>void;const original=h.provider.request.getMockImplementation()!;
  h.provider.request.mockImplementation(async r=>r.method==='eth_sendTransaction'?new Promise(resolve=>{release=resolve;}):original(r));const ready=await prepare();
  expect((await runtime.confirm(ready.key,ready.confirmation!)).status).toBe('SUBMISSION_UNKNOWN');expect(journal.pending(owner)?.status).toBe('AWAITING_WALLET');
  const reloaded=new BrowserTransactions(()=>({state:h.session.state,provider:h.provider}),h.reads,new SubmissionJournal(storage,exclusive),rpc,()=>now,50);
  await expect(reloaded.prepare(review)).rejects.toThrow('UNRESOLVED_SUBMISSION_LOCKED');release(MOCK_HASH);await vi.waitFor(()=>expect(runtime.transactions.get(ready.key).hash).toBe(MOCK_HASH));expect(journal.pending(owner)?.hash).toBe(MOCK_HASH);expect(sends(h.provider)).toHaveLength(1);
});
it.each(['undefined hash','network error'])('%s persists unknown and cannot resend after reload',async kind=>{const {h,runtime,storage,exclusive,rpc,prepare,review}=await liveHarness();const original=h.provider.request.getMockImplementation()!;h.provider.request.mockImplementation(async r=>{if(r.method==='eth_sendTransaction'){if(kind==='network error')throw new Error('offline');return undefined;}return original(r);});const r=await prepare();expect((await runtime.confirm(r.key,r.confirmation!)).status).toBe('SUBMISSION_UNKNOWN');const next=new BrowserTransactions(()=>({state:h.session.state,provider:h.provider}),h.reads,new SubmissionJournal(storage,exclusive),rpc,()=>now,50);await expect(next.prepare(review)).rejects.toThrow('UNRESOLVED_SUBMISSION_LOCKED');expect(sends(h.provider)).toHaveLength(1);});
it('storage failure before request blocks forwarding',async()=>{const {h,rpc}=await liveHarness();const journal=new SubmissionJournal({getItem:()=>null,setItem:()=>{throw new Error('storage denied');},removeItem:()=>{}},mockExclusive());const write=prepareWrite('create_intent',['offer','','need','',String(now+7*86400)]),identity={account:owner,chain:'61999',revision:h.session.state.revision};const plan=await zeroFeePlan(rpc,'binding',write,identity,()=>now);const port=sdk118Submission(h.provider,identity,write,()=>identity.revision,rpc,journal,()=>now);await expect(port.submit(write,plan,()=>{})).rejects.toThrow();expect(sends(h.provider)).toHaveLength(0);});
it('cross-tab serialization blocks a simultaneous second request',async()=>{const storage=memoryStorage(),exclusive=mockExclusive(),a=new SubmissionJournal(storage,exclusive),b=new SubmissionJournal(storage,exclusive);let release!:(h:string)=>void;const first=a.attempt(owner,'one',()=>true,()=>new Promise<string>(r=>{release=r;}));await vi.waitFor(()=>expect(release).toBeTypeOf('function'));const other=vi.fn(async()=>MOCK_HASH);await expect(b.attempt(owner,'two',()=>true,other)).rejects.toThrow('ANOTHER_TAB_SUBMISSION_IN_PROGRESS');expect(other).not.toHaveBeenCalled();release(MOCK_HASH);await first;});
it('browser Web Locks API is required; no unlocked fallback',async()=>{vi.stubGlobal('navigator',{});await expect(browserExclusive('key',async()=>1)).rejects.toThrow('BROWSER_SUBMISSION_LOCK_UNAVAILABLE');});
it('unknown journal can only be cleared by reconciliation of its exact hash',async()=>{const storage=memoryStorage(),journal=new SubmissionJournal(storage,mockExclusive());await journal.attempt(owner,'one',()=>true,async()=>MOCK_HASH);await journal.settled(owner,'0x'+'cd'.repeat(32));expect(journal.pending(owner)).toBeDefined();await journal.settled(owner,MOCK_HASH);expect(journal.pending(owner)).toBeUndefined();});
it('corrupt journal fails closed',()=>{const storage=memoryStorage(),journal=new SubmissionJournal(storage,mockExclusive());storage.setItem(`sca3:61999:${CONTRACT.toLowerCase()}:${owner}`,'invalid');expect(()=>journal.pending(owner)).toThrow('SUBMISSION_JOURNAL_CORRUPT');});
it.each(['chain','binding','expired','value','price','mock'] as const)('zero-mode policy rejects %s',async kind=>{const {rpc,review,h}=await liveHarness();const identity={account:owner,chain:'61999',revision:h.session.state.revision};const plan=await zeroFeePlan(rpc,'binding',review.parameters,identity,()=>now);const invalid={...plan,...(kind==='chain'?{chain:1}:kind==='binding'?{binding:'other'}:kind==='expired'?{expiresAt:now}:kind==='value'?{nativeValue:1n}:kind==='price'?{gasPriceWei:1n}:{status:'MOCK_ONLY'})};expect(()=>zeroFeeBudget(invalid as typeof plan,'binding',now)).toThrow();});
it('only fixed read-only RPC methods can reach HTTP; no write or batch fallback',async()=>{const native=vi.fn<typeof fetch>(async(input,init)=>{expect(input).toBe(NETWORK.rpc);expect(init?.redirect).toBe('error');const body=JSON.parse(String(init?.body));return new Response(JSON.stringify({jsonrpc:'2.0',id:body.id,result:'0x0'}));});const rpc=readRpc(native);expect(await rpc('eth_gasPrice',[])).toBe('0x0');await expect(rpc('eth_sendTransaction' as never,[])).rejects.toThrow('READ_RPC_METHOD_BLOCKED');expect(native).toHaveBeenCalledTimes(1);});
it.each([429,503])('HTTP %i does not retry or enter a wallet path',async code=>{const native=vi.fn<typeof fetch>(async()=>new Response('',{status:code}));await expect(readRpc(native)('eth_gasPrice',[])).rejects.toThrow();expect(native).toHaveBeenCalledTimes(1);});
it.each([{jsonrpc:'2.0',id:999,result:'0x0'},{jsonrpc:'2.0',id:1,error:{code:-32601}},{jsonrpc:'2.0',id:1}])('malformed RPC response fails closed %#',async response=>{await expect(readRpc(vi.fn(async()=>new Response(JSON.stringify(response))))('eth_gasPrice',[])).rejects.toThrow('READ_RPC_INVALID_RESPONSE');});
it.each(['0x00','-1','200000',undefined,'0x'])('strict quantities reject %s',v=>expect(()=>quantity(v)).toThrow());
it('the raw write and method remain immutable',async()=>{const {review}=await liveHarness('assess_cycle');expect(Object.isFrozen(review)).toBe(true);expect(Object.isFrozen(review.args[0])).toBe(true);expect(fingerprint(review.args)).toContain('1');});
it('storage error after observed wallet hash retains the known hash without retry',async()=>{
  const {h,rpc}=await liveHarness(),storage=memoryStorage();let writes=0;
  const journal=new SubmissionJournal({...storage,setItem:(k,v)=>{if(++writes>1)throw new Error('disk unavailable');storage.setItem(k,v);}},mockExclusive());
  const runtime=new BrowserTransactions(()=>({state:h.session.state,provider:h.provider}),h.reads,journal,rpc,()=>now,50);
  const {review}=await liveHarness();const r=await runtime.prepare(review);const op=await runtime.confirm(r.key,r.confirmation!);
  expect(op).toMatchObject({status:'SUBMITTED',hash:MOCK_HASH});expect(sends(h.provider)).toHaveLength(1);expect(journal.pending(owner)).toBeDefined();
});
it('timeout before provider forwarding prevents delayed forwarding even after RPC recovers',async()=>{
  const {h,runtime,prepare,rpc,journal}=await liveHarness();const r=await prepare(),original=rpc.getMockImplementation()!;let release!:(x:string)=>void;
  rpc.mockImplementation(async(m,p)=>m==='eth_getTransactionCount'?new Promise(resolve=>{release=resolve;}):original(m,p));
  expect((await runtime.confirm(r.key,r.confirmation!)).status).toBe('FAILED_BEFORE_SUBMISSION');release('0x0');await vi.waitFor(()=>expect(runtime.transactions.get(r.key).status).toBe('FAILED_BEFORE_SUBMISSION'));expect(sends(h.provider)).toHaveLength(0);expect(journal.pending(owner)).toBeUndefined();
});
it('changing review during a delayed SDK nonce read prevents any later wallet request',async()=>{
  const {h,runtime,prepare,rpc}=await liveHarness(),r=await prepare(),original=rpc.getMockImplementation()!;let release!:(x:string)=>void;
  rpc.mockImplementation(async(m,p)=>m==='eth_getTransactionCount'?new Promise(resolve=>{release=resolve;}):original(m,p));
  const sending=runtime.confirm(r.key,r.confirmation!);await vi.waitFor(()=>expect(release).toBeTypeOf('function'));runtime.cancelApproval(r.key);release('0x0');expect((await sending).status).toBe('FAILED_BEFORE_SUBMISSION');expect(sends(h.provider)).toHaveLength(0);
});
it('a manually renewed preflight after explicit rejection is allowed, never automatic',async()=>{
  const {h,runtime,prepare}=await liveHarness(),original=h.provider.request.getMockImplementation()!;h.provider.request.mockImplementationOnce(original);
  h.provider.request.mockImplementation(async r=>{if(r.method==='eth_sendTransaction')throw {code:4001};return original(r);});
  const r=await prepare();await runtime.confirm(r.key,r.confirmation!);expect(sends(h.provider)).toHaveLength(1);const fresh=await prepare();expect(fresh.operation.status).toBe('PREFLIGHT_READY');expect(sends(h.provider)).toHaveLength(1);
});
it('an earlier rejected request cannot unlock a later identical ready request',async()=>{
  const {h,runtime,prepare}=await liveHarness(),original=h.provider.request.getMockImplementation()!;
  h.provider.request.mockImplementation(async r=>{if(r.method==='eth_sendTransaction')throw {code:4001};return original(r);});
  const first=await prepare();await runtime.confirm(first.key,first.confirmation!);await prepare();await expect(prepare()).rejects.toThrow('DUPLICATE_REQUEST_BLOCKED');expect(sends(h.provider)).toHaveLength(1);
});
