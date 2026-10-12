import type { DiscoveredProvider } from './provider';
const KEY = 'sca3:wallet-provider:v1';
export type Preference = { rdns: string; name: string } | 'disconnected';
/** Selection hint only, never an account, authorization, signature or credential. */
export function readPreference(): Preference | undefined {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return;
    const value: unknown = JSON.parse(raw);
    if (value === 'disconnected') return value;
    if (value && typeof value === 'object' && 'rdns' in value && 'name' in value && typeof value.rdns === 'string' && value.rdns.length > 0 && value.rdns.length <= 255 && typeof value.name === 'string' && value.name.length > 0 && value.name.length <= 100) return { rdns: value.rdns, name: value.name };
  } catch { /* Storage unavailable/corrupt: explicit connection remains available. */ }
}
export function rememberProvider(provider?: DiscoveredProvider) {
  try {
    const value: Preference = provider && !provider.legacy && provider.rdns ? { rdns: provider.rdns, name: provider.name } : 'disconnected';
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch { /* Fail closed for reload restoration; SPA session still works. */ }
}
export function matchingProvider(items: readonly DiscoveredProvider[], preference: Preference | undefined) {
  if (!preference || preference === 'disconnected') return;
  const matches = items.filter(p => !p.legacy && p.rdns === preference.rdns && p.name === preference.name);
  return matches.length === 1 ? matches[0] : undefined;
}
