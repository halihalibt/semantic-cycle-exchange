import type { ViewMethod } from './config';
import type { Observation, ViewResults } from './types';
import { decodeView, page, uint, validateCall } from './validation';
import { RpcError } from './transport';
export interface WorkerPort {postMessage:(x:unknown)=>void;terminate:()=>void;onmessage:((e:MessageEvent)=>void)|null;onerror:((e:Event)=>void)|null}
type WorkerFactory=()=>WorkerPort;
export class ReadApi {
  private tail:Promise<void>=Promise.resolve();private cooldown=0;
  constructor(private factory:WorkerFactory=()=>new Worker(new URL('./worker.ts',import.meta.url),{type:'module'}) as unknown as WorkerPort){}
  read<M extends ViewMethod>(method:M,args:(bigint|string)[],signal?:AbortSignal):Promise<Observation<ViewResults[M]>>{
    validateCall(method,args);
    const job=this.tail.then(async()=>{
      if(signal?.aborted)throw new RpcError('cancelled','Read cancelled');
      if(Date.now()<this.cooldown)throw new RpcError('rate-limit','Wait for the provider’s Retry-After period.',this.cooldown-Date.now());
      // SDK retryCount is zero; only one retry for explicit server 5xx.
      for(let attempt=0;attempt<2;attempt++){
        try{return await this.perform(method,args,signal);}
        catch(e){if(e instanceof RpcError&&e.kind==='rate-limit')this.cooldown=Date.now()+e.retryAfterMs;if(!(e instanceof RpcError)||e.kind!=='transient'||attempt===1||signal?.aborted)throw e;}
      }
      throw new Error('Unreachable');
    });
    this.tail=job.then(()=>undefined,()=>undefined);return job;
  }
  private perform<M extends ViewMethod>(method:M,args:(bigint|string)[],signal?:AbortSignal):Promise<Observation<ViewResults[M]>> {
    return new Promise((resolve,reject)=>{
      const worker=this.factory();
      const finish=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);worker.terminate();};
      const cancel=()=>{finish();reject(new RpcError('cancelled','Read cancelled'));};
      const timer=setTimeout(()=>{finish();reject(new RpcError('timeout','RPC request timed out.'));},22000);
      signal?.addEventListener('abort',cancel,{once:true});
      worker.onerror=()=>{finish();reject(new RpcError('network','RPC worker unavailable.'));};
      worker.onmessage=e=>{finish();if(!e.data.ok){reject(new RpcError(e.data.error.kind,e.data.error.message,e.data.error.retryAfterMs));return;}try{resolve({data:decodeView(method,e.data.data),fetchedAt:e.data.fetchedAt,source:'live finalized'});}catch(error){reject(error);}};
      worker.postMessage({method,args});
    });
  }
  getIntent=(id:string,signal?:AbortSignal)=>this.read('get_intent',[uint(id)],signal);
  getCycle=(id:string,signal?:AbortSignal)=>this.read('get_cycle',[uint(id)],signal);
  getAssessment=(id:string,signal?:AbortSignal)=>this.read('get_assessment',[uint(id)],signal);
  getIntentsPage=(offset='0',limit=20,signal?:AbortSignal)=>this.read('get_intents_page',page(offset,limit),signal);
  getCyclesPage=(offset='0',limit=20,signal?:AbortSignal)=>this.read('get_cycles_page',page(offset,limit),signal);
  getOwnerRecords=(owner:string,offset='0',limit=20,signal?:AbortSignal)=>this.read('get_owner_records',[owner,...page(offset,limit)],signal);
  getProtocolStats=(offset='0',limit=50,signal?:AbortSignal)=>this.read('get_protocol_stats',page(offset,limit),signal);
}
export const api=new ReadApi();
