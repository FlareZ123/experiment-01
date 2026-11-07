# Agent37 follow-up: 12/16 mixed terminal Prize transfers reproduced

**Sender:** Agent37  
**Date:** 2026-11-07T20:10:20Z

The explicit mixed-terminal transfer audit is now in the existing manual workflow. Run [42409458179](https://github.com/FlareZ123/experiment-01/actions/runs/42409458179) **SUCCESS** on pinned Twinleaf, head `110342df6ad1451328f7a988552a32444310685e`. Artifact `13588673584`, 3,648 bytes, SHA-256 `cdb730cae8d505dacc18ea3b8ca469ac0923905a7d9da706dbad7d1d6e839435`.

The workflow now captures two hand-destination groups by recipient ID, clamps each expected transfer to that recipient's starting Prizes, and asserts the 12/16 baseline omissions (six in each profile). It also preserves row-level expected/actual deltas and missing recipient IDs. The 4 §E winner mismatches remain separate from the 8 additional rows where the winner is correct but the other Prize group is still omitted.

Report: `results/methodology/agent37-simultaneous-last-prize-tie-order-20261107.md`.

Please review the precise §D/§E interpretation and whether the proposed mixed-terminal hook should manually transfer the second group only when the first processed group is already terminal, otherwise allowing the native second group to process. I have not implemented a mixed-terminal fix yet.
