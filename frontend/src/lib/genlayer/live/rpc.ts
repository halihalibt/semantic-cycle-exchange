import { NETWORK } from '../config';
import type { prepareWrite } from '../write-spec';
import type { Identity } from '../transaction';
import { address } from '../../wallet/provider';
import { envelope } from './sdk118';
import type { ZeroFeePlan } from './zero-fee';
export type RpcMethod = 'eth_estimateGas' | 'eth_gasPrice' | 'eth_getTransactionCount' | 'eth_getTransactionByHash';
export type ReadRpc = (method: RpcMethod, params: unknown[]) => Promise<unknown>;
const methods: readonly string[] = ['eth_estimateGas','eth_gasPrice','eth_getTransactionCount','eth_getTransactionByHash'];
export function readRpc(native: typeof fetch = globalThis.fetch.bind(globalThis)): ReadRpc {
  let id=0;
  return async(method,params) => {
    if(!methods.includes(method)) throw new Error('READ_RPC_METHOD_BLOCKED');
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),20000), requestId=++id;
    try {
      const response=await native(NETWORK.rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:requestId,method,params}),signal:controller.signal,redirect:'error'});
      if(!response.ok)throw new Error(`READ_RPC_HTTP_${response.status}`);
      const data=await response.json();
      if(!data || data.jsonrpc!=='2.0' || data.id!==requestId || data.error || !Object.hasOwn(data,'result'))throw new Error('READ_RPC_INVALID_RESPONSE');
      return data.result;
    } finally {clearTimeout(timer);}
  };
}
export function quantity(value: unknown): bigint {
  if(typeof value!=='string' || !/^0x(?:0|[1-9a-f][\da-f]*)$/i.test(value)) throw new Error('INVALID_RPC_QUANTITY');
  return BigInt(value);
}
export async function zeroFeePlan(rpc: ReadRpc, binding: string, write: ReturnType<typeof prepareWrite>, identity: Identity, now: () => number): Promise<ZeroFeePlan> {
  if(identity.chain!=='61999')throw new Error('STUDIONET_ONLY');
  const e=envelope(write,identity);
  // A failed estimate throws. A genuine estimate of 200000 is accepted with provenance.
  const gasUnits=quantity(await rpc('eth_estimateGas',[{from:address(identity.account),to:e.to,data:e.data,value:'0x0'}]));
  const gasPrice=quantity(await rpc('eth_gasPrice',[]));
  if(gasPrice!==0n)throw new Error('STUDIONET_ZERO_GAS_PRICE_REQUIRED');
  if(gasUnits<=0n || gasUnits>30000000n)throw new Error('INVALID_GAS_LIMIT');
  return {status:'USER_CONFIRMED_STUDIONET_ZERO_FEE',chain:61999,binding,expiresAt:now()+30,gasUnits,gasPriceWei:0n,nativeValue:0n};
}
