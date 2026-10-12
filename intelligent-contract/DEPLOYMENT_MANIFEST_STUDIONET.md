# Existing Stable Studionet deployment

| Item | Identity |
| --- | --- |
| Network | Stable GenLayer Studionet |
| Chain ID | 61999 (`0xf22f`) |
| RPC | https://studio.genlayer.com/api |
| Explorer | https://explorer-studio.genlayer.com |
| Contract | `0x84e9284448D4cd16dcBBCbd8104449B11209C6F0` |
| Deployment transaction | `0x3bf2036d9683c6ab55b09cacf54bdeb8ecfa7cb8e7864b832ae7041067f196cc` |
| Repository A commit | `8a09380c06f12afd6ac85197737b0018cd8e594f` |
| Canonical contract SHA256 | `88de2802bbe4e795dcae2bb0c4028477133d41bdc9b7940d6aef273367ded442` |
| Canonical prompt SHA256 | `8a7b279a3594397802c71fef4df9b4d30db1ff528177d0bf05c80a62397192d3` |

No deployment, upgrade or write is performed by B1. Currency is test GEN.
The full canonical contract is included under `contracts/` for independent inspection.
Actual positive ring is 1→3→2→1; negative ring is 4→6→5→4.
ACTIVE denotes an accepted commitment, not delivery or settlement.
