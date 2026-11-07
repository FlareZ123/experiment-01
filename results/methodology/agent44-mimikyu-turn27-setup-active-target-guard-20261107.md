# Mimikyu turn-27 setup: reject active-Pokémon bench targets

**Agent 44 | 7 November 2026 | Research-policy guard**

## Finding

`simulation/twinleaf/mimikyu-source-turn27-setup.cjs` is a source-locked helper intended to prepare a Benched Mimikyu for promotion after a Regidrago VSTAR Apex Dragon. It computed `benchIndex` as `-1` when Mimikyu was already Active, but its fallback still treated `player.active` as a valid setup target.

If Active Mimikyu had one Psychic Energy and another Psychic Energy was in hand, `chooseSetupAction` returned `{kind:'attach-psychic', benchIndex:-1}`. `createTactic` always translated that into a `PlayCardAction` targeting `SlotType.BENCH` with index `-1`. The repository-side helper therefore produced an invalid or at least unverified target in this state.

## Correction

Commit `28d61b8dc6936ad3172e97be2b389e8c8e7bcdcc` restricts the setup helper to a Benched Mimikyu. If no Mimikyu is on the Bench, it returns `null`. An Active Mimikyu is left to the remaining configured tactics. The comment was clarified in `c6fa3f43c89bc31e33f50c35aa836e92c21c99ea` without assuming how the upstream dispatcher handles that state.

Commit `200faafb9a7a54d094ce2e2da6675b36ff8b544b` adds a regression where Mimikyu is Active with one Psychic Energy and another Psychic Energy is in hand. It asserts that the helper returns `null`, rather than emitting a negative Bench index. The existing Active-with-two-Energy negative case remains.

Commit `c81d7d2e9924094e11143fd8b3c06c7faa1a42dd` adds the pure helper test to the existing manual Twinleaf smoke check 02. No new workflow was created.

## Validation

**Manual smoke workflow passed:** [run 42341667159](https://github.com/FlareZ123/experiment-01/actions/runs/42341667159).

- Tested workflow head: `95018c742e45c7bb01d5b49e4e8d702056f594e7`.
- All 49 job steps completed successfully.
- Smoke check 02 passed, including the new active-Mimikyu negative-index regression.
- The later comment-only clarification was not part of the tested head; it does not change behavior.

## Limits and open questions

This is a pure helper regression. It does not validate the actual `PlayCardAction` target or prove that the complete turn-27 sequence is legal in the pinned engine.

The following remain open:

1. Verify that `PlayerType.BOTTOM_PLAYER` resolves to the acting bot's Bench in both physical seat orientations.
2. Replay Mysterious Treasure's Dialga discard, Night Stretcher's Psychic recovery, the actual Energy attachment, and Latias ex Skyliner retreat through native Store prompts and accepted actions.
3. Verify the Skyliner ability remains usable under the actual Stadium and Ability-lock state.
4. Verify the Copycat attack tactic is called only when Mimikyu can pay its own Psychic-plus-Colorless cost. The copied Apex Dragon, Timeless-GX, and Power Beam costs are waived under Advanced Player's Rulebook C-18 unless the attack text specifies otherwise; Mimikyu's own Copycat cost still applies.
5. Preserve actor-visible information boundaries and exact original card custody through both physical seats.

Agent7 was asked to verify the two-seat target semantics. Agent46 was asked to verify the Copycat tactic's own attack-legality guard. No response had been received at the time of this report.

## Evidence classification

This is a research-policy guard and test-harness result. It does not prove the natural turn-27 counterline, a complete game, matchup strength, or competitive performance. The turn-27 setup remains a source-locked hypothesis. No vendor code, pinned Twinleaf revision, decklist, selected policy, or competitive result changed.
