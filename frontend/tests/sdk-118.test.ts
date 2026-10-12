// @vitest-environment node
import { afterEach,it,expect,vi } from 'vitest';
import { createClient,abi,decodeInputData } from 'genlayer-js';
import { decodeFunctionData, type Hex } from 'viem';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus, type Hash } from 'genlayer-js/types';
import sdkPackage from '../node_modules/genlayer-js/package.json';
import { singleRequestBoundary } from '../src/lib/wallet/request-boundary';
import { prepareWrite,type WriteArgs,type WriteMethod } from '../src/lib/genlayer/write-spec';
import { CONTRACT,NETWORK } from '../src/lib/genlayer/config';
import { FakeProvider,OWNER,MOCK_HASH } from './fake-provider';
afterEach(()=>vi.restoreAllMocks());
const examples:WriteArgs={create_intent:['offer','','need','','18446744073709551615'],update_intent:['18446744073709551615','2','offer','','need','','2000000'],cancel_intent:['1','2'],assess_cycle:[['1','2','3'],['2','2','2'],[['1','2'],['2','3'],['3','1']]],confirm_cycle:['1','a'.repeat(64)],decline_cycle:['1','a'.repeat(64)],expire_cycle:['1']};
function rpcMock(options:{gasError?:boolean;failure?:number;retryAfter?:string}={}) {
  const calls:string[]=[];
  vi.stubGlobal('fetch',vi.fn(async(input:unknown,init?:RequestInit)=>{
    expect(String(input)).toBe(NETWORK.rpc); const body=JSON.parse(String(init?.body));calls.push(body.method);
    if(!['eth_getTransactionCount','eth_estimateGas','eth_gasPrice','eth_getTransactionByHash'].includes(body.method))throw new Error(`UNMOCKED_RPC_${body.method}`);
    if(options.failure)return new Response(JSON.stringify({error:{code:options.failure,message:'mock unavailable'}}),{status:options.failure,headers:options.retryAfter?{'Retry-After':options.retryAfter}:{}});
    if(options.gasError&&body.method==='eth_estimateGas')return new Response(JSON.stringify({error:{code:-32000,message:'mock estimate failure'}}));
    const result=body.method==='eth_getTransactionCount'?'0x0':body.method==='eth_estimateGas'?'0x5208':body.method==='eth_gasPrice'?'0x2':{hash:MOCK_HASH,status:'FINALIZED',from:OWNER,to:CONTRACT,nonce:'0x0',value:'0x0',gas:'0x0',gasPrice:'0x0',blockHash:null,blockNumber:null,transactionIndex:null,input:'0x'};
    return new Response(JSON.stringify({jsonrpc:'2.0',id:body.id,result}));
  }));return calls;
}
function clientFor(p:FakeProvider,revision=()=>1,write:ReturnType<typeof prepareWrite>=prepareWrite('expire_cycle',['1'])){const boundary=singleRequestBoundary(p,OWNER,1,revision,write);const client=createClient({chain:studionet,account:OWNER,provider:boundary});return {client,boundary};}
it('installed package exact version and candidate capability matrix',()=>{
  expect(sdkPackage.version).toBe('1.1.8');
  const {client}=clientFor(new FakeProvider());expect(studionet.id).toBe(61999);expect(studionet.rpcUrls.default.http[0]).toBe(NETWORK.rpc);
  for(const name of ['writeContract','connect','estimateTransactionGas','waitForTransactionReceipt'])expect(typeof client[name as keyof typeof client]).toBe('function');
  for(const name of ['estimateTransactionFees','estimateTransactionFeesForWrite','getCurrentFeePolicy','waitForFinalization'])expect(name in client).toBe(false);
});
it.each(Object.keys(examples) as WriteMethod[])('actual SDK %s encodes exact arguments and returns only fake hash',async method=>{
  const p=new FakeProvider();const calls=rpcMock();const prepared=prepareWrite(method,examples[method]);const {client,boundary}=clientFor(p,()=>1,prepared);
  const calldata=abi.calldata.makeCalldataObject(method,prepared.args,undefined);const decoded=abi.calldata.decode(abi.calldata.encode(calldata));expect(decoded).toBeInstanceOf(Map);expect((decoded as Map<string,unknown>).get('method')).toBe(method);expect((decoded as Map<string,unknown>).get('args')).toEqual(prepared.args);
  const hash:unknown=await client.writeContract({...prepared,value:0n});expect(hash).toBe(MOCK_HASH);expect(boundary.knownHash).toBe(MOCK_HASH);
  const sends=p.request.mock.calls.filter(([r])=>r.method==='eth_sendTransaction');expect(sends).toHaveLength(1);
  const tx=(sends[0][0].params as Record<string,unknown>[])[0];expect(tx.from).toBe(OWNER);expect(tx.chainId).toBe('0xf22f');expect(tx.to).toBe(studionet.consensusMainContract?.address);expect(tx.data).toMatch(/^0x[0-9a-f]+$/);
  const envelope=decodeFunctionData({abi:studionet.consensusMainContract!.abi,data:tx.data as Hex});
  expect(envelope.functionName).toBe('addTransaction');expect(envelope.args?.[1]).toBe(CONTRACT);
  const inner=decodeInputData(envelope.args?.[4] as Hex,CONTRACT);
  expect(inner?.type).toBe('call');if(!inner || !('callData' in inner))throw new Error('Expected SDK call payload');
  expect((inner.callData as Map<string,unknown>).get('method')).toBe(method);expect((inner.callData as Map<string,unknown>).get('args')).toEqual(prepared.args);
  expect(calls).toEqual(['eth_getTransactionCount','eth_estimateGas','eth_gasPrice']);expect(p.request.mock.calls.map(([r])=>r.method)).toEqual(['eth_chainId','eth_accounts','eth_sendTransaction']);
});
it('wrong chain blocked despite Studio skipping SDK chain guard',async()=>{rpcMock();const p=new FakeProvider();p.chain='0x1';const {client}=clientFor(p);await expect(client.writeContract({...prepareWrite('expire_cycle',['1']),value:0n})).rejects.toThrow('APP_WRONG_NETWORK');expect(p.request.mock.calls.some(([r])=>r.method==='eth_sendTransaction')).toBe(false);});
it('account and revision mismatch blocked before fake send',async()=>{rpcMock();const p=new FakeProvider();p.accounts=['0x'+'2'.repeat(40)];await expect(clientFor(p).client.writeContract({...prepareWrite('expire_cycle',['1']),value:0n})).rejects.toThrow('APP_IDENTITY_CHANGED');await expect(clientFor(new FakeProvider(),()=>2).client.writeContract({...prepareWrite('expire_cycle',['1']),value:0n})).rejects.toThrow('APP_IDENTITY_CHANGED');});
it('provider rejection propagated and never reaches fallback HTTP send',async()=>{const calls=rpcMock();const p=new FakeProvider();const original=p.request.getMockImplementation()!;p.request.mockImplementation(async r=>{if(r.method==='eth_sendTransaction')throw {code:4001,message:'mock rejection'};return original(r);});await expect(clientFor(p).client.writeContract({...prepareWrite('expire_cycle',['1']),value:0n})).rejects.toMatchObject({code:4001});expect(calls).not.toContain('eth_sendTransaction');});
it('single attempt boundary blocks SDK ABI fallback rebroadcast',async()=>{rpcMock();const p=new FakeProvider();const original=p.request.getMockImplementation()!;p.request.mockImplementation(async r=>{if(r.method==='eth_sendTransaction')throw new Error('function selector was not recognized');return original(r);});await expect(clientFor(p,()=>1,prepareWrite('create_intent',examples.create_intent)).client.writeContract({...prepareWrite('create_intent',examples.create_intent),value:0n})).rejects.toThrow();expect(p.request.mock.calls.filter(([r])=>r.method==='eth_sendTransaction')).toHaveLength(1);});
it('pending fake signature and concurrent call share one send latch',async()=>{rpcMock();const p=new FakeProvider();let release!:(value:unknown)=>void;const original=p.request.getMockImplementation()!;p.request.mockImplementation(async r=>r.method==='eth_sendTransaction'?new Promise(resolve=>{release=resolve;}):original(r));const {client}=clientFor(p);const first=client.writeContract({...prepareWrite('expire_cycle',['1']),value:0n});await vi.waitFor(()=>expect(release).toBeTypeOf('function'));await expect(client.writeContract({...prepareWrite('expire_cycle',['1']),value:0n})).rejects.toThrow('APP_DUPLICATE_SUBMISSION_BLOCKED');release(MOCK_HASH);await expect(first).resolves.toBe(MOCK_HASH);expect(p.request.mock.calls.filter(([r])=>r.method==='eth_sendTransaction')).toHaveLength(1);});
it.each([429,503])('mock HTTP %s does not send or automatically retry',async failure=>{const calls=rpcMock({failure,retryAfter:'7'});const p=new FakeProvider();await expect(clientFor(p).client.writeContract({...prepareWrite('expire_cycle',['1']),value:0n})).rejects.toBeDefined();expect(calls).toHaveLength(1);expect(p.request).not.toHaveBeenCalled();});
it('mock RPC unavailable fails before provider submission',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>{throw new Error('mock offline');}));const p=new FakeProvider();await expect(clientFor(p).client.writeContract({...prepareWrite('expire_cycle',['1']),value:0n})).rejects.toThrow();expect(p.request).not.toHaveBeenCalled();});
it('gas estimate is bigint, not a total AI fee quote',async()=>{const calls=rpcMock();expect(await clientFor(new FakeProvider()).client.estimateTransactionGas({from:OWNER,to:CONTRACT})).toBe(21000n);expect(calls).toEqual(['eth_estimateGas']);});
it('exposes unsafe SDK gas fallback as evidence only, never production approval',async()=>{rpcMock({gasError:true});vi.spyOn(console,'error').mockImplementation(()=>{});const p=new FakeProvider();await clientFor(p).client.writeContract({...prepareWrite('expire_cycle',['1']),value:0n});const tx=(p.request.mock.calls.find(([r])=>r.method==='eth_sendTransaction')![0].params as Record<string,string>[])[0];expect(tx.gas).toBe('0x30d40');});
it('explicit FINALIZED SDK receipt polling works against mock response only',async()=>{rpcMock();const {client}=clientFor(new FakeProvider());const receipt=await client.waitForTransactionReceipt({hash:MOCK_HASH as Hash,status:TransactionStatus.FINALIZED,retries:0});expect(receipt).toMatchObject({status_name:'FINALIZED'});expect(receipt.statusName).toBeUndefined();/* not evidence of execution SUCCESS */});

async function captureMockEnvelope(method: 'expire_cycle' | 'cancel_intent', args: [string] | [string,string]) {
  rpcMock();
  const p = new FakeProvider();
  const prepared = method === 'expire_cycle' ? prepareWrite('expire_cycle',args as [string]) : prepareWrite('cancel_intent',args as [string,string]);
  await clientFor(p,()=>1,prepared).client.writeContract({...prepared,value:0n});
  return p.request.mock.calls.find(([r])=>r.method==='eth_sendTransaction')![0];
}
it('fail closed on incorrect system destination, nonzero and missing native value',async()=>{
  const request=await captureMockEnvelope('expire_cycle',['1']);
  const tx=(request.params as Record<string,unknown>[])[0];
  for(const mutation of [{to:'0x'+'2'.repeat(40)},{value:'0x1'},{value:undefined}]){
    const p=new FakeProvider(),b=singleRequestBoundary(p,OWNER,1,()=>1,prepareWrite('expire_cycle',['1']));
    await expect(b.request({method:'eth_sendTransaction',params:[{...tx,...mutation}]})).rejects.toThrow();
    expect(p.request.mock.calls.filter(([r])=>r.method==='eth_sendTransaction')).toHaveLength(0);
  }
});
it('fail closed on wrong frozen inner contract, corrupted calldata, wrong arguments or method',async()=>{
  const request=await captureMockEnvelope('expire_cycle',['1']);
  const tx=(request.params as Record<string,unknown>[])[0], raw=String(tx.data).toLowerCase();
  const target=CONTRACT.slice(2).toLowerCase().padStart(64,'0');
  expect(raw.includes(target)).toBe(true);
  const wrongInner=raw.replace(target,('2'.repeat(40)).padStart(64,'0'));
  const other=await captureMockEnvelope('expire_cycle',['2']);
  const differentArgs=(other.params as Record<string,unknown>[])[0].data;
  const otherMethod=await captureMockEnvelope('cancel_intent',['1','2']);
  const differentMethod=(otherMethod.params as Record<string,unknown>[])[0].data;
  for(const data of [wrongInner,'0xdeadbeef',differentArgs,differentMethod]){
    const p=new FakeProvider(),b=singleRequestBoundary(p,OWNER,1,()=>1,prepareWrite('expire_cycle',['1']));
    await expect(b.request({method:'eth_sendTransaction',params:[{...tx,data}]})).rejects.toThrow('APP_INVALID_CALLDATA');
    expect(p.request.mock.calls.filter(([r])=>r.method==='eth_sendTransaction')).toHaveLength(0);
  }
});
