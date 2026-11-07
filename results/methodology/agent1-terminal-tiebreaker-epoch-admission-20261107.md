# Agent 1: exclude unadjudicated tiebreakers from ordinary native terminal-cause evidence

**7 November 2026.** Development-only evidence classifier correction, not a deck change, win-rate estimate, or game-engine modification. This extends [Agent1's ordinary simultaneous-ending classifier](agent1-paper-basic-simultaneous-terminal-fence-20261107.md).

## Verified risk: tiebreaker has different win condition and pinned native failure

The supplied **Advanced Player's Rulebook v3.4**, I.E, says that a tiebreaker sets six new Prize cards and the first player to hold **fewer remaining Prize cards than the opponent** wins. Its ordinary six-Prize game-resolution table must not be applied to a tiebreaker's winner. Separate compiled [Agent24's pinned native simultaneous-KO study](agent24-native-simultaneous-tiebreak-ko-20261102.md) observed a specific premature-win defect: during a staged simultaneous KO in sudden death, the pinned Twinleaf `choosePrizeCards` reduction can call `endGame` for physical **seat 0**, before resolving both players' Prize entitlements. Their two independently staged pending-Prize cases included equal pending Prize awards and a strictly greater award for seat 1, yet native reported seat 0. The report also reproduces an equal-award case with a printed Volt Cyclone / Spiky Energy attack on deliberately staged boards. These are meaningful **engine-fidelity counterexamples**, not naturally dealt complete games.

Thus a native `FINISHED` state with a reported `winner`, a Prize field or a terminal root is insufficient to infer a paper tiebreak victory. The full, actual simultaneous KO batch and the resulting strict remaining-Prize comparison are needed, and such a batch is not available in the existing public `terminalTransition` evidence.

## Implemented narrow guard

- The shared `simulation/twinleaf/terminal-transition.cjs` `publicSnapshot` now captures `suddenDeath: state.isSuddenDeath === true` from the actual Store before and after the terminating dispatch. This is a public global game-phase marker. It adds no hidden card identity, no policy choice, no random draw and no engine mutation.
- The shared `simulation/evaluation/terminal-cause-evidence.cjs` checks this marker **before** the ordinary simultaneous six-Prize result table and normal final-Prize/no-Pokémon/deckout causes. If either side of the transition is in the sudden-death epoch, its disposition becomes `tiebreaker-batch-adjudication-unresolved` with **zero sufficient conditions**. This excludes both a native winner with equal pending awards and one claimed over an opponent with a strict projected lead.
- A legacy public transition that lacks a boolean `suddenDeath` flag is now `terminal-epoch-unverified` and cannot be counted as an observed sufficient paper cause by the current classifier. The old raw archive is preserved, not rewritten. A re-run under the updated Store observer can obtain the necessary flag.
- The summary separately counts `tiebreakerUnresolved` and `epochUnverified` and retains both among `engineTerminals` and `unresolvedTerminals`. `competitiveGamesQualified` remains zero. Neither status tries to repair Twinleaf's tiebreaker adjudication.

This requires an *actual* public snapshot after an engine finish. Merely seeing that the remaining Prizes differ or that a player declared a KO does not settle the withheld result.

## Reproduction

Files:
- `simulation/twinleaf/terminal-transition.cjs` (public sudden-death marker);
- `simulation/evaluation/terminal-cause-evidence.cjs` (tiebreaker / missing-epoch quarantine);
- `tests/agent1-terminal-tiebreaker-epoch.test.cjs` (seven direct cases: Store snapshot no hidden contents, both winner seats, pending Prize tie and opponent lead, either transition-edge flag, missing-flag legacy, ordinary positive control, summary counters);
- `tests/terminal-cause-evidence.test.cjs` and `tests/agent1-terminal-paper-result-conflicts.test.cjs` (ordinary synthetic snapshots now label `suddenDeath:false` explicitly);
- manually dispatched existing `.github/workflows/agent1-issue25-baseline-sham-v9-native.yml` runs all terminal regressions before its unchanged 24-attempt native v15 A/B/A test.

Compiled pinned workflow **42335777719** was dispatched to confirm the extended test suite and historical natural native attempts. The result was pending when this report was first authored; inspect the final CI conclusion and relevant step logs before citing native validation. Its checkout will fix an exact research commit, rather than changing the archived v15 24-root trial identities.

## Limits

This is a conservative **evidence admission fence**. The newly constructed test rows are synthetic public snapshots. Native simultaneous tiebreak KO evidence is independently archived by Agent24 and does not become a full competitive match by being cross-referenced here. The original 16-entry ordinary table is still valid for its own scope and remains tested. An exact paper tiebreak winner would require a correctly applied full KO batch, actual resulting Prize count comparison, owner choice and effects, and any other game-end conditions. No such winner is newly certified here.

The full source field remains **29/32 authenticated original name/count lists** (ranks 23, 25, 28 still missing). There are **zero competitively qualified complete games**, no finalized fixed 60 and no measured 99.5% Top32 win rate.
