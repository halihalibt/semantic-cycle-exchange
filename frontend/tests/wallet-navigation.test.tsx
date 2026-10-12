import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { App } from '../src/App';
import { WalletPanel } from '../src/WalletPanel';
import { WalletSession } from '../src/lib/wallet/session';
import { matchingProvider, readPreference, rememberProvider } from '../src/lib/wallet/preference';
import { reviewRequest, reviewCurrent } from '../src/features/transactions/review';
import { SubmissionJournal } from '../src/lib/genlayer/live/journal';
import { api } from '../src/lib/genlayer/api';
import { FakeProvider, OWNER } from './fake-provider';
import { liveHarness } from './live-fixtures';
import type { DiscoveredProvider } from '../src/lib/wallet/provider';
const OTHER='0x2222222222222222222222222222222222222222';
const item=(provider: FakeProvider):DiscoveredProvider=>({id:'provider-1',name:'OKX Wallet',rdns:'com.okex.wallet',legacy:false,provider});
function announce(p:FakeProvider) { window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:{provider:p,info:{uuid:'11111111-1111-4111-8111-111111111111',name:'OKX Wallet',rdns:'com.okex.wallet'}}})); }
async function explicit(p:FakeProvider) {
  act(()=>announce(p));fireEvent.change(screen.getByLabelText('Wallet provider'),{target:{value:'provider-1'}});
  fireEvent.click(screen.getByText('Connect / verify wallet'));await screen.findByText(OWNER);
}
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,180));});
beforeEach(()=>{sessionStorage.clear();localStorage.clear();window.history.replaceState(null,'','/semantic-cycle-exchange/');});
afterEach(()=>{cleanup();vi.restoreAllMocks();sessionStorage.clear();localStorage.clear();});
function mockReads(){vi.spyOn(api,'getProtocolStats').mockRejectedValue(new Error('mock offline'));vi.spyOn(api,'getOwnerRecords').mockRejectedValue(new Error('mock offline'));vi.spyOn(api,'getCycle').mockRejectedValue(new Error('mock offline'));vi.spyOn(api,'getIntentsPage').mockRejectedValue(new Error('mock offline'));}
it('OKX connects once across Overview → My Intents → Build Cycle → Workspace',async()=>{
  mockReads();const p=new FakeProvider();render(<App/>);await explicit(p);const listeners=p.listenerCount;
  for(const label of ['My Intents','Build Cycle','Workspace','Overview']){fireEvent.click(screen.getByRole('link',{name:label}));expect(screen.getByText(OWNER)).toBeInTheDocument();expect(p.listenerCount).toBe(listeners);}
  expect(p.request.mock.calls.filter(([r])=>r.method==='eth_requestAccounts')).toHaveLength(1);expect(p.request.mock.calls.filter(([r])=>r.method==='eth_sendTransaction')).toHaveLength(0);expect(window.location.pathname).toBe('/semantic-cycle-exchange/');
});
it('history back/forward keeps the same session',async()=>{
  mockReads();const p=new FakeProvider();render(<App/>);await explicit(p);fireEvent.click(screen.getByRole('link',{name:'My Intents'}));fireEvent.click(screen.getByRole('link',{name:'Build Cycle'}));
  await act(async()=>{window.history.back();await new Promise(r=>setTimeout(r,20));});expect(screen.getByRole('link',{name:'My Intents'})).toHaveAttribute('aria-current','page');expect(screen.getByText(OWNER)).toBeInTheDocument();
  await act(async()=>{window.history.forward();await new Promise(r=>setTimeout(r,20));});expect(screen.getByRole('link',{name:'Build Cycle'})).toHaveAttribute('aria-current','page');expect(screen.getByText(OWNER)).toBeInTheDocument();
});
it('business links navigate without reload; modified clicks stay native',()=>{
  mockReads();render(<App/>);const push=vi.spyOn(window.history,'pushState');fireEvent.click(screen.getByRole('link',{name:'Explore'}));fireEvent.click(screen.getByRole('link',{name:'Create an Intent preview'}));expect(window.location.search).toBe('?view=create');expect(push).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('link',{name:'Build Cycle'}),{ctrlKey:true});expect(push).toHaveBeenCalledTimes(2);
});
it('authorized refresh restores only via reads on the rediscovered provider',async()=>{
  const p=new FakeProvider();render(<WalletPanel/>);await explicit(p);cleanup();p.request.mockClear();render(<WalletPanel/>);act(()=>announce(p));await screen.findByText(OWNER);
  expect(p.request.mock.calls.map(([r])=>r.method)).toEqual(['eth_accounts','eth_chainId','eth_accounts','eth_chainId']);
});
it.each([false,true])('unauthorized page load never prompts (remembered=%s)',async remembered=>{
  const p=new FakeProvider();p.accounts=[];if(remembered)rememberProvider(item(p));render(<WalletPanel/>);act(()=>announce(p));await settle();expect(screen.queryByText(OWNER)).toBeNull();expect(p.request.mock.calls.filter(([r])=>r.method==='eth_requestAccounts')).toHaveLength(0);
});
it('manual Disconnect suppresses restoration after remount',async()=>{
  const p=new FakeProvider();render(<WalletPanel/>);await explicit(p);fireEvent.click(screen.getByText('Disconnect locally'));expect(readPreference()).toBe('disconnected');cleanup();p.request.mockClear();render(<WalletPanel/>);act(()=>announce(p));await settle();expect(screen.getByRole('status')).toHaveTextContent('DISCONNECTED');expect(p.request).not.toHaveBeenCalled();
});
it('account event immediately invalidates preview then verifies new account',async()=>{
  const p=new FakeProvider(),s=new WalletSession(vi.fn());s.select(p);await s.connect();const review=reviewRequest('cancel_intent',['8','1'],s.state,'test');p.accounts=[OTHER];p.emit('accountsChanged',[OTHER]);expect(reviewCurrent(review,s.state)).toBe(false);await waitFor(()=>expect(s.state.account).toBe(OTHER));expect(reviewCurrent(review,s.state)).toBe(false);expect(s.state.status).toBe('CONNECTED');s.dispose();
});
it('wrong chain blocks writing; return to 61999 is read-only',async()=>{
  const p=new FakeProvider(),s=new WalletSession(vi.fn());s.select(p);await s.connect();p.request.mockClear();p.chain='0x1';p.emit('chainChanged','0x1');await waitFor(()=>expect(s.state.status).toBe('WRONG_NETWORK'));expect(()=>reviewRequest('cancel_intent',['8','1'],s.state,'test')).toThrow();p.chain='0xf22f';p.emit('chainChanged','0xf22f');await waitFor(()=>expect(s.state.status).toBe('CONNECTED'));expect(p.request.mock.calls.every(([r])=>r.method!=='eth_requestAccounts')).toBe(true);s.dispose();
});
it('revoked permissions and provider disconnection clear account',async()=>{
  const p=new FakeProvider(),s=new WalletSession(vi.fn());s.select(p);await s.connect();p.accounts=[];p.emit('accountsChanged',[]);expect(s.state.status).toBe('DISCONNECTED');expect(s.state.account).toBeUndefined();p.emit('disconnect',{code:4900});expect(s.state.status).toBe('DISCONNECTED');expect(p.listenerCount).toBe(0);s.dispose();
});
it.each([4100,4900,4901])('silent error %s never requests permissions',async code=>{
  const p=new FakeProvider(),s=new WalletSession(vi.fn());s.select(p);p.request.mockRejectedValue({code});await s.restore();expect(s.state.status).not.toBe('CONNECTED');expect(s.state.account).toBeUndefined();expect(p.request.mock.calls).toHaveLength(1);s.dispose();
});
it('late restore cannot undo disconnect/provider replacement',async()=>{
  const p=new FakeProvider(),q=new FakeProvider(),s=new WalletSession(vi.fn());let resolve!:(v:unknown)=>void;p.request.mockImplementationOnce(()=>new Promise(r=>{resolve=r;}));s.select(p);const pending=s.restore();s.disconnect();s.select(q);resolve([OWNER]);await pending;expect(s.selectedProvider).toBe(q);expect(s.state.account).toBeUndefined();s.dispose();
});
it('silent identity drift is refused',async()=>{
  const p=new FakeProvider(),s=new WalletSession(vi.fn());s.select(p);p.request.mockResolvedValueOnce([OWNER]).mockResolvedValueOnce('0xf22f').mockResolvedValueOnce([OTHER]).mockResolvedValueOnce('0xf22f');await s.restore();expect(s.state.status).toBe('ERROR');expect(s.state.account).toBeUndefined();s.dispose();
});
it('selection hints exclude accounts and reject duplicate identity/legacy/corruption',()=>{
  const p=new FakeProvider(),q=new FakeProvider();rememberProvider(item(p));const pref=readPreference();expect(pref).toEqual({rdns:'com.okex.wallet',name:'OKX Wallet'});expect(matchingProvider([item(p),{...item(q),id:'provider-2'}],pref)).toBeUndefined();expect(matchingProvider([{...item(p),legacy:true}],pref)).toBeUndefined();sessionStorage.setItem('sca3:wallet-provider:v1','{"rdns":3}');expect(readPreference()).toBeUndefined();
});
it('missing remembered provider does not try another wallet',async()=>{
  const p=new FakeProvider();rememberProvider(item(p));render(<WalletPanel/>);await settle();expect(screen.getByRole('status')).toHaveTextContent('DISCONNECTED');expect(p.request).not.toHaveBeenCalled();
});
it('UNKNOWN journal survives navigation, local disconnect and remount',async()=>{
  mockReads();const journal=new SubmissionJournal(localStorage,async(_name,task)=>task());await expect(journal.attempt(OWNER,'pending',()=>true,async()=>{throw new Error('unknown');})).rejects.toThrow();render(<App/>);fireEvent.click(screen.getByRole('link',{name:'Workspace'}));fireEvent.click(screen.getByText('Disconnect locally'));expect(journal.pending(OWNER)?.status).toBe('UNKNOWN');cleanup();render(<App/>);expect(new SubmissionJournal(localStorage).pending(OWNER)?.status).toBe('UNKNOWN');
});
it('old preflight token is refused after account event/revalidation; no send',async()=>{
  const {h,runtime,prepare}=await liveHarness();const ready=await prepare();h.provider.accounts=[OTHER];h.provider.emit('accountsChanged',[OTHER]);await waitFor(()=>expect(h.session.state.account).toBe(OTHER));expect(await runtime.confirm(ready.key,ready.confirmation!)).toMatchObject({status:'FAILED_BEFORE_SUBMISSION',error:'FRESH_PREFLIGHT_REQUIRED'});expect(h.provider.request.mock.calls.filter(([r])=>r.method==='eth_sendTransaction')).toHaveLength(0);h.session.dispose();
});
it('Pages query deep link works without a wallet',()=>{
  window.history.replaceState(null,'','/semantic-cycle-exchange/?view=builder');render(<App/>);expect(screen.getByRole('link',{name:'Build Cycle'})).toHaveAttribute('aria-current','page');expect(screen.getByRole('status')).toHaveTextContent('NOT INSTALLED');
});
