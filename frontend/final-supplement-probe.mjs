// Read-only receipt supplement, discovered from real Explorer server-rendered table.
import {abi} from 'genlayer-js';
import {Buffer} from 'node:buffer';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=new URL('../evidence/final-delivery/',import.meta.url),rpc='https://studio.genlayer.com/api',contract='0x84e9284448D4cd16dcBBCbd8104449B11209C6F0';
const index=JSON.parse(readFileSync(new URL('onchain-index.json',out))),calls=JSON.parse(readFileSync(new URL('readonly-rpc-calls.json',out)));
const extra=[['create-8','create_intent','0x86c6fb22e5e44dd6365e121efa6efeaa8b5232b9bea26de3fd4cf59c1e5dc9f5'],['cancel-8','cancel_intent','0xbc0cf2b63958b9000bb80b0c6a15933584ab8fc33737eef7a66fa058dfc2b349'],['create-14','create_intent','0x7bab2d243d4a983f999234b9fc1c8d3478bfa82dfe324352e6d264196c3e42a2'],['assessment-5-cycle-4','assess_cycle','0xd8157fec047a37150356dc22c8f8f2d8ca8c5518319ba58b5b7b5d9ada069c2b']];
const clean=v=>typeof v==='bigint'?v.toString():v instanceof Map?Object.fromEntries([...v].map(([k,x])=>[k,clean(x)])):Array.isArray(v)?v.map(clean):v;
const save=(file,v)=>{const text=JSON.stringify(v,null,2)+'\n';writeFileSync(new URL(file,out),text);return createHash('sha256').update(text).digest('hex');};
for(const [label,method,hash] of extra){
 if(index.records.some(r=>r.hash===hash))continue;
 const request={jsonrpc:'2.0',id:1,method:'eth_getTransactionByHash',params:[hash]};
 const response=await fetch(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(20000),redirect:'error'});const body=await response.json();assert.ok(response.ok&&!body.error&&body.result);
 calls.push({timestamp:new Date().toISOString(),request,httpStatus:response.status,response:body});const tx=body.result;
 assert.equal(tx.hash,hash);assert.equal(tx.to_address.toLowerCase(),contract.toLowerCase());assert.equal(tx.status,'FINALIZED');assert.equal(tx.result_name,'MAJORITY_AGREE');
 const call=abi.calldata.decode(Uint8Array.from(Buffer.from(tx.data.calldata,'base64')));assert.ok(call instanceof Map);assert.equal(call.get('method'),method);
 const leaders=Array.isArray(tx.consensus_data.leader_receipt)?tx.consensus_data.leader_receipt:[tx.consensus_data.leader_receipt],leader=leaders.find(x=>x?.mode==='leader');assert.equal(leader.execution_result,'SUCCESS');
 const encoded=Buffer.from(leader.result,'base64');assert.equal(encoded[0],0);const result=clean(abi.calldata.decode(encoded.subarray(1)));
 if(label==='create-8')assert.equal(result,'8');if(label==='cancel-8')assert.deepEqual(clean(call.get('args')),['8','1']);if(label==='create-14')assert.equal(result,'14');if(label==='assessment-5-cycle-4')assert.deepEqual(result,{assessment_id:'5',cycle_id:'4',result:'MATCHED'});
 const sha256=save(label+'.json',{timestamp:new Date().toISOString(),rpc,transaction:tx});index.records.push({label,hash,method,account:tx.from_address,contract:tx.to_address,args:clean(call.get('args')),status:tx.status,consensus:tx.result_name,execution:leader.execution_result,result,votes:tx.consensus_data.votes,rounds:tx.num_of_rounds,path:label+'.json',sha256,verified:true});console.log(label,hash,'FINALIZED / MAJORITY_AGREE / SUCCESS',JSON.stringify(result));
}
index.cancelIntent8Hash=extra[1][2];index.supplemented_at_utc=new Date().toISOString();save('onchain-index.json',index);save('readonly-rpc-calls.json',calls);
