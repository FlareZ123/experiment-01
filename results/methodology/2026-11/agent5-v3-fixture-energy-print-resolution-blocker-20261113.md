# Agent5: Agent36 V3 fixture Basic Energy source/engine print mismatch

**Date:** 2026-11-13  
**Status:** Source-level blocker fixed on main; Node 22 regression and native fixture execution pending  
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

## Correction committed on main

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


## Resolution update — 2026-11-13 15:50 UTC

Agent35 committed the narrow correction to `main`:

- `af92cda1efc51bb1d0e78dee4b63d110d71aec86` adds `engineProxyPrintingForSourceRow()` and uses the engine proxy key for CardManager lookup while preserving each source `printing` and recording `enginePrinting` separately.
- `517679f40ff5d86e9d73480608d2d1f5e12d373f` extends the existing actual-CardManager fixture test to assert `MEE/13` source and `SVE/5` engine printings for both candidate and rank-1 opponent.
- The original candidate/field Git blob checks and printed-60 fingerprints remain unchanged. The mapping is exact to Psychic Energy + MEE/13, not a broad generic substitution.

This removes the identified source-level preflight blocker. It is **not yet validated by an executed Node 22 test or native game**: no new PR/push CI run or `workflow_dispatch` run appeared after the commits. The bridge-only run and secure V3 fixture dispatch remain outstanding owner actions.


## Follow-up correction — earlier Night Stretcher source/engine mismatch

**The prior statement that MEE/13 was the only candidate/rank-1 mismatch is superseded.** Agent1's 15:55 pinned-tree review found a second mismatch that occurs earlier in the frozen candidate row order:

- Both `candidate-hood-shadow-rider.json` and rank 1 contain `Night Stretcher ASC/196`.
- Agent1's recursive inspection of pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` found only the `Night Stretcher SFA/61` implementation at `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/nightly-stretcher.ts`; no ASC-specific class exists in that pinned tree.
- The checked-in English card-pool records `me2pt5-196` and `sv6pt5-61` have the same name, Trainer/Item subtype, complete rules text and Expanded legality. This supports a same-card engine proxy `Night Stretcher ASC/196 → SFA/61`, while retaining ASC/196 as the source printing.
- Night Stretcher appears before Psychic Energy MEE/13 in the candidate JSON. Therefore the currently committed MEE/13→SVE/5 alias does **not** unblock `resolvePrintedDeck()`: the current preflight will fail first on ASC/196.

Agent1 sent the evidence to Agent35 and Agent36. Agent35 remains the owner of the active resolver patch; this report does not claim the ASC/196 alias is implemented. The existing resolver/test should be extended narrowly to record both source and engine printings for Night Stretcher in both decks. No broad reprint fallback or new workflow is warranted.

Until the ASC/196→SFA/61 alias is committed and the existing actual-CardManager test is executed, the Agent36 preflight remains blocked before reaching the already-fixed MEE/13 row. The MEE/13 mapping is still independently required for both decks. No Node 22 preflight, native Store game or competitive result has run.


## Bridge impact — Night Stretcher also requires a source-preserving proxy

Agent39 independently inspected the frozen 24-deck normalized artifact and found six `Night Stretcher ASC/196` copies in ranks 1, 8, 19 and 22. The bridge resolver currently reads `normalized.printing` directly for non-Energy rows, so it will also fail on ASC/196 until the exact `me2pt5-196 + Night Stretcher + ASC/196 → SFA/61` engine proxy is added to the bridge resolver and its regression. Agent39 owns that bridge change. This is distinct from Agent35's Agent36 fixture resolver change; both paths require the same narrow source→engine mapping. The MEE/13→SVE/5 proxy remains required in the Agent36 fixture, while the bridge already normalizes generic MEE Basic Energy to SVE identities in its frozen artifact.

**Dispatch status correction:** the bridge-only workflow is not yet ready to dispatch. Wait for Agent39's bridge alias/test and Agent35's Agent36 alias/test to land, then run the existing manual lanes in the established order. No new workflow or trigger is needed.


## Bridge alias committed — manual dispatch is now ready

Agent39 committed the bridge-side `Night Stretcher ASC/196 → SFA/61` source-preserving proxy and regression:
- `067bf94821da7b35602c2e8da68a8dcdb7ef9384` adds the exact engine-print proxy.
- `c2dc0f0f7af6451d44323cb74ff5ef9bdf07d407` adds the exact regression.
- `7b7ceb7ea120272662f67d49f3bca1a03ca7b5f0` prefers an exact source-print match before using the proxy.

The existing `.github/workflows/twinleaf-smoke.yml` bridge lane already runs `tests/2026-11/agent39-aichi-twinleaf-decklist-bridge.test.cjs`. Therefore the bridge-only workflow is now ready for authorized manual dispatch, but it remains unexecuted. The separate Agent36 V3 fixture still lacks its ASC/196→SFA/61 alias (and still requires its MEE/13→SVE/5 alias), so do not dispatch that fixture yet.
