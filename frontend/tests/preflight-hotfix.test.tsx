import { it, expect, vi, afterEach } from 'vitest';
import { Profiler } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserTransactionContext } from '../src/features/transactions/BrowserTransactionContext';
import { IntentForm } from '../src/features/intents/IntentEditor';
import { api } from '../src/lib/genlayer/api';
import { liveHarness } from './live-fixtures';
import { now } from './business-fixtures';
afterEach(() => vi.restoreAllMocks());
it('Create Intent reaches PREFLIGHT_READY with Chrome-like React performance instrumentation', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(now * 1000);
  const { h, runtime } = await liveHarness();
  vi.spyOn(api, 'getOwnerRecords').mockImplementation(h.reads.getOwnerRecords);
  render(<Profiler id="preflight" onRender={() => {}}><BrowserTransactionContext.Provider value={runtime}><IntentForm wallet={h.session.state}/></BrowserTransactionContext.Provider></Profiler>);
  fireEvent.change(screen.getByLabelText(/^Offer description/), { target: { value: 'offer' } });
  fireEvent.change(screen.getByLabelText(/^Need description/), { target: { value: 'need' } });
  fireEvent.submit(screen.getByText('Review create request').closest('form')!);
  fireEvent.click(await screen.findByRole('button', { name: 'Run fresh preflight' }));
  await screen.findByText('PREFLIGHT_READY');
  expect(screen.getByRole('button', { name: 'Confirm and request wallet' })).toBeDisabled();
  expect(h.provider.request.mock.calls.some(([r]) => r.method === 'eth_sendTransaction')).toBe(false);
});

it.each(['gas', 'read', 'timeout'] as const)('Create Intent preflight %s failure stays visible, retryable and unsigned', async failure => {
  vi.spyOn(Date, 'now').mockReturnValue(now * 1000);
  const { h, runtime, rpc } = await liveHarness();
  vi.spyOn(api, 'getOwnerRecords').mockImplementation(h.reads.getOwnerRecords);
  render(<Profiler id="failure" onRender={() => {}}><BrowserTransactionContext.Provider value={runtime}><IntentForm wallet={h.session.state}/></BrowserTransactionContext.Provider></Profiler>);
  fireEvent.change(screen.getByLabelText(/^Offer description/), { target: { value: 'offer' } });
  fireEvent.change(screen.getByLabelText(/^Need description/), { target: { value: 'need' } });
  fireEvent.submit(screen.getByText('Review create request').closest('form')!);
  const button = await screen.findByRole('button', { name: 'Run fresh preflight' });
  if (failure === 'gas') rpc.mockRejectedValueOnce(new Error('gas estimate unavailable'));
  if (failure === 'read') h.reads.getOwnerRecords.mockRejectedValueOnce(new Error('finalized read unavailable'));
  if (failure === 'timeout') rpc.mockImplementationOnce(() => new Promise(() => {}));
  fireEvent.click(button);
  expect(await screen.findByRole('alert')).toHaveTextContent(failure === 'gas' ? 'gas estimate unavailable' : failure === 'read' ? 'finalized read unavailable' : 'STAGED_TIMEOUT');
  expect(button).not.toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Confirm and request wallet' })).not.toBeInTheDocument();
  expect(screen.queryByText('Checking records or waiting for the wallet. No write is retried automatically.')).not.toBeInTheDocument();
  fireEvent.click(button);
  await screen.findByText('PREFLIGHT_READY');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirm and request wallet' })).toBeDisabled();
  expect(h.provider.request.mock.calls.some(([r]) => r.method === 'eth_sendTransaction')).toBe(false);
});

import { TransactionReview } from '../src/features/transactions/TransactionReview';
import { reviewRequest, json } from '../src/features/transactions/review';
import { prepareWrite, type WriteArgs } from '../src/lib/genlayer/write-spec';
import { fingerprint } from '../src/lib/genlayer/staged/immutable';
import { envelope } from '../src/lib/genlayer/live/sdk118';

it.each(['create_intent', 'assess_cycle'] as const)('%s review retains exact canonical BigInt encoding outside props enumeration', async method => {
  const { h } = await liveHarness(method);
  const args = method === 'create_intent' ? ['offer', '', 'need', '', '9007199254740993'] as const : undefined;
  const review = args ? reviewRequest('create_intent', [...args], h.session.state, 'Exact preview') : reviewRequest('assess_cycle', h.args as WriteArgs['assess_cycle'], h.session.state, 'Exact preview');
  const canonical = args ? prepareWrite('create_intent', [...args]) : prepareWrite('assess_cycle', h.args as WriteArgs['assess_cycle']);
  expect(review.parameters).toEqual(canonical);
  expect(fingerprint(review.parameters)).toBe(fingerprint(canonical));
  const identity = { account: h.session.state.account!, chain: '61999', revision: h.session.state.revision };
  expect(envelope(review.parameters, identity)).toEqual(envelope(canonical, identity));
  expect(json(review.parameters)).toBe(json(canonical));
  if (args) expect(review.parameters.args[4]).toBe(9007199254740993n);
  else expect(review.parameters.args[0]).toEqual([1n, 3n, 2n]);
  expect(Object.keys(review)).not.toContain('parameters');
  expect(Object.isFrozen(review)).toBe(true);
  expect(Object.isFrozen(review.parameters)).toBe(true);
  expect(Object.isFrozen(review.parameters.args)).toBe(true);
  expect(() => Reflect.set(review.parameters.args, '0', 0n)).not.toThrow();
  expect(review.parameters).toEqual(canonical);
});

it('a returned failed operation displays diagnostics and exposes no approval', async () => {
  const { h, runtime, review } = await liveHarness();
  const original = runtime.prepare.bind(runtime);
  vi.spyOn(runtime, 'prepare').mockImplementation(async r => {
    const result = await original(r);
    runtime.transactions.blockedBeforeForwarding(result.key);
    return { key: result.key, gasUnits: undefined, operation: runtime.transactions.diagnostic(result.key, 'PREFLIGHT_FAILED') };
  });
  render(<Profiler id="returned-failure" onRender={() => {}}><BrowserTransactionContext.Provider value={runtime}><TransactionReview review={review} wallet={h.session.state}/></BrowserTransactionContext.Provider></Profiler>);
  fireEvent.click(screen.getByRole('button', { name: 'Run fresh preflight' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('PREFLIGHT_FAILED');
  expect(screen.getByRole('status')).toHaveTextContent('FAILED_BEFORE_SUBMISSION');
  expect(screen.getByRole('button', { name: 'Run fresh preflight' })).not.toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Confirm and request wallet' })).not.toBeInTheDocument();
  expect(h.provider.request.mock.calls.some(([r]) => r.method === 'eth_sendTransaction')).toBe(false);
});
