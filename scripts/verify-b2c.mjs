import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root=resolve(dirname(new URL(import.meta.url).pathname),'..');
const base='a98d3dcbefcef6e37b11fb41a2ef9e11050c5b78';
const read=p=>readFileSync(resolve(root,p));
const historical=execFileSync('git',['ls-tree','-r','--name-only',base],{cwd:root,encoding:'utf8'}).trim().split('\n');
const frozenFiles=historical.filter(p=>p.startsWith('frontend/tests/') || p.startsWith('intelligent-contract/') || p.startsWith('evidence/b1') || p.startsWith('evidence/b2a') || p.startsWith('evidence/b2b') || ['frontend/package.json','frontend/package-lock.json','frontend/vite.config.ts','frontend/src/lib/genlayer/config.ts'].includes(p));
for(const p of frozenFiles)assert.deepEqual(read(p),execFileSync('git',['show',`${base}:${p}`],{cwd:root}),`Frozen file changed: ${p}`);
const pkg=JSON.parse(read('frontend/package.json')),installed=JSON.parse(read('frontend/node_modules/genlayer-js/package.json'));
assert.equal(pkg.dependencies['genlayer-js'],'1.1.8');assert.equal(installed.version,'1.1.8');
const reached=new Set();
function walk(p){
  p=resolve(p);if(reached.has(p))return;reached.add(p);
  const source=readFileSync(p,'utf8');
  const imports=[...source.matchAll(/(?:\b(?:from|import)\s*|\bimport\s*\(|\bnew\s+URL\s*\()\s*['"]([^'"]+)['"]/g)].map(m=>m[1]).filter(s=>s.startsWith('.'));
  for(const target of imports){const next=resolve(dirname(p),target);const file=[next,...['.ts','.tsx','.js','.json'].map(ext=>next+ext),resolve(next,'index.ts')].find(existsSync);assert.ok(file,`Unresolved import: ${target}`);if(!file.endsWith('.json'))walk(file);}
}
walk(resolve(root,'frontend/src/main.tsx'));
walk(resolve(root,'frontend/src/lib/genlayer/worker.ts'));
for(const file of reached){assert.ok(!file.includes('/staged/'),`Staged code reachable from production: ${file}`);assert.ok(!file.endsWith('/wallet/request-boundary.ts'),'Send boundary reachable from production');}
function evidenceFiles(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?evidenceFiles(resolve(dir,entry.name)):[relative(root,resolve(dir,entry.name))]);}
// Historical .gitignore ignores *.log; explicitly inventory all B2-C logs for publication.
const changed=[...new Set([...execFileSync('git',['diff','--name-only',base],{cwd:root,encoding:'utf8'}).split('\n'),...execFileSync('git',['ls-files','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).split('\n'),...evidenceFiles(resolve(root,'evidence/b2c'))].filter(Boolean))];
const allowed=['frontend/src/features/transactions/TransactionReview.tsx','frontend/src/lib/genlayer/transaction.ts','frontend/src/lib/wallet/request-boundary.ts','scripts/verify-b2c.mjs','scripts/verify-b2c.py','README.md','WORK_CHECKPOINT.md'];
for(const p of changed)assert.ok(allowed.includes(p) || p.startsWith('frontend/src/lib/genlayer/staged/') || p.startsWith('frontend/tests/staged-') || p.startsWith('docs/PHASE_B2C_') || p.startsWith('evidence/b2c/'),`Outside B2-C: ${p}`);
const hashes=Object.fromEntries(['frontend/package.json','frontend/package-lock.json','frontend/node_modules/genlayer-js/dist/index.js','frontend/node_modules/genlayer-js/dist/index-C3Ul1Rte.d.ts','frontend/node_modules/genlayer-js/dist/chains/index.js'].map(p=>[p,createHash('sha256').update(read(p)).digest('hex')]));
console.log(JSON.stringify({status:'PASS',frozenFilesChecked:frozenFiles.length,oldTestsUnchanged:true,productionEntryAndWorkerReachable:[...reached].map(p=>relative(root,p)).sort(),stagedExecutorReachable:false,productionSendBoundaryReachable:false,changedFiles:changed.sort(),hashes},null,2));
