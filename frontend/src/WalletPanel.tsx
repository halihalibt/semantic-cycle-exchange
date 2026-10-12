import { useEffect, useRef, useState } from 'react';
import { Discovery, type DiscoveredProvider } from './lib/wallet/provider';
import { WalletSession, type WalletState } from './lib/wallet/session';
export function WalletPanel({ onState }: { onState?: (state: WalletState) => void } = {}) {
  const [providers, setProviders] = useState<readonly DiscoveredProvider[]>([]);
  const [selected, setSelected] = useState('');
  const [state, setState] = useState<WalletState>({ status: 'NOT_INSTALLED', revision: 0 });
  const session = useRef<WalletSession | null>(null);
  const changed = useRef(onState); changed.current = onState;
  useEffect(() => {
    const wallet = new WalletSession(next => { setState(next); changed.current?.(next); if (next.status === 'PROVIDER_UNAVAILABLE') setSelected(''); }); session.current = wallet;
    const discovery = new Discovery(window, items => { setProviders(items); wallet.discover(items.length); });
    discovery.start((window as Window & { ethereum?: unknown }).ethereum);
    return () => { discovery.stop(); wallet.dispose(); session.current = null; };
  }, []);
  function select(id: string) { setSelected(id); const found = providers.find(p => p.id === id); if (found) session.current?.select(found.provider); else session.current?.disconnect(); }
  return <section className="wallet-foundation" aria-label="Optional wallet connection">
    <details><summary>Optional wallet connection · writes disabled</summary>
      <p>Read-only pages work without a wallet. Provider names are self-reported and unverified.</p>
      {providers.length ? <label>Wallet provider<select value={selected} onChange={e => select(e.target.value)}><option value="">Select a wallet</option>{providers.map(p => <option key={p.id} value={p.id}>{p.name} · {p.id}</option>)}</select></label> : <p>No compatible browser wallet discovered.</p>}
      <p role="status">{state.status.replaceAll('_', ' ')}{state.chain && ` · Chain ${state.chain}`}</p>
      {state.account && <code>{state.account}</code>}
      {state.status === 'WRONG_NETWORK' && <p>Stable Studionet 61999 is required. No automatic network change is performed.</p>}
      {state.error && <p role="alert">{state.error.message} ({state.error.source}{state.error.code ? ` ${state.error.code}` : ''})</p>}
      <button disabled={!selected || state.status === 'CONNECTING'} onClick={() => { void session.current?.connect(); }}>Connect / verify wallet</button>
      <button onClick={() => { session.current?.disconnect(); setSelected(''); }}>Disconnect locally</button>
      <p>Disconnect clears this app’s session; it does not revoke wallet permissions. Signing and transaction submission are disabled.</p>
    </details>
  </section>;
}
