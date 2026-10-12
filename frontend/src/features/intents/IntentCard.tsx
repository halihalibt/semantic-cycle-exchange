import { Badge } from '../../components';
import type { Intent } from '../../lib/genlayer/types';
export function stamp(seconds: string) { const date = new Date(Number(seconds) * 1000); return Number.isNaN(date.getTime()) ? seconds : date.toLocaleString(); }
export function IntentCard({ item }: { item: Intent }) {
  return <article className="intent-card"><p className="eyebrow">INTENT #{item.intent_id} · VERSION {item.version}</p>
    <p>Effective <Badge value={item.status}/> · Stored <strong>{item.stored_status}</strong></p><code>{item.owner}</code>
    <h3>Offer</h3><p>{item.offer_description}</p><p>{item.offer_limitations || 'No limitations stated.'}</p>
    <h3>Need</h3><p>{item.need_description}</p><p>{item.need_requirements || 'No requirements stated.'}</p>
    <p>Expires {stamp(item.expires_at)}</p><p>{item.cycle_id !== '0' ? <a href={`?view=cycle&id=${item.cycle_id}`}>Linked Cycle #{item.cycle_id}</a> : 'No linked Cycle'}</p>
    <a href={`?view=intent&id=${item.intent_id}`}>Inspect / review changes ↗</a>
  </article>;
}
