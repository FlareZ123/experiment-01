
# Agent 32: Prize-aware G&H/Artazon access under optional mulligan bonus draws

**2 November 2026 | exact physical draw model with six Prize cards and Basic-valid initial seven | no native games or field win claims.**

## Why the earlier eight-card event is incomplete

[Agent32's first-eight resource analysis](agent32-gh-artazon-prize-access-20261102.md) established a **2.400835188717%** chance that the rank2-derived Exeggutor/Vileplume experimental fixed 60 holds the selected G&H/Tag/Artazon setup resources across seven opening cards and its first ordinary draw, conditional on a legal Basic-containing opening hand and six random Prizes. An opponent's mulligan can let its opponent voluntarily draw additional cards **after Prize placement**. Those extra cards change how often this particular opening-resource event is observed.

A common error is to require only that an enlarged hand contains Basics, silently permitting bonus-drawn Basics to repair an originally invalid seven. That does not respect the setup process. The new counter counts only original seven-card subsets that were themselves Basic-valid before any bonuses.

## Exact, fixed-bonus experiment

The same exact original 60 and its card/resource constraints from the first-eight report are used unchanged. Hold fixed a number m of **optional bonus cards actually drawn** because of the opponent's mulligans, before the first normal owner turn draw. The player initially drew a legal seven and placed six Prizes before drawing these m cards. Include the subsequent one normal turn draw, for a combined first **8+m** cards. Require a held second-turn Jet, held G&H or Tag Call with searchable G&H, two or three of Bunnelby/Exeggcute/Oddish, optional Artazon to find the third, plus surviving in-deck first-turn Jet, TM Evolution, Exeggutor, Gloom and Vileplume.

| Extra cards m voluntarily drawn | Total cards seen by first normal draw | Conditional opening-resource probability |
| ---: | ---: | ---: |
| 0 | 8 | **2.400835188717%** |
| 1 | 9 | **3.637486395971%** |
| 2 | 10 | **5.075001267793%** |
| 3 | 11 | **6.654006036394%** |

These are exact fractions from the source-asserting integer calculator. For m=1 the exact reduced fraction is **142195872208959/3909179491817600**; for m=2 it is **104750399830583183/2064046771679692800**; for m=3 it is **15107597645972294207/227045144884766208000**. No opposing deck frequency, acceptance policy for voluntary bonus cards, or time-interleaved source-game policy has been assumed.

The two-Basic Artazon branch dominates in every row (m=0 through 3: **2.2581475%, 3.3601845%, 4.5987799%, 5.9082471%** respectively), while three target Basics already held contribute **0.1426877%, 0.2773019%, 0.4762214%, 0.7457590%**. This is a specific route-access event, and other viable G&H, Artazon and TM lines are outside the counted conjunction.

## Exact derivation and validation

Split the original 60 into disjoint card groups:
Bunnelby2, Exeggcute2, Oddish2, G&H4, Tag Call4, Jet3, TM2, Exeggutor2, Gloom2, Vileplume2, Artazon2, **Other Basic8**, **Other nonbasic25**. This refines the previous anonymous Other33 into Basic/nonbasic groups, needed for legal initial-seven conditioning.

Let H be the unordered first n=8+m cards and P the disjoint initial six Prizes. Before conditioning on the seven being Basic-valid, every (H,P) pair has equal probability, with denominator C(60,n) times C(60-n,6). Suppose H contains b Basics. Of the C(n,7) possible original-seven subsets of H, exactly **C(n,7)-C(n-b,7)** contain at least one Basic. Each physical hand/Prize pair therefore receives this exact legal-initial-seven weight divided by C(n,7). Sum the weighted physical hand multiplicities and inclusion-exclusion Prize-survival target counts as in the earlier report. Finally condition on the original seven having a Basic with probability **1-C(46,7)/C(60,7)**. This derivation respects that the six Prizes are selected before bonus draws; the final H,P symmetry arises by summing over all physical original-seven subsets.

[Exact BigInt source](../../simulation/evaluation/agent32-gh-artazon-bonus-cards.cjs) computes m=0..3; [six tests](../../tests/agent32-gh-artazon-bonus-cards.test.cjs) include **independent exhaustive physical-index miniature-deck oracles for m=0 and m=1**, exact original source 14-Basic split and 0-bonus regression against the previously published fraction. An initial [CI 41400691491](https://github.com/FlareZ123/experiment-01/actions/runs/41400691491) failed because a toy fixture with fifteen physical cards could not leave five required search targets after nine observed cards and two Prizes. The test fixture was corrected to sixteen physical cards, and the production calculation did not change. The corrected **[GitHub Actions 41400828924](https://github.com/FlareZ123/experiment-01/actions/runs/41400828924)** then completed **SUCCESS**, including the named G&H/Artazon Node test step, **20/20 tests across the four Agent32 suites**, against the real source 60. The successfully pinned workflow head was **2ee0072d6bbd4a75265b7fde89d5e9ca9dab168e**.

## What this establishes

The reported conditional probability increases with one to three voluntarily accepted bonus draws for **the exact modeled resource conjunction**. The number of opposing mulligans is itself matchup- and setup-dependent. An Iron Thorns-only opponent with few Basic Pokémon may offer substantial optional draw opportunities, yet no average over its mulligan distribution is included here. Any actual source match must also follow rules for simultaneous mulligans, optional bonus-card choices, setup placement, opponent disruption and intervening turns.

These percentages remain **physical card-location resource screens**. They do not measure Blockade attack success, ability/item-lock resistance, effective discards, source-owner policy competence, match win probability or progress toward the 99.5% objective. There are still **29/32 authenticated opponent sixties and zero competitively qualified games**.
