# Agent 49: reproducible Twinleaf Simulator Card-reference leakage

**Date:** 16 October 2026 UTC. **Evidence class:** direct pinned-engine state-mutation test. **Status:** reproduced in [manual CI 38847364140](https://github.com/FlareZ123/experiment-01/actions/runs/38847364140), whose job completed successfully.

## Question

Does a speculative `Simulator` action mutate state held by the original Store because its clone preserves Pokémon `Card` object identity?

## Source mechanism

At pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/bots/simulator.ts` constructs `this.store.state = deepClone(state, [Card])`. The supplied `deepClone` returns the original object whenever its `ignores` list matches, so a `PokemonCard` is shared between the source state and speculative state. The attack reducer in `ptcg-server/src/game/store/effect-reducers/attack-effect.ts` increments `targetCard.damageTakenLastTurn` when damage is applied and that field exists; the base `PokemonCard` defines the field initialized at zero.

These source facts predict that resolving a speculative attack's damage may change a field of the source game's card instance.

## Executed characterization

Reproducer: [simulator-card-isolation-audit.cjs](../../simulation/twinleaf/simulator-card-isolation-audit.cjs). It stages the existing genuine Tool-attack fixture with active Meloetta ex SV11B, three Basic Psychic Energy, Technical Machine: Crisis Punch PAF, and opposing active Shadow Rider Calyrex VMAX CRE. It constructs a `Simulator` from the staged source Store, dispatches `AttackAction(101, 'Crisis Punch')`, and resolves three real pending Wait prompts. Source-state board and card fields are inspected **before** and **after** the simulated attack.

| Observation | CI value |
| --- | --- |
| Pinned Twinleaf revision | `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` |
| Cloned and source `PokemonCard` strictly identical | `true` |
| Speculative defender board damage | `280` |
| Source defender board damage before / after | `0 / 0` |
| Source defender `PokemonCard.damageTakenLastTurn` before / after | `0 / 280` |
| Direct mutation of source card field | `true` |
| Real Wait prompts resolved | `3` |

The test restores the original source `damageTakenLastTurn` in a `finally` block; it does not intentionally change vendor code. [Audit workflow](../../.github/workflows/twinleaf-simulator-card-audit.yml) is manual-only, compiling exactly the repository-pinned submodule.

## Impact and boundaries

**Established:** a speculative, successfully resolved attack can mutate an original game's Pokémon Card field even though the original board's damage counters remain unchanged. This violates a strict noninterference requirement for simulations and makes the simulator's Card-identity treatment a concrete engine-quality risk.

**Not established:** the frequency of this mutation during ordinary `SimpleTacticsAi` scoring, whether that field affects current-game decisions, whether other mutable card fields leak, and any change to a candidate's win rate. Real gameplay and simulated prompt resolution can follow different paths. No deck-strength estimate follows from this test.

**Research response:** [experimental detached-simulator-hook.cjs](../../simulation/twinleaf/detached-simulator-hook.cjs) pre-clones the full object graph before invoking the original Simulator and is opt-in. Do not enable it in a benchmark until a real pinned-engine differential test establishes attack functionality, card identities and source noninterference. The upstream submodule should remain unmodified. When comparing actual games, preserve baseline and opt-in policy labels, seed plans and opponent inventories.

**Priority next:** characterize the detached hook on the same source-backed Tool attack. If that passes, test a small fixed-seed game with and without the hook and inspect any bot-policy or game-event divergences without calling them win-rate evidence.

## Follow-up: tested detached Card clone

[Manual CI 38847672445](https://github.com/FlareZ123/experiment-01/actions/runs/38847672445) compiled pinned Twinleaf, passed the two [wrapper contract unit tests](../../tests/detached-simulator-hook.test.cjs), and ran the same real, staged Tool attack with and without the opt-in [detached simulator](../../simulation/twinleaf/detached-simulator-hook.cjs):

| Measure | Unmodified Simulator | Detached research Simulator |
| --- | --- | --- |
| Simulator shares live target Card identity | yes | no |
| Simulated damage to target | 280 | 280 |
| Live target Card field changed | yes | no |
| Live board damage changed | no | no |

The [differential runner](../../simulation/twinleaf/detached-simulator-characterization.cjs) asserts all four invariants and restores its hook in a `finally` block. **This supports a mechanism-specific mitigation for one controlled effect; it is not a generally certified replacement Simulator.** A separate source-locked whole-game comparison is being investigated without altering default policy.


## Full-game policy sensitivity: original versus detached Simulator

[Manual CI 38847922347](https://github.com/FlareZ123/experiment-01/actions/runs/38847922347) passed the staged regression and then ran the [fixed-seed source-locked comparison](../../simulation/twinleaf/detached-simulator-game-contrast.cjs) with rank-1 Shadow Rider versus rank-10 Regidrago from the published 60-card source lists.

Both games used source deck hashes `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311` and `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`, seed `20261049`, `maxActions=350`, first player seat 1, experimental Supporter/Double-Dragon/Forest Seal policy corrections, independent per-seat speculative RNG and the same game RNG scheme.

| Metric | Original Card-aliased Simulator | Detached Simulator |
| --- | --- | --- |
| Engine result | seat 0, Shadow Rider | seat 1, Regidrago |
| Game completed | yes | yes |
| Actions | 248 | 192 |
| Turns | 22 | 17 |
| Attack actions by seat 0 / 1 | 6 / 5 | 4 / 5 |
| Final Prizes remaining by seat 0 / 1 | 0 / 1 | 2 / 0 |
| Deterministic trace fingerprint | `67d724d4069f4efbd2ee10ac0bd8a0c1f1d6536e5150da27f0aea302dcc44dc3` | `a8db394798b92d72aa17c0095f4afe9f94ff18851f7e26b56dee58bca7c508a7` |

**Interpretation:** replacing Simulator's live-Card reference sharing with a detached object graph, while holding source lists and seed fixed, changed the bot game's decisions or downstream game events enough to reverse the engine-reported winner. This is **real whole-game sensitivity**. It does not isolate which particular field or action caused the divergence. The clone also changes reference identity that other upstream code could intentionally rely upon, so reverse causation or alternative mechanisms are not yet excluded. The fixed-seed pair is **one diagnostic comparison, zero qualified competitive samples**, with neither bot policy certified as skilled play. Do not use either game's winner to rank the decks.


## Direct proof that contaminated state changes real attack resolution

[Manual CI 38848554287](https://github.com/FlareZ123/experiment-01/actions/runs/38848554287) passed a source-card, pinned-Store characterization in [simulator-counter-phantom-damage.cjs](../../simulation/twinleaf/simulator-counter-phantom-damage.cjs). It uses real engine source printings `Shadow Rider Calyrex V CRE` with one Psychic Energy and `Conkeldurr V PGO` with one Fighting Energy, a conditioned turn-4 board, and real `Shadow Mist`, `PassTurnAction`, between-turn Wait prompts, and `Counter` actions.

| State/observation | No speculative action | Unmodified Simulator speculative Shadow Mist | Detached Simulator speculative Shadow Mist |
| --- | ---: | ---: | ---: |
| Simulated damage to Conkeldurr | N/A | 20 | 20 |
| Actual game-board damage to Conkeldurr | 0 | 0 | 0 |
| Live Conkeldurr card's `damageTakenLastTurn` before real Counter | 0 | **20** | 0 |
| Actual resolved Counter damage to Shadow Rider V after its Fighting Resistance | **0** | **10** | **0** |

This establishes a **direct game-mechanics consequence**. The unmodified speculative simulation puts 20 **phantom** damage in a source Card history field even though the board has zero damage. A subsequent actual Counter attack reads that field, producing 10 actual damage after the defending Shadow Rider's -30 Fighting Resistance. In both control and detached-hook conditions, Counter resolves for 0. These are actual pinned reducer and prompt outcomes, not predicted damage.

**Scope:** the test stages a legal-energy conditioned midgame board; the board is not a sampled opening or an archived Aichi whole-game decision. It proves an engine error is *reachable if a simulator performs the indicated speculative attack*, independent of claims that a normal policy actually selects it during a source-ranked match. This is a stronger causal demonstration than the earlier source Card-mutation-only probe. The prior full-game changed winner is policy sensitivity and does not identify which specific field caused divergence.

