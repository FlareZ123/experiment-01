# Rank-31 Chimecho: two actual source-ranked bot traces have no Bell lock exposure

**Agent 5, 18 October 2026 UTC. Evidence class: original-source pinned-engine automatic-play diagnostic, not competitive qualification.**

## Frozen test provenance

The existing [rank31 source observer](../../simulation/twinleaf/rank31-chimecho-source-visibility.cjs) ran in [manual Aichi lock-board CI 39091329603](https://github.com/FlareZ123/experiment-01/actions/runs/39091329603), source revision `6016db79efa4adfd3f046586763ad5f0461f7a3e`. Its rank31 observer step succeeded and uploaded named artifact `rank31-chimecho-source-pair`, artifact ID **12122079299**, created 2026-10-18 02:51:09 UTC, 1,177 ZIP bytes. Agent 5 downloaded the unmodified artifact and inspected the contained `rank31-chimecho-source.json`. The complete workflow also has unrelated board, Tool-Power and type tests; do not promote this source observation based on other steps.

The two unchanged decks are the published rank1 Shadow Rider reference and exact published rank31 Yuhi Yokoyama Dusknoir/Chimecho 60, resolved with **zero unresolved printings**. Pinned Twinleaf upstream engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Seed protocol `decorrelated-slots-v3` for rank31 `published-field` repeat 0, with candidate in both physical seats. The original source bot makes all decisions; none were forced. Runs had `maxActions:240`; no terminal strength is eligible.

## Actual gameplay observations

| Reference physical seat | Seed | Rank31 physical seat | Actual first player | Rank31 attack actions by 240-action cap | Bell used | Chimecho played | Finished |
| --- | ---: | ---: | --- | --- | ---: | ---: | --- |
| A | 1098062414 | B | **rank31** | Koffing Poison Gas at turns 35,37,39 | 0 | 0 | No |
| B | 1295587841 | A | **rank31** | Tapu Lele-GX Energy Drive at turns 7,9 | 0 | 0 | No |

- Despite swapping rank31 to physical A/B and using separately derived seeds, **rank31 actually went first in both trials**. Thus the sample contains zero rank31-going-second opportunities to use Bell on the first available attacking turn.
- In the rank31-seat-A game, early owner decisions included `Random Receiver`, `Fog Crystal`, a Psychic Energy attachment and Retreat before its first pass. The trace records neither the selected Fog target nor the own deck/Prize Chimecho location, so it cannot establish that a legal Bell line was available or dominated.
- In the rank31-seat-B game, early decisions included `Hisuian Heavy Ball` and attachment to an Unown before passing on turn 1. This still cannot determine Chimecho prize status or a counterfactual attack.
- Both 240-action caps were reached without terminal outcomes; counting them as losses or wins would be invalid. The one source is a sample of **two** repeated selected authentic initial deals, and the observer reports no hidden source-hand option comparisons.

These source-trace observations align with earlier separate [Agent43 rank31 Roxie source work](agent43-rank31-roxie-exposure.md), which used the same frozen seeds to audit Roxie, but **do not independently increase the number of source games**. They answer a narrower Bell-play exposure question using the existing recorded fixture.

## Distinguish capabilities

The separate [staged Chimecho attack and hand-entry Store regressions](../twinleaf/chimecho-hand-entry-path-preflight.md) passed: printed Bell damage, opponent player lock, hand-entry restriction despite Path to the Peak, Supporter Ranger intervention, and endturn expiry. The source-ranked natural-play runs above did **not** exercise that lock. Staged mechanically legal effects are not evidence that the generic rank31 bot can establish them when resources and opposing actions matter.

## Follow-up that would change the conclusion

Predeclare additional exact-source seed/physical seat trials, stratify by **actual first player** from draw logs and record owner-visible initial hand + legal first decisions, owner-facing Fog Crystal search prompt and attack availability. Identify a reproducible real rank31-going-second state in which printed Chimecho and Psychic-producing Energy are available, then compare generic and independent autonomous Bell-aware policies from the same actual source deal without injecting cards or inspecting hidden deck before a legal owner search. Preserve full opponent candidate response and replay noninterference. **Do not select only realized successful Bell branches for strength inference**.

Current global Aichi benchmark: 29/32 exact source inventories (ranks 23/25/28 missing), zero independently qualified games, no demonstrated 99.5% win rate.

**Final CI check:** Entire workflow 39091329603 finished SUCCESS at 2026-10-18 02:55:48 UTC; downloaded ZIP SHA-256 `f549d997df06a13c4f67485fc5fb09e4a571e882848e40bb43a6bf4fffde719b`.
