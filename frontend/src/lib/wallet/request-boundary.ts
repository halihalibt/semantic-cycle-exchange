import { accounts, address, chainId, type Provider, type RequestArguments } from './provider';
/** Minimal provider wrapper for offline SDK evidence. Not connected to production UI.
 * Per-operation latch blocks the SDK's ABI fallback from sending a second request. */
export function singleRequestBoundary(provider: Provider, expectedAccount: string, revision: number, currentRevision: () => number) {
  const expected = address(expectedAccount);
  let attempted = false;
  let hash: unknown;
  return {
    get attempted() { return attempted; },
    get knownHash() { return hash; },
    async request(request: RequestArguments): Promise<unknown> {
      if (request.method !== 'eth_sendTransaction') throw new Error('APP_METHOD_BLOCKED');
      if (attempted) throw new Error('APP_DUPLICATE_SUBMISSION_BLOCKED');
      attempted = true; // Latch before asynchronous checks, including re-entrant calls.
      if (currentRevision() !== revision) throw new Error('APP_IDENTITY_CHANGED');
      if (chainId(await provider.request({ method: 'eth_chainId' })) !== 61999n) throw new Error('APP_WRONG_NETWORK');
      if (accounts(await provider.request({ method: 'eth_accounts' }))[0] !== expected) throw new Error('APP_IDENTITY_CHANGED');
      if (currentRevision() !== revision) throw new Error('APP_IDENTITY_CHANGED');
      const params = request.params;
      if (!Array.isArray(params) || params.length !== 1 || !params[0] || typeof params[0] !== 'object') throw new Error('APP_INVALID_TRANSACTION');
      const tx = params[0] as Record<string, unknown>;
      if (address(tx.from) !== expected || chainId(tx.chainId) !== 61999n) throw new Error('APP_IDENTITY_CHANGED');
      hash = await provider.request(request);
      return hash;
    },
  };
}
