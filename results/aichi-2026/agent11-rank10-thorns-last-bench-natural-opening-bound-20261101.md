# Agent 11: how often can the original rank-10 locked Dedenne last-Bench fork even arise without search?

**1 November 2026 | Exact combinatorics, source-printing checked | Development-only negative prioritization result**

## Research question

The [previous authentic two-seat staged native fork](../twinleaf/agent11-last-bench-thorns-native-fork-20261029.md) held the rank-10 Regidrago player's Dedenne-GX UNB 57 and Regidrago V SIT 135 simultaneously while four Bench positions were occupied. Against original rank-6 Iron Thorns ex TWM 77, a first-available-Basic actor played Dedenne into the fifth Bench slot, where Initialization suppressed its entry draw. The alternative preserved Dedenne and Benched Regidrago. That is a valid scripted Store comparison; no naturally dealt source-game incidence was measured.

**Question tested here:** Before any card-search, Trainer, Ability draw, evolution, or Prize-taking, how often can the rank-10 player naturally *have enough distinct Basics* for that specific five-position board plus two held cards, after accounting for both players' simultaneous opening mulligans?

This is an intentionally narrow necessary-card-location calculation. It does not predict which Basics a player actually Benches or prove which line is better.

## Authenticated source inventory

Read only [the 29 recovered Aichi original printed lists](full-decklists.json), specifically ranks 10 and 6. The runnable source guard checks all 60 copies per deck and the exact Pokémon printings involved.

| Exact original 60 | Physical categories relevant to this calculation |
| --- | --- |
| **Rank 10 Regidrago** | 1 Dedenne-GX UNB57; 4 Regidrago V SIT135; 10 other Basic Pokémon; 5 evolved Pokémon; 40 other non-Pokémon; hence 15 Basics and 45 non-Basics total |
| **Rank 6 Iron Thorns** | 4 Iron Thorns ex TWM77 Basics; 56 non-Basics |

The five non-Basic Pokémon copies in rank 10 are three Regidrago VSTAR SIT136, one Dragapult ex TWM130 and one Hisuian Goodra VSTAR LOR136. The other Pokémon printings' Basic classification was checked against the provided card pool. The executable guards the full named-printing inventory so a source-list change is not silently accepted.

The physical state needs *at least seven Basic cards* among the rank-10 player's observed cards: Dedenne plus a retained Regidrago V plus five more Basics to fill Active and four Bench positions. Seeing seven satisfies only a **necessary** inventory condition. It says nothing about whether those five were actually played, remain available, or are attractive plays.

## Exact calculation

Let \(C(n,k)\) denote the binomial coefficient, \(p_{10}=1-C(45,7)/C(60,7)\) be rank 10's opening-seven validity probability, \(p_6=1-C(56,7)/C(60,7)\) be rank 6's, and \(q_6=1-p_6\).

We condition all rank-10 calculations on an actual **valid starting seven**, as required by setup. When both players simultaneously have invalid sevens they restart together, yielding no free bonus card. When rank 10 has a valid seven and rank 6 continues to mulligan, rank 10 can take one optional bonus draw per opponent invalid seven. Assuming the rank-10 player elects to take **all** such bonus draws, the exact simultaneous-mulligan count distribution is:

\[
P(K=0)=\frac{p_6}{1-(1-p_{10})q_6},\qquad
P(K=k)=\frac{p_{10}p_6q_6^k}{1-(1-p_{10})q_6},\ \ k\geq1.
\]

For a natural sample of \(n\) seen rank-10 cards, the inventory event before conditioning on a valid first seven is

\[
\frac{\sum_{r=1}^{4}\sum_{o=0}^{10}
\mathbf{1}[1+r+o\geq t]\binom4r\binom{10}o\binom{45}{n-1-r-o}}
{\binom{60}n},
\]

where the singleton Dedenne is selected, \(r\) Regidrago V copies are selected and \(o\) other Basics are selected. Evaluate \(t=2\) for holding both named Pokémon and \(t=7\) for the necessary five-more-Basics configuration. Condition on a valid initial seven by removing the exact disjoint all-45-nonbasic starting-seven contribution. Prizes are set before bonus draws, but the marginal identities of the observed bonus/ordinary draw sample are still uniform from the unseen 53-card population when averaged across the six unknown Prize cards.

The code uses integer-precise BigInt binomial arithmetic and double-precision probability accumulation; a separate enumeration checked the values. The extremely long mulligan tail that would exceed the remaining deck's draw capacity is explicitly bounded, rather than pretending infinite draws are legal.

## Results

All percentages are conditioned on rank 10 ultimately presenting a valid starting seven. The percentages in the last column are **necessary inventory envelopes**, not playable-turn probabilities or observed game outcomes.

| Natural exposure | Dedenne + at least one Regidrago V seen | Also at least seven total Basics seen |
| --- | ---: | ---: |
| First seven only (no awarded extras) | **4.7143521%** | **0.00081948%** |
| First seven plus all opponent-mulligan bonus draws | **6.9003322%** | **0.10673693%** |
| Same plus rank-10 first ordinary turn draw | **8.4256834%** | **0.17744861%** |

Rank-10 starting seven is Basic-valid with probability **88.2499205%**; rank-6's independent first seven is invalid with probability **60.0500374%**. Under simultaneous setup the probability of zero awarded rank-10 bonus cards is **42.9827974%**. In the max-bonus calculation the omitted tail probability is below **3.70 × 10^-11**, which translates to less than **0.00000000370 percentage points** of unaccounted chance.

**Implication for shared priorities:** A strategy treating this *precise, naturally pre-search seven-Basic last-Bench collision* as a common first-turn failure would be misleading. The original script verifies a real possible mechanical fork, while this quantitative envelope shows that unaccelerated natural-card exposure of its necessary inventory is rare. It suggests prioritizing the much broader two-seat Supporter/Item/attack selection deficiencies already observed in actual source games, before spending more resources on this isolated opening.

## Scope and caveats

- **No search/draw engines or gameplay policies modeled.** Rank-10 draw/search Trainers, Pokémon entry Abilities, additional turns, hand reshuffles, Prize-taking and lost/played Pokémon can substantially change actual Bench occupancy and card exposure. Accordingly, **0.17745% is not an unconditional bound on encountering the fork later in gameplay**.
- Even the necessary seven-Basic event can be strategically impossible to implement with the displayed original turn, because the held cards might have been played or discarded, the opponent could take prizes, or other cards occupy Bench positions.
- Rank-6 only has Iron Thorns ex Basics; the earlier confirmed native Ability suppression applies to its Active Initialization under the staged setup. The probability here is card-location only, with no opponent-pressure or counter-response model.
- This does not test the relative strength of keeping Dedenne versus Regidrago, their Bench opportunity costs, or win rates.
- The research supplies **zero competitively qualified games**. At this date **29/32 exact original 60s** are authenticated; the fixed-deck **99.5% win-rate goal remains unproven**.

## Reproduction

- Source-locked CJS calculation: [scripts/agent11-rank10-last-bench-mulligan-bound.cjs](../../scripts/agent11-rank10-last-bench-mulligan-bound.cjs)
- Four direct node:test regression cases: [tests/agent11-rank10-last-bench-mulligan-bound.test.cjs](../../tests/agent11-rank10-last-bench-mulligan-bound.test.cjs)
- Source inventory: [full-decklists.json](full-decklists.json)
- Prior actual pinned native staged fork and same-deal attacking response: [last Bench native](../twinleaf/agent11-last-bench-thorns-native-fork-20261029.md), [Volt Cyclone reply](../twinleaf/agent11-last-bench-thorns-volt-cyclone-response-20261029.md)

Local Node test run: **4/4 passing**. This is a pure exact-combinatorial result, with no new Twinleaf native run and no newly requested CI workflow.
