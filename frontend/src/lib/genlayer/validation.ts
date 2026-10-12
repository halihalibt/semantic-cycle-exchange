import { METHODS, type ViewMethod, PROMPT_HASH } from './config';
import type { ViewResults } from './types';
const MAX = (1n<<64n)-1n;
export function uint(value:string,positive=true):bigint {
  if(!/^(0|[1-9]\d*)$/.test(value)) throw new Error('Use a whole decimal ID.');
  const n=BigInt(value);if(n<(positive?1n:0n)||n>MAX)throw new Error('Value is outside the unsigned 64-bit range.');return n;
}
export function page(offset:string,limit:number){ uint(offset,false);if(!Number.isInteger(limit)||limit<1||limit>50)throw new Error('Page limit must be 1–50.');return [BigInt(offset),BigInt(limit)]; }
export function validateCall(method:ViewMethod,args:(bigint|string)[]) {
  if(!METHODS.includes(method))throw new Error('Only the seven public views are allowed.');
  if(['get_intent','get_cycle','get_assessment'].includes(method)){if(args.length!==1||typeof args[0]!=='bigint')throw new Error('Invalid ID arguments');uint(String(args[0]));return;}
  if(method==='get_owner_records') {if(args.length!==3||typeof args[0]!=='string'||!/^0x[0-9a-fA-F]{40}$/.test(args[0]))throw new Error('Invalid owner');args=args.slice(1);}
  if(args.length!==2||typeof args[0]!=='bigint'||typeof args[1]!=='bigint')throw new Error('Invalid page arguments');
  uint(String(args[0]),false);if(args[1]<1n||args[1]>50n)throw new Error('Page limit must be 1–50.');
}
function normalize(v:unknown):unknown {
  if(typeof v==='number'){if(!Number.isSafeInteger(v)||v<0)throw new Error('Unsafe numeric return');return String(v);}
  if(typeof v==='bigint')return v.toString();
  if(Array.isArray(v))return v.map(normalize);
  if(v instanceof Map)return normalize(Object.fromEntries(v));
  if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,normalize(x)]));
  return v;
}
function obj(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('Malformed contract object');return v as Record<string,unknown>;}
function fields(r:Record<string,unknown>,names:string[],kind:'string'|'boolean'){for(const k of names)if(typeof r[k]!==kind)throw new Error(`Missing or invalid ${k}`);}
function integers(r:Record<string,unknown>,names:string[]){fields(r,names,'string');for(const k of names)uint(r[k] as string,false);}
function oneOf(r:Record<string,unknown>,k:string,values:string[]){if(!values.includes(String(r[k])))throw new Error(`Invalid ${k}`);}
function arr(r:Record<string,unknown>,k:string){if(!Array.isArray(r[k]))throw new Error(`Invalid ${k}`);return r[k] as unknown[];}
const intents=['OPEN','RESERVED','CONSUMED','CANCELLED','EXPIRED'];const cycles=['PENDING','ACTIVE','ABORTED','EXPIRED'];
function checkIntent(v:unknown){const r=obj(v);integers(r,['intent_id','version','expires_at','cycle_id']);fields(r,['owner','offer_description','offer_limitations','need_description','need_requirements'],'string');oneOf(r,'status',intents);oneOf(r,'stored_status',intents);}
function ring(r:Record<string,unknown>){for(const k of ['intent_ids','versions']){const a=arr(r,k);if(a.length!==3)throw new Error('Invalid ring');a.forEach(x=>uint(String(x)));}const e=arr(r,'edges');if(e.length!==3)throw new Error('Invalid edges');e.forEach((x,i)=>{if(!Array.isArray(x)||x.length!==2||x[0]!==arr(r,'intent_ids')[i]||x[1]!==arr(r,'intent_ids')[(i+1)%3])throw new Error('Invalid directed ring');});}
function checkCycle(v:unknown){const r=obj(v);integers(r,['cycle_id','confirmation_count','created_at','confirmation_deadline']);fields(r,['snapshot_id','canonical_snapshot'],'string');oneOf(r,'status',cycles);oneOf(r,'stored_status',cycles);ring(r);const flags=arr(r,'confirmations');if(flags.length!==3||flags.some(x=>typeof x!=='boolean')||String(flags.filter(Boolean).length)!==r.confirmation_count)throw new Error('Invalid confirmations');if(arr(r,'owners').length!==3)throw new Error('Invalid owners');for(const t of arr(r,'terms')){if(!Array.isArray(t)||t.length!==9||t.some(x=>typeof x!=='string'))throw new Error('Invalid terms');}if(arr(r,'terms').length!==3)throw new Error('Invalid terms');}
export function decodeView<M extends keyof ViewResults>(method:M,value:unknown):ViewResults[M]{
  const r=obj(normalize(value));
  if(['get_intent','get_cycle','get_assessment'].includes(method)){fields(r,['found'],'boolean');if(r.found===false)return r as unknown as ViewResults[M];}
  if(method==='get_intent')checkIntent(r);
  if(method==='get_cycle')checkCycle(r);
  if(method==='get_assessment'){integers(r,['assessment_id','cycle_id','assessed_at']);fields(r,['snapshot_id','canonical_snapshot','proposer','prompt_version','prompt_sha256'],'string');if(r.prompt_sha256!==PROMPT_HASH)throw new Error('Canonical prompt identity mismatch');ring(r);oneOf(r,'result',['MATCHED','NOT_MATCHED']);oneOf(r,'cycle_status',[...cycles,'NONE']);const d=arr(r,'decisions');if(d.length!==3||d.some(x=>!['FIT','NO_FIT','UNSURE'].includes(String(x))))throw new Error('Invalid decisions');if((d.every(x=>x==='FIT'))!==(r.result==='MATCHED')||(r.result==='NOT_MATCHED'&&(r.cycle_id!=='0'||r.cycle_status!=='NONE')))throw new Error('Contradictory assessment');}
  if(method==='get_protocol_stats'){fields(r,['protocol'],'string');integers(r,['network_id','intent_total','cycle_total','active_total','aborted_total','expired_cycles_cleaned','offset','next_offset','assessment_total']);fields(r,['has_more','semantic_matching_available'],'boolean');if(r.protocol!=='SCA-3-V1'||r.network_id!=='61999')throw new Error('Protocol identity mismatch');integers(obj(r.effective_intent_counts_page),intents);}
  if(method==='get_intents_page'||method==='get_cycles_page'){integers(r,['total','next_offset']);fields(r,['has_more'],'boolean');arr(r,'records').forEach(method==='get_intents_page'?checkIntent:checkCycle);}
  if(method==='get_owner_records'){fields(r,['owner'],'string');integers(r,['intent_total','cycle_total','next_offset','unfinished_count']);fields(r,['has_more'],'boolean');arr(r,'intents').forEach(checkIntent);arr(r,'cycles').forEach(checkCycle);}
  return r as unknown as ViewResults[M];
}
