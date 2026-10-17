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

## Exact static-score exposure under a simplified source opening

An independent [BigInt combinatorial model](../../scripts/aichi-bunnelby-bench-priority.cjs) counts every physical initial-seven plus one-draw observation from the exact rank-2 **60-card source inventory**. It conditions on Bunnelby being available in the **initial seven** to begin Active, assumes all other visible Basic Pokémon can occupy Bench slots, and requires at least one Bench Basic with an Evolution in the source list. More than five such Bench Basics are excluded. It ranks the Bench by the exact pinned *static* score described above, selects two, and asks whether a non-evolving Basic displaces any Stage-capable Basic.

| Precisely defined event | Exact source probability |
| --- | ---: |
| Initial Bunnelby Active opportunity plus at least one evolving Bench Basic, within Bench limit | **12.19644349%** of all first-eight observations |
| A non-evolving Basic is selected over an unselected evolving Basic in that condition | **1.89733285%** of all first-eight observations |
| Same displacement conditional on the qualifying opening | **15.55644356%** |
| Any evolving Basic omitted by the two-target limit, conditional on qualifying opening | **17.89040621%** |
| Excluded configurations with more than five remaining Basic Pokémon on Bench | **0.00442129%** of all first-eight observations |

The exact arithmetic uses integer numerators: denominator `20,468,966,760`, qualifying `2,496,485,964`, non-evolving displacement `388,364,430` and any omission `446,631,480`. The denominator integrates the 7-of-8 possible opening-hand locations of a singleton Bunnelby, so it models initial-seven legality rather than treating a turn draw as an opening Active. [Independent toy-deck ordered enumeration and source assertions](../../tests/aichi-bunnelby-bench-priority.test.cjs) are committed. The model was also cross-checked in an independent local Python combinatorial enumeration and 750,000-draw Monte Carlo. The new repository test has **not** been executed in CI.

**This is a card-visibility and default-score diagnostic, not an actual TM Evolution misplay rate.** It excludes six-Prize Stage survival, TM and Energy access, Supporter/discard economics, Bench-placement choices, turns when Bunnelby begins Benched or enters later, and opponent disruption. Conditional percentages refer only to the deliberately simplified event above. The calculation strengthens the case that the stage-target selector can matter, without predicting its game-win benefit.

## Separately selectable remedy

[New target resolver](../../simulation/twinleaf/bunnelby-evolution-policy.cjs) is `BunnelbyStageTargetResolver` via `withBunnelbyEvolutionLine(...,{sourceCards,targetAwareEvolution:true})`. It handles only an actual `CHOOSE_POKEMON_TO_EVOLVE` prompt in the attack phase when Bunnelby PRC has TM Evolution PAR. It filters Bench targets for which at least one relevant Stage card is **possibly** searchable under the known original 60 minus publicly known zones. Prior to any first true deck search, hidden Prizes are excluded from the decision. After the independent, live-State-guarded K1 observation, exact deck membership is allowed. It uses the pinned score among the eligible targets, respects prompt validation and falls back to the generic resolver when it cannot produce an accepted choice.

The primary [headless runner](../../simulation/twinleaf/headless.cjs) exposes an explicit `bunnelbyTargetAwareEvolution:true` flag that requires `bunnelbyK0SafeEvolution:true`; it preserves the frozen legacy and K0-only profiles and labels this new action policy `BunnelbyStageTargetResolver-v1`. This can be composed with `bunnelbyObservedK1:true`, which independently requires a genuine live Store prompt to transition K0→K1.

## Verification state

[Three proposed pinned tests](../../tests/bunnelby-tm-target-selection.test.cjs) contrast generic target choice against the new filtered target choice and check that the target choice is invariant across two K0-indistinguishable Gloom Prize partitions. A separate [both-seat source-60 smoke](../../tests/bunnelby-k1-headless-smoke.test.cjs) checks the flags and version labels. They are included in the existing manually dispatched [TM workflow](../../.github/workflows/aichi-tm-attack-policy.yml) with no per-commit automation.

The workflow dispatch tool returned a safety block during this incarnation. Consequently, these new tests still need a successful compiled pinned-engine run. The arithmetic finding is sourced and verified; the engine-policy correction remains **implemented but not compiled-validated**. Next, validate the real prompt and produced Stage evolution under an authentic source-ranked first-going-second Bunnelby/Guzma & Hala/Jet/TM deal and an opponent continuation. Zero competitive games have been qualified.
