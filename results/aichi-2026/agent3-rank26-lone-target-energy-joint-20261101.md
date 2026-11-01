# Rank26 first-player direct Energy root and opponent's lone Basic

**Agent 3, 1 November 2026.** Exact coupled physical-card event, independent shuffle simulation. No attacking, games or win rates.

## Why the opponent's setup matters

The [first-root source calculation](agent3-rank26-direct-root-lightning-dce-20261101.md) requires the exact registered rank26 Meloetta list to hold its single Double Colorless Energy (DCE) after its first ordinary draw while **both Basic Lightning remain in deck**. The six disjoint Unown/Bunnelby plus Pump/Dowsing witness branches also require their other named cards to survive six Prizes. The [coupled-mulligan extension](agent3-rank26-coupled-setup-mulligan-bonus-20261101.md) gives the probability under alternative choices of optional opponent-mulligan bonus draws.

We now intersect that narrow source event with the **defending opponent having exactly one Basic in its setup hand including all optional source-mulligan bonus draws**. If the opponent benches every additional Basic and has no unusual setup effect, this is a forced lone-Active opening before rank26's first turn.

## Exact coupled calculation

Condition on rank26 eventually drawing a Basic-valid seven, both decks completing setup under the supplied rule that **both redraw if both failed**, and rank26 being the first player. Assume the defending opponent accepts all its available bonus draws; compare three rank26 bonus policies.

Let `s=1-C(48,7)/C(60,7)`, `o=1-C(60-b,7)/C(60,7)` for opponent Basic count `b`, and `D=1-(1-s)(1-o)`. Completed setup partitions into both opening hands valid, source valid/opponent invalid, and source invalid/opponent valid. The one-Basic probability in any Basic-valid opponent seven is `b*C(60-b,6)/(C(60,7)-C(60-b,7))`. When the source instead mulligans `n` times, the already-valid opponent must avoid drawing any of its `b-1` remaining Basics across those bonus draws; probability `C(54-b,n)/C(53,n)`. The source's own DCE/Lightning event is conditioned on the actual bonuses awarded by opponent mulligans. The three nonoverlapping terminal setup cases are summed; the omitted more-than-46-mulligan tail is bounded.

| Opponent Basic count | Representative deck | Source declines all bonuses | Source takes all | Source declines only when DCE initially held |
| ---: | --- | ---: | ---: | ---: |
| 4 | Original Iron Thorns ranks 6, 24, 29 | 2.333591% | 2.571266% | **2.688031%** |
| 14 | Original champion Shadow Rider rank 1 | 1.046036% | 1.058873% | **1.064360%** |
| 17 | Hypothetical 17-Basic list, matching New Moon v1's count | 0.765916% | 0.771299% | **0.773584%** |

This is a **narrow card-location and setup-intersection probability**. It neither proves the source can pay for its actions nor estimates first-turn knockouts. The source has alternative ways to discard hand Lightning and acquire DCE. The defending player can use cards or setup mechanics outside this Basic-only screen. Rank6 additionally suppresses Meloetta's Rule Box Ability without a proper unlock.

## Independent physical cross-check

I independently shuffled two genuine 60-position decks, redrew under simultaneous mulligans, placed six Prizes, then applied the stated owner bonus-draw choices and checked the six source witness branches. **180,000** setups per opponent Basic count, NumPy `default_rng(20261101+b)`, yielded **4,746** qualifying events for four Basics (**2.636667%**), **1,896** for fourteen (**1.053333%**) and **1,361** for seventeen (**0.756111%**). All three agree with the exact figures to within ordinary 95% binomial sampling uncertainty. The simulation does not execute card actions.

Reproduce using [the joint source-aware enumerator](../../scripts/agent3-rank26-coupled-lone-basic-root.cjs) and its [deterministic tests](../../tests/agent3-rank26-coupled-lone-basic-root.test.cjs), reusing the previously independently tested [Agent27 coupled setup helper](../../scripts/agent27-rank26-mulligan-ticket-access.cjs). These latest Node assertions have not been executed in CI; the earlier direct-root and bonus-draw suites passed [CI 41329137800](https://github.com/FlareZ123/experiment-01/actions/runs/41329137800).

The next required evidence is genuine source-dealt first turns under a paper-correct bilateral policy, with source card access, opponent Bench, AttackAction and downstream opponent replies recorded. Benchmark status: **29/32** exact opponent sixties; **0** competitively qualified games.
