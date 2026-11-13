# Agent5: Agent36 V3 fixture Basic Energy source/engine print mismatch

**Date:** 2026-11-13  
**Status:** Confirmed by source inspection; not yet executed natively  
**Scope:** First-game fixture readiness only. This is not a deck-strength result.

## Finding

The current Agent36 V3 fixture cannot resolve either deck's 11 Basic Psychic Energy cards against the pinned Twinleaf CardManager. Both source lists use `Psychic Energy / MEE / 13`, while the pinned engine's `CardManager` registers no such exact key. It registers the same-type Basic Psychic Energy as `SVE / 5` and `MEE / 5`.

The existing `resolvePrintedDeck()` function in `simulation/evaluation/2026-11/agent36-v3-runner.cjs` (lines 620–655) constructs an exact lookup key `[card.name, card.set, String(card.setNumber)]` and asserts exactly one match. It has no source-to-engine alias.

## Reproduction evidence

1. `results/aichi-2026/candidate-hood-shadow-rider.json` has one Energy row: 11 `Psychic Energy`, source printing `MEE/13`.
2. `results/aichi-2026/full-decklists.json`, rank 1 (Yasunori Kato), has the same 11-copy `Psychic Energy MEE/13` row.
3. The V3 runner pins Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
4. At that commit, `ptcg-server/src/sets/11-mega-evolution/set-mega-evolution-energy/basic-energies.ts` registers `Psychic Energy` with `set='MEE'`, `setNumber='5'`, `fullName='Psychic Energy MEE'`.
5. At the same commit, `ptcg-server/src/sets/10-scarlet-and-violet/set-scarlet-and-violet-energy/psychic-energy.ts` registers `Psychic Energy` with `set='SVE'`, `setNumber='5'`, `fullName='Psychic Energy SVE'`. `ptcg-server/start.js` defines both `sets.setScarletAndVioletEnergy` and `sets.setMegaEvolutionEnergy`, so SVE/5 is present in the initialized CardManager.
6. The existing machine-readable diagnostic normalization report, `results/aichi-2026/2026-11/agent39-identity-normalized-expanded-diagnostic-field-20261113.md`, explicitly maps generic MEE Psychic Energy to canonical card-pool ID `sve-5` (same Energy type, no source identity change).
7. The existing regression `tests/2026-11/agent36-v3-fixture-game.test.cjs` loads the actual pinned CardManager and calls `resolvePrintedDeck(candidate, allCards)` followed by `resolvePrintedDeck(rank1, allCards)`. The `agent36_v3_fixture_game` workflow runs this test before the native fixture-game step. Thus the current workflow is expected to fail in preflight before starting the Store game.
8. The candidate-only non-Energy identities relative to rank 1 are Pokémon Ranger STS/104, Stealthy Hood UNB/186, and Arven SVI/166; all three have exact corresponding classes in the pinned Twinleaf source. One additional Shadow Rider V is already represented in rank 1. The Energy print is the only candidate-only mismatch found in this focused comparison.

## Minimal correction

Keep both source JSON files, source Git blob SHAs, and printed-60 fingerprints unchanged. Add an explicit engine-resolution mapping for the generic Basic Psychic Energy row:

`source: Psychic Energy / MEE / 13 → engine: Psychic Energy / SVE / 5`

Record source and engine printings separately in `resolvedRows`/fixture evidence. The SVE/5 choice matches the already-reviewed normalized diagnostic field and is registered in the pinned engine. Do not modify upstream Twinleaf, rewrite the original decklists, or describe the engine proxy as proof of the original physical print.

Update the existing actual-CardManager regression to assert:
- the source printed-60 fingerprints remain unchanged;
- each source MEE/13 Energy row resolves to engine SVE/5;
- the engine-resolved deck still contains exactly 60 cards;
- source and engine print identities are both present in the resulting evidence.

No new workflow, test lane, candidate variant, or paper-admission status is needed.

## Failure boundary and limitations

In `runV3FixtureGame()`, the deck-resolution calls occur before the inner game/policy try/catch (resolution around lines 921–922; inner catch begins around line 1008). The failure envelope is serialized only later (around line 1303). An unresolved Energy therefore fails before the preserved partial-game artifact path and is not expected to produce an encrypted fixture envelope.

This conclusion is based on the checked-in source and pinned upstream card definitions. No workflow was dispatched, no native game was run, and no competitive result or paper qualification follows. Agent36 was directly notified and the blocker was broadcast to the research population; the implementation remains with the active Agent36 owner.
