# Agent 6: pinned Tool Jammer no-op, ToolEffect-level repair and native both-seat receipt

**2 November 2026, 15:51 UTC | genuine pinned Twinleaf native staging | 0 competitive games**

## Primary finding: source-level root cause

Directly inspected the actual pinned upstream revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/sets/09-sword-and-shield/set-battle-styles/tool-jammer.ts`: `ToolJammer.reduceEffect` handles only `TrainerEffect`; the body of that branch is commented out and returns the original state. In the examined handler there is **no live ToolEffect suppression**. Pinned code: https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-battle-styles/tool-jammer.ts
- `ptcg-server/src/sets/06-black-and-white/set-plasma-freeze/float-stone.ts`: on `CheckRetreatCostEffect`, Float Stone calls `IS_TOOL_BLOCKED(store,state,effect.player,this)` and then removes the Colorless retreat cost when it reports false.
- `ptcg-server/src/game/store/prefabs/prefabs.ts`: `IS_TOOL_BLOCKED` reduces `new ToolEffect(player,card)`; it interprets a thrown result as blocked. The pinned `JammingTower.reduceEffect` does exactly this by throwing for matching ToolEffect. The Tool Jammer card's missing implementation therefore has a direct operational mechanism for the tested missed suppression. Source: https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/jamming-tower.ts

This is a **code-level finding** about the pinned implementation, supported by earlier native [failing unguarded cases](agent6-tool-jammer-floatstone-native-fidelity-20261102.md) with the exact original Aichi rank30 Latias ex SSP / Float Stone versus opposing Active Tool Jammer. It does not assert all Tool/Tool Jammer effects are broken in all contexts. Other independent handlers may implement additional effects.

## Research-owned general boundary, isolated and opt-in

[agent6-tool-jammer-tool-effect-guard.cjs](../../simulation/twinleaf/agent6-tool-jammer-tool-effect-guard.cjs) wraps **one existing Store's** `reduceEffect` synchronously, restoring the original method in `finally`. When a `ToolEffect` concerns the owner's actually attached Active Tool, the opponent's Active carries Tool Jammer, the owner Tool is not itself Tool Jammer, and the opponent's Tool Jammer is not blocked by the pinned `IS_TOOL_BLOCKED`, the adapter throws an explicit marker. This lets the existing native `IS_TOOL_BLOCKED` path veto Float Stone without modifying the upstream submodule. No app-wide default-on patch or card definition edit.

Six [pure tests](../../tests/agent6-tool-jammer-tool-effect-guard.test.cjs) cover the active case, absent jammer, blocked jammer, own Tool Jammer exemption, Bench/unrelated and other-player effects, and `finally` restoration. Their existing manual workflow step **passed** in [Actions run 41475356421](https://github.com/FlareZ123/experiment-01/actions/runs/41475356421).

## Compiled original Store result: 4/4 staged correction

The newly added independent `runEffectRepair()` option in [native stage](../../simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs) executed against the authentic pinned compiled Store. Frozen exact original source position and counterexample modes:

| State (Latias ex SSP with Float Stone BKT, no Energy) | Physical source seat | Native patched cost | Actual RetreatAction |
| --- | --- | ---: | --- |
| Path to the Peak + enemy Active Tool Jammer | 0 | 2 | Rejected: NOT_ENOUGH_ENERGY |
| Path to the Peak + enemy Active Tool Jammer | 1 | 2 | Rejected: NOT_ENOUGH_ENERGY |
| Enemy Active Iron Thorns ex with Tool Jammer | 0 | 2 | Rejected: NOT_ENOUGH_ENERGY |
| Enemy Active Iron Thorns ex with Tool Jammer | 1 | 2 | Rejected: NOT_ENOUGH_ENERGY |

Each row returned **two actual ToolEffect interception receipts** (one for the independent cost check, one for the attempted native retreat), retained Active Latias, and passed every field including native ability block, native retreat cost, owner-public decision guards and physical rejection. Summary: **stagedNativeCases=4, failedChecks=0, qualifiedCompetitiveGames=0**.

- [Manual CI 41475356421](https://github.com/FlareZ123/experiment-01/actions/runs/41475356421), exact head `cba2eeb24eba7956f02c6b51abf51bd08658e609`, vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Archived native JSON ZIP artifact 13158030503](https://github.com/FlareZ123/experiment-01/actions/runs/41475356421/artifacts/13158030503), independently downloaded ZIP SHA-256 `46533e4694ab66a9e46a39b2ecaac5407612195483a46e1771fdab8ee4339140`, agrees with GitHub artifact digest. Internal member `agent6-tool-jammer-effect-repair.json`.
- Workflow overall intentionally red from separate unchanged, paper-invalid **native baseline** stage. Both old narrowly scoped cost repair and new ToolEffect repair steps succeeded. The counterexample has not been hidden or silently overwritten.

## Hard limitations and next falsification

The stage sets up a natural-looking public board manually, rather than playing the actual original 60s from shuffled starts. It only proves that `Float Stone` invokes the shared ToolEffect checking path, and an attached Active enemy Tool Jammer can block it under these cases. It does **not** certify interactions of other attached Tools whose cards might skip this check, whether an authentic played Tool Jammer has the same behavior, all suppression/Tool lock priority, effects of damaged or moved Pokémon, any complete owner actor, or the paper event clock.

Recommended independent tests: another physically staged Tool that uses `IS_TOOL_BLOCKED`, a native attached Active opponent Tool Jammer applied through an authentic action instead of direct staging, own Tool Jammer exemption and opposing Jammer cancellation under Jamming Tower. After those, integrate only a versioned, prospectively selected symmetric common Store guard with full source payment and opponent continuations. Until then, do not promote engine game terminals to tournament wins.

**Aichi 2026 original sources 29/32, ranks 23/25/28 missing; no selected best fixed sixty, zero qualified games, 99.5% not demonstrated.**
