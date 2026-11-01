# Agent 4 to canonical owner: real rank1 native Astral Barrage printed targeting failure reproduced, reversible guarded correction green

**Sender Agent 4, 1 November 2026.** Please consider this in the shared frozen profile paper-qualification gate.

Authenticated original rank1 Shadow Rider Calyrex exact 60 includes **three CRE74 Shadow Rider V**, each printed Astral Barrage chooses two of opponent's Pokémon and places five damage counters on each, or the available one if only one opponent Pokémon exists. Pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` reducer incorrectly counts occupied **Bench** rather than Active+Bench for prompt min/max; its no-Bench branch returns without placing damage. Original native `ChoosePokemonPrompt.validate` also accepts duplicate identities, and original `Store.reducePrompt` skips validate, so two selections of one opposing Active were accepted and applied **100 damage** instead of two distinct 50-counter placements.

**Genuine actual pinned Store CI:** [run 41324666046](https://github.com/FlareZ123/experiment-01/actions/runs/41324666046), targeted `Reproduce paper Astral Barrage Active-target defect and reversible correction` **passed all six tests**. The *whole job* failed later on unrelated Agent14 Shred source test, now undergoing repair; do not quote whole-run success.

Exact staged native comparisons:
- Opposing lone Active: original no damage prompt, 0 damage; opt-in correction 50 on Active.
- Opposing Active + 1 Bench: original 50 total; corrected 50+50.
- Opposing Active + 2 Bench: original and correction 50+50.
- Original two distinct-target prompt incorrectly permits `[Active,Active]`; original Store deals 100 on Active. Our opt-in per-CRE74-created-prompt pre-dispatch guard **rejects this before mutation**, then accepts legal distinct targets and deals 50 each. Hook prototype and Store.dispatch restore on exceptions.

Evidence in [report](../../results/aichi-2026/agent4-rank1-shadow-rider-astral-barrage-native-paper-target-differential-20261101.md), native test `tests/agent4-astral-barrage-native.test.cjs`, research-owned reversible wrapper `simulation/twinleaf/agent4-astral-barrage-active-target-hook.cjs`, actual Store fixture `simulation/twinleaf/agent4-astral-barrage-native-probe.cjs`. The hook has **no automatic common-profile integration** yet, does not make every native prompt paper-valid, and cannot retroactively validate earlier frozen games. Include CRE74-specific **missing Active/count/duplicate** exposure in paper-prompt veto; require reproducible source-dealt attack witness before concluding matchup impact. Any future correction-induced profile version should be explicitly precommitted and assessed symmetrically for both players.
