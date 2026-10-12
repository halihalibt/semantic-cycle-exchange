/** Test-only SDK bridge: deliberately absent from the production import graph.
 * The test harness must provide Mock Provider and deny outbound sockets/fetch. */
import { createClient, abi } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { encodeFunctionData } from 'viem';
import type { Identity } from '../transaction';
import type { prepareWrite } from '../write-spec';
import type { Provider } from '../../wallet/provider';
import { singleRequestBoundary } from '../../wallet/request-boundary';
import type { SubmissionPort } from './executor';
import type { StagedFee } from './fee-budget';
export function sdk118Rehearsal(provider: Provider, identity: Identity, write: ReturnType<typeof prepareWrite>, currentRevision: () => number): SubmissionPort {
  let check: () => void = () => { throw new Error('UNAPPROVED_REQUEST'); }, quote: StagedFee | undefined, gasVerified=false;
  const boundary=singleRequestBoundary(provider,identity.account,identity.revision,currentRevision,write,tx=>{
    check();
    if(!quote || !gasVerified || typeof tx.gas!=='string' || typeof tx.gasPrice!=='string' || BigInt(tx.gas)!==quote.gasUnits || BigInt(tx.gasPrice)!==quote.gasPriceWei)throw new Error('UNVERIFIED_GAS_BUDGET');
  });
  const client=createClient({chain:studionet,account:identity.account as `0x${string}`,provider:boundary});
  return {
    get forwarded(){return boundary.forwarded;}, get knownHash(){return boundary.knownHash;},
    async submit(request,fee,finalCheck){
      // 1.1.8 has no fee-distribution write arguments. Never silently discard one.
      if(fee.status!=='MOCK_ONLY' || fee.feeValueWei!==0n || fee.distribution.some(v=>v!==0n))throw new Error('SDK_118_DISTRIBUTION_UNSUPPORTED');
      // SDK writeContract captures an internal client; replacing the public estimator
      // does not intercept that closure. Verify an exact envelope explicitly and
      // refuse the fallback sentinel, even if a real estimate equals that value.
      if(fee.gasUnits===200000n)throw new Error('SDK_118_GAS_FALLBACK_AMBIGUOUS');
      const consensus=studionet.consensusMainContract!;
      const data=encodeFunctionData({abi:consensus.abi,functionName:'addTransaction',args:[identity.account,request.address,BigInt(studionet.defaultNumberOfInitialValidators),BigInt(studionet.defaultConsensusMaxRotations),abi.transactions.serialize([abi.calldata.encode(abi.calldata.makeCalldataObject(request.functionName,request.args,undefined)),false])]});
      gasVerified=false;
      const estimate=await client.estimateTransactionGas({from:identity.account as `0x${string}`,to:consensus.address,data,value:0n});
      if(estimate!==fee.gasUnits)throw new Error('UNVERIFIED_GAS_BUDGET');
      gasVerified=true;
      quote=fee;check=finalCheck;
      return client.writeContract({...request,value:0n,leaderOnly:false,consensusMaxRotations:studionet.defaultConsensusMaxRotations});
    },
  };
}
