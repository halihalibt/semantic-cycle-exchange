import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../intelligent-contract/contracts/semantic_cycle_accord.py',import.meta.url));
assert.equal(source.length,32040);
assert.equal(createHash('sha256').update(source).digest('hex'),'88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442');
assert.ok(source.includes('8a7b279a3594397802c71fef4df9b4d30db1ff528177d0bf05c80a62397192d3'));
console.log('Canonical source: 32040 bytes, exact frozen SHA256 PASS');
