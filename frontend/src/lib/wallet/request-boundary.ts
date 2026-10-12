import { decodeInputData } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { decodeFunctionData, type Hex } from 'viem';
import { CONTRACT } from '../genlayer/config';
import { WRITE_PARAMETERS, type prepareWrite } from '../genlayer/write-spec';
import { accounts, address, chainId, type Provider, type RequestArguments } from './provider';

type ExpectedWrite = ReturnType<typeof prepareWrite>;
function equalArguments(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) return Array.isArray(actual) && actual.length === expected.length && actual.every((v, i) => equalArguments(v, expected[i]));
  return typeof actual === typeof expected && actual === expected;
}
function isZeroValue(value: unknown): boolean {
  if (value === 0 || value === 0n) return true;
  return typeof value === 'string' && /^(?:0x[\da-f]+|0|[1-9]\d*)$/i.test(value) && BigInt(value) === 0n;
}
/** Offline SDK evidence only. No production write executor is connected.
 * The latch is set before async checks, preventing SDK ABI fallback rebroadcast. */
export function singleRequestBoundary(provider: Provider, expectedAccount: string, revision: number, currentRevision: () => number, expectedWrite: ExpectedWrite) {
  const expected = address(expectedAccount);
  if (address(expectedWrite.address) !== address(CONTRACT) || !Object.hasOwn(WRITE_PARAMETERS, expectedWrite.functionName) || !Array.isArray(expectedWrite.args)) throw new Error('APP_INVALID_EXPECTED_WRITE');
  const consensus = studionet.consensusMainContract;
  if (!consensus || !consensus.abi || address(consensus.address) === address(CONTRACT)) throw new Error('APP_CONSENSUS_CONFIG_MISSING');
  let attempted = false;
  let hash: unknown;
  return {
    get attempted() { return attempted; },
    get knownHash() { return hash; },
    async request(request: RequestArguments): Promise<unknown> {
      if (request.method !== 'eth_sendTransaction') throw new Error('APP_METHOD_BLOCKED');
      if (attempted) throw new Error('APP_DUPLICATE_SUBMISSION_BLOCKED');
      attempted = true;
      if (currentRevision() !== revision) throw new Error('APP_IDENTITY_CHANGED');
      if (chainId(await provider.request({ method: 'eth_chainId' })) !== 61999n) throw new Error('APP_WRONG_NETWORK');
      if (accounts(await provider.request({ method: 'eth_accounts' }))[0] !== expected) throw new Error('APP_IDENTITY_CHANGED');
      if (currentRevision() !== revision) throw new Error('APP_IDENTITY_CHANGED');
      const params = request.params;
      if (!Array.isArray(params) || params.length !== 1 || !params[0] || typeof params[0] !== 'object' || Array.isArray(params[0])) throw new Error('APP_INVALID_TRANSACTION');
      const tx = params[0] as Record<string, unknown>;
      if (address(tx.from) !== expected || chainId(tx.chainId) !== 61999n) throw new Error('APP_IDENTITY_CHANGED');
      if (typeof tx.to !== 'string' || address(tx.to) !== address(consensus.address)) throw new Error('APP_INVALID_TARGET');
      if (!isZeroValue(tx.value)) throw new Error('APP_NONZERO_VALUE_BLOCKED');
      if (typeof tx.data !== 'string' || !/^0x(?:[\da-f]{2})+$/i.test(tx.data)) throw new Error('APP_INVALID_CALLDATA');
      try {
        const outer = decodeFunctionData({ abi: consensus.abi, data: tx.data as Hex });
        if (outer.functionName !== 'addTransaction' || !outer.args || outer.args.length < 5 || typeof outer.args[1] !== 'string' || address(outer.args[1]) !== address(CONTRACT) || typeof outer.args[4] !== 'string') throw new Error('APP_INVALID_TARGET');
        const inner = decodeInputData(outer.args[4] as Hex, CONTRACT);
        if (!inner || inner.type !== 'call' || !('callData' in inner) || !(inner.callData instanceof Map)) throw new Error('APP_INVALID_CALLDATA');
        const method = inner.callData.get('method');
        const args = inner.callData.get('args');
        if (method !== expectedWrite.functionName || !Object.hasOwn(WRITE_PARAMETERS, method as PropertyKey) || !equalArguments(args, expectedWrite.args)) throw new Error('APP_UNEXPECTED_CALLDATA');
      } catch {
        throw new Error('APP_INVALID_CALLDATA');
      }
      if (currentRevision() !== revision) throw new Error('APP_IDENTITY_CHANGED');
      hash = await provider.request(request);
      return hash;
    },
  };
}
