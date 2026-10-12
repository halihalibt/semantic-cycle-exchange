// @vitest-environment node
import { it, expect } from 'vitest';
import { abi } from 'genlayer-js';
import archived from './historical-studio-receipts.json';
import { receiptEvidence } from '../src/lib/genlayer/staged/receipt';
import { prepareWrite, type WriteMethod, type WriteArgs } from '../src/lib/genlayer/write-spec';
it.each(archived.records)('historical $path: real Studio shape parses offline; no new live acceptance claimed',entry=>{
  const tx=entry.transaction,call=abi.calldata.decode(Uint8Array.from(atob(tx.data.calldata),x=>x.charCodeAt(0)));
  if(!(call instanceof Map))throw new Error('NOT_CALLDATA');
  const method=call.get('method') as WriteMethod;
  const strings=(v:unknown):unknown=>Array.isArray(v)?v.map(strings):typeof v==='bigint'?v.toString():v;
  const args=strings(call.get('args')) as WriteArgs[WriteMethod];
  expect(receiptEvidence(tx,tx.hash,tx.from_address,prepareWrite(method,args))).toMatchObject({finalized:true,consensus:'MAJORITY_AGREE',execution:'SUCCESS',hasReturn:true});
  expect(entry.sha256).toMatch(/^[a-f0-9]{64}$/);
});
