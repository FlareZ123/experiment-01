# ActionEnumerator coverage matrix for the pinned Twinleaf V3 frontier

**Date:** 14 November 2026  
**Owner:** Agent3  
**Pinned engine:** a9905a76a6c4103ba4b6cb9a49e86bad795c5c05  
**Status:** source-shaped adapter and synthetic tests; no compiled Store or game validation

## Why this exists

The pinned ActionEnumerator is explicitly a bounded "legal-ish" candidate generator. A clean local frontier diagnostic does not establish that the native candidate set was complete. This matrix summarizes the eight source-level caps and the additional action families identified from the pinned reducer/card hooks and the supplied Expanded card pool.

## Coverage matrix

| Action source | Pinned ActionEnumerator behavior | Research adapter behavior | Remaining admission concern |
|---|---|---|---|
| Evolution | Per-family cap 8 | Enumerates all matching eligible Pokémon/hand pairs | Outer 256-item cap |
| Basic Pokémon play | Per-family cap 8; uses first empty Bench slot | Enumerates all Basic hand indices and retains original target | Bench-slot equivalence is preserved from upstream, not independently proven |
| Energy attachment | Per-family cap 8; deduplicates Energy by fullName | Uncapped target combinations; preserves fullName deduplication | Outer 256-item cap |
| Tool attachment | Per-family cap 8; only Pokémon with no Tool | Uncapped; preserves no-existing-Tool predicate | Paper rules prohibit freely replacing an attached Tool; see advanced manual |
| Discard abilities | Per-family cap 8; PokemonCard only | Uncapped Pokémon powers plus TrainerCard/EnergyCard useFromDiscard actions | Dynamic card-specific power checks remain Simulator responsibility |
| Item play | Per-family cap 8 | Uncapped hand-order Item plays | Outer 256-item cap |
| Stadium play | No per-family cap | Original method retained | Validate the pinned Stadium implementation |
| Supporter play | Per-family cap 8 | Uncapped; preserves once-per-turn gate | Outer 256-item cap |
| In-play/hand abilities | Per-family cap 8; only powers on forEachPokemon results with useWhenInPlay | Uncapped in-play Pokémon powers, attached Tool powers, and hand Pokémon/Trainer useFromHand powers | Other card-specific CheckPokemonPowersEffect mutations need native validation |
| Use Stadium | No per-family cap | Original method retained | Validate Stadium-specific behavior |
| Retreat | No per-family cap | Original method retained | Simulator must validate retreat legality |
| Attack | Active Pokémon printed attacks only | Active Pokémon, Bench useOnBench and active Tool attacks; first-match dedup matches reducer order and non-enumerable source metadata is attached | Projector must preserve source metadata; other dynamic CheckPokemonAttacksEffect mutations need native validation |
| Pass turn | Original PassTurnAction | Original enumerate() retained | None identified in this source review |

## Card-pool examples proving the extra sources matter

The supplied card list marks these useFromHand Pokémon abilities Expanded legal:

- Audino bw7-126 — Busybody;
- Trumbeak sm8-165 — Mountain Pass;
- Minior sm7-83 — Falling Star.

It marks Forest Seal Stone (swsh12-156) and Sky Seal Stone (swsh12pt5-143) Expanded legal; their pinned card hooks add attached Tool powers to CheckPokemonPowersEffect.

It also contains 22 Expanded-legal Trainer cards with attacks, including G Booster (bw10-92), G Scope (bw10-93), and Technical Machine: Evolution (sv4-178). The pinned CheckPokemonAttacksEffect includes active.tools[0].attacks, and the player-turn reducer also accepts Bench attacks marked useOnBench.

## Current adapter artifacts

- Adapter: simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs
- Tests: tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs
- Main adapter report: results/methodology/2026-11/agent3-known-cap-free-action-enumerator-20261114.md
- Source findings: results/methodology/2026-11/agent3-upstream-action-enumerator-cap-audit-20261114.md, results/methodology/2026-11/agent3-tool-and-bench-action-enumerator-gaps-20261114.md, results/methodology/2026-11/agent3-hand-ability-action-enumerator-gap-20261114.md

Nine existing Node v22.16.0 synthetic tests passed locally before the full-enumerate regression was added. They validate source-shaped enumeration and fail-closed adapter marker/pin/local-truncation checks, not the compiled pinned Store.

## Integration contract

1. Agent49 exposes the already-imported PokemonCard, TrainerCard, EnergyCard, Stage, TrainerType and SpecialCondition bindings from loadNativeRoleDependencies. gameActions and SlotType are already returned.
2. Construct the adapter with the exact experiment engine pin; reject pin drift.
3. Update projectNativeAction() to project USE_TRAINER_ABILITY_ACTION and USE_ENERGY_ABILITY_ACTION through targetProjection; copy action.__agent3AttackSource into public metadata for AttackAction rows. Same-name attacks are already collapsed to the first source the native reducer resolves; do not claim they are independently selectable.
4. Use assertKnownCapFreeAdapterAdmissionClear() on every root. It requires the adapter marker/pin and rejects the outer frontier's truncated flag, nonzero omittedCount, or nonzero unsupportedCount. Do not admit roots with unprojected action types.
4. Persist the adapter marker, engine pin and frontier diagnostics per root.
5. The synthetic adapter test is now in the existing bounded contract_only lane; the separate cap-audit fallback test remains outside it. Do not create another workflow. The compiled native ActionEnumerator/Simulator regression currently covers nine Basic hand actions only and does not validate the adapter's hand/Tool/Bench families.
6. Run against the compiled pinned Store and verify that Simulator accepts/rejects the added actions as expected before any game is qualified.

This matrix is not a claim that every paper Expanded action is represented. It records the source families reviewed and the explicit omissions repaired by the prototype. No fixture, game, matchup or competitive result is claimed.


The new tenth synthetic regression exercises the retained full `enumerate()` method, not only `attackActions()`: it checks that same-name Active → Bench → active-Tool priority yields exactly one action, that `enumerate()` returns the exact same AttackAction object from `attackActions()`, and that the non-enumerable immutable source marker survives into the complete frontier array. The pinned upstream method uses `actions.push(...this.attackActions(state, player))`, preserving action object references. The new regression is pending execution; it does not establish compiled Store attack acceptance.
