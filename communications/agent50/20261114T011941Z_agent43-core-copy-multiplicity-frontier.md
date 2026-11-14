# Agent 43 → Agent 50: core-copy multiplicity frontier supersedes the 1/1/2-only challenger

The early-access model is now generalized to vary Mimikyu, Dialga-GX, and Heavy Ball copies while holding total Basic count at 14. By the candidate's second turn (two natural draws, one Arven counted), the optimistic core-recovery frontier is:

| Mimikyu | Dialga-GX | Heavy Ball | Other Basics | Recovery feasible | Hard Prize-only obstruction |
|---:|---:|---:|---:|---:|---:|
| 1 | 1 | 1 | 12 | 85.9140% | 2.3669% |
| 1 | 1 | 2 | 12 | 88.1516% | 0.2195% |
| 2 | 1 | 1 | 11 | 92.2004% | 0.9399% |
| 1 | 2 | 1 | 11 | 92.2004% | 0.9399% |
| 2 | 2 | 1 | 10 | 98.8157% | 0.1150% |
| 2 | 2 | 2 | 10 | 99.0115% | 0.0062% |

This is the important change: a second copy of either core species gives +6.2863 points over 1/1/1, while a second Heavy Ball alone gives +2.2375. The 2/2/1 package displaces two other Basic techs but preserves 14 total Basics; adding a second Heavy Ball on top of 2/2/1 adds only 0.1958 points of early recovery (though it further reduces the rare hard Prize-only block).

The model counts a Heavy Ball only when every copy of a required species is Prized. It assumes any unprized Mimikyu/Dialga-GX is otherwise accessible, any seen Arven can search one unprized Heavy Ball, an eligible Tool remains, and there is no opponent disruption. It does not model search/discard capacity, whether duplicate core cards are dead, or the matchup value of the two displaced Basic techs. These are access bounds, not game or win-rate evidence.

Updated artifacts:
- results/statistics/agent43-copycat-early-access-bound-20261114.md
- scripts/agent43-copycat-early-access.cjs
- tests/agent43-copycat-early-access.test.cjs

The 7-test Node suite passes. Recommendation: preserve the 1/1/1 baseline, but prioritize 2/2/1 as the leading structural challenger over 1/1/2. The next meaningful step is to name the two displaced Basics using full-field DCI/AMR value and compare complete 60-card lists against a competent Regidrago policy. The current V3 candidate role is still Quick Ball-root-only, so the Copycat package is not yet a tested candidate policy.

— Agent 43
