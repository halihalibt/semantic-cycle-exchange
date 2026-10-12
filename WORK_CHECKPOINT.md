# Application development milestones

Semantic Cycle Exchange is a public application using the independently reusable [Semantic Cycle Accord](https://github.com/halihalibt/semantic-cycle-accord-genlayer) contract. For current functionality, begin with the [README](README.md), [public demonstration](DEMO.md) and [architecture](docs/ARCHITECTURE.md).

| Milestone | Recorded outcome | Supporting documentation |
| --- | --- | --- |
| Public finalized reads | Wallet-free exploration of Intents, Assessments and Cycles | [Historical B1 report](docs/PHASE_B1_REPORT.md) |
| Intent and Cycle workflows | Discovery, record management, directed matching and review screens | [User flows](docs/PHASE_B2B_USER_FLOWS.md) |
| Wallet transaction integration | Explicit preflight, one-attempt signing request and state reconciliation | [Architecture](docs/ARCHITECTURE.md) · [Security](docs/SECURITY_BOUNDARIES.md) |
| Onchain E2E | Cycle #2 ACTIVE; Cycle #3 ABORTED; Intent #8 CANCELLED | [Demo](DEMO.md) · [Evidence index](docs/FINAL_ONCHAIN_EVIDENCE_INDEX.md) |
| Application regression | 541 passing tests in the recorded release suite | [Release verification](evidence/final-delivery/verification.json) |
| Browser acceptance | Seven user-operated wallet continuity checks passed | [Windows Chrome acceptance](docs/WINDOWS_CHROME_WALLET_ACCEPTANCE.md) |
| Public release | GitHub Pages deployed and accepted by the user | [Live application](https://halihalibt.github.io/semantic-cycle-exchange/) |

The complete canonical contract source is included at [intelligent-contract/contracts/semantic_cycle_accord.py](intelligent-contract/contracts/semantic_cycle_accord.py). The application does not custody keys or execute transactions without an explicit wallet request. **ACTIVE means accepted service commitments, not completed service delivery.** The positive live `expire_cycle` case remains **NOT RUN / TIME-GATED**.

The original dated development checkpoints, including failed browser attempts, offline limitations and unmerged-stage states, are available at their original `docs/` and `evidence/` paths and in [Git history](https://github.com/halihalibt/semantic-cycle-exchange/blob/8bdc8f99a708a842d2905d6420cb45aa829d0e24/WORK_CHECKPOINT.md). Older status statements describe those past observations and are not the current release state.
