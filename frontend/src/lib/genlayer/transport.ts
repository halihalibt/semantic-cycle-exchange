import { CONTRACT, NETWORK } from './config';
export class RpcError extends Error {constructor(public kind:string,message:string,public retryAfterMs=0){super(message);this.name='RpcError';}}
export function retryDelay(header:string|null,now=Date.now()):number {if(!header)return 0;const seconds=Number(header);return Number.isFinite(seconds)?Math.max(0,seconds*1000):Math.max(0,Date.parse(header)-now)||0;}
export function guardedFetch(native:typeof fetch,signal:AbortSignal):typeof fetch {
  return async(input,init)=>{
    if(String(input)!==NETWORK.rpc||init?.method!=='POST'||typeof init.body!=='string')throw new RpcError('boundary','RPC boundary rejected request');
    const body=JSON.parse(init.body);
    if(body.method!=='gen_call'||body.params?.[0]?.type!=='read'||body.params[0].to!==CONTRACT||body.params[0].transaction_hash_variant!=='latest-final')throw new RpcError('boundary','Only finalized contract reads are permitted');
    let response:Response;
    try{response=await native(input,{...init,signal});}catch(e){if(signal.aborted)throw new RpcError('timeout','RPC request timed out or was cancelled.');throw new RpcError('network',e instanceof Error?e.message:'RPC unavailable');}
    if(response.status===429)throw new RpcError('rate-limit','RPC rate limit reached. Please wait before refreshing.',retryDelay(response.headers.get('retry-after')));
    if(!response.ok)throw new RpcError(response.status>=500?'transient':'http',`RPC HTTP ${response.status}`);
    return response;
  };
}
