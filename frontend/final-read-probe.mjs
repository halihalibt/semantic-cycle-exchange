// Read-only evidence closure. Only eth_getTransactionByHash and latest-final gen_call.
import {createClient,abi} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import {writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Buffer} from 'node:buffer';
import assert from 'node:assert/strict';
const rpc='https://studio.genlayer.com/api',contract='0x84e9284448D4cd16dcBBCbd8104449B11209C6F0';
const out=new URL('../evidence/final-delivery/',import.meta.url);mkdirSync(out,{recursive:true});
const transactions=[
 ['create-7','create_intent','0x52923b7ccf1ab4cc568f1f87846083c17c3ee2e519904857782a766f184661fa'],
 ['update-7','update_intent','0x1be34dde1a051205063c3312deb0935be3745670e2fbdbb3188e1ebb425c24c6'],
 ['create-9','create_intent','0xd18ac0762e3ff379560fd5e8f980295982134837962c054bfbb3d1c9d5bf7f05'],
 ['create-10','create_intent','0x7daac86d3e17f5ccd637972610c56cf7cfd268f45f2f8dd3030677679331bfcf'],
 ['assessment-3','assess_cycle','0x29b2a75465b46864eb3bfdeadf4c54c3739c118c15099a4c8453dcd91eb46c48'],
 ['confirm-2-a','confirm_cycle','0xb0cf0ea42ea3901d12e3f99e46bf689f667df70fb480ad384551aacea36568ed'],
 ['confirm-2-b','confirm_cycle','0x9694ff7b0a43ce2f40b22d7ad000b1914150a499dbe98eeca91669d513a90876'],
 ['confirm-2-c','confirm_cycle','0x49d8ffb9d9d4b887110f44a1d0576fd7948c0d0dfec86bcce06ca837592a936e'],
 ['create-11','create_intent','0xb1ea3ba9ba4e267f534098987d1cd1421788233d6547d305f12b7683cad867ba'],
 ['create-12','create_intent','0xc88df37d8b481b71e1bd93b98e0989455f0263ea0350e4457c8c74c4a328eb71'],
 ['create-13','create_intent','0x7b6d3553c21987b829a1dda41c355890f8df301dbeb740caaa5e65623516f55e'],
 ['assessment-4','assess_cycle','0x32f3a6f3f5a59c4a48cbca57ecda61bd36fd57789c5f0c3142ed6e3bf06ae26e'],
 ['decline-3','decline_cycle','0xfd9abb76faae58049ebb86049c1712c52f21238b198b5e4f15c65f98aaf81c7a']
];
const clean=v=>typeof v==='bigint'?v.toString():v instanceof Map?Object.fromEntries([...v].map(([k,x])=>[k,clean(x)])):Array.isArray(v)?v.map(clean):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clean(x)])):v;
const save=(file,v)=>{const text=JSON.stringify(clean(v),null,2)+'\n';writeFileSync(new URL(file,out),text);return createHash('sha256').update(text).digest('hex');};
const native=globalThis.fetch;let sequence=0;const calls=[];
globalThis.fetch=async(url,options)=>{
 assert.equal(String(url),rpc);const request=JSON.parse(options.body);assert.ok(['eth_getTransactionByHash','gen_call'].includes(request.method));
 if(request.method==='gen_call'){assert.equal(request.params[0].type,'read');assert.equal(request.params[0].transaction_hash_variant,'latest-final');assert.equal(request.params[0].to,contract);}
 const response=await native(url,{...options,signal:AbortSignal.timeout(20000),redirect:'error'});const data=await response.clone().json();calls.push({timestamp:new Date().toISOString(),request,httpStatus:response.status,response:data});return response;
};
const records=[];
// Two at a time, never send transactions.
for(let i=0;i<transactions.length;i+=2)await Promise.all(transactions.slice(i,i+2).map(async([label,expected,hash])=>{
 try{
  const response=await fetch(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:++sequence,method:'eth_getTransactionByHash',params:[hash]})});const body=await response.json();if(!response.ok||body.error||!body.result)throw new Error(JSON.stringify(body.error??body));
  const tx=body.result;const sha256=save(label+'.json',{timestamp:new Date().toISOString(),rpc,transaction:tx});
  const call=abi.calldata.decode(Uint8Array.from(Buffer.from(tx.data.calldata,'base64')));assert.ok(call instanceof Map);assert.equal(call.get('method'),expected);assert.equal(tx.hash,hash);assert.equal(tx.to_address.toLowerCase(),contract.toLowerCase());
  const leaders=Array.isArray(tx.consensus_data.leader_receipt)?tx.consensus_data.leader_receipt:[tx.consensus_data.leader_receipt];
  const leader=leaders.find(r=>r?.mode==='leader');const encoded=Buffer.from(leader.result,'base64');
  const result=encoded[0]===0?clean(abi.calldata.decode(encoded.subarray(1))):'UNKNOWN';
  records.push({label,hash,method:call.get('method'),account:tx.from_address,contract:tx.to_address,args:clean(call.get('args')),status:tx.status,consensus:tx.result_name,execution:leader.execution_result,result,votes:tx.consensus_data.votes,rounds:tx.num_of_rounds,path:label+'.json',sha256,verified:tx.status==='FINALIZED'&&tx.result_name==='MAJORITY_AGREE'&&leader.execution_result==='SUCCESS'});console.log(label,tx.status,tx.result_name,leader.execution_result);
 }catch(e){records.push({label,hash,status:'UNKNOWN',error:String(e)});console.log(label,'UNKNOWN',String(e));}
}));
const reads=[];const client=createClient({chain:studionet,endpoint:rpc});
for(const [method,ids] of [['get_cycle',[1,2,3,4]],['get_assessment',[3,4]],['get_intent',[7,8,9,10,11,12,13,14]]]){
 for(const id of ids){try{const result=await client.readContract({address:contract,functionName:method,args:[BigInt(id)],transactionHashVariant:TransactionHashVariant.LATEST_FINAL,jsonSafeReturn:true});reads.push({method,id,result:clean(result)});console.log(method,id,result.status??result.result);}catch(e){reads.push({method,id,status:'UNKNOWN',error:String(e)});}}
}
save('readonly-rpc-calls.json',calls);save('onchain-index.json',{timestamp:new Date().toISOString(),provenance:'WORK independently retrieved read-only Studio RPC; original UI actions USER-EXECUTED',contract,chain:61999,records,reads,cancelIntent8Hash:'UNKNOWN / not supplied',expiration:'LIVE EXPIRATION POSITIVE TEST — NOT RUN / TIME-GATED'});
