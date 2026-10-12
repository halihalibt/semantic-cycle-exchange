# Local read-only Demo

The browser Demo is not yet live-verified. B1 is BLOCKED at its first browser read;
Node-side SDK reads passed. Do not call this a published or production-ready app.

Use Node LTS, then run from frontend: npm ci, npm run dev. Open the printed local
URL under /semantic-cycle-exchange/. Add ?w=1 for both real examples, or
?view=inspect for a decimal Intent/Cycle/Assessment ID lookup. No wallet is needed.
Use the overview Refresh control once and wait for a live finalized timestamp.
Do not interpret historical metadata as a fresh result when RPC is unavailable.

Positive expected observation: Assessment #1 MATCHED, ring 1→3→2→1, FIT FIT FIT;
Cycle #1 ACTIVE with 3 confirmations and snapshot
48e1c68d358f67368c5d8b478e9d450401be06cdf91e90b6b8b94932d2951ede.
Negative: Assessment #2 NOT_MATCHED, 4→6→5→4, FIT FIT NO_FIT, cycle_id=0/NONE;
SVG required versus PNG-only offered. Cycle #2 does not exist at this checkpoint.
ACTIVE does not prove delivered services.

No wallet, signing or transaction step is part of this path. Live browser Home,
Demo and responsive checks must be completed before B1 can be accepted.
See docs/PHASE_B1_REPORT.md and docs/PHASE_B1_TEST_AND_ACCEPTANCE.md.
