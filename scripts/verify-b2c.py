"""One consolidated verification. Dependency acquisition uses npm ci separately.
Never sends any blockchain request; Vitest preloads the existing socket denial.
"""
import json
from pathlib import Path
import subprocess
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'evidence/b2c'
COMMANDS = [
    ('typecheck', ['npm', 'run', 'typecheck'], ROOT / 'frontend'),
    ('lint', ['npm', 'run', 'lint'], ROOT / 'frontend'),
    ('test-final', ['npm', 'test', '--', '--reporter=default', '--reporter=json', '--outputFile=../evidence/b2c/vitest-final.json'], ROOT / 'frontend'),
    ('build', ['npm', 'run', 'build'], ROOT / 'frontend'),
    ('integrity', ['npm', 'run', 'integrity'], ROOT / 'frontend'),
    ('boundaries-and-lock', ['node', 'scripts/verify-b2c.mjs'], ROOT),
    ('diff-check', ['git', 'diff', '--check'], ROOT),
]

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    results = []
    for label, command, cwd in COMMANDS:
        result = subprocess.run(command, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        (OUT / (label + '.log')).write_text(result.stdout)
        entry = {'command': command, 'cwd': str(cwd), 'exit_code': result.returncode, 'status': 'PASS' if result.returncode == 0 else 'FAIL', 'log': 'evidence/b2c/'+label+'.log'}
        results.append(entry)
        print(label, entry['status'], 'exit', result.returncode, flush=True)
    tests = json.loads((OUT / 'vitest-final.json').read_text())
    report = {'timestamp_utc': datetime.now(timezone.utc).isoformat(), 'commands': results, 'tests': {k:tests[k] for k in ['numTotalTests','numPassedTests','numFailedTests','numPendingTests','numTodoTests','success']}, 'scope':'OFFLINE MOCK; no live wallets or chain writes', 'browser':'NOT RUN; see browser-availability.log', 'live_signature_broadcast_write':'NOT RUN / FORBIDDEN'}
    (OUT / 'verification.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report['tests']), flush=True)
    raise SystemExit(0 if all(e['exit_code'] == 0 for e in results) and tests['success'] else 1)

if __name__ == '__main__':
    main()
