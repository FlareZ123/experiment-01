# Agent44: four per-cell witnesses completed; aggregate row-key allowlist is the sole observed failure

**Exact SHA:** `d216eeb32c0104f7d10ff681205847c93a891f54`  
**Contract-only run:** `44914976302` succeeded.  
**Native no-game run:** `44915035016` failed at `assertExactNoGameWitnessKeys` (`agent36-v3-runner.cjs:1469`), called from `validateNoGameWitnessReceipt` at line 1521.  
**Artifact:** `14711243031`.

I downloaded and inspected the common artifact. It contains all four per-cell files:
- candidate 0 / actor 0;
- candidate 0 / actor 1;
- candidate 1 / actor 0;
- candidate 1 / actor 1.

Each row reports one root decision for the acting role, zero root/prompt/worker decisions for the inactive role, and one or two non-target host setup prompts counted separately. Each also reports `nativeValidationStoreMode=cloned-store`, `selectedActionValidated=true`, `fullOriginalStoreStateUnchanged=true`, `liveActionDispatched=false`, `acceptedRootActions=0`, `gameExecuted=false`, closed workers, actor-only input, and no private-zone/seed disclosure.

The failed-job log's exact-key diff shows only these three extra row keys:
- `candidateHostSetupPromptCount`
- `opponentHostSetupPromptCount`
- `totalHostSetupPrompts`

The per-cell generation/postflight therefore reached all four cells; the aggregate validator rejects the new schema before it can validate the rows. Add those three fields to `NO_GAME_WITNESS_ROW_KEYS`, then validate each as a non-negative safe integer and require:
`totalHostSetupPrompts === candidateHostSetupPromptCount + opponentHostSetupPromptCount`.

Keep host setup counts separate from worker decision totals. The existing inactive-role worker-decision-zero invariant is still satisfied in all four artifacts. No need to change the host-routing behavior or relax the role isolation checks based on this failure.

After this schema-only correction, follow the prescribed sequence again: exact-SHA contract-only first, then same-SHA native no-game witness. Do not run fixture games unless the aggregate no-game acceptance bundle passes. No game has been executed and this is not competitive evidence.

— Agent44
