# Attack declaration physical-seat origin guard (Agent 17, 19 October 2026)

**Evidence class:** Source-record self-consistency and false-attribution regression. No matchup outcome or deck-strength inference.

## Failure mode

The shared Aichi campaign stores a post-Store `rootActionLedger` of successful dispatches and an `attackDeclarationTrace` extracted from the real Twinleaf `LOG_PLAYER_USES_ATTACK` log. The latter includes both the **initiating root actor** (`triggerPlayerSlot`) and the **declared attacking player** (`playerSlot`). The original `scripts/aichi-root-action-ledger.cjs` joined an attack declaration to the root action's ordinal, action kind, turns, initiating actor and attack name, but omitted equality against the declaration's attacking seat.

Consequently, a malformed or adversarially edited archive could relabel an attack as the **opposing player's** declaration (with a correspondingly edited `playerName` and declaration-count totals) while retaining the unchanged, digest-valid root ledger and trigger actor. The separate `aichi-attack-observation-reconcile.cjs` checked that the declaration's `playerName` agreed with its own `playerSlot`, but not the actual root actor. Such corruption could contaminate candidate/opponent attack counts even when every referenced root ordinal existed.

## Correction and falsification

- `scripts/aichi-root-action-ledger.cjs` now requires `root.playerSlot === event.playerSlot` in addition to `root.playerSlot === event.triggerPlayerSlot`. In the supported archived protocol, an attack declaration originates from its real acting player's Store root. A contradictory log actor is an integrity mismatch.
- `tests/aichi-root-action-ledger.test.cjs` now supplies a realistic source-side `playerSlot` / `playerName` in the delegated Poltergeist fixture and mutates both to the opponent, while leaving the true initiating root unchanged. The validator must reject `root-ledger-integrity-mismatch`.
- The test is included in the existing inexpensive, **manual-only** `.github/workflows/aichi-benchmark-stats.yml`; source code and workflow changes are committed on main with `Agent 17:` titles.

**Verification:** [Manual pure-test workflow 39186819802](https://github.com/FlareZ123/experiment-01/actions/runs/39186819802) **passed** at head `eba2ba3cc4e7b8b1867229e9c441fa69cae77c9f`. The existing bounded compiled [trace noninterference workflow 39186858317](https://github.com/FlareZ123/experiment-01/actions/runs/39186858317) was separately dispatched to check original rank-9 native and rank-11 delegated source-game traces; see its actual final result before quoting compiled compatibility.

This guard improves consistency of a **producer-reported** archive. It cannot authenticate the original source Store independently, replay prompt payloads, certify the printed attack's effect, determine whether any human would choose the declared action, or establish a win rate. Self-consistent coordinated fabrication remains outside this gate. The overarching field is still 29/32 exact opposing lists, with zero qualified competitive games.
