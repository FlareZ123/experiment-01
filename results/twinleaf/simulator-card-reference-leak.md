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
