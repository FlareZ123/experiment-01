# Agent 1: paper-basic simultaneous terminal result fence

**7 November 2026.** This change narrows what a public native Store terminal transition can certify. It does not change any Pokémon deck, player action, random stream, engine rule, or historical archive.

## Problem and source

The existing `simulation/evaluation/terminal-cause-evidence.cjs` recognized a reported native winner when a recorded FINISHED transition showed either final-Prize completion or the opponent losing its last Pokémon. It did not check whether a *simultaneous* condition on the winner or loser changes the basic game result.

The provided **Advanced Player's Rulebook v3.4**, section **I.E, Win and Loss**, includes an explicit simultaneous-endings table. Two players taking their final Prizes is a tie. A player taking their final Prizes while also losing their only Pokémon is a tie when the opponent still has Pokémon. Some three-condition combinations have a winner, so simply rejecting all multi-condition endings would be wrong. The same rulebook, section **II.A**, states that updated card text can take precedence over basic rules. Consequently, a disagreement with the basic table requires separate card-text adjudication instead of an assertion that the reported native winner is necessarily impossible.

## Implemented independent check

The classifier now computes an exhaustive four-bit outcome relative to the native-reported winner:

- bit 1: reported winner has no Prize cards remaining;
- bit 2: reported loser has no Prize cards remaining;
- bit 4: reported winner has no Pokémon in play;
- bit 8: reported loser has no Pokémon in play.

A 16-entry table implements the supplied I.E simultaneous basic results: `none`, `winner`, `loser`, `tie`. If the actual public after-snapshot implies `loser` or `tie`, the classifier returns `paper-basic-result-conflict`, preserves `engineWinner` and `paperBasicOutcome`, and **does not emit an observed sufficient terminal condition**. This is a **card-text reconciliation gate**, rather than proof of a paper game result. When the table permits the claimed winner, the original final-Prize, last-Pokémon, and next-turn empty-deck delta checks remain in force.

The classifier additionally rejects negative, fractional, or missing public counts, invalid turn sequencing, invalid active-seat labels, and already-recorded preterminal winners. The count guard has **no fixed Pokémon maximum**, because Expanded can have more than five Benched Pokémon under effects such as Sky Field.

The summary retains conflicted engine terminals among `engineTerminals` and `unresolvedTerminals`, introduces a `paperBasicConflicts` count, and keeps `competitiveGamesQualified: 0`. No native terminal is silently converted into a counted win or a tie.

## Reproduction and bounds

- Modified `simulation/evaluation/terminal-cause-evidence.cjs`.
- Added `tests/agent1-terminal-paper-result-conflicts.test.cjs` with an exhaustive 16-case table test and an independent two-seat symmetry test, plus simultaneous Prize tie, prize/own-elimination tie, allowed triple end-condition, valid next-draw deck exhaustion, malformed evidence, and summary preservation regressions.
- Node **22.16.0** local command `node --test tests/agent1-terminal-paper-result-conflicts.test.cjs` yielded **9/9 passing test cases**, including the 16-condition submatrix in each seat.
- Extended the existing **manually dispatched** `.github/workflows/agent1-issue25-baseline-sham-v9-native.yml` v15 unit step to execute the original `tests/terminal-cause-evidence.test.cjs` and new test before the unchanged 24-match native suite. The manual run was dispatched as [CI 42334805533](https://github.com/FlareZ123/experiment-01/actions/runs/42334805533); verify its final result separately before citing it as native revalidation.

This is a pure **rulebook-to-public-evidence validation**, with synthetic exhaustive states. It does **not** show that a contradictory native finish actually occurred in the historical v15 24-match archive. Existing old terminal classifications should be kept with their original software revision. A fresh archived replay with the classifier can indicate whether its stricter gate changes those old dispositions; it cannot retroactively upgrade their paper legality or opponent competence.

## Relation to the fixed-60 objective

An erroneous native winner tag could distort the very limited evidence used to compare future candidate 60s. The new gate closes one falsifiable source of overconfidence while preserving historical trial identities and censoring. **Zero competitively qualified paper games, no selected fixed 60, and no demonstrated 99.5% Aichi Top 32 field win rate.** The still-missing exact opponent inventories for ranks 23, 25, and 28 remain outside the scope of this check.
