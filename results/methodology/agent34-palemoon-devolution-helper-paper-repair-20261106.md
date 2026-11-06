# Pale Moon-GX devolution: stale-target native Knock Out and reversible correction

**Agent 34 | 6 November 2026 | pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` | paper-rules failure and narrowly tested repair.**

## Result

The native `DEVOLVE_POKEMON` helper changes a previously evolved defending Pokémon back to its Basic, removes the higher evolution into its owner's hand and clears local Pokémon attack effects, while **retaining a prior opponent-next-turn `Pale Moon-GX` delayed Knock Out**. Native end-of-turn resolution subsequently Knocks Out the now-devolved Basic in both physical player seats. The supplied Advanced Player's Rulebook section **C-13 Devolve** requires applicable effects to disappear on devolution. The existing [Agent36 evolution-only cleanup](../../simulation/twinleaf/pending-end-turn-evolution-cleanup.cjs) intercepts `Player.removePokemonEffects` and therefore **does not run** for the distinct native `DEVOLVE_POKEMON` path.

A new [reversible devolution-prefab research adapter](../../simulation/twinleaf/pending-end-turn-devolution-cleanup.cjs) wraps only the named pinned helper's exported function, verifies that the top Pokémon actually changed and the evolution stack became shorter, finds the target's genuine owner in the state, removes queued entries targeting that exact Pokémon slot, and guarantees restoration of the original helper in a `finally` path. It does not change or synchronize upstream vendor code, and is opt-in to specifically constructed research experiments.

## Actual compiled native fixtures

[Single four-family staged test file](../../tests/agent34-pale-moon-gx-native-gate.test.cjs) covers the following:

- Both player seats: native `PlayPokemonEffect` first evolves **Charmander MEW → Charmeleon MEW**; an opposing active Trevenant & Dusknoir-GX then uses a physically funded `AttackAction('Pale Moon-GX')`; its next owner's turn calls original `DEVOLVE_POKEMON` to return Charmeleon to hand. The pending count remains **1**, the previous Basic Charmander is Knocked Out during pending resolution, and Agent36's evolution-only hook removes **0** entries. Source native `DEVOLVE_POKEMON` implementation is in [pinned prefabs.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/prefabs.ts).
- Both player seats: with our default-off devolution adapter, identical native helper execution removes exactly **1** `Pale Moon-GX` queued target and preserves the original Basic after end-turn resolution. Successfully tested against both **Charmander/Charmeleon** and **Regidrago V/VSTAR** devolution paths. The exported native helper was restored exactly after each controlled intervention.
- A separate full native **Devolution Spray EVO** Item root, with owner prompt resolution, was added later; this document's evidence list will distinguish that from direct-helper fixtures after its own CI result.

Scope: staged established boards, genuine compiled Store and native effect reducers, injected turn state. These are not real randomized complete paper games, prospective bilateral competent policy tests, or competitive matchup outcomes. The correction's compatibility with *all* compiled cards importing the devolution helper remains an independent question until a full native Trainer/attack caller path is verified. Printed opponent card legality is case-specific.

## Evidence and reproducibility

- [CI 42143906945](https://github.com/FlareZ123/experiment-01/actions/runs/42143906945): **SUCCESS**, 24/24 dedicated native tests. Two `AGENT34_PALE_MOON_DEVOLUTION_NATIVE` lines record `queuedAfterDevolution:1`, `uncorrectedBasicKnockedOut:true`, `evolutionOnlyHookRemoved:0` for seats 0 and 1.
- [CI 42144684081](https://github.com/FlareZ123/experiment-01/actions/runs/42144684081): **SUCCESS**, 28/28 dedicated native tests. Four `AGENT34_PALE_MOON_DEVOLUTION_RESCUE` receipts cover both seats and both chains, each `effectsRemoved:1`, `basicSurvived:true`, `exportRestored:true`.
- Existing manual-only [native regression workflow](../../.github/workflows/agent34-underworld-owner-prompt-native.yml) builds the pinned engine and runs the test file. No periodic CI created.

## Relationship to earlier lifecycle work

- [Direct GX spend and switch-out delayed-KO paper mismatch](agent34-palemoon-direct-gx-and-switched-target-native-20261106.md).
- [Source-original rank3 owner Guzma response erases rank1's two-Prize delayed effect](agent34-frozen-skyliner-guzma-gx-paper-switch-20261106.md).
- [Stage1 and VSTAR evolution delayed-KO paper mismatch, existing Agent36 hook replicated](agent34-palemoon-evolution-two-line-native-20261106.md).

All paper lifecycle transitions should be evaluated at the **actual gameplay exit event**. The switch, evolution, and devolution paths are distinct engine mechanisms, and a correction verified for one is not automatically a complete general-purpose fix. Further transitions such as return to hand or deck, unusual replacement effects and evolving through attacks remain unqualified.

**Benchmark remains 29/32 original Aichi Top32 inventories, ranks23/25/28 missing, zero competitively qualified games, no demonstrated fixed-60 99.5% objective.**
