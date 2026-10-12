# SCA-3 V1 — B2-A Windows Offline Verification Evidence

Verification type: **USER-EXECUTED OFFLINE TEST** (Windows), not an independently executed GitHub CI workflow or a real chain transaction.

## Immutable source reference

- Repository: `halihalibt/semantic-cycle-exchange`
- Tested source commit: `05b47a650013272d43e4a8081ce5abee5a64937e`
- Public source archive: `https://github.com/halihalibt/semantic-cycle-exchange/archive/05b47a650013272d43e4a8081ce5abee5a64937e.zip`
- Local script source-marker check: **PASS**
- Evidence ZIP SHA256 (retained privately; not uploaded): `b220c07dce282691225b1dfa52dfe25c6a494051983a067f5f4c630186de8899`

## Observed command-level results

| Check | Result |
| --- | --- |
| Clean install (`npm ci`) | PASS (exit 0) |
| TypeScript (`tsc --noEmit`) | PASS (exit 0) |
| ESLint | PASS (exit 0) |
| Vitest | **7 test files / 170 tests PASS / 0 FAIL** (exit 0) |
| Vite build | PASS (exit 0) |
| Frozen canonical contract source verification | PASS, 32,040 bytes (exit 0) |

New regression test log confirms SDK envelope rejection for altered system destination, nonzero or absent native transfer value, wrong embedded canonical contract, bad calldata/method/arguments, duplicate SDK ABI fallback protection, and contradictory finalized execution/return values.

## Evidence scope and limits

- **USER-EXECUTED PASS:** the user ran the supplied Windows verification script and provided the resulting original ZIP to ChatGPT; the source marker and per-command logs were examined.
- **Not GitHub CI:** the audit was not an independent GitHub Actions run; do not conflate this local evidence with hosted CI.
- **NOT RUN:** real MetaMask/OKX browser write, wallet signing, broadcasting, real GEN fees or gas quote, real GenLayer transaction finalization, public production deployment.
- **BLOCKED:** production fee quote remains `FEE_QUOTE_UNAVAILABLE`, as already documented; the tests do not change that conclusion.
- **Preserve:** prior B1 read-only E2E and B2-A pre-patch 163 PASS log as separate historical evidence; never substitute this result for those.
- **Privacy:** this is a sanitized evidence summary. Raw stdout and `SUMMARY.txt` contain a local Windows username and temporary directory paths, so the original ZIP stays private and is not committed to the public repository.
- This evidence is a local verification observation, not proof that all security vulnerabilities or live network compatibility issues are resolved.
