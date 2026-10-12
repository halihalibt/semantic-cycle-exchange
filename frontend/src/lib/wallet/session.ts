import { accounts, chainId, providerError, type Provider, type ProviderListener } from './provider';
export type WalletStatus = 'NOT_INSTALLED' | 'DISCOVERED' | 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'WRONG_NETWORK' | 'PROVIDER_UNAVAILABLE' | 'ERROR';
export interface WalletState { status: WalletStatus; account?: string; chain?: string; revision: number; error?: ReturnType<typeof providerError> }
export class WalletSession {
  private provider?: Provider;
  private bindings: [string, ProviderListener][] = [];
  private value: WalletState = { status: 'NOT_INSTALLED', revision: 0 };
  constructor(private changed: (state: WalletState) => void, private invalidated: () => void = () => {}) {}
  get selectedProvider(): Provider | undefined { return this.provider; }
  get state(): WalletState { return { ...this.value }; }
  private set(state: Omit<WalletState, 'revision'>) { this.value = { ...state, revision: this.value.revision + 1 }; this.invalidated(); this.changed(this.state); }
  discover(count: number) { if (!this.provider) this.set({ status: count ? 'DISCOVERED' : 'NOT_INSTALLED' }); }
  private detach() { for (const [event, fn] of this.bindings) this.provider?.removeListener(event, fn); this.bindings = []; }
  select(provider: Provider) {
    this.detach(); this.provider = provider; this.set({ status: 'DISCONNECTED' });
    const listen = (event: string, fn: ProviderListener) => { provider.on(event, fn); this.bindings.push([event, fn]); };
    // Invalidate immediately, then recheck existing permissions without requesting any.
    listen('accountsChanged', value => {
      const active = this.value.status === 'CONNECTED' || this.value.status === 'WRONG_NETWORK';
      this.set({ status: 'DISCONNECTED' });
      try { if (active && accounts(value).length) void this.restore(); }
      catch (e) { this.set({ status: 'ERROR', error: providerError(e) }); }
    });
    listen('chainChanged', value => {
      const active = this.value.status === 'CONNECTED' || this.value.status === 'WRONG_NETWORK';
      try { const id = chainId(value); this.set({ status: id === 61999n ? 'DISCONNECTED' : 'WRONG_NETWORK', chain: id.toString() }); }
      catch (e) { this.set({ status: 'ERROR', error: providerError(e) }); }
      if (active) void this.restore();
    });
    listen('connect', () => this.set({ status: 'DISCONNECTED' }));
    listen('disconnect', e => { this.detach(); this.provider = undefined; this.set({ status: 'DISCONNECTED', error: providerError(e) }); });
  }
  /** Read-only reload/event recovery. No old transaction approval is restored. */
  async restore(): Promise<void> {
    const provider = this.provider;
    if (!provider) return;
    this.set({ status: 'DISCONNECTED' });
    const revision = this.value.revision;
    try {
      const first = accounts(await provider.request({ method: 'eth_accounts' }));
      const id = chainId(await provider.request({ method: 'eth_chainId' }));
      const current = accounts(await provider.request({ method: 'eth_accounts' }));
      const secondId = chainId(await provider.request({ method: 'eth_chainId' }));
      if (this.provider !== provider || this.value.revision !== revision) return;
      if (!first.length || !current.length) { this.set({ status: 'DISCONNECTED' }); return; }
      if (first[0] !== current[0] || id !== secondId) throw new Error('APP_IDENTITY_CHANGED');
      this.set({ status: id === 61999n ? 'CONNECTED' : 'WRONG_NETWORK', account: current[0], chain: id.toString() });
    } catch (e) {
      if (this.provider !== provider || this.value.revision !== revision) return;
      const error = providerError(e);
      if (error.code === 4900 || error.code === 4901) { this.detach(); this.provider = undefined; }
      this.set({ status: error.code === 4900 || error.code === 4901 ? 'PROVIDER_UNAVAILABLE' : error.code === 4100 ? 'DISCONNECTED' : 'ERROR', error });
    }
  }
  /** Called only by a deliberate user action. B2-A verification uses fake providers. */
  async connect(): Promise<void> {
    if (this.value.status === 'CONNECTING') return;
    const provider = this.provider;
    if (!provider) { this.set({ status: 'PROVIDER_UNAVAILABLE' }); return; }
    this.set({ status: 'CONNECTING' });
    const revision = this.value.revision;
    try {
      const requested = accounts(await provider.request({ method: 'eth_requestAccounts' }));
      const id = chainId(await provider.request({ method: 'eth_chainId' }));
      const current = accounts(await provider.request({ method: 'eth_accounts' }));
      const secondId = chainId(await provider.request({ method: 'eth_chainId' }));
      if (this.provider !== provider || this.value.revision !== revision) return;
      if (!requested.length || requested[0] !== current[0] || id !== secondId) throw new Error('APP_IDENTITY_CHANGED');
      this.set({ status: id === 61999n ? 'CONNECTED' : 'WRONG_NETWORK', account: current[0], chain: id.toString() });
    } catch (e) {
      if (this.provider !== provider || this.value.revision !== revision) return;
      const error = providerError(e);
      if (error.code === 4900 || error.code === 4901) { this.detach(); this.provider = undefined; }
      this.set({ status: error.code === 4900 || error.code === 4901 ? 'PROVIDER_UNAVAILABLE' : error.code === 4001 || error.code === 4100 ? 'DISCONNECTED' : 'ERROR', error });
    }
  }
  disconnect() { this.detach(); this.provider = undefined; this.set({ status: 'DISCONNECTED' }); }
  dispose() { this.detach(); this.provider = undefined; this.value = { status: 'DISCONNECTED', revision: this.value.revision + 1 }; this.invalidated(); }
}
