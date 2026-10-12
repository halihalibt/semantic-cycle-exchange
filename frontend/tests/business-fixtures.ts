import type { Cycle, Intent, Observation, OwnerRecords } from '../src/lib/genlayer/types';
import type { WalletState } from '../src/lib/wallet/session';
export const owner = '0x'+'1'.repeat(40);
export const wallet:WalletState = {status:'CONNECTED',account:owner,chain:'61999',revision:3};
export const now=2000000000;
export const ctx={now:String(now),observedAt:String(now),marginSeconds:'30'};
export const obs=<T,>(data:T):Observation<T>=>({data,fetchedAt:new Date(now*1000).toISOString(),source:'live finalized'});
export function intents():Intent[]{return [1,3,2].map(i=>({intent_id:String(i),owner:'0x'+String(i).repeat(40),offer_description:'Offer '+i,offer_limitations:'Limits '+i,need_description:'Need '+i,need_requirements:'Requirements '+i,version:'2',expires_at:String(now+7*86400),status:'OPEN',stored_status:'OPEN',cycle_id:'0'}));}
export function reservation(){const records=intents().map(r=>({...r,status:'RESERVED' as const,stored_status:'RESERVED' as const,cycle_id:'1'}));const cycle:Cycle={cycle_id:'1',snapshot_id:'a'.repeat(64),canonical_snapshot:'mock contract snapshot',terms:records.map((r,i)=>[r.intent_id,r.owner,r.offer_description,r.offer_limitations,r.need_description,r.need_requirements,r.version,r.expires_at,records[(i+1)%3].intent_id]),intent_ids:records.map(r=>r.intent_id),owners:records.map(r=>r.owner),edges:records.map((r,i)=>[r.intent_id,records[(i+1)%3].intent_id]),versions:records.map(r=>r.version),confirmations:[true,false,false],confirmation_count:'1',created_at:String(now-1000),confirmation_deadline:String(now+86400),status:'PENDING',stored_status:'PENDING'};return {cycle,records};}
export function history():OwnerRecords{return {owner,intents:intents().filter(i=>i.owner===owner),cycles:[],intent_total:'1',cycle_total:'0',unfinished_count:'1',next_offset:'1',has_more:false};}
