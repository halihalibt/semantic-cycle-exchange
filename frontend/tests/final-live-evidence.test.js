// @vitest-environment node
import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import index from '../../evidence/final-delivery/onchain-index.json';
import { receiptEvidence } from '../src/lib/genlayer/staged/receipt';
import { prepareWrite } from '../src/lib/genlayer/write-spec';
it.each(index.records)('independent live receipt $label remains hash-bound and parses through production safety checks offline',record=>{
  const raw=readFileSync(new URL(`../../evidence/final-delivery/${record.path}`,import.meta.url));
  expect(createHash('sha256').update(raw).digest('hex')).toBe(record.sha256);
  const tx=JSON.parse(raw.toString()).transaction;
  const method=record.method;
  expect(receiptEvidence(tx,record.hash,record.account,prepareWrite(method,record.args))).toMatchObject({finalized:true,consensus:'MAJORITY_AGREE',execution:'SUCCESS',hasReturn:true});
});
