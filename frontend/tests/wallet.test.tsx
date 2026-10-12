import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Discovery, chainId, providerError, isProvider, type DiscoveredProvider } from '../src/lib/wallet/provider';
import { WalletSession } from '../src/lib/wallet/session';
import { WalletPanel } from '../src/WalletPanel';
import { FakeProvider, OWNER } from './fake-provider';
function announce(target: EventTarget, provider: unknown, name = 'MetaMask', uuid = '11111111-1111-4111-8111-111111111111') {
  target.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: { provider, info: { uuid, name, rdns: 'io.metamask', icon: '<svg onload="alert(1)"/>' } } }));
}
describe('provider discovery', () => {
  it('no provider and no automatic requests', () => { const changes = vi.fn(); const d = new Discovery(new EventTarget(), changes); d.start(); expect(changes).toHaveBeenLastCalledWith([]); d.stop(); });
  it('legacy fallback never auto-connects', () => { const p = new FakeProvider(), change = vi.fn(), d = new Discovery(new EventTarget(), change); d.start(p); expect(change.mock.lastCall?.[0][0].legacy).toBe(true); expect(p.request).not.toHaveBeenCalled(); d.stop(); });
  it('multiple providers, duplicates, spoofed UUID do not replace selection', () => {
    const target = new EventTarget(), p = new FakeProvider(), q = new FakeProvider(); let found: readonly DiscoveredProvider[] = [];
    const d = new Discovery(target, x => { found = x; }); d.start(); announce(target,p); announce(target,p); announce(target,q,'OKX');
    expect(found).toHaveLength(2); expect(found[0].provider).toBe(p); expect(found[1].provider).toBe(q); expect(found[0].id).not.toBe(found[1].id); expect(found[0]).not.toHaveProperty('icon'); d.stop();
    announce(target,new FakeProvider()); expect(found).toHaveLength(2);
  });
  it('announcements supersede fallback metadata without duplicate providers', () => { const p = new FakeProvider(), target = new EventTarget(), cb = vi.fn(), d = new Discovery(target,cb); d.start(p); announce(target,p); expect(cb.mock.lastCall?.[0]).toHaveLength(1); expect(cb.mock.lastCall?.[0][0].legacy).toBe(false); d.stop(); });
  it('ignores invalid providers and metadata', () => { const target = new EventTarget(), cb = vi.fn(), d = new Discovery(target,cb); d.start(); announce(target,{}); announce(target,new FakeProvider(),'','bad'); expect(cb).toHaveBeenCalledTimes(1); expect(isProvider({request:()=>{}})).toBe(false); d.stop(); });
});
describe('session identity', () => {
  it('explicit selection and user-triggered connection only', async () => { const p = new FakeProvider(), q = new FakeProvider(), s = new WalletSession(vi.fn()); s.discover(2); expect(s.state.status).toBe('DISCOVERED'); s.select(q); expect(q.request).not.toHaveBeenCalled(); await s.connect(); expect(s.state).toMatchObject({status:'CONNECTED',account:OWNER,chain:'61999'}); expect(p.request).not.toHaveBeenCalled(); s.dispose(); expect(q.listenerCount).toBe(0); });
  it.each([4001,4100,4900,4901])('classifies provider code %s',async code=>{const p=new FakeProvider(),s=new WalletSession(vi.fn());s.select(p);p.request.mockRejectedValue({code});await s.connect();expect(s.state.error).toMatchObject({source:'provider',code});expect(s.state.status).not.toBe('CONNECTED');s.dispose();});
  it('separates app errors',()=>expect(providerError(new Error('APP_INVALID_CHAIN'))).toEqual({source:'application',message:'APP_INVALID_CHAIN'}));
  it.each(['0x1','0xf22f'])('checks chain %s',async chain=>{const p=new FakeProvider(),s=new WalletSession(vi.fn());p.chain=chain;s.select(p);await s.connect();expect(s.state.status).toBe(chain==='0x1'?'WRONG_NETWORK':'CONNECTED');s.dispose();});
  it.each(['61999','0xzz','-0x1','0x','0x10000000000000000'])('rejects invalid hex %s',chain=>expect(()=>chainId(chain)).toThrow());
  it.each(['accountsChanged','chainChanged','connect','disconnect'])('invalidates identity on %s',async event=>{const p=new FakeProvider(),invalidate=vi.fn(),s=new WalletSession(vi.fn(),invalidate);s.select(p);await s.connect();const rev=s.state.revision;p.emit(event,event==='chainChanged'?'0x1':undefined);expect(s.state.revision).toBeGreaterThan(rev);expect(s.state.account).toBeUndefined();expect(invalidate).toHaveBeenCalled();if(event==='disconnect')expect(p.listenerCount).toBe(0);s.dispose();});
  it('ignores late connection completion after account switch',async()=>{const p=new FakeProvider(),s=new WalletSession(vi.fn());let resolve!:(x:unknown)=>void;p.request.mockImplementationOnce(()=>new Promise(r=>{resolve=r;}));s.select(p);const connecting=s.connect();p.emit('accountsChanged',[]);resolve([OWNER]);await connecting;expect(s.state.status).toBe('DISCONNECTED');s.dispose();});
  it('double connect does not request permission twice',async()=>{const p=new FakeProvider(),s=new WalletSession(vi.fn());s.select(p);await Promise.all([s.connect(),s.connect()]);expect(p.request.mock.calls.filter(([r])=>r.method==='eth_requestAccounts')).toHaveLength(1);s.disconnect();expect(p.listenerCount).toBe(0);expect(s.state.account).toBeUndefined();});
  it('disconnect during connection cannot restore old account',async()=>{const p=new FakeProvider(),s=new WalletSession(vi.fn());s.select(p);const promise=s.connect();s.disconnect();await promise;expect(s.state.account).toBeUndefined();expect(p.listenerCount).toBe(0);});
});
it('minimal UI escapes metadata, requires selection, and cleans listeners', async()=>{
  const p=new FakeProvider();render(<WalletPanel/>);expect(p.request).not.toHaveBeenCalled();
  fireEvent(window,new CustomEvent('eip6963:announceProvider',{detail:{provider:p,info:{uuid:'11111111-1111-4111-8111-111111111111',name:'<img src=x onerror=alert(1)>',rdns:'spoof'}}}));
  expect(screen.getByText(/<img src=x/)).toBeInTheDocument();expect(document.querySelector('img')).toBeNull();
  fireEvent.change(screen.getByLabelText('Wallet provider'),{target:{value:'provider-1'}});expect(p.request).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Connect / verify wallet'));await screen.findByText(OWNER);fireEvent.click(screen.getByText('Disconnect locally'));expect(screen.queryByText(OWNER)).not.toBeInTheDocument();cleanup();expect(p.listenerCount).toBe(0);
});
