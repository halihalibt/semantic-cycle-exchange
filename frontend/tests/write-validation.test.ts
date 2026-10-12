import { describe,it,expect } from 'vitest';
import { prepareWrite,validateText,WRITE_PARAMETERS,type WriteArgs,type WriteMethod,type TextFields } from '../src/lib/genlayer/write-spec';
import { validateAssessment,validateOwned,validateCapacity,validateExpiry,validatePending,validateCancellation,validateExpiration,DAY } from '../src/lib/genlayer/write-validation';
import type { Cycle,Intent,OwnerRecords } from '../src/lib/genlayer/types';
import { OWNER } from './fake-provider';
const now=1000000n, ctx={now:String(now),observedAt:String(now),marginSeconds:'30'};
const snapshot='a'.repeat(64);
const text:TextFields=['offer','limits','need','requirements'];
export const examples:WriteArgs={create_intent:[...text,'2000000'],update_intent:['1','2',...text,'2000000'],cancel_intent:['1','2'],assess_cycle:[['1','2','3'],['2','2','2'],[['1','2'],['2','3'],['3','1']]],confirm_cycle:['1',snapshot],decline_cycle:['1',snapshot],expire_cycle:['1']};
function intents():Intent[]{return [1,2,3].map((i)=>({intent_id:String(i),owner:`0x${String(i).repeat(40)}`,offer_description:'offer',offer_limitations:'limits',need_description:'need',need_requirements:'requirements',version:'2',expires_at:'2000000',status:'OPEN',stored_status:'OPEN',cycle_id:'0'}));}
function reservation(){const records=intents().map(r=>({...r,status:'RESERVED' as const,stored_status:'RESERVED' as const,cycle_id:'1'}));const cycle:Cycle={cycle_id:'1',snapshot_id:snapshot,canonical_snapshot:'contract-view-fixture',intent_ids:['1','2','3'],versions:['2','2','2'],edges:[['1','2'],['2','3'],['3','1']],owners:records.map(r=>r.owner),terms:records.map((r,i)=>[r.intent_id,r.owner,r.offer_description,r.offer_limitations,r.need_description,r.need_requirements,r.version,r.expires_at,String((i+1)%3+1)]),confirmations:[true,false,false],confirmation_count:'1',created_at:'900000',confirmation_deadline:'1159200',status:'PENDING',stored_status:'PENDING'};return {records,cycle};}
describe('canonical positional writes',()=>{
  it('has exactly seven methods and frozen argument names',()=>expect(WRITE_PARAMETERS).toEqual({create_intent:['offer_description','offer_limitations','need_description','need_requirements','expires_at'],update_intent:['intent_id','expected_version','offer_description','offer_limitations','need_description','need_requirements','expires_at'],cancel_intent:['intent_id','expected_version'],assess_cycle:['intent_ids','versions','edges'],confirm_cycle:['cycle_id','snapshot_id'],decline_cycle:['cycle_id','snapshot_id'],expire_cycle:['cycle_id']}));
  it.each(Object.keys(examples) as WriteMethod[])('%s arguments retain order',method=>{const p=prepareWrite(method,examples[method]);const decimal=JSON.parse(JSON.stringify(p.args,(_,x)=>typeof x==='bigint'?x.toString():x));expect(decimal).toEqual(examples[method]);expect(p.functionName).toBe(method);});
  it('preserves full u64',()=>expect(prepareWrite('cancel_intent',['18446744073709551615','18446744073709551615']).args).toEqual([18446744073709551615n,18446744073709551615n]));
  it.each(['0','-1','1.1','01','1e3','18446744073709551616',' 1','NaN'])('rejects integer %s',id=>expect(()=>prepareWrite('expire_cycle',[id])).toThrow());
  it('rejects unsafe Number input even through untyped boundary',()=>expect(()=>prepareWrite('expire_cycle',[9007199254740992] as unknown as [string])).toThrow());
  it('rejects unknown methods and wrong argument counts',()=>{expect(()=>prepareWrite('evil' as WriteMethod,[] as unknown as WriteArgs['expire_cycle'])).toThrow();expect(()=>prepareWrite('cancel_intent',['1'] as unknown as WriteArgs['cancel_intent'])).toThrow();});
  it.each(['x'.repeat(512),'中'.repeat(170)+'ab','😀'.repeat(128)])('accepts 512 UTF8 byte boundary %#',s=>expect(()=>validateText([s,'','need',''])).not.toThrow());
  it.each(['x'.repeat(513),'中'.repeat(171),'😀'.repeat(128)+'a','\ud800'])('rejects oversized or invalid Unicode %#',s=>expect(()=>validateText([s,'','need',''])).toThrow());
  it.each(['',' ','\u0085','\u001c'])('rejects blank descriptions %#',s=>expect(()=>validateText([s,'','need',''])).toThrow('EMPTY_DESCRIPTION'));
  it('allows empty optional fields and preserves BOM like Python',()=>expect(()=>validateText(['\ufeff','','need',''])).not.toThrow());
});
describe('advisory intent preflight',()=>{
  it('allows interior of 1–30 day interval only as advisory',()=>expect(validateExpiry(String(now+2n*DAY),ctx)).toEqual({advisoryOnly:true}));
  it.each([DAY,30n*DAY,DAY+20n,30n*DAY-20n])('requires fresh read near validity boundary %s',delta=>expect(()=>validateExpiry(String(now+delta),ctx)).toThrow('FRESH_READ_REQUIRED'));
  it.each([DAY-1n,30n*DAY+1n])('rejects invalid validity %s',delta=>expect(()=>validateExpiry(String(now+delta),ctx)).toThrow('INVALID_VALIDITY'));
  it('rejects stale time context',()=>expect(()=>validateExpiry('2000000',{...ctx,observedAt:'999900'})).toThrow('FRESH_READ_REQUIRED'));
  it('uses authoritative unfinished count, not one history page',()=>{const r={owner:OWNER,unfinished_count:'5',intents:[]} as unknown as OwnerRecords;expect(()=>validateCapacity(r,OWNER,ctx)).toThrow('OWNER_CAPACITY');expect(()=>validateCapacity({...r,unfinished_count:'4'},OWNER,ctx)).not.toThrow();});
  it('rejects owner mismatch',()=>expect(()=>validateOwned(intents()[1],'2','2',OWNER,ctx,true)).toThrow('UNAUTHORIZED'));
  it('rejects stale version',()=>expect(()=>validateOwned(intents()[0],'1','1',OWNER,ctx,true)).toThrow('STALE_VERSION'));
  it.each(['CONSUMED','CANCELLED','EXPIRED','RESERVED'] as const)('rejects update status %s',status=>expect(()=>validateOwned({...intents()[0],status,stored_status:status},'1','2',OWNER,ctx,true)).toThrow());
  it('rejects expired record and near deadline',()=>{expect(()=>validateOwned({...intents()[0],expires_at:ctx.now},'1','2',OWNER,ctx,true)).toThrow('INTENT_EXPIRED');expect(()=>validateOwned({...intents()[0],expires_at:String(now+10n)},'1','2',OWNER,ctx,true)).toThrow('FRESH_READ_REQUIRED');});
  it('rejects version overflow',()=>expect(()=>validateOwned({...intents()[0],version:'18446744073709551615'},'1','18446744073709551615',OWNER,ctx,true)).toThrow('VERSION_OVERFLOW'));
});
describe('topology and snapshots',()=>{
  it('topology is not an AI semantic result',()=>expect(validateAssessment(examples.assess_cycle,intents(),OWNER,ctx)).toEqual({topologyValid:true,semanticResult:'NOT_EVALUATED',replayCheck:'CONTRACT_ONLY'}));
  it('rejects duplicate IDs',()=>expect(()=>prepareWrite('assess_cycle',[['1','1','3'],['2','2','2'],[['1','1'],['1','3'],['3','1']]])).toThrow('DUPLICATE_INTENT'));
  it('rejects duplicate owners',()=>{const r=intents();r[1].owner=OWNER;expect(()=>validateAssessment(examples.assess_cycle,r,OWNER,ctx)).toThrow('DUPLICATE_OWNER');});
  it('rejects wrong direction',()=>expect(()=>prepareWrite('assess_cycle',[['1','2','3'],['2','2','2'],[['1','3'],['3','2'],['2','1']]])).toThrow('INVALID_RING'));
  it('rejects version and record misalignment',()=>{const r=intents();r[1].version='3';expect(()=>validateAssessment(examples.assess_cycle,r,OWNER,ctx)).toThrow('STALE_VERSION');expect(()=>validateAssessment(examples.assess_cycle,intents().reverse(),OWNER,ctx)).toThrow('INTENT_ORDER_MISMATCH');});
  it('rejects outsider and reserved assessment',()=>{expect(()=>validateAssessment(examples.assess_cycle,intents(),'0x'+'4'.repeat(40),ctx)).toThrow('UNAUTHORIZED');const r=intents();r[0].cycle_id='1';expect(()=>validateAssessment(examples.assess_cycle,r,OWNER,ctx)).toThrow('INTENT_UNAVAILABLE');});
  it('duplicate eligible confirmation is no-op; decline blocks snapshot',()=>{const {cycle,records}=reservation();expect(validatePending(cycle,snapshot,records,OWNER,ctx)).toEqual({duplicateConfirmation:true,declineBlocksIdenticalSnapshot:true});});
  it('requires actual snapshot returned by view',()=>{const {cycle,records}=reservation();expect(()=>validatePending(cycle,'b'.repeat(64),records,OWNER,ctx)).toThrow('SNAPSHOT_MISMATCH');});
  it('rejects mutated reservation terms',()=>{const {cycle,records}=reservation();records[1].offer_description='changed';expect(()=>validatePending(cycle,snapshot,records,OWNER,ctx)).toThrow('SNAPSHOT_MISMATCH');});
  it.each(['ACTIVE','ABORTED','EXPIRED'] as const)('rejects terminal confirm %s',status=>{const {cycle,records}=reservation();expect(()=>validatePending({...cycle,status,stored_status:status},snapshot,records,OWNER,ctx)).toThrow('CYCLE_NOT_PENDING');});
  it('reserved cancellation explicitly aborts eligible pending cycle',()=>{const r=reservation();expect(validateCancellation(r.records[0],'1','2',OWNER,ctx,r)).toEqual({abortsPendingCycle:true});expect(()=>validateCancellation(r.records[0],'1','2',OWNER,ctx)).toThrow('RESERVATION_MISMATCH');});
  it('overdue reserved cancellation waits for permissionless cleanup',()=>{const r=reservation();r.cycle.confirmation_deadline=ctx.now;expect(()=>validateCancellation(r.records[0],'1','2',OWNER,ctx,r)).toThrow('INTENT_EXPIRED');});
  it('expiration distinguishes effective and stored expired, repeats false',()=>{const {cycle}=reservation();const effective={...cycle,status:'EXPIRED' as const,confirmation_deadline:'999900'};expect(validateExpiration(effective,ctx)).toEqual({expectedNoop:false,permissionless:true});expect(validateExpiration({...effective,stored_status:'EXPIRED'},ctx)).toEqual({expectedNoop:true,permissionless:true});});
  it('expiration rejects before deadline and fails closed at boundary',()=>{const {cycle}=reservation();expect(()=>validateExpiration(cycle,ctx)).toThrow('DEADLINE_NOT_REACHED');expect(()=>validateExpiration({...cycle,confirmation_deadline:ctx.now},ctx)).toThrow('FRESH_READ_REQUIRED');});
});
