"""Offline acceptance. No live wallet, RPC, blockchain write or browser extension."""
import json, subprocess
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'evidence/b2c-r1'
COMMANDS=[
 ('npm-ci',['npm','ci'],ROOT/'frontend'),
 ('typecheck',['npm','run','typecheck'],ROOT/'frontend'),
 ('lint',['npm','run','lint'],ROOT/'frontend'),
 ('vitest',['npm','test','--','--reporter=default','--reporter=json','--outputFile=../evidence/b2c-r1/vitest.json'],ROOT/'frontend'),
 ('build',['npm','run','build'],ROOT/'frontend'),
 ('canonical',['npm','run','integrity'],ROOT/'frontend'),
 ('production-integrity',['node','scripts/verify-b2c-r1.mjs'],ROOT),
 ('diff-check',['git','diff','--check'],ROOT)]
OUT.mkdir(parents=True,exist_ok=True)
results=[]
for name,command,cwd in COMMANDS:
 p=subprocess.run(command,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 (OUT/(name+'.txt')).write_text(p.stdout)
 results.append({'check':name,'command':command,'exit_code':p.returncode,'status':'PASS' if p.returncode==0 else 'FAIL','evidence':'evidence/b2c-r1/'+name+'.txt'})
 print(name,results[-1]['status'],flush=True)
t=json.loads((OUT/'vitest.json').read_text())
summary={k:t[k] for k in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests','numTodoTests','success']}
r={'timestamp_utc':datetime.now(timezone.utc).isoformat(),'commands':results,'tests':summary,'scope':'OFFLINE Mock Provider / Mock RPC + jsdom. Sockets and unmocked fetch denied.','live_wallet_sign_broadcast':'NOT RUN / FORBIDDEN','website_publish_merge_portal':'NOT RUN / FORBIDDEN'}
(OUT/'verification.json').write_text(json.dumps(r,indent=2)+'\n')
print(summary,flush=True)
raise SystemExit(0 if all(c['exit_code']==0 for c in results) and t['success'] else 1)
