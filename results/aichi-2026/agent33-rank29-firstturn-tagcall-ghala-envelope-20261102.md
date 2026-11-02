# Rank29 first-turn Tag Call / Guzma & Hala source access

**Agent33, 2 November 2026.** Original fixed 60 contains four Basic Iron Thorns ex, two Tag Call, two Guzma & Hala, one DCE and one Thunder Mountain Prism Star. Going second, Tag Call can reach G&H, G&H can search Thunder and DCE with the required optional two-other-card discard, and Thunder reduces the Lightning cost of Iron Thorns ex's Volt Cyclone. The two Colorless are supplied by DCE. Alternative access occurs when G&H is directly held or both singleton resources are directly held.

The exact calculation conditions on at least one Basic in the opening seven, then counts six unknown Prize cards and the compulsory turn-one draw without replacement. Drawing one of 53 remaining cards before enumerating six Prizes among the other 52 is combinatorially equivalent to the actual chronology, with Prizes placed before the turn draw.

| Conditional first-own-turn resource-location event | Probability |
| --- | ---: |
| G&H held and singleton resources unprized/held | **18.40895035%** |
| G&H absent; Tag Call held and G&H accessible in deck | **14.50195925%** |
| Either connector | **32.91090960%** |
| Both singleton attack resources directly held | **1.27835513%** |
| **Union, overlapping states removed** | **33.78150571%** |

The exact union is **56,238,988,836,673,440 / 166,478,632,771,651,200**. The denominator is `(C(60,7)-C(56,7))*53*C(52,6)`.

| G&H copies | Tag Call copies | Ideal resource opportunity |
| ---: | ---: | ---: |
| 2 | 2 (original) | 33.7815% |
| 2 | 3 | 39.7733% |
| 2 | 4 | 45.0846% |
| 3 | 2 | 40.0098% |
| 4 | 2 | 45.3986% |

This sensitivity is for replacement of otherwise unmodeled other cards. It does not establish a better deck: displaced card value, Supporter contention and state-dependent discardability remain unmeasured.

Reproduce using [BigInt model](../../simulation/evaluation/agent33-rank29-firstturn-tagcall-ghala-envelope.cjs), [regression](../../tests/agent33-rank29-firstturn-tagcall-ghala-envelope.test.cjs) and [original card records](full-decklists.json). The remotely fetched script has been checked on the actual original 60 and reproduced the independent Python combinatorial result. Local full-version Node22 tests passed; no native CI claim for this committed smaller form.

**Qualification veto:** This is only a structural paper card-location bound for going second. No source policy or two-discard **physical payment**, Stadium and DCE transition, native attack/Prize outcome, opponent continuation, opponent intervention, tournament 25-minute clock or win rate has been established. Especially do not trust accepted native G&H optional-cost actions before checking two actual cards reached discard. Field coverage stays 29/32 exact original 60s, with zero competitive-qualified games. Next: test same native rank29 printed 60 in both physical seats under one frozen selected policy, on paired actual source deals, preserving every error and negative attempt.
