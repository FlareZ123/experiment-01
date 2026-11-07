# Champion Mimikyu + Dialga-GX initial Prize-cut risk against Regidrago

**Agent 6 | 7 November 2026 | exact combinatorial opportunity model.** Scope: three original Basic and Item singleton slots in the Aichi rank1 Shadow Rider 60, not a native game, a deck proposal, or a matchup win-rate estimate. Source card/count inventory: `results/aichi-2026/full-decklists.json`. Reproducer: `scripts/agent6-copycat-prize-mincut.cjs`; focused regression: `tests/agent6-copycat-prize-mincut.test.cjs`.

## Why this precise access chain matters

The original rank1 champion has exactly one **Mimikyu GRI 58** (Basic), one **Dialga-GX UPR 100** (Basic), and one **Hisuian Heavy Ball ASR 146** (Item). Its central paper Regidrago counterline can put Mimikyu Active with two Psychic Energy, copy opponent's preceding non-GX Apex Dragon, and then copy Timeless-GX from its own discarded Dialga-GX. The attack and discard requirements remain substantial and conditional, but direct access to both singleton Basic bodies is necessary for this specific line.

Nine *fully authenticated* Top32 original lists (ranks 10, 12, 13, 14, 18, 20, 21, 27, 32) contain Regidrago VSTAR and Dialga-GX. Two more Top32 entries (ranks 23 and 28) are labeled Regidrago without authenticated complete lists. Hence **11/32 field archetypes are Regidrago**, and the specific champion counterline is more than a rare-theory curiosity. The exact Mimikyu Copycat/non-GX Apex paper-versus-native discrepancy is independently documented by Agent46 [here](../../methodology/agent46-mimikyu-copycat-nongx-apex-native-block-20261107.md), and a prior staged two-KO countersequence with an explicit research-side compatibility hook is [here](../agent2-champion-copycat-bonus-powerbeam.md).

The bundled English card database independently verifies the three exact printed texts and subtypes: `sm2-58` Mimikyu is Basic and its Copycat can copy the opponent's prior **non-GX** attack; `sm5-100` Dialga-GX is Basic with Timeless-GX; `swsh10-146` Hisuian Heavy Ball is an Item that may reveal **a Basic Pokémon** in face-down Prizes, exchange that one with the Heavy Ball, and then shuffle the face-down Prizes. Hisuian Heavy Ball can exchange with **one** face-down Prized Basic Pokémon when played. If both Mimikyu and Dialga are initially Prized, one Heavy Ball cannot recover both immediately. If Heavy Ball itself is Prized alongside either core Basic, it cannot provide the initial access path. These form a specific **Prize-only min-cut** for the full two-Basic counterline before normal Prize-taking or some other recovery line.

## Exact conditioned calculation

The source 60 has 14 starting-eligible Basic Pokémon. First draw a uniformly random starting seven, **condition on having at least one Basic** (a legal first opening), then set six uniformly random Prizes from the remaining 53. No extra opponent-mulligan cards, opening search, Prize-taking, Item lock or decisions are modeled. Equivalently for the joint distribution, first choose six uniformly random Prize cards from all 60, then choose the initial seven from the other 54, and count only the hands containing a Basic.

Partition the 60 into one Mimikyu Basic, one Dialga-GX Basic, one Hisuian Heavy Ball Item, 12 other Basics, and 45 other cards. For each possible selection of the three named cards into Prizes and each number `b` of other Prized Basics, the probability of that Prize composition is

`C(12,b) * C(45,6 - b - m - d - h) / C(60,6)`

where `m,d,h` indicate whether the corresponding singleton is Prized. Conditional on that Prize composition, the probability that the initial seven contain at least one Basic is

`1 - C(54 - (14 - m - d - b),7) / C(54,7)`.

Summing the product over all valid `m,d,h,b` and dividing by `1 - C(46,7)/C(60,7)` gives the exact probability conditional on a legal starting hand. The cut event is

`(m AND d) OR (h AND (m OR d))`.

This explicitly includes multivariate Prize configurations and avoids treating initial Prizes as independent singleton Bernoulli trials.

| Event, conditional on valid initial seven | Rank1 champion and Hood Shield (14 Basics) | Temple candidate (15 Basics) |
| --- | ---: | ---: |
| Valid original seven, unconditional | 86.140932% | 88.249921% |
| At least one of the two Basic core cards Prized | 18.766341% | 18.832936% |
| **Both core Basics Prized** | 0.808671% | 0.815359% |
| Heavy Ball Prized with at least one core Basic | 1.614441% | 1.619181% |
| All three named cards Prized (overlap) | 0.056203% | 0.056628% |
| **Immediate Prize-only two-Basic access cut (event union)** | **2.366909%** | **2.377913%** |

An additional manifest-provenance test now reads the three exact machine-readable 60-card inventories and verifies 60 total cards, exactly one `Mimikyu GRI 58`, `Dialga-GX UPR 100`, and `Hisuian Heavy Ball ASR 146`, plus the VMAX-based 14/15 Basic count for these known all-other-Basic shells. The rank1 and Hood Shield lists each have 14 Basics. Temple v1 has 15 because it plays three rather than four VMAX with a corresponding additional Basic. All three contain the three named singleton roles. The difference in conditional percentages is caused by the opening-hand Basic count; the nominal three-singleton/unconditional six-Prize combinatorics otherwise match.

## Counterfactual: extra Heavy Balls as direct Prize-rescue capacity

For a *hypothetical* 60-card list containing the same two Basic singletons and `H` copies of Hisuian Heavy Ball, the cut condition generalizes to `number of Prized core Basics > (H - Prized Heavy Balls)`. In the enumeration, add `C(H,h)` for the chosen `h` Prized Balls and reduce the other non-Basic pool to `60 - basicCount - H`. The nominal 60-card count stays fixed by replacing otherwise unspecified non-Basic slots. Actual counterfactual deck construction, legality and sacrificed card functions remain unexamined.

| Copies of Hisuian Heavy Ball | 14-Basic immediate Prize-capacity cut | 15-Basic immediate Prize-capacity cut |
| ---: | ---: | ---: |
| 0 | 18.766341% | 18.832936% |
| **1 (all three actual lists)** | **2.366909%** | **2.377913%** |
| 2 (hypothetical) | 0.219492% | 0.220562% |
| 3 (hypothetical) | 0.014663% | 0.014733% |
| 4 (hypothetical) | 0.000640% | 0.000643% |

Thus a second Ball would reduce this *isolated* original 14-Basic Prize cut by roughly a factor of ten, while consuming a slot potentially needed for setup, draw, a tactical Supporter, or another countermeasure. This does **not** show a beneficial deck swap or a win-rate change. Real Item locks and retrieval access remain unresolved, and two retrieved Basics still require the Copycat attack conditions. This illustrative count comparison is useful for evaluating discrete, catastrophic-but-rare resource failure modes without pretending that the other 59 card choices are free.

## Strategy interpretation and limits

- This is the probability of **one precise immediate access mechanism** being obstructed by Prize placement, conditional on a legal seven. It does **not** imply a loss, absence of any Regidrago counterplay, or the champion's failure to take Prizes. A skilled player might recover the missing component later via Prize-taking, execute a different attack line, or win without Copycat.
- The complement (97.633091% rank1) means only that *this particular initial Prize cut is absent*. It is **not** the probability the Copycat counterline is executable: Mimikyu still needs Energy and Active access, Dialga must be in discard when copied, the opponent must actually declare Apex, and the turn/match rules and locks must permit the attacks. Heavy Ball may be inaccessible from hand or blocked by Item lock even when it is outside Prizes.
- The Basic-opening conditioning accounts for initial mulligans on the player's side but assumes uniform legal-seven sampling and does not incorporate information learned from opponent mulligans, which can change policy choices. Three exact historically valid physical printings and other paper rules still require independent validation across all matchup states.
- The specific Prize-only cut persists across the two shortlisted Shadow Rider modifications. It is therefore a focused risk to evaluate in source-dealt matches, especially when testing the prominent Regidrago archetype, without treating the 2.37% figure as a predicted competitive loss fraction.
- Both model and tests are pure CJS. The exact committed module and test callbacks were independently fetched, parsed and executed in a separate JavaScript V8 runtime: **6/6 tests passed**; champion and Temple probabilities match a separate Python exact-enumeration calculation. No compiled Twinleaf/native Node CI or competitive sample is claimed.

The field remains **29/32 fully authenticated original name/count inventories**, zero paper-qualified competitive games, no selected final 60, and no demonstrated 99.5% win rate.
