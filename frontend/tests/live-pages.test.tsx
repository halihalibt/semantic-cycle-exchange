import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserTransactionContext } from '../src/features/transactions/BrowserTransactionContext';
import { TransactionReview } from '../src/features/transactions/TransactionReview';
import { IntentForm } from '../src/features/intents/IntentEditor';
import { CycleActions } from '../src/features/cycles/CycleWorkspace';
import { CycleBuilder } from '../src/features/cycles/CycleBuilder';
import { api } from '../src/lib/genlayer/api';
import { App } from '../src/App';
import { WRITE_PARAMETERS, type WriteMethod } from '../src/lib/genlayer/write-spec';
import { liveHarness } from './live-fixtures';
import { now, obs } from './business-fixtures';
import { MOCK_HASH } from './fake-provider';
beforeEach(()=>vi.spyOn(Date,'now').mockReturnValue(now*1000));
afterEach(()=>vi.restoreAllMocks());
const methods=Object.keys(WRITE_PARAMETERS) as WriteMethod[];
const sendCount=(h:Awaited<ReturnType<typeof liveHarness>>['h'])=>h.provider.request.mock.calls.filter(([r])=>r.method==='eth_sendTransaction').length;
async function ui(method: WriteMethod='create_intent') {
  const f=await liveHarness(method),{h}=f;
  vi.spyOn(api,'getIntent').mockImplementation(h.reads.getIntent);vi.spyOn(api,'getCycle').mockImplementation(h.reads.getCycle);vi.spyOn(api,'getOwnerRecords').mockImplementation(h.reads.getOwnerRecords);
  const original=h.provider.request.getMockImplementation()!;
  h.provider.request.mockImplementation(async r=>{const result=await original(r);if(r.method==='eth_sendTransaction')h.applySuccess();return result;});
  return f;
}
async function readyPane() {fireEvent.click(screen.getByRole('button',{name:'Run fresh preflight'}));await screen.findByRole('button',{name:'Confirm and request wallet'});}
function approve() {fireEvent.click(screen.getByLabelText(/I confirm this exact method/));fireEvent.click(screen.getByRole('button',{name:'Confirm and request wallet'}));}
it.each(methods)('%s business page uses real adapter only after fresh preflight and explicit confirmation',async method=>{
  const {h,runtime}=await ui(method),wallet=h.session.state;
  const component=method==='assess_cycle'?<CycleBuilder wallet={wallet}/>:['confirm_cycle','decline_cycle','expire_cycle'].includes(method)?<CycleActions cycle={h.cycle} wallet={wallet}/>:<IntentForm wallet={wallet} item={method==='create_intent'?undefined:h.records[0]}/>;
  render(<BrowserTransactionContext.Provider value={runtime}>{component}</BrowserTransactionContext.Provider>);
  if(method==='create_intent'||method==='update_intent') {
    const fields=method==='create_intent'?['offer','','need','']:['new offer','new limits','new need','new req'];
    for(const [i,label] of ['Offer description','Offer limitations','Need description','Need requirements'].entries())fireEvent.change(screen.getByLabelText(new RegExp('^'+label)),{target:{value:fields[i]}});
    if(method==='update_intent')fireEvent.change(screen.getByLabelText(/Expires at/),{target:{value:String(now+8*86400)}});
    fireEvent.submit(screen.getByText(method==='create_intent'?'Review create request':'Review update request').closest('form')!);
  } else if(method==='cancel_intent') {fireEvent.click(screen.getByLabelText(/I understand the cancellation/));fireEvent.click(screen.getByText('Review cancellation request'));}
  else if(method==='assess_cycle') {
    for(const [i,id] of ['1','3','2'].entries())fireEvent.change(screen.getByLabelText('Intent ID '+['A','B','C'][i]),{target:{value:id}});
    fireEvent.submit(screen.getByText('Load selected Intents').closest('form')!);await screen.findByText(/Expected versions:/);fireEvent.click(screen.getByText('Validate and review assessment request'));
  } else if(method==='expire_cycle')fireEvent.click(screen.getByText('Review expiration cleanup'));
  else {fireEvent.click(screen.getByLabelText(/I have reviewed all three/));if(method==='decline_cycle')fireEvent.click(screen.getByLabelText(/I understand these irreversible/));fireEvent.click(screen.getByText(method==='confirm_cycle'?'Review confirmation request':'Review decline request'));}
  await screen.findByRole('button',{name:'Run fresh preflight'});expect(screen.getByRole('heading',{name:method})).toBeInTheDocument();expect(sendCount(h)).toBe(0);
  await readyPane();expect(sendCount(h)).toBe(0);expect(screen.getByRole('button',{name:'Confirm and request wallet'})).toBeDisabled();
  fireEvent.click(screen.getByLabelText(/I confirm this exact method/));expect(sendCount(h)).toBe(0);
  fireEvent.click(screen.getByRole('button',{name:'Confirm and request wallet'}));await screen.findByText('FINALIZED_SUCCESS');expect(sendCount(h)).toBe(1);expect(screen.getByText(MOCK_HASH)).toBeInTheDocument();expect(screen.getByText('Verified outcome: CHANGED')).toBeInTheDocument();
});
it('page load, preview and acknowledgement do not request a signature',async()=>{const {h,runtime,review}=await ui();render(<BrowserTransactionContext.Provider value={runtime}><TransactionReview review={review} wallet={h.session.state}/></BrowserTransactionContext.Provider>);expect(h.provider.request.mock.calls.every(([r])=>r.method!=='eth_sendTransaction')).toBe(true);await readyPane();fireEvent.click(screen.getByLabelText(/I confirm this exact method/));expect(sendCount(h)).toBe(0);});
it('rapid confirmation clicks forward a single wallet request',async()=>{const {h,runtime,review}=await ui();render(<BrowserTransactionContext.Provider value={runtime}><TransactionReview review={review} wallet={h.session.state}/></BrowserTransactionContext.Provider>);await readyPane();fireEvent.click(screen.getByLabelText(/I confirm this exact method/));const button=screen.getByRole('button',{name:'Confirm and request wallet'});fireEvent.click(button);fireEvent.click(button);await screen.findByText('FINALIZED_SUCCESS');expect(sendCount(h)).toBe(1);});
it('account change after preflight disables an existing confirmation',async()=>{const {h,runtime,review}=await ui();const {rerender}=render(<BrowserTransactionContext.Provider value={runtime}><TransactionReview review={review} wallet={h.session.state}/></BrowserTransactionContext.Provider>);await readyPane();h.provider.emit('accountsChanged',[]);rerender(<BrowserTransactionContext.Provider value={runtime}><TransactionReview review={review} wallet={h.session.state}/></BrowserTransactionContext.Provider>);expect(screen.getByRole('status')).toHaveTextContent('BLOCKED');expect(screen.getByRole('button',{name:'Confirm and request wallet'})).toBeDisabled();expect(sendCount(h)).toBe(0);});
it('parameter change during fresh confirmation cancels approval before forwarding',async()=>{
  const {h,runtime}=await ui();render(<BrowserTransactionContext.Provider value={runtime}><IntentForm wallet={h.session.state}/></BrowserTransactionContext.Provider>);
  fireEvent.change(screen.getByLabelText(/^Offer description/),{target:{value:'offer'}});fireEvent.change(screen.getByLabelText(/^Need description/),{target:{value:'need'}});fireEvent.submit(screen.getByText('Review create request').closest('form')!);await screen.findByRole('button',{name:'Run fresh preflight'});await readyPane();
  let release!:()=>void;h.reads.getOwnerRecords.mockImplementationOnce(()=>new Promise(resolve=>{release=()=>resolve(obs({owner:h.session.state.account!,intents:[],cycles:[],intent_total:'0',cycle_total:'0',unfinished_count:'0',next_offset:'0',has_more:false}));}));
  approve();await waitFor(()=>expect(release).toBeTypeOf('function'));fireEvent.change(screen.getByLabelText(/^Offer description/),{target:{value:'changed'}});release();await vi.waitFor(()=>expect(runtime.transactions.get('browser-1').status).toBe('FAILED_BEFORE_SUBMISSION'));expect(sendCount(h)).toBe(0);
});
it('unknown send error is visible and provides read-only recovery, no resend button',async()=>{const {h,runtime,review}=await ui();const original=h.provider.request.getMockImplementation()!;h.provider.request.mockImplementation(async r=>{if(r.method==='eth_sendTransaction')throw new Error('transport lost');return original(r);});render(<BrowserTransactionContext.Provider value={runtime}><TransactionReview review={review} wallet={h.session.state}/></BrowserTransactionContext.Provider>);await readyPane();approve();await screen.findByText('SUBMISSION_UNKNOWN');expect(screen.getByRole('alert')).toHaveTextContent('transport lost');expect(screen.queryByRole('button',{name:'Confirm and request wallet'})).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Check existing transaction (read only)'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Check existing transaction (read only)'})).not.toBeDisabled());expect(sendCount(h)).toBe(1);});
it('failed gas estimate displays an error and cannot open the wallet',async()=>{const {h,runtime,review,rpc}=await ui();rpc.mockRejectedValue(new Error('gas estimate unavailable'));render(<BrowserTransactionContext.Provider value={runtime}><TransactionReview review={review} wallet={h.session.state}/></BrowserTransactionContext.Provider>);fireEvent.click(screen.getByRole('button',{name:'Run fresh preflight'}));await screen.findByRole('alert');expect(screen.getByRole('alert')).toHaveTextContent('gas estimate unavailable');expect(screen.queryByRole('button',{name:'Confirm and request wallet'})).not.toBeInTheDocument();expect(sendCount(h)).toBe(0);});
it('production App installs live context without any automatic wallet request',()=>{render(<App search="?view=create"/>);expect(screen.getByText('Wallet connection · manual transactions')).toBeInTheDocument();expect(screen.getByText('Review create request')).toBeDisabled();expect(screen.queryByText('ONCHAIN_SUBMISSION_DISABLED')).not.toBeInTheDocument();});
