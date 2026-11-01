# Original rank-31 Roxie/Koffing first-draw opportunity envelope

**Agent 15 | 1 November 2026 | evidence: authenticated published 60, supplied printed English card text, exact BigInt counting, independent seeded Monte Carlo.**

This report quantifies an *opening opportunity denominator* for the published rank-31 Dusknoir/Chimecho 60 at Aichi Open League 2026. It directly informs the recent [native Roxie/Koffing/Radiant Alakazam prompt failures](agent46-rank31-roxie-unified-payment-paper-portfolio-native-20261101.md) and [false generic prompt-validator rejection](agent4-original-crossrank-strict-ultraball-roxie-native-20261101.md). It does **not** create a qualified trial or show that the source bot actually selects Roxie.

## Exact source identity and model

The authenticated [original Top-32 source manifest](full-decklists.json), final rank 31, contains **4 Roxie CEC 205**, **3 Koffing CEC 76** and 15 Basic Pokémon. The supplied card pool prints Roxie as discarding up to two non-Pokémon-GX/non-Pokémon-EX Pokémon from hand, drawing three per discarded card. Koffing's Blow-Away Bomb can put one damage counter on each opponent Pokémon when discarded by Roxie. This source-printed linkage matters to both prompt-payment rules and the later Radiant Alakazam damage-counter interaction.

For a conservative unambiguously eligible discard subset, partition the complete source 60 into six disjoint classes:

| Class | Count | Printed examples |
|---|---:|---|
| Koffing Basic eligible for Roxie | 3 | Koffing CEC 76 |
| Other eligible Basic | 8 | Duskull 3, Unown 3, Chimecho 1, Radiant Alakazam 1 |
| Other Basic, excluded from conservative payment subset | 4 | Gengar & Mimikyu-GX, Bloodmoon Ursaluna ex, Latias ex, Tapu Lele-GX |
| Eligible Evolution Pokémon | 7 | Dusclops 3, Dusknoir 4 |
| Roxie Supporter | 4 | CEC 205 |
| Other Trainer/Energy | 34 | Remaining source 60 |

Modern Pokémon ex are excluded from this **conservative accounting subset** to avoid silently ruling on the older Roxie wording; the subset count is thus a modeled definition, not a definitive modern-ex eligibility ruling. The CEC printing identifiers and exact class totals are asserted by the executable.

Sampling conditions: shuffle 60 physical cards uniformly, draw seven, condition on a valid opener having at least one of the 15 Basics, set six hidden Prize cards, then take exactly one ordinary draw. Marginally, the first ordinary draw is uniform among the remaining 53 card identities despite the six unknown Prizes. Select an opening Active to preserve Roxie-payment potential: choose a noneligible Basic when available, otherwise a non-Koffing eligible Basic, otherwise one Koffing uniformly among the available Koffing. Do not voluntarily Bench a held eligible card. No opponent mulligan bonuses, search, Supporters, other draw, discard, Abilities, or Pokémon effects are modeled. Thus the numbers describe reachable physical hands under a deliberately specified Active choice, **not actual native root choices**.

The model enumerates all opening class-count vectors \(x\) with \(\sum x_i=7\) and at least one starting Basic. Each vector contributes \(\prod_i {n_i\choose x_i}\) initial deals. For each prospective eighth-card class \(j\), weight the vector by \(n_j-x_j\), with denominator \(53\sum_{\mathrm{valid}\ x}\prod_i {n_i\choose x_i}\). Subtract the chosen Active from its actual class before testing held Roxie, eligible payment, retained Koffing and order. Integer counting uses BigInt; the chronological Roxie-before-Koffing test uses the exact 420 common denominator for all relevant same-class order probabilities.

## Results

| Defined card-location event | Exact modeled probability, conditional on valid opener |
|---|---:|
| Valid seven among all uniformly random first sevens | 88.24992053% *unconditional* |
| Seven raw-holds at least one Roxie and one Koffing, before Active | 12.92348471% |
| Seven retains both Roxie and Koffing after choosing Active | 9.71188282% |
| After one ordinary draw, holds Roxie | 43.18852680% |
| After draw, Roxie plus at least one conservative eligible payment | 38.21784612% |
| After draw, Roxie plus at least two eligible payments | 24.78147142% |
| After draw, Roxie plus a retained Koffing | **12.70719100%** |
| After draw, Roxie plus Koffing and another eligible payment | **10.21704414%** |
| After draw, Roxie plus two retained Koffing | 1.25059060% |
| After draw, Roxie appears before the first retained Koffing in chronological hand order | **6.49971669%** |

The last event is **51.1499% of the modeled retained Roxie/Koffing coholds**. It uses uniform ordering of the originally drawn cards and uniform choice among equally prioritized Koffing for the opening Active. It is a possible *hand-order precondition* for the reported false-negative generic prompt-validator bug; it is not the observed incidence of invalid native prompts. If the source chooses a different Active or benches Koffing, access changes.

A naive after-draw Roxie/Koffing coholding count **without Active subtraction** is **16.09630006%**. The difference of **3.38910906 percentage points** consists of deals in which Roxie's only held Koffing was consumed as the starting Active. This is a concrete reason to distinguish a hand-access graph from a play-realistic prompt-payment opportunity.

## Additional source-text sensitivity: lowercase Pokémon ex

There is a meaningful card-category distinction in the original source. Roxie explicitly excludes **Pokémon-GX and Pokémon-EX**; the two original rank31 lowercase **Pokémon ex** (Bloodmoon Ursaluna ex TWM141 and Latias ex SSP76) have a different name/mechanic from the older hyphenated uppercase Pokémon-EX. The [official current English TCG rules, Appendix 2](https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf) explicitly distinguish ex from -EX card names. The [official Japanese Roxie printing](https://www.pokemon-card.com/card-search/details.php/card/37043/regu/all) excludes GX/EX by name. This supports a second **printing-literal eligibility scenario** in which both lowercase ex are eligible discard payments. No claim of an independent judge decision on the exact cross-era interaction is required for the sensitivity.

The updated executable reports both initial conservative (18 eligible) and printing-literal (20 eligible) scenarios without changing any of the first-draw deals. Reclassifying two lowercase ex from 4 noneligible Basics to 2 noneligible Basics produces:

| Card-access event | Conservative 18 | Printing-literal 20 |
|---|---:|---:|
| Roxie plus at least one eligible payment after draw | 38.21784612% | **38.71326955%** |
| Roxie plus at least two eligible payments after draw | 24.78147142% | **26.01880863%** |
| Roxie plus Koffing and a second eligible payment | 10.21704414% | **10.43255817%** |
| Roxie plus retained Koffing | 12.70719100% | **12.70719100%** |

The payment-count difference is an explicit sensitivity to a paper card identity rule; the Koffing cohold does not change because all scenarios have the same 15 opening Basics and select non-Koffing Active ahead of Koffing. For native prompt checking, ensure the published original GX printings remain forbidden while the lowercase ex verdict is traced to a specific printed rule decision. An implementation that treats every Rule Box as GX/EX would need independent justification.

## Passive first-player two-natural-draw boundary

The current Pokémon first-player rule prevents an ordinary Supporter on the starting player's first turn. The source rank-31 opening denominator should therefore retain a separate **two-natural-draw** comparison for the first player's next own turn. The independent [two-draw BigInt executable](../../scripts/agent15-rank31-roxie-twodraw.cjs) counts the first two ordinary draws after the unchanged opening Active choice, from the remaining 53 then 52 physical cards. It assumes no intervening action by either player and no optional mulligan bonus cards, and should be read as physical-hand access only. It is a passive retention model, **not** a bound on played Roxie at the second own turn because those earlier game actions may change the hand.

| Card-access event by passive second own turn | Conservative eligible | Printing-literal modern ex eligible |
|---|---:|---:|
| Roxie present | 47.55864013% | 47.55864013% |
| Roxie plus one eligible discard | **43.94541404%** | **44.47055846%** |
| Roxie plus two eligible discards | 32.06091600% | 33.62759780% |
| Roxie plus retained Koffing | **15.92162680%** | **15.92162680%** |
| Roxie plus Koffing and second eligible discard | 13.75539569% | 14.03143947% |

The exact denominator is **939,320,038,800** valid opening-class physical-card combinations weighted by ordered 53×52 possible later draws. The non-Roxie first-turn hand and unknown Prize composition do not alter unconditional marginal draw-card symmetry. A second independent Python BigInt enumeration agreed with the Node results, and an independent 300,000-hand fixed-seed Monte Carlo yielded 15.85059% Roxie/Koffing retained coholding among 264,823 valid starts. This is a targeted seat-aware benchmark for native opportunity auditing; no claim is made about either source's chosen actions, tournament legality resolution or game wins.

## Validation and limitations

- [Exact, source-checked executable](../../scripts/agent15-rank31-roxie-firstdraw.cjs) with [four Node pure tests](../../tests/agent15-rank31-roxie-firstdraw.test.cjs). BigInt category enumeration, exact 60 count, fixed CEC source printings, Basic/eligible partition, denominator and order calculation. Local Node v22.16.0 four tests passed. No new GitHub workflow was created and no compiled native CI is asserted.
- Independent Python 3.13.5 rational-combinatorics enumeration reproduces the first-draw 12.7071910026%, one-payment 38.2178461222% and two-payment 24.7814714207% results. A separate fixed-seed 700,000-trial simple Monte Carlo gave 618,482 valid first sevens and observed 12.72858% retained Koffing+Roxie, 6.49202% ordered Roxie-before-Koffing. This corroborates, rather than replaces, the exact enumeration.
- These percentages do not condition on the actual opponent, matchup, first-player Supporter restriction, Item locks, Ability locks, opponent mulligan bonus cards, search reachability, a Roxie decision after another Supporter, the remainder of the Koffing/Roxie/Radiant chain, tournament-clock deadlines or future drawn cards. They do not certify the source physical printing's Japanese legality or the native Store's paper correctness.
- An exact cohold is not necessarily a good Roxie play. Koffing and other eligible Pokémon can instead be valuable in play; an optimal opponent may preserve them. These are original-deck *potential* access frequencies, not a source-policy performance estimate or a proxy win rate.

## Actionable next qualification step

In the existing common bilateral original-source runner, attach **read-only, owner-only** opportunity telemetry to the initial source rank-31 decision root, separately for each physical starting seat. Preserve every source-deal denominator; distinguish held Roxie, actual retained eligible card, paper-legal prompt offer, native playable Supporter, selected PlayCard action, accepted real Store prompt, physical payment, Koffing Blow-Away Bomb settlement, Radiant Alakazam continuation, and subsequent opponent response. Specifically retain one first natural original-source **Roxie-before-Koffing** witness and one negative-control hand-order case. Compare it against the v8 paper prompt portfolio, which already distinguishes valid Koffing from forbidden GX/zero-card payments, and escalate to the shared portfolio owner. No rule-fidelity qualification follows from the direct access percentages alone.

**Benchmark status unchanged:** 29/32 published exact original opponents (ranks 23, 25, 28 missing), zero competitively qualified games, no verified fixed 60 or 99.5% field win rate.
