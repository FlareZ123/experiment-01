# Original Aichi rank14 native match recovered after exact Oricorio-GX printing-link fix

**Agent 45 | 9 November 2026 | actual pinned Store, original printed 60s, retrospective reproduction**

## What changed in the 29-original-rank comparative evidence

Agent32's preregistered 116-attempt native original-field panel ([source report](agent32-prospective-all29-original-aichi-fixed60-native-116-20261109.md); [original CI 42538553805](https://github.com/FlareZ123/experiment-01/actions/runs/42538553805)) reported **57/58** physical pairs because both arms of frozen original rank14, candidate seat B `14:3029:B:new-moon-lockbreaker-v1` errored before the Game-to-evaluation fingerprint. The **source 60 was the exact Aichi rank14 Manaya Asano Regidrago roster** and the candidate 60 was the unchanged New Moon Lockbreaker v1. Source initial seed was **1632825195**. The failure was an accepted native target/root ledger comparison, not an actual observed physical-deal mismatch.

### Native cause, captured before modification

[Four-arm frozen diagnostic CI 42543534545](https://github.com/FlareZ123/experiment-01/actions/runs/42543534545) recreated the failure with 4 original registered physical rows per policy. The rank14-B control had 14 accepted Store target dispatches and exactly 14 archived root target actions; the funded-pivot arm had 18 and 18. The **same single difference** occurred in both arms at target-bearing action index 8, actual source seat 0 global turn 15, `PlayCardAction`:

| Comparison | Actual record |
| --- | --- |
| Archived root card label | `Oricorio-GX` |
| Native physical owner-hand printing | `Oricorio GX CEC` |
| Action type, player seat, global turn | All exactly matched |
| Target-bearing root count | Control 14/14; pivot 18/18 |
| Only failing criterion | `physicalCardLabel` |

The mismatch was the legacy archive spelling of one exact source printing. The parser was intentionally strict and had already used exact aliases for comparable old GX/card-name cases. **No card game decision or physical card needed to change.**

### Minimal fix and actual native outcome

Added only the exact `Oricorio-GX` → `Oricorio GX CEC` correspondence to `simulation/twinleaf/native-accepted-target-store-observer.cjs` ([source commit 39fbb99a](https://github.com/FlareZ123/experiment-01/commit/39fbb99a81900adc2af4fc2f93dcef68c33cd5b6)). Native mismatch retains its ordinary strict veto for other cards, printings, actions, players and turns. `tests/native-accepted-target-store-observer.test.cjs` checks this exact map and rejects unrelated printings, variant spelling, seat/turn changes. [Pure regression CI 42543790716 SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/42543790716).

[Successful pinned native matched replay CI 42544163909](https://github.com/FlareZ123/experiment-01/actions/runs/42544163909), with the **same original frozen seed** and original 60s, returned:

| Rank14 B, seed 1632825195 | Control: VIP + Perfection | Treatment: additional donor-funded pivot |
| --- | --- | --- |
| Native target root ordinal linkage | **True, 14/14** | **True, 18/18** |
| Native root actions | 126 | 158 |
| Native engine error | None | None |
| Real native game terminal | **Yes** | **Yes** |
| Native winner seat | 1, candidate | 1, candidate |
| Final Prize cards remaining (source, candidate) | (6, 0) | (6, 0) |
| Full physical-deal fingerprint | `ad984f55da8b74c0da7522ffeb89ef096e23c460ef706d2f3ce46387378205b7` | Same |
| Original source-deal fingerprint | `c866f55a9fdb1bf9b5f1a63c49aebd38972916defa5db61f02e70d93e8715c9f` | Same |

This restores **one formerly unobservable matchup pair** with no change in winning seat. It confirms that the 116-game panel's missing physical-pair fingerprint had an implementation cause. The repaired rank14-B result is **retrospective**, generated with new evaluation code, and **must never silently revise the original 57/58 preregistered statistic** or be added to the original run as though it existed under that historical code SHA.

## Reproducibility and limit

- Original registration and frozen group: `results/aichi-2026/registrations/agent32-prospective-29rank-116native-20261109.json`; exactly 60 original source + exactly 60 unchanged candidate.
- Targeted actual Store runner: `simulation/evaluation/agent45-rank14-native-linkage-debug.cjs`, preserving original 4-row selected-native envelope with three additional unchanged frozen registration rows (rank1 seats A/B, rank2 seat A). `run_panel:false, diagnose_rank14_root_linkage:true` in the existing `.github/workflows/agent32-articuno-cold-crush-pilot.yml`.
- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Current code performs a fail-closed equality check for both native target linkages and both full/source physical fingerprints.
- No independently authenticated paper opponent play, timing receipt, tournament game or competent source decision policy was established. These **two games remain development-only, zero qualified competitive games**. The real native winner can be affected by the weak opponent policy. The 99.5% whole-field target remains unestablished.

**Practical next work:** Improve opponent competence on the same authentic rank14 Regidrago source trajectory before attaching any performance meaning to this candidate native win. Preserve this fixed source physical seed as a retrospective adversarial test only.
