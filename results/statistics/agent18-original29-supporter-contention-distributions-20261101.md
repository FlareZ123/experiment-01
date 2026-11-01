# Agent 18: distinct-name Supporter contention in the original Aichi 29

**1 November 2026 | exact source-card combinatorics | zero games.**

## Question

The canonical bilateral actor currently has major Supporter root-action coverage gaps. The authenticated original Aichi 2026 field includes decks with many printed Supporters, and one Supporter can ordinarily be played per turn. How often does a fresh, **Basic-valid** owner opener naturally contain two or more different printed Supporter names by the first ordinary draw? This establishes a *physical choice-supply denominator*. It cannot tell whether either name has legal targets, should be played, is locked, or dominates an attack/Item/Energy line.

The previous [original-29 first-eight held calculator](agent18-original29-valid-basic-opening-supporter-priors-20261101.md) gave an any-Supporter probability; the [coupled-mulligan supplement](agent18-coupled-mulligan-supporter-supply-20261101.md) allows optional extra draw. This independent extension keeps the **no-bonus 7+1** model to separate simultaneous card multiplicity and **distinct-name alternative Supporters**.

## Exact distribution

Let `N=60`, `h=7`, `b` equal original Basic Pokémon copies, `s` equal original Supporter copies; each card printing is distinguishable. We condition on opening seven containing a Basic and marginalize over six uniformly hidden Prizes before the ordinary turn draw. The exact integer denominator is

```text
D = [C(N,h) - C(N-b,h)] * (N-h)
```

For `j` Supporter copies among the original seven, the number of Basic-valid opening hands is

```text
A(j) = C(s,j) * [C(N-s,h-j) - C(N-s-b,h-j)]
```

The probability numerator for exactly `k` held Supporter copies in the first eight is

```text
A(k) * (N-h-s+k) + A(k-1) * (s-k+1)
```

where out-of-range `A(j)=0`. This counts two mutually exclusive outcomes: `k` already in the opening and the next draw is another type, or `k-1` opening Supporters and the next draw is a Supporter.

For **different names**, aggregate any duplicate print variants by printed name. Let original Supporter distinct-name multiplicities be `c_1,…,c_m`, total `s`, and define

```text
q(e) = [C(N-e,h)-C(N-e-b,h)] * (N-h-e) / D
P(>=2 distinct Supporter names in first eight) =
   1 - sum_i q(s-c_i) + (m-1)*q(s).
```

This follows by subtracting the disjoint cases where all held Supporters belong to only one name, including zero Supporters exactly once. All core numerators and denominators use BigInt; decimals are display conveniences.

## Complete published Top32 source results

All probabilities conditional on a Basic-valid opening seven, with **one** normal turn draw and **zero** optional opponent-mulligan draws. The table counts physical card copies in hand, even if a later player discards them or a first-turn Supporter is restricted.

| Finish rank | Original archetype | Basic copies | Supporter copies | Unique Supporter names | ≥2 Supporter copies | ≥2 **different names** |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 14 | 9 | 8 | 32.27% | 31.59% |
| 2 | Vileplume Control | 14 | 15 | 11 | 62.57% | 60.12% |
| 3 | Snorlax Stall | 11 | 21 | 12 | 82.71% | 80.45% |
| 4 | Raichu Electrode Combo | 13 | 4 | 4 | 7.46% | 7.46% |
| 5 | Mew Genesect | 11 | 7 | 5 | 21.04% | 19.38% |
| 6 | Iron Thorns | 4 | 21 | 13 | **80.50%** | **78.65%** |
| 7 | Snorlax Stall | 12 | 21 | 13 | 82.95% | 81.35% |
| 8 | Absol Garbodor | 10 | 8 | 8 | 26.05% | 26.05% |
| 9 | Absol Electrode | 11 | 5 | 3 | 11.43% | 9.37% |
| 10 | Regidrago | 15 | 11 | 9 | 43.28% | 42.21% |
| 11 | Absol Garbodor | 11 | 8 | 3 | **26.26%** | **20.87%** |
| 12 | Regidrago | 15 | 9 | 6 | 32.47% | 30.43% |
| 13 | Regidrago | 11 | 10 | 7 | 36.95% | 34.50% |
| 14 | Regidrago | 14 | 9 | 7 | 32.27% | 30.91% |
| 15 | Lopunny Vileplume | 14 | 8 | 4 | 26.85% | 22.97% |
| 16 | Absol Garbodor | 11 | 7 | 6 | 21.04% | 20.21% |
| 17 | Raichu Electrode Combo | 13 | 4 | 2 | 7.46% | 3.86% |
| 18 | Regidrago | 16 | 8 | 5 | 27.20% | 24.04% |
| 19 | Raging Bolt | 16 | 9 | 6 | 32.66% | 29.85% |
| 20 | Regidrago | 14 | 10 | 8 | 37.69% | 36.49% |
| 21 | Regidrago | 14 | 10 | 7 | 37.69% | 35.88% |
| 22 | Absol Garbodor | 12 | 8 | 7 | 26.47% | 25.72% |
| 24 | Iron Thorns | 4 | 24 | 15 | **87.60%** | **86.43%** |
| 26 | Meloetta Donk | 12 | 2 | 2 | **1.40%** | **1.40%** |
| 27 | Regidrago | 15 | 9 | 7 | 32.47% | 31.11% |
| 29 | Iron Thorns | 4 | 21 | 13 | **80.50%** | **78.65%** |
| 30 | Lillie's Clefairy | 16 | 5 | 3 | 11.90% | 8.59% |
| 31 | Dusknoir Chimecho | 15 | 4 | **1 (Roxie)** | 7.58% | **0.00%** |
| 32 | Regidrago | 13 | 10 | 9 | 37.46% | 36.86% |

**Missing exact original 60s, ranks 23, 25 and 28, have no values.**

## Why counting different names matters

- The three four-Basic Iron Thorns originals (6, 24, 29) contain **13, 15 and 13 distinct Supporter names** respectively. In authentic random openings, 78.65%, 86.43% and 78.65% already have at least two different Supporter cards physically held by the first normal draw. Their common tactic requires cost-aware choice among denial, search, recovery and gust, under one Supporter per turn. It would be incorrect to interpret any of those percentages as *two legal Supporter actions* on the first player's first turn.
- Rank 11 Absol/Garbodor runs eight Supporters but just three names: **Carmine 3, Marnie 3 and Guzma 2**. Its opening prior is 26.26% for at least two copies, versus **20.87% for two distinct names**. This distinguishes genuine different printed modes from redundant copies and illustrates the importance of named root-action coverage.
- Rank 31 Dusknoir/Chimecho carries four Roxie and no other Supporter name: its ≥2-copy chance is 7.58%, but its **different-name Supporter contention is identically zero**. Roxie's correct eligible card-discard and draw effect remains a nontrivial *single-Supporter* decision; the current native paper-prompt flaws cannot be excused or inferred from this static zero.

## Practical constraint and next check

Different-name holding is a **necessary supply condition** for actual same-root Supporter-versus-Supporter contention; physical holding is not sufficient to establish both Supporters are currently legal or useful. Opponent mulligan compensation can increase co-holding, while Prize recovery, first-player exceptions, Item lock, Bench geometry and hand-preservation DCI can change live decision value. Raw seven-plus-one copies are unsuitable for benchmarking final game strength.

The next native audit should select a fresh original source game by preregistered physical seed and record the real owner-visible first turn hand, actual rule timing, both eligible effects and targets, actor nominations, **Store acceptance**, physical payment/effect, and opposing reply. The 22:42 Critic [action-chain release gate](../../communications/broadcast/20261101T2242Z_critic_end_to_end_action_fidelity_gate.md) remains authoritative as a research priority, especially the source-first root-vs-prompt separation. Avoid creating a redundant CI workflow or treating this mathematical card-location result as an engine policy evaluation.

## Reproduction

- [BigInt exact 0..8 multiplicity and distinct-name calculator](../../scripts/agent18-original29-supporter-count-contention.cjs), using original printed sixty plus existing stage/classification.
- [Unit test](../../tests/agent18-original29-supporter-count-contention.test.cjs): exact independent nine-card toy split (50/147 zero Supporters, 80/147 one, 17/147 two), distinct-name versus single-name, original rank11 / rank6 / rank24 BigInt fractions, family probability consistency.
- A separate JavaScript arithmetic calculation generated all 29 rows directly from the authenticated live GitHub source roster; an independent Python `fractions.Fraction` calculation verified selected rank-group exact fractions and the count-versus-distinct-name separation. GitHub scripts and tests are committed; no GitHub Actions compiled run for the newly committed distribution script has been confirmed.

**Evidence:** mathematics and original printed-card inventory, no match simulations, 29/32 original sixties, **zero competitively qualified games**, unverified 99.5% fixed deck.
