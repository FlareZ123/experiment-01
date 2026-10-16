# Exact early Prize-rescue capacity cuts for the champion's two-card counter-line

**Agent 27, 16 October 2026.** Evidence class: exact finite-population combinatorics, independently checked against exhaustive miniature-deck deals. This measures **structural Prize rescue capacity** for named roles, not matchup execution, actual first-turn access, or a game-win probability.

## Source inventory and tactical condition

The [published rank-1 Shadow Rider Calyrex reference](benchmark-shadow-rider.md) includes exactly one **Mimikyu**, one **Dialga-GX**, and one **Hisuian Heavy Ball**, with **14 Basic Pokémon total**. [Human strategic concepts](../../resources/human_concepts.md) describe Mimikyu Copycat copying an opponent Regidrago's Apex Dragon and using the player's own discarded Dialga-GX Timeless-GX attack. That interaction is an important *possible counter-line*, requiring both critical Basics to be available before the first Prize is taken; engine/ruling details have their own separate audits.

If an entire necessary Basic role is Prized, one usable Hisuian Heavy Ball can retrieve one Basic from the Prize cards in the abstract access model. A rescue Item that is itself Prized cannot provide that rescue. A **capacity cut** occurs when the number of critical roles with all their copies Prized exceeds the number of non-Prized rescue Items. This is a necessary limitation of the designated rescue channel under static initial Prizes. Other effects or later Prize-taking may still solve the situation.

## Exact conditional probabilities

All rows condition on a valid seven-card opening, with six subsequent face-down Prize cards, a 60-card deck, and the original 12 other Basic Pokémon unchanged. Additional copies hypothetically replace non-Basic filler slots. Original published counts are marked **reference**.

| Copies of Mimikyu | Copies of Dialga-GX | Heavy Ball copies | Rescue-capacity cut given valid opener |
| ---: | ---: | ---: | ---: |
| 1 | 1 | 0 | 18.76634080% |
| 1 | 1 | **1 (reference)** | **2.36690910%** |
| 1 | 1 | 2 | 0.21949187% |
| 1 | 1 | 3 | 0.01466326% |
| 2 | 1 | 1 | 0.94357297% |
| 2 | 2 | 1 | 0.11659566% |
| 2 | 1 | 2 | 0.06666168% |

The exact reference fraction is **139744719 / 5904101632**. The two-Ball hypothetical is **18690899 / 8515531200**. A second Heavy Ball would reduce the narrow structural cut by approximately **2.1474 percentage points**; adding a second Mimikyu instead would reduce it by approximately **1.4233 points**. These compare different slot types and do not establish their strategic value or recommended deck changes.

For the one-Ball reference, the disjoint failure partitions are: one critical Basic and Heavy Ball both Prized (**1.55823786%**); both critical Basics Prized with Heavy Ball outside the Prizes (**0.75246835%**); and all three Prized (**0.05620289%**). The partitions total **2.36690910%**.

## Method and independent check

For each critical role `i` with `c_i` copies, enumerate `r_i` of those copies Prized. Let `h` be the rescue Item count, `y` the number Prized, `u` other Basic copies, `z` of those Prized, and `f` non-Basic fillers. For `q` Prizes, the number of such Prize subsets is

`W = product_i C(c_i,r_i) * C(h,y) * C(u,z) * C(f, q - sum_i(r_i) - y - z)`.

After those Prizes, the number of valid opening hands of size `s` is

`V = C(N-q,s) - C(N-q - [sum_i(c_i-r_i)+u-z], s)`.

Multiply `W*V` and sum over all configurations where `count_i(r_i == c_i) > h-y`. Divide by the number of legal hand/Prize combinations,

`[C(N,s)-C(N-B,s)] * C(N-s,q)`, where `B=sum_i c_i+u`.

This is equivalent to physically dealing the opening hand first, accepting it only if it contains a Basic, then dealing the Prizes from the remaining cards. The executable [exact enumerator](../../scripts/prize_recovery_capacity.py) preserves integer combinatorial counts and uses Python `Fraction`. I independently enumerated every accepted hand and Prize assignment for four miniature-deck cases, including three critical roles and duplicate roles; all four fractions matched the formula exactly.

**Implementation warning:** the enumerator's `cut_unconditional` result key is currently *misnamed*: it holds the joint probability of the cut **and** a valid opening. The correct conditional result is `cut_given_valid_opening`, and all numbers in this report use that field. Do not interpret the misnamed key as the unconditional Prize-cut probability.

## What remains missing

This cut abstracts every non-Prized critical Basic as potentially obtainable and every non-Prized rescue Item as usable. It does not model draw/search sequencing, Item lock, opponent turn order, Ultra Ball discard constraints, inaccessible search chains, the need for a functional attacker, Energy requirements, opposing interactions, Prize taking during a game, or the option to win through a different line. It also ignores opponent mulligan bonus draws, since those do not change the static initial Prize capacity event itself. Thus, a card-slot recommendation requires game-state tactical value and policy validation.

**The 99.5% field-win objective remains unsupported.**