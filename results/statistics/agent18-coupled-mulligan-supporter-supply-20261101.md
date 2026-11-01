# Agent 18: first-turn Supporter possession after the *opponent's* mulligans

**1 November 2026 | mathematical opening-hand model + independent 200,000-trial setup simulation, zero game trials.**

## Why this changes the rank-11 policy baseline

The 29 exact original Aichi 2026 source sixties contain varied numbers of Basic Pokémon. Ranks **6, 24, 29** each contain just **four Iron Thorns ex**, making them prone to opening mulligans. A valid opener facing any of those sixties may be offered extra draws before the first ordinary draw. These draws change the physical Supporter supply available for a later policy decision. The corresponding action itself may be prohibited by the first-turn Supporter rule, card text, locks, targets or the one-Supporter quota.

The existing [exact 29-source unbonused opening census](agent18-original29-valid-basic-opening-supporter-priors-20261101.md) counts the physical *first eight* cards after a Basic-valid seven without taking any optional opponent-mulligan bonus cards. This extension examines one explicit counterfactual owner choice: **accept every opponent-mulligan bonus draw possible while preserving one ordinary first-turn draw**. Actual owner choices may differ. It does not use hidden opponent cards to make a decision.

| Own unchanged original 60 | Opponent Basic count | No bonus accepted | All available bonuses accepted | Change |
| --- | ---: | ---: | ---: | ---: |
| Rank 11 Absol/Garbodor, 11 Basics and 8 Supporters | 4 (ranks 6/24/29) | 68.53139% | **73.92485%** | **+5.39346 percentage points** |
| Rank 11 same 60 | 14 (rank 1) | 68.53139% | **69.14278%** | +0.61139 pp |
| Rank 1 Shadow Rider, 14 Basics and 9 Supporters | 4 | 73.67819% | **78.86396%** | +5.18578 pp |
| Rank 6 Iron Thorns, 4 Basics and 21 Supporters | 14 | 96.61253% | **96.70274%** | +0.09021 pp |

For rank 11 facing four Basics, the probability of being **offered at least one** bonus card is **53.89162%**, and expected bonus *offers* are **1.348978 cards** per completed simultaneous setup. Against a 14-Basic opponent, those become **11.11928%** and **0.129082 cards**. The distinction between offers and cards actually accepted is essential.

## Two-player mulligan race

Let `p` be the chance that the owner has at least one Basic in a fresh seven; `o` is the opponent's analogous chance. Every first-round outcome where both fail rerolls both hands and gives neither a bonus. Set `q=1-o` and `d=1-(1-p)(1-o)`. Condition on arriving at a completed Basic-valid setup. The number `M` of opponent mulligans eligible for owner bonus draws follows

```text
Pr(M=0) = o/d
Pr(M=m) = p*o*q^m/d, for integer m >= 1
Pr(M>=t) = p*q^t/d, for t >= 1
```

The owner's final valid opening seven is exchangeable and independent of the opponent's mulligan count under independent uniform shuffles. With `b` own Basics and `s` own Supporter copies:

```text
A = [C(60-s,7)-C(60-s-b,7)] /
    [C(60,7)-C(60-b,7)]

R(k) = C(53-s,k) / C(53,k)

Pr(no held Supporter after k draws | valid seven) = A * R(k)
```

After six random Prizes, the deck has 47 cards. For an opponent offering `M=m` optional bonuses, this explicit policy draws `k=min(1+m,47)` cards including the ordinary first-turn draw. When `m>46`, the owner declines offers beyond 46 so that an ordinary draw is still possible. Sum the exact race probabilities over `M=0,…,46` and the `M>=47` tail. For rank 11 against four Basics the latter tail probability is only **3.49247×10⁻¹¹**, and the implementation includes it rather than silently dropping it. All binomial coefficients have exact BigInt evaluation before conversion for floating-point mixture weights.

## Independent validation

- New [coupled-model script](../../scripts/agent18-coupled-mulligan-supporter-supply.cjs) exposes the two-player analytical evaluator plus a full **29-source × two opponent Basic-count** matrix (14-Basic rank-1 reference and a hypothetical four-Basic opponent). It uses the existing fail-closed original printings classifier, preserving missing ranks 23/25/28.
- New [three Node tests](../../tests/agent18-coupled-mulligan-supporter-supply.test.cjs) cover exact rational toy-deck checks with `N=9, seven -> three cards, two Prizes` and independent reference fractions `13519/17199`, `128803/179928`, `50713/91584`; rank 11 and rank 6 numerical outputs; zero Supporters; a never-mulliganing opponent; and invalid input.
- The exact source was written atomically and locally tested in Node: **3/3 tests pass**, `node --check` passes. A separately written Python `fractions.Fraction` implementation reproduced the reported calculations.
- A **separate full-shuffle 200,000-trial setup simulation** (seed `180120261101`) explicitly re-dealt both hands when both players lacked a Basic, re-dealt only the failing player when one was valid, dealt real six-card hidden Prizes, and drew optional bonus cards and the ordinary card from the source's randomly shuffled remaining deck. Rank 11 (11 Basics, eight Supporters) versus four-Basic opponent: **68.4255%** holding without bonus, **73.9095%** with maximal safe bonus and **53.9545%** offered at least one extra card. These independent empirical proportions are consistent with the exact predictions 68.53139%, 73.92485%, and 53.89162% at 200,000 random trials. The simulation was a mathematical sampling check, not a Pokémon match.
- The newly committed source and tests have **not yet been exercised in GitHub Actions**; a bounded manual native CI dispatch was blocked by the host and was not retried or rerouted.


## Supplement: bonus draws affect *distinct-name* Supporter contention

The [exact first-eight different-name analysis](agent18-original29-supporter-contention-distributions-20261101.md) gives 20.871716% for rank11's three Supporter names (3 Carmine, 3 Marnie, 2 Guzma) with bonus offers declined. The same two-player mulligan model can analytically extend that to maximum-safe bonus acceptance, using inclusion-exclusion and the existing family-held evaluator without new deck assumptions.

Let `H_b,o(e)` be the coupled-model probability of holding **any** cards from an arbitrary `e`-copy non-Basic family, after maximal safe bonus acceptance facing opponent Basic count `o`; let disjoint Supporter names have counts `c_i`, total `S`, and `m` names. Then

```text
P(>=2 different Supporter names after bonus draws) =
   sum_i H_b,o(S - c_i) - (m - 1)*H_b,o(S).
```

This is exact inclusion-exclusion on physical holding, because the no-bonus probabilities and bonus-draw mixture both preserve the probability of excluding any named group. Evaluated independently in Python using `fractions.Fraction` for the entire mulligan distribution:

| Unchanged original 60 | No bonuses | Maximum-safe bonuses vs 4-Basic opponent | Maximum-safe bonuses vs rank1 14-Basic opponent |
| --- | ---: | ---: | ---: |
| Rank11 Absol/Garbodor | **20.87%** | **27.36%** | **21.49%** |
| Rank6 Iron Thorns | **78.65%** | **82.91%** | **79.08%** |
| Rank24 Iron Thorns | **86.43%** | **89.49%** | **86.76%** |

For rank11 specifically, hypothetical acceptance of opponent four-Basic mulligan bonuses raises the *different-name* co-holding probability by about **6.49 percentage points** before any root action. This creates additional **possible alternative named Supporters**, while their actual simultaneous play remains limited to one and can be disallowed by timing, targets or locks. No native policy decision, opponent response, match outcome or 99.5% inference follows from this supply calculation. A separate **120,000-deal coupled two-player simulation**, `random.Random(seed=180120262311)`, rerolled both-invalid seven-card openers, generated opponent mulligan bonus offers, dealt six hidden Prizes, and checked physical different-name Supporters after declining all versus accepting every safe bonus. Rank11 versus four-Basic opponent observed **20.8558%** without bonuses (exact 20.8717%) and **27.5350%** with bonuses (exact 27.3589%); both agree within about 1.4 binomial standard errors. This is setup-card sampling, **not a Pokémon match**.

## Decision-policy implications

A shared two-seat opponent policy should retain actual accepted bonus-draw counts and first-own-turn held Supporter printings; an opening supply estimate is insufficient as a legal action percentage. For a paper-rules owner-actor decision, distinguish first-player Carmine's printed exception, any other card-specific timing exception, evolving boards, native card/prompt legality, Supporter quota, and preserved cards' opportunity costs. Compare actual original-source first-turn traces across independently precommitted physical deals to these access priors before assigning blame to card scarcity.

Source records: [authenticated Aichi originals](../aichi-2026/full-decklists.json), [existing field mulligan setup-census](../aichi-2026/agent31-field-mulligan-source-census-20261030.md), [same-source native rank11 root-policy gap](../aichi-2026/agent43-rank11-held-guzma-supporter-root-bottleneck-20261101.md).

**Evidence classification:** exact source-card combinatorics, independently cross-checked arithmetic and independent synthetic opening-deal simulation. **No card-action/printed-effect settlement, no competitive-qualified games, and no demonstrated win-rate improvement toward the 99.5% fixed deck.**
