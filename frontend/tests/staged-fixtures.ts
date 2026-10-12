import { vi } from 'vitest';
import { abi } from 'genlayer-js';
import { sha256, stringToHex } from 'viem';
import type { Cycle, Intent, Assessment, Term } from '../src/lib/genlayer/types';
import { CONTRACT, PROMPT_HASH } from '../src/lib/genlayer/config';
import { Transactions } from '../src/lib/genlayer/transaction';
import { WalletSession } from '../src/lib/wallet/session';
import type { Provider } from '../src/lib/wallet/provider';
import { prepareWrite, type WriteMethod, type WriteArgs } from '../src/lib/genlayer/write-spec';
import { StagedExecutor, type StagedDependencies, type SubmissionPort } from '../src/lib/genlayer/staged/executor';
import type { StagedFee } from '../src/lib/genlayer/staged/fee-budget';
import { intents, history, now, obs, owner } from './business-fixtures';
import { FakeProvider, MOCK_HASH } from './fake-provider';
export function canonical(terms: Term[]) {
  const text=JSON.stringify(['SCA-3-V1',61999,CONTRACT.toLowerCase(),terms.map(t=>t.map((v,i)=>[0,6,7,8].includes(i)?Number(v):v))]);
  return {canonical_snapshot:text,snapshot_id:sha256(stringToHex(text)).slice(2)};
}
export function pendingCycle(records: Intent[]): Cycle {
  const terms:Term[]=records.map((r,i)=>[r.intent_id,r.owner,r.offer_description,r.offer_limitations,r.need_description,r.need_requirements,r.version,r.expires_at,records[(i+1)%3].intent_id]);
  return {cycle_id:'1',...canonical(terms),terms,intent_ids:records.map(r=>r.intent_id),owners:records.map(r=>r.owner),edges:records.map((r,i)=>[r.intent_id,records[(i+1)%3].intent_id]),versions:records.map(r=>r.version),confirmations:[false,false,false],confirmation_count:'0',created_at:String(now-1000),confirmation_deadline:String(now-1000+3*86400),status:'PENDING',stored_status:'PENDING'};
}
export const samples: WriteArgs = {
  create_intent:['offer','','need','',String(now+7*86400)],update_intent:['1','2','new offer','new limits','new need','new req',String(now+8*86400)],cancel_intent:['1','2'],
  assess_cycle:[['1','3','2'],['2','2','2'],[['1','3'],['3','2'],['2','1']]],confirm_cycle:['1',''],decline_cycle:['1',''],expire_cycle:['1'],
};
export function base64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
export function rawReceipt(method: WriteMethod, args: WriteArgs[WriteMethod], value: unknown) {
  const write=prepareWrite(method,args);
  return {hash:MOCK_HASH,from_address:owner,to_address:CONTRACT,status:'FINALIZED',result_name:'MAJORITY_AGREE',leader_only:false,
    data:{calldata:base64(abi.calldata.encode(abi.calldata.makeCalldataObject(method,write.args,undefined)))},
    consensus_data:{leader_receipt:[{mode:'leader',execution_result:'SUCCESS',result:base64(Uint8Array.from([0,...abi.calldata.encode(value as Parameters<typeof abi.calldata.encode>[0])]))}]} };
}
export async function harness(method: WriteMethod='create_intent') {
  const transactions=new Transactions(), provider=new FakeProvider(); let selected:Provider|undefined=provider;
  const session=new WalletSession(()=>{},()=>transactions.invalidateIdentity());session.select(provider);await session.connect();
  let records=intents(), c=pendingCycle(records), assessment:Assessment|undefined, timestamp=now, available=true, policy='mock-policy-1', balance=100000n;
  if(['confirm_cycle','decline_cycle','expire_cycle'].includes(method))records=records.map(r=>({...r,status:'RESERVED',stored_status:'RESERVED',cycle_id:'1'}));
  if(method==='expire_cycle'){c={...c,created_at:String(now-3*86400-100),confirmation_deadline:String(now-100),status:'EXPIRED'};}
  const args=structuredClone(samples[method]);if(method==='confirm_cycle'||method==='decline_cycle')args[1]=c.snapshot_id;
  const ownerRecords=()=>({...history(),intents:records.filter(r=>r.owner===owner)});
  const reads={getIntent:vi.fn(async(id:string)=>obs(records.find(r=>r.intent_id===id)?{found:true as const,...records.find(r=>r.intent_id===id)!}:{found:false as const})),getCycle:vi.fn(async()=>obs({found:true as const,...c})),getAssessment:vi.fn(async()=>obs(assessment?{found:true as const,...assessment}:{found:false as const})),getOwnerRecords:vi.fn(async()=>obs(ownerRecords()))};
  const quote=vi.fn(async(binding:string):Promise<StagedFee|undefined>=>available?{status:'MOCK_ONLY',policy,binding,expiresAt:now+60,gasUnits:21000n,gasPriceWei:2n,feeValueWei:3n,distribution:[1n,1n,1n],coverage:{genvm:true,ai:true,validators:true,consensus:true,rotations:true,appeals:true}}:undefined);
  let forwarded=false, hash:unknown;const submit=vi.fn(async(_write,_fee,check:()=>void)=>{check();forwarded=true;hash=MOCK_HASH;return hash;});
  const port:SubmissionPort={get forwarded(){return forwarded;},get knownHash(){return hash;},submit};
  let receipt:unknown=rawReceipt(method,args,method==='create_intent'?7n:method==='update_intent'?3n:method==='assess_cycle'?{assessment_id:1n,result:'NOT_MATCHED',cycle_id:0n}:method==='confirm_cycle'||method==='expire_cycle'?true:null);
  const deps:StagedDependencies={mode:'MOCK_ONLY',reads,wallet:()=>({state:session.state,provider:selected}),quote,balance:vi.fn(async()=>balance),submission:vi.fn(()=>port),receipt:vi.fn(async()=>receipt),now:()=>timestamp,timeoutMs:50};
  const executor=new StagedExecutor(transactions,deps);
  return {executor,transactions,provider,session,reads,quote,submit,port,deps,args,method,
    get records(){return records;},set records(v:Intent[]){records=v;},get cycle(){return c;},set cycle(v:Cycle){c=v;},
    set assessment(v:Assessment){assessment=v;},set timestamp(v:number){timestamp=v;},set available(v:boolean){available=v;},set policy(v:string){policy=v;},set balance(v:bigint){balance=v;},set selected(v:Provider|undefined){selected=v;},set forwarded(v:boolean){forwarded=v;},set hash(v:unknown){hash=v;},set receipt(v:unknown){receipt=v;},get receipt(){return receipt;},
    async ready(){return executor.prepare('one',method,args,100000n);},async send(){const r=await this.ready();return executor.confirm('one',r.confirmation!,true);},
    applySuccess(){
      switch(method){
        case 'create_intent':records.push({...intents()[0],intent_id:'7',version:'1',offer_description:'offer',offer_limitations:'',need_description:'need',need_requirements:'',expires_at:String(now+7*86400)});break;
        case 'update_intent':records[0]={...records[0],version:'3',offer_description:'new offer',offer_limitations:'new limits',need_description:'new need',need_requirements:'new req',expires_at:String(now+8*86400)};break;
        case 'cancel_intent':records[0]={...records[0],status:'CANCELLED',stored_status:'CANCELLED',cycle_id:'0'};break;
        case 'assess_cycle':assessment={assessment_id:'1',...canonical(c.terms),intent_ids:c.intent_ids,versions:c.versions,edges:c.edges,decisions:['FIT','NO_FIT','UNSURE'],result:'NOT_MATCHED',cycle_id:'0',cycle_status:'NONE',assessed_at:String(now),proposer:owner,prompt_version:'SCA3-CANONICAL-CLASSIFICATION-V1',prompt_sha256:PROMPT_HASH};break;
        case 'confirm_cycle':c={...c,confirmations:[true,false,false],confirmation_count:'1'};break;
        case 'decline_cycle':case 'expire_cycle':c={...c,status:method==='decline_cycle'?'ABORTED':'EXPIRED',stored_status:method==='decline_cycle'?'ABORTED':'EXPIRED'};records=records.map(r=>({...r,status:'OPEN',stored_status:'OPEN',cycle_id:'0'}));break;
      }
    },
  };
}
