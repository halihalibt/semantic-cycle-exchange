import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const rpc='https://studio.genlayer.com/api';const contract='0x84e9284448D4cd16dcBBCbd8104449B11209C6F0';
const allowed=new Set(['get_protocol_stats','get_assessment','get_cycle','get_intent','get_intents_page','get_cycles_page','get_owner_records']);
const evidence={category:'current direct SDK finalized RPC observation (Node); not browser verification',timestamp:new Date().toISOString(),node:process.version,sdk:JSON.parse(readFileSync(new URL('./node_modules/genlayer-js/package.json',import.meta.url))).version,chain:{id:studionet.id,rpc:studionet.rpcUrls.default.http[0]},calls:[],status:'RUNNING'};
const native=globalThis.fetch;
globalThis.fetch=async(url,options)=>{
  const request=JSON.parse(options.body);assert.equal(String(url),rpc);assert.equal(request.method,'gen_call');assert.equal(request.params[0].type,'read');assert.equal(request.params[0].transaction_hash_variant,'latest-final');assert.equal(request.params[0].to,contract);
  const response=await native(url,{...options,signal:AbortSignal.timeout(20000)});
  evidence.calls.push({timestamp:new Date().toISOString(),url:String(url),request,httpStatus:response.status,retryAfter:response.headers.get('retry-after'),response:await response.clone().json()});
  if(!response.ok)throw new Error(`HTTP ${response.status}; no retry`);return response;
};
try {
 assert.equal(evidence.sdk,'1.1.8');assert.equal(studionet.id,61999);assert.equal(studionet.rpcUrls.default.http[0],rpc);
 const client=createClient({chain:studionet,endpoint:rpc});
 const calls=[['get_protocol_stats',[0n,50n]],['get_assessment',[1n]],['get_cycle',[1n]],['get_assessment',[2n]],['get_cycle',[2n]],['get_intent',[4n]],['get_intents_page',[0n,1n]],['get_cycles_page',[0n,1n]],['get_owner_records',['0x22Acaa233b7b985b36ef168F2DE9295334065B15',0n,1n]]];
 for(const [functionName,args] of calls){
  assert.ok(allowed.has(functionName));const decoded=await client.readContract({address:contract,functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL,jsonSafeReturn:true});evidence.calls.at(-1).decoded=decoded;
  console.log(`${functionName}(${args.join(',')}): decoded`);
 }
 const [stats,pos,cycle,neg,missing,intent]=evidence.calls.map(c=>c.decoded);
 assert.equal(stats.protocol,'SCA-3-V1');assert.equal(stats.network_id,61999);
 assert.equal(pos.assessment_id,1);assert.deepEqual(pos.decisions,['FIT','FIT','FIT']);assert.deepEqual(pos.intent_ids,[1,3,2]);assert.equal(pos.result,'MATCHED');
 assert.equal(cycle.status,'ACTIVE');assert.equal(cycle.confirmation_count,3);assert.deepEqual(cycle.confirmations,[true,true,true]);assert.equal(cycle.snapshot_id,pos.snapshot_id);assert.equal(pos.snapshot_id,'48e1c68d358f67368c5d8b478e9d450401be06cdf91e90b6b8b94932d2951ede');
 assert.equal(neg.assessment_id,2);assert.deepEqual(neg.decisions,['FIT','FIT','NO_FIT']);assert.equal(neg.result,'NOT_MATCHED');assert.equal(neg.cycle_id,0);assert.equal(neg.cycle_status,'NONE');assert.equal(missing.found,false);assert.equal(intent.intent_id,4);assert.ok(['OPEN','EXPIRED'].includes(intent.status));
 evidence.status='PASS';console.log('All seven public views and real positive/negative finalized identities: PASS');
}catch(e){evidence.status='BLOCKED';evidence.error=String(e);console.error(e);process.exitCode=1;}
finally{writeFileSync(new URL('../evidence/b1/live-sdk-reads.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');}
