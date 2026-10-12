export type UInt = string;
export type IntentStatus = 'OPEN'|'RESERVED'|'CONSUMED'|'CANCELLED'|'EXPIRED';
export type CycleStatus = 'PENDING'|'ACTIVE'|'ABORTED'|'EXPIRED';
export type Term = [UInt,string,string,string,string,string,UInt,UInt,UInt];
export interface Intent { intent_id:UInt; owner:string; offer_description:string; offer_limitations:string; need_description:string; need_requirements:string; version:UInt; expires_at:UInt; status:IntentStatus; stored_status:IntentStatus; cycle_id:UInt }
export interface Cycle { cycle_id:UInt; snapshot_id:string; canonical_snapshot:string; terms:Term[]; intent_ids:UInt[]; owners:string[]; edges:UInt[][]; versions:UInt[]; confirmations:boolean[]; confirmation_count:UInt; created_at:UInt; confirmation_deadline:UInt; status:CycleStatus; stored_status:CycleStatus }
export interface Assessment { assessment_id:UInt; snapshot_id:string; canonical_snapshot:string; intent_ids:UInt[]; versions:UInt[]; edges:UInt[][]; decisions:('FIT'|'NO_FIT'|'UNSURE')[]; result:'MATCHED'|'NOT_MATCHED'; cycle_id:UInt; cycle_status:CycleStatus|'NONE'; assessed_at:UInt; proposer:string; prompt_version:string; prompt_sha256:string }
export type Found<T> = ({found:true}&T)|{found:false};
export interface Page<T> {records:T[];total:UInt;next_offset:UInt;has_more:boolean}
export interface OwnerRecords {owner:string;intents:Intent[];cycles:Cycle[];intent_total:UInt;cycle_total:UInt;next_offset:UInt;has_more:boolean;unfinished_count:UInt}
export interface Stats {protocol:string;network_id:UInt;intent_total:UInt;cycle_total:UInt;active_total:UInt;aborted_total:UInt;expired_cycles_cleaned:UInt;effective_intent_counts_page:Record<IntentStatus,UInt>;offset:UInt;next_offset:UInt;has_more:boolean;semantic_matching_available:boolean;assessment_total:UInt}
export interface ViewResults {get_intent:Found<Intent>;get_cycle:Found<Cycle>;get_assessment:Found<Assessment>;get_intents_page:Page<Intent>;get_cycles_page:Page<Cycle>;get_owner_records:OwnerRecords;get_protocol_stats:Stats}
export interface Observation<T> {data:T;fetchedAt:string;source:'live finalized';}
