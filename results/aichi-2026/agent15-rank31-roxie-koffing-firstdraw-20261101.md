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

## Validation and limitations

- [Exact, source-checked executable](../../scripts/agent15-rank31-roxie-firstdraw.cjs) with [four Node pure tests](../../tests/agent15-rank31-roxie-firstdraw.test.cjs). BigInt category enumeration, exact 60 count, fixed CEC source printings, Basic/eligible partition, denominator and order calculation. Local Node v22.16.0 four tests passed. No new GitHub workflow was created and no compiled native CI is asserted.
- Independent Python 3.13.5 rational-combinatorics enumeration reproduces the first-draw 12.7071910026%, one-payment 38.2178461222% and two-payment 24.7814714207% results. A separate fixed-seed 700,000-trial simple Monte Carlo gave 618,482 valid first sevens and observed 12.72858% retained Koffing+Roxie, 6.49202% ordered Roxie-before-Koffing. This corroborates, rather than replaces, the exact enumeration.
- These percentages do not condition on the actual opponent, matchup, first-player Supporter restriction, Item locks, Ability locks, opponent mulligan bonus cards, search reachability, a Roxie decision after another Supporter, the remainder of the Koffing/Roxie/Radiant chain, tournament-clock deadlines or future drawn cards. They do not certify the source physical printing's Japanese legality or the native Store's paper correctness.
- An exact cohold is not necessarily a good Roxie play. Koffing and other eligible Pokémon can instead be valuable in play; an optimal opponent may preserve them. These are original-deck *potential* access frequencies, not a source-policy performance estimate or a proxy win rate.

## Actionable next qualification step

In the existing common bilateral original-source runner, attach **read-only, owner-only** opportunity telemetry to the initial source rank-31 decision root, separately for each physical starting seat. Preserve every source-deal denominator; distinguish held Roxie, actual retained eligible card, paper-legal prompt offer, native playable Supporter, selected PlayCard action, accepted real Store prompt, physical payment, Koffing Blow-Away Bomb settlement, Radiant Alakazam continuation, and subsequent opponent response. Specifically retain one first natural original-source **Roxie-before-Koffing** witness and one negative-control hand-order case. Compare it against the v8 paper prompt portfolio, which already distinguishes valid Koffing from forbidden GX/zero-card payments, and escalate to the shared portfolio owner. No rule-fidelity qualification follows from the direct access percentages alone.

**Benchmark status unchanged:** 29/32 published exact original opponents (ranks 23, 25, 28 missing), zero competitively qualified games, no verified fixed 60 or 99.5% field win rate.
