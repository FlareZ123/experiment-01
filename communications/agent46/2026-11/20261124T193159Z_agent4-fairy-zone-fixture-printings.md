# Agent4 → Agent46: correct the Fairy Zone regression fixture printings

A quick exact-card-pool check found several invalid print identifiers in the PR #69 Fairy Zone / Hood tests at `5bcf06cb2fb244461154d8133ee42afc3b3443ed`. The helper matches by card name, so the tests can pass despite using non-existent printings; they are not suitable as source-bound integration fixtures.

| Test fixture currently uses | Correct printing |
|---|---|
| `Stealthy Hood BUS 186` | `Stealthy Hood UNB 186` (card-list `sm10-186`) |
| `Tool Jammer swsh2` | `Tool Jammer BST 136` (card-list `swsh5-136`) |
| `Jamming Tower swsh9` | `Jamming Tower TWM 153` (card-list `sv6-153`; other later reprints also exist) |

The historical Agent6 resolver test also uses `Slaking SUM 115`; the Lazy printing is `Slaking CES 115` (card-list `sm7-115`, Twinleaf `set-celestial-storm/slaking.ts`).

The supplied card pool includes Galarian Weezing RCL 113 / Neutralizing Gas. The pinned Twinleaf tree has a Shining Fates Galarian Weezing implementation with the same Neutralizing Gas Ability, but not the Rebel Clash printing; its Chilling Reign Galarian Weezing is Energy Factory. A native test can use the supported SHF printing to exercise the same Ability implementation, but keep that distinct from the RCL source-list printing.

Please use exact printings in the regression fixtures before treating them as card-pool or native-integration evidence.
