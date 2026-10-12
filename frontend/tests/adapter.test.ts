import {describe,it,expect,vi} from 'vitest';
import {ReadApi,type WorkerPort} from '../src/lib/genlayer/api';
import {decodeView,page,uint,validateCall} from '../src/lib/genlayer/validation';
import {CONTRACT,NETWORK} from '../src/lib/genlayer/config';
import {guardedFetch,retryDelay} from '../src/lib/genlayer/transport';
import fixtures from './fixtures.json';
const reads=fixtures.reads;
function factory(reply:unknown){const post=vi.fn();const terminate=vi.fn();const worker:WorkerPort={postMessage:post,terminate,onmessage:null,onerror:null};post.mockImplementation(()=>queueMicrotask(()=>worker.onmessage?.({data:reply} as MessageEvent)));return {create:()=>worker,post,terminate};}
describe('Exact IDs and view decoding',()=>{
 it('preserves full u64 precision',()=>{expect(uint('18446744073709551615')).toBe(18446744073709551615n);const d=decodeView('get_intent',{...reads['intent-1'],intent_id:'18446744073709551615'});expect(d.found&&d.intent_id).toBe('18446744073709551615');});
 it.each(['0','-1','1.5','1e3','01','18446744073709551616'])('rejects invalid ID %s',x=>expect(()=>uint(x)).toThrow());
 it.each([0,51,-1,1.5])('rejects page limit %s',n=>expect(()=>page('0',n)).toThrow());
 it('allows page boundaries and large offsets',()=>{expect(page('0',1)).toEqual([0n,1n]);expect(page('18446744073709551615',50)).toEqual([18446744073709551615n,50n]);});
 it('decodes positive and negative without inventing vote fields',()=>{const p=decodeView('get_assessment',reads['assessment-1']);const n=decodeView('get_assessment',reads['assessment-2']);expect(p.found&&p.result).toBe('MATCHED');expect(n.found&&n.cycle_id).toBe('0');expect(n).not.toHaveProperty('votes');});
 it('distinguishes stored OPEN from effective EXPIRED',()=>{const x=decodeView('get_intent',{...reads['intent-4'],status:'EXPIRED'});expect(x.found&&x.status).toBe('EXPIRED');expect(x.found&&x.stored_status).toBe('OPEN');});
 it('keeps page counts separate from global counters',()=>{const x=decodeView('get_protocol_stats',{...reads['protocol-stats'],intent_total:100,has_more:true});expect(x.intent_total).toBe('100');expect(x.effective_intent_counts_page.OPEN).toBe('3');expect(x.has_more).toBe(true);});
 it('handles missing records',()=>expect(decodeView('get_cycle',{found:false})).toEqual({found:false}));
 it('rejects contradictory or malformed responses',()=>{expect(()=>decodeView('get_assessment',{...reads['assessment-2'],cycle_id:2})).toThrow();expect(()=>decodeView('get_cycle',{...reads['cycle-1'],confirmation_count:2})).toThrow();expect(()=>decodeView('get_protocol_stats',{})).toThrow();expect(()=>decodeView('get_intent',{...reads['intent-1'],intent_id:9007199254740992})).toThrow();});
 it('validates all seven view argument shapes',()=>{validateCall('get_owner_records',['0x22Acaa233b7b985b36ef168F2DE9295334065B15',0n,50n]);expect(()=>validateCall('get_owner_records',['bad',0n,50n])).toThrow();expect(()=>validateCall('get_cycle',[1n,2n])).toThrow();});
});
describe('Network boundary and reliability',()=>{
 const request={method:'gen_call',params:[{type:'read',to:CONTRACT,transaction_hash_variant:'latest-final'}]};
 const options={method:'POST',body:JSON.stringify(request)};
 it('blocks writes and nonfinal reads before transport',async()=>{const native=vi.fn();const f=guardedFetch(native,new AbortController().signal);for(const body of [{method:'eth_sendTransaction'}, {...request,params:[{...request.params[0],type:'write'}]}, {...request,params:[{...request.params[0],transaction_hash_variant:'latest-nonfinal'}]}])await expect(f(NETWORK.rpc,{method:'POST',body:JSON.stringify(body)})).rejects.toThrow();expect(native).not.toHaveBeenCalled();});
 it('passes the controlled abort signal and exact endpoint',async()=>{const c=new AbortController();const n=vi.fn().mockResolvedValue(new Response('{}'));await guardedFetch(n,c.signal)(NETWORK.rpc,options);expect(n.mock.calls[0][1].signal).toBe(c.signal);});
 it('separates 429 and retains Retry-After without retrying',async()=>{const n=vi.fn().mockResolvedValue(new Response('{}',{status:429,headers:{'Retry-After':'5'}}));await expect(guardedFetch(n,new AbortController().signal)(NETWORK.rpc,options)).rejects.toMatchObject({kind:'rate-limit',retryAfterMs:5000});expect(n).toHaveBeenCalledTimes(1);});
 it('handles Retry-After HTTP dates',()=>expect(retryDelay('Mon, 12 Oct 2026 05:00:10 GMT',Date.parse('2026-10-12T05:00:00Z'))).toBe(10000));
 it('separates server and transport failures',async()=>{const n=vi.fn().mockResolvedValue(new Response('',{status:503}));await expect(guardedFetch(n,new AbortController().signal)(NETWORK.rpc,options)).rejects.toMatchObject({kind:'transient'});});
 it('does not amplify 429 and enforces cooldown',async()=>{const f=factory({ok:false,error:{kind:'rate-limit',message:'429',retryAfterMs:5000}});const create=vi.fn(f.create);const a=new ReadApi(create);await expect(a.getCycle('1')).rejects.toMatchObject({kind:'rate-limit'});await expect(a.getCycle('1')).rejects.toMatchObject({kind:'rate-limit'});expect(create).toHaveBeenCalledTimes(1);});
 it('labels successful observations live finalized',async()=>{const f=factory({ok:true,data:reads['cycle-1'],fetchedAt:'2026-10-12T05:00:00Z'});const x=await new ReadApi(f.create).getCycle('1');expect(x.source).toBe('live finalized');expect(x.data.found&&x.data.status).toBe('ACTIVE');expect(f.terminate).toHaveBeenCalledOnce();});
 it('cancels in-flight and queued reads without starting another worker',async()=>{const workers:WorkerPort[]=[];const a=new ReadApi(()=>{const w:WorkerPort={postMessage:vi.fn(),terminate:vi.fn(),onmessage:null,onerror:null};workers.push(w);return w;});const c1=new AbortController(),c2=new AbortController();const p1=a.getCycle('1',c1.signal).catch(e=>e);const p2=a.getCycle('2',c2.signal).catch(e=>e);await Promise.resolve();expect(workers.length).toBe(1);c2.abort();c1.abort();expect((await p1).kind).toBe('cancelled');expect((await p2).kind).toBe('cancelled');expect(workers).toHaveLength(1);});
 it('times out and terminates a hung worker',async()=>{vi.useFakeTimers();try{const w:WorkerPort={postMessage:vi.fn(),terminate:vi.fn(),onmessage:null,onerror:null};const p=new ReadApi(()=>w).getCycle('1').catch(e=>e);await Promise.resolve();await vi.advanceTimersByTimeAsync(22000);expect((await p).kind).toBe('timeout');expect(w.terminate).toHaveBeenCalledOnce();}finally{vi.useRealTimers();}});
 it('retries at most once for explicit 5xx',async()=>{let n=0;const a=new ReadApi(()=>factory(++n===1?{ok:false,error:{kind:'transient',message:'503'}}:{ok:true,data:{found:false},fetchedAt:'now'}).create());await a.getCycle('2');expect(n).toBe(2);});
});
