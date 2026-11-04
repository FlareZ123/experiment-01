# Agent50 preregistration: strict terminal and board-custody audit of staged rank26 Crisis Punch

**4 November 2026, before the next native CI run.** The source mechanism is the existing two-seat `tests/agent50-rank26-firstturn-crisis-punch.native.test.cjs` against pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This follow-up is **retrospective to successful native run 41571770196**, but prospective with respect to the added diagnostic fields and strict phase/winner/card-presence assertions. It is an explicitly **constructed, favorable board** with source rank26 original card printings for Meloetta, TM Crisis Punch, Lightning, DCE, Squawk; the rest is synthetic filler. It does not reproduce five prior self-KOs, a genuine original 60-zone game or match selection.

## Trigger and question

The previous success report printed `GamePhase=7`, opponent Active's `fullName` as null, source Prize 6→4, but also `opponentLostAllPokemon:false`. A weak existing test accepted either 210 damage or missing opponent Active without verifying `state.winner`, the actual KO zone, or whether an opponent Pokémon remained somewhere. This apparent inconsistency is a reason to audit terminal correctness independently.

## Fixed protocol

1. On both source physical seats 0 and 1, reuse the existing staged initial board: global turn1, source Meloetta ex and three-C Energy paid via original Lightning plus actual manual attachment of Double Colorless Energy, TM Crisis Punch, opponent Shadow Rider Calyrex V CRE alone in Active, opponent 1 Prize remaining.
2. Add **read-only** diagnostics: `state.phase`, `state.winner`, the exact `opponent.active.getPokemonCard()` existence, `opponent.bench` returned Pokémon list, and source/opponent discard Pokémon names. Do not infer active state from nullish `fullName` or artificial `opponentLostAllPokemon` alone.
3. Assert actual AttackAction name, source exact card printings, paid Energy card identities, source Prize 6→4, defending Pokémon physically enters opponent discard, opponent's Active and Bench contain zero Pokémon, `GamePhase.FINISHED`, `winner=source seat`, and no pending prompt. If any fails, **record the precise backend state as a fidelity defect** and do not silently relabel a passing runner as a game.
4. Use the **existing manual** `agent50-rank26-koko-dual-recipient-native.yml` workflow, which already compiles pinned engine and runs the same two-seat test, with no new workflows.
5. Include the full CI run ID/revision, tests passed/failed, explicit measured postconditions and any technical correction in a new source mechanics report.

## Interpretation

A fully passing strict fixture would demonstrate a narrow constructed native attack/KO/terminal operation on both seats. Its artificial opponent Prize configuration, missing original 60-zone custody, absence of natural assembly, and absent opponent policy mean **zero paper-competitive games and no fixed 60 evaluation**. A failed fixture demonstrates a defect or uncovered precondition, not evidence of real competitive weakness.
