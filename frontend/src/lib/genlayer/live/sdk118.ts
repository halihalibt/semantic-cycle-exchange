import { abi, createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { encodeFunctionData, toHex, type RpcTransactionRequest } from 'viem';
import { CONTRACT, NETWORK } from '../config';
import { address, type Provider } from '../../wallet/provider';
import { singleRequestBoundary } from '../../wallet/request-boundary';
import type { Identity } from '../transaction';
import type { prepareWrite } from '../write-spec';
import type { SubmissionPort } from '../staged/executor';
import { fingerprint, frozen } from '../staged/immutable';
import { zeroFeeBudget } from './zero-fee';
import type { ReadRpc } from './rpc';
import { quantity } from './rpc';
import type { SubmissionJournal } from './journal';
export function envelope(write: ReturnType<typeof prepareWrite>, identity: Identity) {
  const consensus=studionet.consensusMainContract;
  if(studionet.id!==NETWORK.id || studionet.rpcUrls.default.http[0]!==NETWORK.rpc || !consensus || identity.chain!=='61999' || address(write.address)!==address(CONTRACT))throw new Error('STUDIONET_SDK_CONFIG_MISMATCH');
  const data=encodeFunctionData({abi:consensus.abi,functionName:'addTransaction',args:[address(identity.account),write.address,BigInt(studionet.defaultNumberOfInitialValidators),BigInt(studionet.defaultConsensusMaxRotations),abi.transactions.serialize([abi.calldata.encode(abi.calldata.makeCalldataObject(write.functionName,write.args,undefined)),false])]});
  return frozen({to:consensus.address,data});
}
function rejection(error: unknown): unknown {
  let e=error;const seen=new Set<unknown>();
  while(e && typeof e==='object' && !seen.has(e)) {
    seen.add(e);if('code' in e && e.code===4001)return {code:4001,message:'USER_REJECTED'};
    e='cause' in e ? e.cause : undefined;
  }
  return error;
}
/** SDK 1.1.8 ABI/calldata/serialization and its supported request API.
 * Explicit envelope avoids writeContract's gas fallback and ABI retry.
 * Never supplies invented gas/fee options to writeContract. */
export function sdk118Submission(provider: Provider, identity: Identity, write: ReturnType<typeof prepareWrite>, revision: () => number, rpc: ReadRpc, journal: SubmissionJournal, now: () => number): SubmissionPort {
  let check: () => void =()=>{throw new Error('UNAPPROVED_REQUEST');};
  let expected: (RpcTransactionRequest & { chainId: '0xf22f' }) | undefined;
  const boundary=singleRequestBoundary(provider,identity.account,identity.revision,revision,write,tx=>{
    check();if(!expected || fingerprint(tx)!==fingerprint(expected))throw new Error('SDK_TRANSACTION_ENVELOPE_CHANGED');
  });
  const client=createClient({chain:studionet,account:address(identity.account) as `0x${string}`,provider:boundary});
  return {
    get forwarded(){return boundary.forwarded;},get knownHash(){return boundary.knownHash;},
    async submit(request,fee,finalCheck) {
      const plan=zeroFeeBudget(fee,fee.binding,now());
      if(fingerprint(request)!==fingerprint(write))throw new Error('TRANSACTION_PARAMETERS_CHANGED');
      const e=envelope(write,identity);
      const nonce=quantity(await rpc('eth_getTransactionCount',[identity.account,'pending']));
      finalCheck();
      expected={from:address(identity.account) as `0x${string}`,to:e.to,data:e.data,value:'0x0',gas:toHex(plan.gasUnits),nonce:toHex(nonce),type:'0x0',chainId:'0xf22f',gasPrice:'0x0'};
      check=()=>{finalCheck();zeroFeeBudget(plan,fee.binding,now());};
      return journal.attempt(identity.account,fingerprint([write,identity]),()=>boundary.forwarded,async()=>{
        check();
        try { return await client.request({method:'eth_sendTransaction',params:[expected!] }); }
        catch(e){throw rejection(e);}
      });
    },
  };
}
