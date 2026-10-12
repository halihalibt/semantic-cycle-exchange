import { useEffect, useRef, useState } from 'react';
import type { WalletBinding } from './lib/genlayer/live/runtime';
import { Discovery, type DiscoveredProvider } from './lib/wallet/provider';
import { WalletSession, type WalletState } from './lib/wallet/session';
import { matchingProvider, readPreference, rememberProvider } from './lib/wallet/preference';
export function WalletPanel({ onState, onBinding }: { onState?: (state: WalletState) => void; onBinding?: (binding: WalletBinding) => void } = {}) {
  const [providers, setProviders] = useState<readonly DiscoveredProvider[]>([]);
  const [selected, setSelected] = useState('');
  const [state, setState] = useState<WalletState>({ status: 'NOT_INSTALLED', revision: 0 });
  const session = useRef<WalletSession | null>(null);
  const changed = useRef(onState); changed.current = onState;
  const binding=useRef(onBinding);binding.current=onBinding;
  const selection=useRef<DiscoveredProvider | undefined>(undefined);
  const interacted=useRef(false);
  useEffect(() => {
    interacted.current=false;
    const preference=readPreference();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let restored: DiscoveredProvider | undefined;
    let attempted=false;
    const wallet = new WalletSession(next => { setState(next); changed.current?.(next); binding.current?.({state:next,provider:wallet.selectedProvider}); if (next.status === 'PROVIDER_UNAVAILABLE' || next.status === 'DISCONNECTED' && !wallet.selectedProvider) { setSelected('');rememberProvider(); } }); session.current = wallet;
    const discovery = new Discovery(window, items => {
      setProviders(items);
      if(!interacted.current && !attempted)wallet.discover(items.length);
      // Metadata is untrusted. Ambiguous/replaced providers never inherit a session.
      if(restored && matchingProvider(items,preference)?.provider!==restored.provider){wallet.disconnect();setSelected('');restored=undefined;}
      if(timer)clearTimeout(timer);
      if(interacted.current || attempted)return;
      timer=setTimeout(()=>{
        if(interacted.current)return;
        const found=matchingProvider(items,preference);
        if(!found){if(preference==='disconnected' || preference)wallet.disconnect();return;}
        attempted=true;restored=found;selection.current=found;setSelected(found.id);
        wallet.select(found.provider);void wallet.restore();
      },150);
    });
    discovery.start((window as Window & { ethereum?: unknown }).ethereum);
    return () => { if(timer)clearTimeout(timer);discovery.stop(); wallet.dispose(); session.current = null;selection.current=undefined; };
  }, []);
  function select(id: string) { interacted.current=true;rememberProvider();setSelected(id); const found = providers.find(p => p.id === id);selection.current=found; if (found) session.current?.select(found.provider); else session.current?.disconnect(); }
  async function connect() {
    interacted.current=true;
    const wallet=session.current,provider=selection.current;
    await wallet?.connect();
    if(wallet && wallet===session.current && provider?.provider===wallet.selectedProvider && ['CONNECTED','WRONG_NETWORK'].includes(wallet.state.status))rememberProvider(provider);
  }
  return <section className="wallet-foundation" aria-label="Optional wallet connection">
    <details><summary>{onBinding ? 'Wallet connection · manual transactions' : 'Optional wallet connection · writes disabled'}</summary>
      <p>Read-only pages work without a wallet. Provider names are self-reported and unverified.</p>
      {providers.length ? <label>Wallet provider<select value={selected} onChange={e => select(e.target.value)}><option value="">Select a wallet</option>{providers.map(p => <option key={p.id} value={p.id}>{p.name} · {p.id}</option>)}</select></label> : <p>No compatible browser wallet discovered.</p>}
      <p role="status">{state.status.replaceAll('_', ' ')}{state.chain && ` · Chain ${state.chain}`}</p>
      {state.account && <code>{state.account}</code>}
      {state.status === 'WRONG_NETWORK' && <p>Stable Studionet 61999 is required. No automatic network change is performed.</p>}
      {state.error && <p role="alert">{state.error.message} ({state.error.source}{state.error.code ? ` ${state.error.code}` : ''})</p>}
      <button disabled={!selected || state.status === 'CONNECTING'} onClick={() => { void connect(); }}>Connect / verify wallet</button>
      <button onClick={() => { interacted.current=true;rememberProvider();session.current?.disconnect();selection.current=undefined;setSelected(''); }}>Disconnect locally</button>
      <p>Disconnect clears this app’s session; it does not revoke wallet permissions. {onBinding ? 'Transactions require fresh preflight and a separate explicit confirmation.' : 'Signing and transaction submission are disabled.'}</p>
    </details>
  </section>;
}
