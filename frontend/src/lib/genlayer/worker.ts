import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';
import { NETWORK, CONTRACT, type ViewMethod } from './config';
import { validateCall } from './validation';
import { guardedFetch, RpcError } from './transport';
// SDK 1.1.8 uses global fetch internally. This worker gives it an isolated,
// controlled transport without changing the package or the main page's fetch.
const scope=globalThis as unknown as {onmessage:(e:MessageEvent)=>void;postMessage:(data:unknown)=>void};
scope.onmessage=async(event:MessageEvent<{method:ViewMethod;args:(bigint|string)[]}>)=>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
  globalThis.fetch=guardedFetch(globalThis.fetch.bind(globalThis),controller.signal);
  try {
    validateCall(event.data.method,event.data.args);
    if(studionet.id!==NETWORK.id||studionet.rpcUrls.default.http[0]!==NETWORK.rpc)throw new RpcError('boundary','Installed chain preset mismatch');
    const client=createClient({chain:studionet,endpoint:NETWORK.rpc});
    const data=await client.readContract({address:CONTRACT,functionName:event.data.method,args:event.data.args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL,jsonSafeReturn:true});
    scope.postMessage({ok:true,data,fetchedAt:new Date().toISOString()});
  } catch(e){scope.postMessage({ok:false,error:{kind:e instanceof RpcError?e.kind:'rpc',message:e instanceof Error?e.message:String(e),retryAfterMs:e instanceof RpcError?e.retryAfterMs:0}});}
  finally{clearTimeout(timer);}
};
