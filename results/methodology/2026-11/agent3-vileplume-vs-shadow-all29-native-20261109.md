# Fixed rank-2 Vileplume Control versus Shadow Rider across every authenticated Aichi source

**Agent 3, 9 November 2026. Full native execution completed, source decklists unchanged.**

## Selection-relevant result

Native simulator Aichi original-opponent cohort: **116 native Store games** across all **29 authenticated original Top32 sixty-card lists**, each exact source with both physical seat orientations, with **58 independently registered physical source groups** and two complete contender 60s.

| Outcome | Shadow Rider rank1 | Vileplume Control rank2 |
| --- | ---: | ---: |
| Native candidate wins | **33** | 8 |
| Native losses | 12 | 10 |
| Native full terminals | **45** | 18 |
| Root action caps | 13 | 38 |
| Engine errors | 0 | 2 |

**Actual source physical pairing:** 47/58 matched source deal and starter; only 14 both-terminal comparable groups; 5 actual terminal outcome differences, 4 favorable to Shadow Rider versus 1 favorable to Vileplume.

The initial fixed rank2 lock-control architecture has dramatically fewer native terminals and wins under the current bot, despite opt-in tactical Bunnelby/Guzma & Hala original-source policy assistance. This is **developmental evidence of a major model/policy-completion gap**, and does not by itself prove the deck is competitively weak. The tournament runner-up finish is independent real-world evidence of viability under skilled play; the native actor’s 38 capped games make it inappropriate to reject the architecture using a naive W/58 rate.

## Exact rank-by-rank diagnostic scope

Table reports **native candidate wins / two registered game attempts** per original source. Full terminals, losses, error flags and actual matched physical status remain in the CI artifact.

| Source rank | Original archetype | Shadow Rider native wins | Vileplume native wins | Physical source matched | Both terminal matched |
| ---: | --- | ---: | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 2/2 | 0/2 | 2/2 | 1/2 |
| 2 | Vileplume Control | 0/2 | 0/2 | 1/2 | 0/2 |
| 3 | Snorlax Stall | 1/2 | 0/2 | 2/2 | 0/2 |
| 4 | Raichu Electrode Combo | 1/2 | 0/2 | 1/2 | 0/2 |
| 5 | Mew Genesect | 1/2 | 2/2 | 2/2 | 2/2 |
| 6 | Iron Thorns | 0/2 | 0/2 | 2/2 | 0/2 |
| 7 | Snorlax Stall | 1/2 | 1/2 | 2/2 | 1/2 |
| 8 | Absol Garbodor | 2/2 | 0/2 | 2/2 | 0/2 |
| 9 | Absol Electrode | 1/2 | 0/2 | 2/2 | 0/2 |
| 10 | Regidrago | 2/2 | 0/2 | 1/2 | 0/2 |
| 11 | Absol Garbodor | 1/2 | 0/2 | 2/2 | 2/2 |
| 12 | Regidrago | 1/2 | 2/2 | 2/2 | 1/2 |
| 13 | Regidrago | 2/2 | 1/2 | 1/2 | 1/2 |
| 14 | Regidrago | 0/2 | 0/2 | 2/2 | 0/2 |
| 15 | Lopunny Vileplume | 1/2 | 0/2 | 2/2 | 1/2 |
| 16 | Absol Garbodor | 2/2 | 0/2 | 1/2 | 0/2 |
| 17 | Raichu Electrode Combo | 1/2 | 0/2 | 2/2 | 0/2 |
| 18 | Regidrago | 0/2 | 0/2 | 2/2 | 1/2 |
| 19 | Raging Bolt | 2/2 | 0/2 | 1/2 | 1/2 |
| 20 | Regidrago | 2/2 | 0/2 | 2/2 | 0/2 |
| 21 | Regidrago | 1/2 | 0/2 | 2/2 | 0/2 |
| 22 | Absol Garbodor | 1/2 | 1/2 | 1/2 | 1/2 |
| 24 | Iron Thorns | 1/2 | 0/2 | 1/2 | 0/2 |
| 26 | Meloetta Donk | 2/2 | 0/2 | 2/2 | 0/2 |
| 27 | Regidrago | 2/2 | 1/2 | 1/2 | 1/2 |
| 29 | Iron Thorns | 0/2 | 0/2 | 1/2 | 1/2 |
| 30 | Lillie's Clefairy | 2/2 | 0/2 | 2/2 | 0/2 |
| 31 | Dusknoir Chimecho | 0/2 | 0/2 | 1/2 | 0/2 |
| 32 | Regidrago | 1/2 | 0/2 | 2/2 | 0/2 |

## Execution evidence

- [Frozen 58-group registration, two complete original tournament 60s](https://github.com/FlareZ123/experiment-01/blob/agent3/vileplume-fixed60-all29-20261109/results/aichi-2026/registrations/agent3-vileplume-vs-shadow-all29-prospective-20261109.json).
- [Runnable same-policy original-source experiment](https://github.com/FlareZ123/experiment-01/blob/agent3/vileplume-fixed60-all29-20261109/simulation/evaluation/2026-11/agent3-vileplume-vs-shadow-all29-native.cjs).
- [Successful 116-game GitHub Actions native run 42576893739](https://github.com/FlareZ123/experiment-01/actions/runs/42576893739) and its artifact `agent3-vileplume-vs-shadow-all29-native`, all complete root and board receipts retained.
- Fixed branch experimental code SHA `9515589d17f86ad35d1a5d3d8067a5d02efb48fd`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Both control and Vileplume challenger had the same common actor features and native paper correction profile: Celestial Roar, Mew Energy Mix, and blocked Energy target. The Bunnelby/Guzma & Hala extensions were likewise offered to both actors; original printed 60s and actual physical seating were preserved.

## Next actual solution

The next model improvement for this archetype should be **realistic first-turn Tag Call → Guzma & Hala → Jet Energy + TM: Evolution → Bunnelby Barrage line and subsequent Vileplume/Stoutland board establishment**, measuring actual board completion and legal root choices. Thirty-eight action caps on the lock deck make the current generic agent a poor proxy for skilled control piloting. Existing Bunnelby source heuristics need a complete attack-and-lock objective and opponent-aware game termination, rather than another superficial retrieval proxy. Run a corrected full field comparison only after it can autonomously execute this priority line.

**Competitive qualification = zero games; 99.5% field target unproven; missing exact original ranks23/25/28.** Shadow Rider remains the stronger demonstrated **developmental comparator** under this current frozen policy, and Vileplume remains a meaningful strategic avenue requiring stronger automatic pilot.
