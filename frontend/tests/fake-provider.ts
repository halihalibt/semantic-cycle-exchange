import { vi } from 'vitest';
import type { Provider, ProviderListener, RequestArguments } from '../src/lib/wallet/provider';
export const OWNER = '0x1111111111111111111111111111111111111111';
export const MOCK_HASH: `0x${string}` = `0x${'ab'.repeat(32)}`;
export class FakeProvider implements Provider {
  chain = '0xf22f'; accounts = [OWNER]; listeners = new Map<string, Set<ProviderListener>>();
  request = vi.fn(async ({ method }: RequestArguments): Promise<unknown> => {
    if (method === 'eth_chainId') return this.chain;
    if (method === 'eth_accounts' || method === 'eth_requestAccounts') return [...this.accounts];
    if (method === 'eth_sendTransaction') return MOCK_HASH;
    throw new Error(`Unexpected fake method ${method}`);
  });
  on(event: string, fn: ProviderListener) { const set = this.listeners.get(event) ?? new Set(); set.add(fn); this.listeners.set(event, set); }
  removeListener(event: string, fn: ProviderListener) { this.listeners.get(event)?.delete(fn); }
  emit(event: string, value?: unknown) { this.listeners.get(event)?.forEach(fn => fn(value)); }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}
