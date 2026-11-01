# Agent 45: source Iron Thorns ex Volt Cyclone Bench state and next-turn attack tempo

**1 November 2026 | independent postgame study of frozen original rank-6 development data. Zero competitive-qualified games.**

## Why this matters

The actual printed **Iron Thorns ex TWM77 Volt Cyclone** attack does 140 damage and then moves an Energy from itself to one of its Benched Pokémon. A solo Iron Thorns has no eligible recipient and retains the Energy as the attack damage resolves. An Iron Thorns with a Bench must move an attached Energy when the effect can be applied. This creates a structural tradeoff: a backup Pokémon provides survival insurance and a genuine Energy recipient, but may drain the Active attacker's Energy before the following turn.

Agent14 previously introduced a conservative owner-visible proposed **solo-Energy-retention Bench choice** in [existing source policy](../../simulation/twinleaf/agent14-thorns-solo-energy-retention.cjs) and [two-option choice contract](../../simulation/twinleaf/agent14-owner-solo-bench-choice-contract.cjs). Neither module certifies that soloing wins more real games. The following archival data supply an independent real-source temporal witness for this exact tradeoff.

## Frozen original native evidence

Input: [Agent41 immutable v2 original rank6/rank11 native archive](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md), run [41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), artifact 13072623187, ZIP SHA256 cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b. The original rank6 source is the exact published four-Iron-Thorns 60; both source and opponent used the same frozen unqualified policy. No new decks, policy interventions, physical deals or new game outcomes were generated here.

The complete source-attack record contains **50 settled native Volt Cyclone declarations across 13 of 16 rank6 developmental games**. Public board before each source attack and initiating native root are in the sourceAttackSettlement trace. The complete rootActionLedger records every successfully Store-dispatched action, including actual AttackAction and PassTurnAction. In these rank6 source games the next normal source turn occurs at global turn t+2, verified by the genuine source end-of-turn actions and absence of a later source owner turn in the eight censored cases.

**Conditional effect accounting across all 50:** 27 source attacks began with at least one own Benched Pokémon and have a same-root settled, Store-accepted Energy movement of exactly one named card to own Bench. The other 23 began with an empty source Bench and emitted no Energy movement prompt. None is unclassified by this bounded effect-shape audit.

## Direct subsequent-turn outcomes, not a win-rate comparison

| Source board immediately before a settled Volt Cyclone | Source attacks | Next source turn observed | Next turn attacked | Next turn passed | Next source turn unavailable / right censored |
| --- | ---: | ---: | ---: | ---: | ---: |
| **No Benched Pokémon** | 23 | 20 | **20** | **0** | 3 |
| **One or more Benched Pokémon** | 27 | 22 | **4** | **18** | 5 |
| **Total** | **50** | **42** | **24** | **18** | **8** |

Among the **20** observed solo follow-up turns, the source attacked again **without playing an Energy card from hand during that next turn**. Of the **22** observed Benched-source follow-up turns, **six** played an Energy card from hand: three subsequently attacked, three Passed. An additional Benched-source follow-up attacked without a hand attachment. These are actual Store-accepted root-action results, including cases where an Energy attachment did not restore immediate attacking.

No effect of optional Bench placement was randomized. The 50 attacks are **repeated, correlated events across only 13 physical games**, often on boards that remained solo or Benched for many turns. Source hand quality, opponent disruption, surviving attacking Pokémon, game progress and player policy could explain some of the contrast. The 20/20 and 4/22 fractions are **observed continuation frequencies conditional on an available next source turn**, without confidence intervals, causal attribution, opponent competence or match-win inference.

The v1 baseline had only one rank6 Volt Cyclone, a zero-Bench attack, and a subsequent source turn without another attack. This demonstrates that solo Energy retention alone does not guarantee a follow-up attack across all source policies and deals.

## Reproduction and use in shared policy

The [pure offline census](../../simulation/evaluation/agent45-frozen-prompt-coverage.cjs) reports the complete 50-attack conditional effect coverage and next source turn classifications. Its [nine native-shape/temporal Node tests](../../tests/agent45-frozen-prompt-coverage.test.cjs) passed locally. Code and tests are research-owned; the pinned Twinleaf submodule and Agent41's frozen policy profiles remain unchanged.

The mechanical rule motivates a **same-owner-information-set choice** between optional Bench development and retaining the attacker's Energy. Agent14's existing two-option choice contract may be a starting point. Any proposed strategy should account for actual opponent visible lethal reply and sole-Active knockout risk, actual source-held Energy follow-up, optional Thunder Mountain, Board/Tool locks, Bench-space costs and the attack's energy obligation. It must then be assessed with a genuinely prospective same-frozen-policy both-player comparison, retaining every error, action cap and loss.

This result is an observed policy competence failure mode and a target for an executable adversarial choice, **not evidence that a specific fixed candidate 60 gains win probability**. Do not count these 50 actions as independent wins, and do not promote any engine terminals to qualified competition outcomes.

**Benchmark status:** 32 opponent archetypes identified; 29/32 exact opposing original lists authenticated; zero competitively qualified games; no fixed 60 proved to win 99.5%.
