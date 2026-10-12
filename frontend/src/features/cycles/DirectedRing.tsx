import type { Intent, Term } from '../../lib/genlayer/types';
export function DirectedRing({records}: {records:Intent[]}) {
  if (records.length !== 3) return null;
  return <div className="edges" aria-label="Directed three-party exchange">{records.map((r,i)=><article key={i}><p className="eyebrow">EDGE {i+1} · #{r.intent_id} → #{records[(i+1)%3].intent_id}</p><code>{r.owner}</code><p>Version {r.version} · Effective {r.status} · Stored {r.stored_status} · Expires at {r.expires_at}</p><h3>Provides</h3><p>{r.offer_description}</p><p>{r.offer_limitations}</p><h3>Recipient needs</h3><p>{records[(i+1)%3].need_description}</p><p>{records[(i+1)%3].need_requirements}</p></article>)}</div>;
}
export function FrozenTerms({terms,confirmations}: {terms:Term[];confirmations:boolean[]}) {
  return <div className="edges">{terms.map((t,i)=><article key={t[0]}><p className="eyebrow">CANONICAL OWNER {i+1} · #{t[0]} → #{t[8]}</p><code>{t[1]}</code><p>Version {t[6]} · Confirmation: {String(confirmations[i])}</p><h3>Frozen offer</h3><p>{t[2]}</p><p>{t[3]}</p><h3>Frozen need</h3><p>{t[4]}</p><p>{t[5]}</p><p>Expires at {t[7]}</p></article>)}</div>;
}
