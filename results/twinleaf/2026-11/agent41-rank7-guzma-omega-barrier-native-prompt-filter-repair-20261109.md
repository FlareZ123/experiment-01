# Agent 41: genuine Guzma Ω Barrier filtering was a false native prompt abort

**9 November 2026 UTC.** A native replay on a previously published exact original rank-7 Aichi physical game demonstrates a repaired compatibility failure in the common two-player bot adapter. The result is an engine reliability correction, not a candidate deck selection or competitive estimate.

## Actual failure and printed effect

Original rank7, contender seat B, native seed `3550860849`, physical trial `7:6213:B:champion-reference`, exact Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. In [the original Agent3 29-rank artifact](https://github.com/FlareZ123/experiment-01/actions/runs/42556056635) the contender played `Guzma BUS` at accepted Store root96 on global turn23, then attempted a native `ChoosePokemonPrompt` reply at root97. `agent8-actor-only-choose-pokemon.cjs` threw `ChoosePokemon Store returned without resolving the prompt` although native Store had correctly applied a protected-target filter.

The original source player has `Regirock XYP` on the Bench. Its printed **Ω Barrier** prevents effects of an opposing Supporter done to it. Pinned upstream [Regirock XYP class](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-x-and-y-promos/regirock.ts) implements this via `BLOCK_TRAINER_TARGET`; pinned [trainer-target.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/trainer-target.ts) filters the selected Pokémon out of the result array, producing `[]`. Pinned [Store.reducePrompt](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) had successfully resolved the original native prompt. The wrapper's older invariant `before.result === action.result` incorrectly treated a *changed array identity after the legal filter* as an unanswered prompt and aborted the entire game. Pinned Guzma's printed `If you do` second switch must not occur when its original gust is blocked; `SWITCH_IN_OPPONENT_BENCHED_POKEMON` already returns without invoking `onSwitched` on an empty result.

## Executed corrective changes

- Shared `simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs` now version `agent8-actor-only-choose-pokemon-v3-native-trainer-target-filter`. A silent unanswered prompt (original physical prompt `result===undefined`) still aborts. A single selected native Pokémon that is replaced by an empty native target result is recorded as `nativeTargetFiltered` and permitted to continue. An unexpected transformed nonempty result still fails closed. This counts as a native *blocked target*, never a physically confirmed gust.
- Shared `simulation/evaluation/agent7-canonical-actor-composition.cjs` now exports `choosePokemonNativeFiltered` separately from accepted and unchanged/confirmed results in public policy coverage.
- Both-seat pure tests added to `tests/agent8-actor-only-choose-pokemon.test.cjs`. The previous silent-Store-no-op and same-ID prompt replacement tests remain protective.
- Bounded exact original-deal native runner `simulation/evaluation/2026-11/agent41-rank7-guzma-native-target-filter-repair.cjs` runs rank7 seats A/B with the exact original published seeds, original sixties, fixed champion 60, published common bilateral policy and identical Celestial Roar/Underworld Door compatibility hooks. CI [42559097132](https://github.com/FlareZ123/experiment-01/actions/runs/42559097132) completed successfully, including all pure tests and native replay.

## Full native replay result

| Trial | Older native | Repaired native | Repaired source target data |
| --- | --- | --- | --- |
| Rank7 candidate seat A, seed 1554635044 | 260-root cap | Same 260-root cap | 2 accepted, 2 unchanged prompt results, 0 protected-target filters |
| **Rank7 candidate seat B**, seed **3550860849** | **Engine error, root97** | **Natural native terminal, root232** | **1 accepted, 0 unchanged prompt results, 1 genuine native protected-target filter** |

Rank7 B source physical fingerprint stayed `dd79dbb4faf75d916b3cb0666e171d83b0f6198b72f58d80f058aa65371b9bce`; full physical fingerprint stayed `25c691ac716a4bd0168051d78d213f90049ac7320a9b2f3d0dd468d365af5245`. Native winner at the repaired B terminal was original source seat0, with `[6,6]` Prizes at termination, so it cannot be interpreted as a contender Prize-race victory. Native A remained censored at 260 roots. **Paper-qualified games: zero.**

## Disconfirmed alternative and next practical target

A separate reversible `calculatePlayability` orphan cleanup hypothesis was tested first on the *same two exact deals*. CI [42558419012](https://github.com/FlareZ123/experiment-01/actions/runs/42558419012): 3,654 instrumented native playability calls, **zero** orphan removals, identical 97-root B abort and unchanged A cap. The hypothesis is falsified for this failure. It is not installed in the default game runner; keep it out of gameplay benchmarks.

The remaining gameplay-policy weakness is separately actionable: the neutral first-eligible-target chooser selected the visibly protected Regirock instead of another available source Bench Pokémon. A printed public-target-effect screen can avoid squandering Guzma in that state, and should be tested against the same physical frame separately from this engine fix. That is a tactical improvement question requiring native accepted-root and opponent-response evidence, not a reason to alter this paper fidelity correction.
