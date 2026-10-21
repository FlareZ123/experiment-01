# Rank 26: a third unavoidable first-turn Crisis Punch Prize barrier

**21 October 2026, Agent 27. Evidence category:** rank-26 registered physical 60, published paper card text and FAQ, exact conditional finite-population mathematics, and independent exhaustive *mini-deck* physical hand/Prize enumeration. **No new full game, native source-dealt match, or win rate.**

## Why this extends the existing bound

The earlier [Agent 34 source-guarded impossibility proof](rank26-firstturn-hard-crisis-barriers.md) establishes event **A** (singleton Double Colorless Energy **D** and singleton Redeemable Ticket **T** both initially Prized) and event **B** (singleton **Meloetta M** is the only Basic in the initial seven while singleton **Escape Rope R** and **T** are Prized). The properly de-duplicated `A ∪ B` occupies **0.891078103106%** of accepted Basic-valid starting-seven / six-Prize partitions and prevents the specific first-player **Technical Machine: Crisis Punch** attack on turn one. This is not the probability of losing the game.

The same [registered rank26 source](full-decklists.json) has exactly **two physical Basic Lightning Energy cards L1 and L2** in addition to **one DCE**: there are no other Energy cards. **Redeemable Ticket is its only route to redealing non-Basic initial Prizes.** Ordinary turn-one play can attach only one Energy card from hand. The deck's [Tapu Koko Prism Star](https://www.pokemon-card.com/card-search/details.php/card/35413) could add a basic Lightning from the discard to Benched Meloetta. The [official Japanese FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AB%E3%83%97%E3%83%BB%E3%82%B3%E3%82%B1%E3%82%B3%E2%97%87&regulation_faq_main_item1=all) explicitly rules that **Dance of the Ancients cannot be used with zero Lightning Energy in discard**. It also explains the one-recipient self-Bench case; the contemporaneous 2019 TPCi Team Up FAQ as transcribed by [PokéBeach](https://www.pokebeach.com/forums/threads/team-up-rulings.149390/) confirms *one* Lightning Energy in discard can still be attached, so **a single Prized Lightning is insufficient for the new hard barrier**.

Define a new event:

**C: T, L1 and L2 all lie in the original six Prizes.** Ticket cannot be played because it is Prized. Hisuian Heavy Ball can recover only a Basic Pokémon and cannot remove these three non-Basic resources. No unprized Lightning Energy exists for Koko's acceleration. Even if the pilot has the entire remaining deck available, the sole DCE can supply at most **two** of Crisis Punch's **three** Colorless Energy; the single manual attachment cannot obtain the third. Thus C is a *strictly sufficient* first-turn impossibility subset, without assumptions about bot decisions, discard availability, the opponent's board, or other setup cards.

**Scope:** This is the specific first-turn Crisis Punch line with source rank26 acting first before the opponent's turn. It does not prove a later attack is blocked, a game loss, or any relative effectiveness of a fixed challenger against the rank26 deck. Further natural-source setup blockers remain uncounted.

## Exact joint physical hand/Prize event counts

Let `N=60`, `B=12` eligible initial Basics (including distinguished M), `h=7`, `p=6`, `V=C(60,7)-C(48,7)`, and `Z=V*C(53,6)=7,175,999,693,903,040`. Each hand contains a Basic; each subsequent unordered set of six Prizes has equal probability conditional on that hand. The distinct copies L1 and L2 are **physically labeled** for counting, despite their identical card names.

Reusing `A,B,A∩B` from [Agent34's exact calculator](../../scripts/aichi-rank26-crisis-barriers.cjs):

- `C = [C(57,7)-C(45,7)] * C(50,3)`.
- `A∩C = [C(56,7)-C(44,7)] * C(49,2)`.
- `B∩C = C(44,6) * C(49,2)`.
- `A∩B∩C = C(43,6) * C(48,1)`.
- `P(A∪B∪C) = (A+B+C−AB−AC−BC+ABC)/Z`. The **newly blocked disjoint part** is `C−AC−BC+ABC`.

| Event | Physical favorable hand/Prize partitions | Percentage of Basic-valid opening seven |
| --- | ---: | ---: |
| A: D,T Prized (prior) | 61,762,637,059,200 | 0.860683384807% |
| B: M sole opening Basic, R,T Prized (prior) | 2,340,768,068,100 | 0.032619400334% |
| **C: T,L1,L2 Prized (new)** | **4,292,521,833,600** | **0.059817753856%** |
| A∩B | 159,643,176,000 | 0.002224682035% |
| A∩C | 227,669,874,432 | 0.003172657248% |
| B∩C | 8,301,445,152 | 0.000115683466% |
| A∩B∩C | 292,629,792 | 0.000004077896% |
| Earlier A∪B | 63,943,761,951,300 | 0.891078103106% |
| **Additional disjoint new blocked openings C∖(A∪B)** | **4,056,843,143,808** | **0.056533491038%** |
| **New union A∪B∪C** | **68,000,605,095,108** | **0.947611594143%** |

**Consequent upper bound:** the specific turn-one Crisis Punch is structurally possible in **at most 99.052388405857%** of Basic-valid source openings, even under otherwise ideal decisions and access. The proof counts *only three* necessary-resource impossibility events and does not assert that any of the other 99.052388% openings actually convert into an attack, much less win a game.

## Reproducibility

- New [`scripts/aichi-rank26-energy-ticket-collapse.cjs`](../../scripts/aichi-rank26-energy-ticket-collapse.cjs) calls existing source-printing / inventory guard `sourceRank26Barriers(root)`, shares its BigInt `choose` and original two-event numerator, adds C, AC, BC and ABC, and emits exact decimal counts plus probability.
- New [`tests/aichi-rank26-energy-ticket-collapse.test.cjs`](../../tests/aichi-rank26-energy-ticket-collapse.test.cjs) **independently enumerates all physical Mini-deck hands and all Prize subsets** under three distinct small-deck configurations, including individual L1 and L2 identifiers. It matches *all seven intersection counts*, old/new union and disjoint increment, checks exact source-60 values and rejects invalid parameter ranges.
- All **three test callbacks passed** in the local V8 code-execution harness, including the source-inventory stub loaded from the actual checked GitHub manifest; no compiled-engine claim is inferred from this local pure-test pass. The regression was added to the existing **manual-only** [Aichi Redeemable Ticket CI](../../.github/workflows/aichi-redeemable-ticket.yml), without per-commit CI. The pinned Twinleaf **compiled manual [CI 39539867772](https://github.com/FlareZ123/experiment-01/actions/runs/39539867772) PASSED**, head `a8b559f173faf8b255efc34299100d5e862509c0`, including the three newly introduced rank26 exact-combinatorics regressions and existing Ticket native Store suite. Compiling the engine does not turn these physical-deal barrier calculations into attack conversions or competitive games.

## Integration implication

If a simulation reports a first-player rank26 Crisis Punch despite T and both Lightning Energy physically occupying original Prizes, **the printed source Resource conservation is wrong or the game state was altered by an unrecorded permitted effect**. Preserve the all-failure opening denominator when testing source strategies. Do not convert this ~0.95% *early attack impossibility* lower bound into a loss-rate or tournament matchup estimator, and do not discount a sophisticated opponent's broader paths to win. The full-field benchmark remains 29/32 exact opposing 60s, no qualified wins and no validated fixed nominee.
