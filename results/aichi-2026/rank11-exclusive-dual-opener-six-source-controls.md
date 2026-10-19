# Rank-11 exclusive opening policy: six source-dealt controls

**Agent 1, 19 October 2026 UTC. Evidence:** compiled retrospective paired mechanical regression, zero qualified games.

## Design

The published rank-11 Absol/Garbodor opponent has two early lines in the current research adapters:

- An already-held Boost Shake, separate Tool, and usable Trubbish acquisition.
- A held Forest Seal Stone on a Tool-free Pokémon V, a second Tool for Trubbish, and Star Alchemy fetching Boost Shake.

The independent callbacks share one `SimpleTacticsAi.prototype.decodeNextAction` fallback chain. A change of hand after Star Alchemy could theoretically make the other route claim a new line. Previous naive nesting tests found no actual collision on five selected source-first held-Seal deals.

The new [exclusive adapter](../../simulation/twinleaf/rank11-exclusive-openers.cjs) uses an opt-in `claimOpportunity` gate on the [direct](../../simulation/twinleaf/rank11-direct-boostshake.cjs) and [held-Seal](../../simulation/twinleaf/rank11-held-seal-policy.cjs) decoders. The **first actual eligible owner-visible route** claims the opening for the rest of that game. Subsequent opportunities for another route are refused. Direct uses its K0 all-Garbodor-held and K1 owner-deck-search guards. Existing standalone policies retain their original behavior when this hook is absent. The new adapter is opt-in and synchronous; both underlying decoders restore their prototype overrides after play.

## Six compiled source-positive regressions

The [source runner](../../simulation/twinleaf/rank11-exclusive-openers-source-replay.cjs) runs the unchanged published rank-11 60 against either a fixed New Moon Lockbreaker v1 60 (historical held-Seal controls) or the fixed rank-1 Shadow Rider 60 (historical direct controls). Each fixture is one previously identified authentic shuffled source deal, replayed as standalone versus exclusive under the same source, candidate, seed, source seat and actual start.

[Manual GitHub Actions run 39212920919](https://github.com/FlareZ123/experiment-01/actions/runs/39212920919) **passed** on commit `d382c445078b2c1584fd0b60562e2c9bb9b24a7c`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its complete JSON is archived in Actions artifact `rank11-direct-boostshake-unqualified-seat-0`, ID **12168228874**, ZIP SHA-256 `d54c7bd24ae45a4c2ec9ad9fad728e475bac036312e24ab2466290fe00e2001c`.

| Branch | Source physical seat | Source actually starts | Seed | Source own-turn root actions |
| --- | ---: | --- | ---: | ---: |
| Held Seal | 0 | first | 1097193676 | 17 |
| Held Seal | 0 | first | 188431119 | 21 |
| Direct Shake | 0 | first | 1325646358 | 12 |
| Direct Shake | 0 | second | 1769876458 | 12 |
| Direct Shake | 1 | first | 4188921502 | 12 |
| Direct Shake | 1 | second | 1050426099 | 20 |

All six cases confirmed:

- Actual starting player and source deck hashes were identical in both replay arms.
- Standalone and exclusive policies completed their respective authentic Tool-equipped Garbodor opening.
- The exclusive policy selected the expected branch.
- The entire first source-turn root-action sequence was **identical** in both arms.
- The alternate route was never eligible to claim in these six cases (`blockedOtherRoute:0` in every audit).

These are **six retrospective positives**, comprising different fixed candidate 60s. They cannot be combined as a competitive denominator or used as evidence of 99.5% wins.

## Next qualification steps

The branch latch removes one *potential* class of interference by design. Since there were no actual competing claims in these six fixtures, this test does not prove that the latch resolved a real observed collision. Test failed and K1-aborted lines, no-opportunity starts, both physical seats in a new failure-inclusive seed frame, and actual source-opponent replies under an information-set-safe autonomous two-player policy. Until then this is an **early policy mechanics improvement**; it is not a qualified full-game opponent.

**Qualified competitive games added: zero.**
