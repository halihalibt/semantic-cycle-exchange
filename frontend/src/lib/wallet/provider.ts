export interface RequestArguments { method: string; params?: readonly unknown[] | object }
export type ProviderListener = (...args: unknown[]) => void;
export interface Provider {
  request(args: RequestArguments): Promise<unknown>;
  on(event: string, listener: ProviderListener): void;
  removeListener(event: string, listener: ProviderListener): void;
}
export function isProvider(value: unknown): value is Provider {
  if (!value || typeof value !== 'object') return false;
  const p = value as Partial<Provider>;
  return typeof p.request === 'function' && typeof p.on === 'function' && typeof p.removeListener === 'function';
}
export function address(value: unknown): string {
  if (typeof value !== 'string' || !/^0x[\da-f]{40}$/i.test(value)) throw new Error('APP_INVALID_ACCOUNT');
  return value.toLowerCase();
}
export function chainId(value: unknown): bigint {
  if (typeof value !== 'string' || !/^0x[\da-f]+$/i.test(value) || value.length > 18) throw new Error('APP_INVALID_CHAIN');
  return BigInt(value);
}
export function accounts(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error('APP_INVALID_ACCOUNTS');
  return value.map(address);
}
export function providerError(error: unknown): { source: 'provider' | 'application'; code?: number; message: string } {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  if (typeof code === 'number' && Number.isInteger(code)) {
    const labels: Record<number, string> = {4001: 'Connection rejected.', 4100: 'Account access not authorized.', 4900: 'Wallet disconnected.', 4901: 'Wallet unavailable on this chain.'};
    return { source: 'provider', code, message: labels[code] ?? `Wallet error (${code}).` };
  }
  return { source: 'application', message: error instanceof Error ? error.message : 'Wallet unavailable.' };
}

export interface DiscoveredProvider { id: string; name: string; rdns: string; provider: Provider; legacy: boolean }
/** Metadata is only an escaped display label. Icons and branding flags are never used. */
export class Discovery {
  private entries: DiscoveredProvider[] = [];
  private sequence = 0;
  private running = false;
  constructor(private target: EventTarget, private changed: (providers: readonly DiscoveredProvider[]) => void) {}
  private announce = (event: Event) => {
    try {
      const detail = (event as CustomEvent).detail;
      if (!detail || !isProvider(detail.provider) || !detail.info || typeof detail.info.uuid !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(detail.info.uuid)) return;
      const { name, rdns } = detail.info;
      if (typeof name !== 'string' || !name.trim() || name.length > 100 || typeof rdns !== 'string' || rdns.length > 255) return;
      const existing = this.entries.find(p => p.provider === detail.provider);
      if (existing) {
        if (existing.legacy) { existing.legacy = false; existing.name = name; existing.rdns = rdns; this.emit(); }
        return;
      }
      // Locally assigned identity: spoofed/colliding UUIDs cannot replace another provider.
      this.entries.push({ id: `provider-${++this.sequence}`, name, rdns, provider: detail.provider, legacy: false });
      this.emit();
    } catch { /* Ignore malformed announcements, including throwing getters. */ }
  };
  private emit() { this.changed(this.entries.map(p => ({ ...p }))); }
  start(legacy?: unknown) {
    if (this.running) return;
    this.running = true;
    this.target.addEventListener('eip6963:announceProvider', this.announce);
    this.target.dispatchEvent(new Event('eip6963:requestProvider'));
    if (!this.entries.length && isProvider(legacy)) {
      this.entries.push({ id: `provider-${++this.sequence}`, name: 'Injected wallet (unverified)', rdns: '', provider: legacy, legacy: true });
    }
    this.emit();
  }
  stop() { this.target.removeEventListener('eip6963:announceProvider', this.announce); this.running = false; this.entries = []; }
}
