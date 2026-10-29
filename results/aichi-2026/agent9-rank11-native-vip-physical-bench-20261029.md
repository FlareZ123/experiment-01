# Agent 9: native source-first Battle VIP Pass effect is physically confirmed

**29 October 2026. Evidence: actual pinned Twinleaf Store action and native ChooseCardsPrompt + physical Bench/deck witnesses. This is a retrospective mechanism study, never a competitive result.**

## Original source and control

- Fixed source: original Aichi Open League 2026 **rank 11**, Wataru Yano Absol/Garbodor exact printed 60 (`results/aichi-2026/full-decklists.json`). Opponent: unchanged rank 1 champion reference.
- Physical deal: prior frozen source-first seed **3149897025**, candidate slot A, source physical seat 1. The same seed and source full-deal fingerprints are checked against the historical canonical baseline through reused `frozenInputs()` and `runVariant('baseline')` from `simulation/evaluation/agent3-source-vip-k1-native-pair.cjs`.
- Source's held first-turn VIP is documented independently in `results/aichi-2026/agent1-original-source-held-opening-census-native-20261029.md`, where the frozen original actor passed without using it.
- Pinned native engine revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, existing canonical runner `simulation/evaluation/agent41-bilateral-v2-development.cjs`; no upstream patches or new simulator.

## Verified positive mechanism (manual CI [40957484916](https://github.com/FlareZ123/experiment-01/actions/runs/40957484916))

The **actual Store** recorded one accepted source-seat1 `Battle VIP Pass FST` item on global turn **1**, zero rejected Item roots, one genuine authenticated source owner-deck `ChooseCardsPrompt`, one native accepted resolution, zero rejected prompt choices, and **one physically confirmed two-Pokémon Bench placement**:

| Witness | Before | After |
| --- | ---: | ---: |
| Source public Bench occupancy | 1 | 3 |
| Source real deck count | 46 | 44 |

Exact chosen native card objects were `Trubbish FST` and `Crobat V DAA`; the same references were found in the corresponding source Benched Pokémon card lists after native prompt resolution. The adapter verified both the deck cardinality decrement and occupied Bench increment. Its audit recorded `nativeBenchConfirmed=1`, `nativeBenchUnconfirmed=0`, `selectedBasics=2`, `unresolvedOwnerSearches=0`. This proves **the identified source-held VIP action and search-to-Bench effect can be dispatched on the pinned real Store** under this model; it does not prove the tactical selection optimal, the remainder of the source policy human-competent, or anything about winning.

All **91** compiled regression tests passed in this run, including the new default-off canonical hook priority and owner-safe mock tests. The workflow was intentionally marked **failed** because an additional report-level check expected a source-side root ledger record with `card === 'Battle VIP Pass FST'`, yet that strict filter returned empty; the next actor reply was thereby also absent from its derived check. The item and physical prompt succeeded independently. The follow-on ledger and next-opponent-root diagnostics were added to the same canonical test runner in a later revision; **do not erase this initial ledger-observation discrepancy**. A third manual run is pending for that additional audit.

## Limitations and reuse

- Only a **retrospectively selected held-VIP physical source deal**, so effect opportunity is enriched by prior observation, not sampled prospectively.
- `withActorBattleVipAfterPass` is explicitly opt-in, uses a detached own-hand/public-board decision and reads deck identities only after a genuine owner-authorized search. It wraps both physical seats but this particular native success exercises source seat 1; separate seat-0 native positive control remains useful.
- The policy consumes the native Item and a valid search-to-Bench choice after canonical Pass. It is not a complete Pokémon TCG playing strategy, does not certify full card draw/shuffle/timing/turn-clock correctness, and never qualifies a simulated terminal for the 99.5% target.
- Competitive-qualified game count remains **0** and exact opposing Top32 coverage remains **29/32** (missing 23, 25, 28).

Versioned code: `simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs`, `simulation/evaluation/agent7-canonical-actor-composition.cjs`, `simulation/evaluation/agent9-original-rank11-vip-native.cjs`; compiled tests `tests/agent9-battle-vip-owner-after-pass.test.cjs`, `tests/agent7-canonical-actor-composition.test.cjs`; manual-only workflow `.github/workflows/supporter-decision-regression.yml`.
