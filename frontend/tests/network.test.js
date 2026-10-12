// @vitest-environment node
import { it,expect } from 'vitest';
import { Socket } from 'node:net';
it('test process denies actual socket egress',()=>{
  expect(()=>new Socket().connect({host:'127.0.0.1',port:9})).toThrow('B2A_OFFLINE_NETWORK_BLOCKED');
});
