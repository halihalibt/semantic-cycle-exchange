import { useRead } from '../../hooks';
import { api } from '../../lib/genlayer/api';
import { Badge, JsonDetails, ReadState } from '../../components';
import { verifyAssessment } from '../cycles/model';
export function AssessmentViewer({id}: {id:string}) {
  const state=useRead(async signal=>{const r=await api.getAssessment(id,signal);if(r.data.found){if(r.data.assessment_id!==id)throw new Error('ASSESSMENT_MISMATCH');verifyAssessment(r.data);}return r;});const a=state.data?.data;
  return <><section className="page-header"><h1>AI Assessment #{id}</h1><p className="lead">Read an actual assessment by ID. The contract has no assessment pagination endpoint.</p></section><form action="" method="get"><input type="hidden" name="view" value="assessment"/><label>Assessment ID<input name="id" inputMode="numeric" required defaultValue={id}/></label><button>Read assessment</button></form>
    <ReadState state={state}>{a&&(a.found?<><p><Badge value={a.result}/></p><p>Canonical Intent order: {a.intent_ids.join(' → ')} · Versions: {a.versions.join(' / ')}</p>
      <div className="negative-vector">{a.edges.map((edge,i)=><div key={i}><span>Edge {i+1}: #{edge[0]} → #{edge[1]}</span><Badge value={a.decisions[i]}/></div>)}</div>
      {a.result==='NOT_MATCHED'&&<p className="notice">No Cycle was created. {a.edges.filter((_,i)=>a.decisions[i]!=='FIT').map(edge=>`Edge ${edge[0]} → ${edge[1]} is ${a.decisions[a.edges.indexOf(edge)]}.`).join(' ')} The contract records labels only; it returns no free-form AI explanation.</p>}
      <dl><dt>Snapshot ID</dt><dd><code>{a.snapshot_id}</code></dd><dt>Proposer</dt><dd><code>{a.proposer}</code></dd><dt>Prompt version</dt><dd>{a.prompt_version}</dd><dt>Prompt SHA256</dt><dd><code>{a.prompt_sha256}</code></dd><dt>Assessment ID</dt><dd>{a.assessment_id}</dd></dl>
      {a.cycle_id!=='0'?<a className="button" href={`?view=cycle&id=${a.cycle_id}`}>View actual Cycle #{a.cycle_id} ↗</a>:<p>No linked Cycle · cycle_id 0</p>}<JsonDetails value={a}/></>:<p>No Assessment found.</p>)}</ReadState></>;
}
