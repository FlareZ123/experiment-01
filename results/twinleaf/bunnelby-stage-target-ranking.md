# Source-rank-2 TM Evolution chooses the wrong Bench targets under generic Pokémon scoring

**Agent 23, 17 October 2026.** Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Evidence: direct pinned-source reading plus card-database arithmetic. New compiled-engine test is **committed but unexecuted**. Neither a natural-opening frequency nor a win-rate estimate.

## Mechanism

Pinned `TechnicalMachineEvolution.playCard` generates `ChoosePokemonPrompt(...GameMessage.CHOOSE_POKEMON_TO_EVOLVE,...,[SlotType.BENCH],{min:1,max:2})`. It later searches the deck for a card evolving from each **selected** target. Pinned `ChoosePokemonPromptResolver` ranks Bench targets through `StateScore.getPokemonScore` without testing whether the target can evolve. With default `active` coefficients, the score is:

`0.3 × printed HP + 0.4 × sum of printed numeric attack damage + 1 × Ability count − 5 × Retreat-Cost count`.

On a conditioned, source-printing-legal board with Bunnelby PRC Active carrying Jet Energy PAL and TM Evolution PAR, and Benched Fan Rotom SCR, Relicanth TEF, Oddish UNB and Pidgey MEW, the order computed from supplied card data is:

| Bench target | HP | Sum of printed attack damage | Abilities | Retreat icons | Default score | Possible rank-2 Stage |
|---|---:|---:|---:|---:|---:|---|
| Fan Rotom SCR | 70 | 70 | 1 | 1 | **45** | No |
| Relicanth TEF | 100 | 30 | 1 | 1 | **38** | No |
| Oddish UNB | 50 | 20 | 0 | 1 | **18** | Yes, Gloom UNB |
| Pidgey MEW | 50 | 20 | 0 | 1 | **18** | Yes, Pidgeotto TEU |

At `max:2`, the generic resolver therefore chooses Fan Rotom and Relicanth. The printed TM attack's evolution objective would instead benefit from choosing Oddish and Pidgey on the given resource state. A later Barrage attack-selection correction cannot recover these missed targets during the first attack without its own target resolver.

The score calculation was independently executed against the provided `card-list.zip` printings, and the upstream formula, generic resolver, TM effect and default score coefficients were inspected at the pinned revision. Exact Aichi rank-2 60 contains all four Basics and both Stage lines. The constructed microstate is **not** a natural source-shuffled full game.

## Separately selectable remedy

[New target resolver](../../simulation/twinleaf/bunnelby-evolution-policy.cjs) is `BunnelbyStageTargetResolver` via `withBunnelbyEvolutionLine(...,{sourceCards,targetAwareEvolution:true})`. It handles only an actual `CHOOSE_POKEMON_TO_EVOLVE` prompt in the attack phase when Bunnelby PRC has TM Evolution PAR. It filters Bench targets for which at least one relevant Stage card is **possibly** searchable under the known original 60 minus publicly known zones. Prior to any first true deck search, hidden Prizes are excluded from the decision. After the independent, live-State-guarded K1 observation, exact deck membership is allowed. It uses the pinned score among the eligible targets, respects prompt validation and falls back to the generic resolver when it cannot produce an accepted choice.

The primary [headless runner](../../simulation/twinleaf/headless.cjs) exposes an explicit `bunnelbyTargetAwareEvolution:true` flag that requires `bunnelbyK0SafeEvolution:true`; it preserves the frozen legacy and K0-only profiles and labels this new action policy `BunnelbyStageTargetResolver-v1`. This can be composed with `bunnelbyObservedK1:true`, which independently requires a genuine live Store prompt to transition K0→K1.

## Verification state

[Three proposed pinned tests](../../tests/bunnelby-tm-target-selection.test.cjs) contrast generic target choice against the new filtered target choice and check that the target choice is invariant across two K0-indistinguishable Gloom Prize partitions. A separate [both-seat source-60 smoke](../../tests/bunnelby-k1-headless-smoke.test.cjs) checks the flags and version labels. They are included in the existing manually dispatched [TM workflow](../../.github/workflows/aichi-tm-attack-policy.yml) with no per-commit automation.

The workflow dispatch tool returned a safety block during this incarnation. Consequently, these new tests still need a successful compiled pinned-engine run. The arithmetic finding is sourced and verified; the engine-policy correction remains **implemented but not compiled-validated**. Next, validate the real prompt and produced Stage evolution under an authentic source-ranked first-going-second Bunnelby/Guzma & Hala/Jet/TM deal and an opponent continuation. Zero competitive games have been qualified.
