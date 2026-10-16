# Snorlax PGO Block is bypassed by Twinleaf's interactive retreat-start path

**Agent 19, 16 October 2026.** Pinned engine `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a reproduced game-rule implementation defect, with a narrowly scoped research-side correction. It is not a completed matchup or a win-rate observation.

## Why it matters to the Aichi field

The exact published Aichi rank-3 and rank-7 Snorlax Stall source inventories include Snorlax PGO 55. Its printed *Block* Ability prevents the opponent's Active Pokémon from retreating while Snorlax is Active. Source-locked conditional opening feasibility and the Hood counters are separately documented in [our opponent inventory report](../aichi-2026/snorlax-solo-block-counterplay.md). Stall strength requires a rules-faithful retreat path. However, the currently pinned SimpleTacticsAi `retreat-tactic.ts` constructs **`RetreatAction`**, which already enforces Block. This defect therefore does not itself establish contamination of existing default-bot Aichi outcomes. It directly affects the distinct interactive `RetreatStartAction` path and any future policies that use it.

## Pinned source-level cause

The pinned `Snorlax` implementation at `ptcg-server/src/sets/09-sword-and-shield/set-pokemon-go/snorlax.ts` checks `effect instanceof RetreatEffect` and throws `BLOCKED_BY_EFFECT` if its active Ability can apply to the opponent's retreating Active. That implementation correctly invokes the source Ability target probe; Stealthy Hood may suppress the effect, and the separately documented research Tool Jammer hook restores the relevant Active Tool shutdown.

The pinned `player-turn-reducer.ts` permits two actions:

- `RetreatAction` invokes `new RetreatEffect(player, benchIndex)`, which triggers Snorlax's prohibition.
- `RetreatStartAction` invokes `new RetreatStartEffect(player)` for the interactive pay-energy/choose-Bench flow.

The pinned `retreat-effect.ts` validates a limited `cannotRetreatWhileActive` flag and then switches via `retreatPokemon()` from its ChoosePokemonPrompt continuation. It never invokes `RetreatEffect` on that route, so Snorlax's actual `RetreatEffect` handler is skipped. This is a precise action-routing defect, not a vague concern that the bot might choose incorrectly.

## Reproduced full Store actions

[Deterministic 8-case characterization fixture](../../simulation/twinleaf/snorlax-retreat-action-characterization.cjs) constructs a Pokémon TCG Expanded turn-3 state with Shadow Rider Calyrex V Active, Latias ex SSP on Bench (making Basic retreat cost zero), and opposing solo Snorlax PGO Active. Four combinations of Stealthy Hood on Shadow Rider and Tool Jammer on Snorlax each run both actual `Store.dispatch` action interfaces, including the full choose-Pokémon prompt when needed. Tool Jammer's known upstream issue is fixed with the existing research-side hook during both comparisons.

| Shadow Rider Hood | Opposing Active Tool Jammer | Unpatched direct `RetreatAction` | Unpatched interactive `RetreatStartAction` | Patched interactive action |
| --- | --- | --- | --- | --- |
| Absent | Absent | Blocked | **Retreats illegally** | Blocked |
| Present | Absent | Retreats | Retreats | Retreats |
| Present | Present | Blocked | **Retreats illegally** | Blocked |
| Absent | Present | Blocked | **Retreats illegally** | Blocked |

The same exact state has zero retreat **cost** in all cases. The target is a valid Bench Pokémon. The original direct action has `BLOCKED_BY_EFFECT` and retains Shadow Rider Active when prohibited. The original interactive route instead resolves `ChoosePokemonPrompt` and actually promotes Latias ex. The experimental corrected interactive route agrees with the direct action in all four configurations.

**Evidence:** manual [source/Store CI 38840267279](https://github.com/FlareZ123/experiment-01/actions/runs/38840267279) archived original unpatched eight-case observations as artifact `12020439869`; manual [original versus corrected CI 38840589023](https://github.com/FlareZ123/experiment-01/actions/runs/38840589023) passed two compiled Store tests after confirming all 16 original/corrected action scenarios. Both use the same pinned engine and a bounded, explicitly constructed legal board.

## Reversible research correction

[Research-owned opt-in hook](../../simulation/twinleaf/snorlax-retreat-start-hook.cjs) patches `Snorlax.prototype.reduceEffect` at runtime and restores it afterward. When called with `RetreatStartEffect`, it runs the original card's already implemented `RetreatEffect` legality gate with a dummy Bench index. Snorlax's Block handler examines the player and state, and has no Bench-index dependency. If that original legality check permits action, the hook delegates the original `RetreatStartEffect` normally. This preserves the original Ability-blocking/Stealthy Hood logic instead of reimplementing rules.

The shared `headless.runMatch` now accepts optional `snorlaxRetreatStartCorrection:true`, records the flag, and appends `SnorlaxBlockStartGate-v1` to its policy provenance. Default false retains the pinned-engine baseline for honest comparisons; experiments must label policy and correction differences. The opt-in headless runtime provenance and restoration regression passed together with the compiled Store regressions in [manual CI 38840797499](https://github.com/FlareZ123/experiment-01/actions/runs/38840797499): three tests passed. Source-locking the fixed diagnostic now also permits an explicitly selected `snorlaxRetreatStartCorrection` boolean without changing default match semantics.

This targeted hook repairs only Snorlax PGO. Other cards with retreat restrictions could be affected by the same dual-action mismatch; checking such implementations is an independent next experiment.

## Limitations and future work

The staged board fixture proves the direct versus interactive action discrepancy and corrected local permission path, including Hood/Jammer. The pinned SimpleTacticsAi retreat tactic explicitly constructs `RetreatAction`; default headless matches therefore do not exercise this defect through its ordinary retreat tactic. The pinned socket layer also exposes a `retreatStart` route that constructs `RetreatStartAction`, so the bug is meaningful for that interactive interface and any policy choosing it. This fixture does not establish how frequently real UI clients select the route. It does not model full 60-card deck draws, opponent Bench commitments, Energy/recovery decisions, or lock strategy. Source deck legality and engine mappings remain separately qualified.

Further research should capture and count `RetreatStartAction` versus `RetreatAction` in alternative policies and interactive clients, and enumerate other pinned card effects that handle only one retreat interface. Extend the hook or related compatibility boundary based on an adversarial action test. Do not promote Snorlax matchup terminal results as competitive evidence until this path is corrected and meaningful opponent lock strategies have been validated.

No competitive win-rate claim is supported, and the 99.5% goal remains unmet.
