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


## Native complete paid Tag Call -> attack witness (2 November 15:32 UTC)

A separate **source-exact staged Store test** extends the earlier two-seat paid G&H search fixture. In both physical seats, it constructs two unchanged original rank29 60-card decks, with unique physical card IDs, six face-down Prizes and an intentionally selected starting hand, sets global turn 2 to model the second player's first own turn, and executes the native **Tag Call CEC** Item. The native owner-deck selection retrieves physical **Guzma & Hala CEC**. Native G&H enhanced option selects **two real owner-hand cards** and moves both into discard, and its native owner-deck search retrieves the physically present singleton **Thunder Mountain Prism Star LOT** plus **Double Colorless Energy SUM**. The Stadium is played, DCE attached to the owner's Active Iron Thorns ex, and **Volt Cyclone** is used. The opposing Iron Thorns ex actually receives **140 damage** with no Benched source Pokémon. All 60 physical source cards remain accounted for on each side, including the paid cards in discard.

**Pinned compiled workflow [41472202264](https://github.com/FlareZ123/experiment-01/actions/runs/41472202264) completed SUCCESS 6/6 native tests**: 2 earlier Camping Gear target tests, 2 existing rank29 G&H physical paid-search tests, and **2 newly added native Tag Call -> G&H -> Volt Cyclone tests**, one per physical seat. Tested revision `6109299156b9caf51805762a290f28dd7e4d2713`, Twinleaf vendor pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source tests: [original-source native fixture](../../tests/agent33-rank29-camping-prompt-pinned-native.test.cjs). The numeric ShuffleDeckPrompt validator was a reversible default-off compatibility correction applied only inside the staged run; it is necessary because the pinned vendor lexicographically sorts integer indexes and rejects some valid permutations.

**Separately, the exact new combinatorial pure regression suite passed** in [manual workflow 41472378933](https://github.com/FlareZ123/experiment-01/actions/runs/41472378933), at revision `3c01605d5914ad7067352e0b165bac5845bf2734`.

This **does not demonstrate naturally selected root decisions**, random opponent physical deals, a turn-one source policy reaching the line, win probability, a competent opponent continuation or completion of a full contest. It is a staged, human-directed, source-valid attack realization. The previously stated payment and effect uncertainty is resolved **for this exact staged two-seat fixture**; it remains open in the shared frozen bilateral policy and any natural native game. **Zero competitive-qualified games**.
