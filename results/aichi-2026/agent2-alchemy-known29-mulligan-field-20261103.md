# Agent 2: all 29 authenticated Aichi originals show the opening Quick Ball deficit beyond the four-Basic Iron Thorns cohort

**3 November 2026 | 320,000 paired, seeded resource-only Monte Carlo openings across eight original-source Basic-count strata. No games, no competitive wins, no selected fixed 60.**

## Question and source provenance

The [rank6 four-Basic source mulligan experiment](agent2-alchemy-rank6-mulligan-opportunities-20261103.md) established that an Apex Alchemy owner can receive many extra starting cards against **Iron Thorns ex-only original sources**. However, only three of the authenticated original Top32 lists have four Basics. Does the single-card Apex Alchemy variant **Boost Shake 3→4, Quick Ball 3→2** still lose early optional lock access when opponent mulligans are averaged across all 29 authenticated ranks?

The source-strata table below is the independently published Basic-stage census from [Agent18's original29 source Supporter-prior work](../statistics/agent18-original29-valid-basic-opening-supporter-priors-20261101.md), joined to the [29 authenticated original printed sixties](full-decklists.json). The code rejects changed ranks and invalid source deck totals, and uses no guessed source card inventories for missing ranks **23, 25, 28**.

The two immutable candidate 60s remain [Agent43 Apex Alchemy v0](agent43-apex-alchemy-paper-expanded-v0.json), 3 Shake/3 Quick Ball, versus [Agent2 v1](agent2-apex-alchemy-shake4-quick2-v1.json), 4 Shake/2 Quick Ball. All other cards and print identities are unchanged.

## Field-level opening result, weighted equally across known original source ranks

| Idealized resource event | v0 | v1 | Difference (v1 minus v0) |
| --- | ---: | ---: | ---: |
| Muk/Shake plus independently accessible Regidrago V | 15.8011% | 18.0397% | **+2.2385 pp** |
| Budew plus independently accessible Regidrago V | 33.4890% | 26.6943% | **−6.7947 pp** |
| **Either early lock plus Regidrago V** | **41.5883%** | **37.4684%** | **−4.1198 pp** |
| Opening-seven Budew Active plus Regidrago V | 11.4539% | 10.9464% | −0.5075 pp |

For the emphasized **either lock + Regidrago** outcome, the weighted paired-difference 95% Monte Carlo interval is **[−4.2020, −4.0376] percentage points**. This is a sampling interval for the stated mathematical resource predicate and fixed sampling design. It cannot establish the real-game advantage of either 60.

### All eight source Basic-count strata

Each distinct Basic count uses **40,000 paired candidate openings**, both candidate 60s sharing the same shuffled physical positions and source bonus count. The number of source ranks in that stratum supplies its equal-rank field weight. These samples are repeated virtual initial setups, **not 320,000 matches**.

| Source Basics | Authentic ranks | Candidate bonus-offer probability | v0: either+Regidrago | v1: either+Regidrago |
| ---: | ---: | ---: | ---: | ---: |
| 4 | 3 | 54.89% | 47.60% | 43.47% |
| 10 | 1 | 22.02% | 41.40% | 37.64% |
| 11 | 6 | 18.80% | 41.65% | 37.49% |
| 12 | 3 | 16.01% | 40.96% | 37.02% |
| 13 | 3 | 13.60% | 40.96% | 36.73% |
| 14 | 6 | 11.52% | 40.61% | 36.50% |
| 15 | 4 | 9.73% | 40.26% | 35.94% |
| 16 | 3 | 8.19% | 40.51% | 36.56% |

Observed differences remain negative in **all eight Basic-count strata**, ranging approximately **−3.76 to −4.32 percentage points**. The four-Basic source pattern materially raises the *absolute* access rates but does not explain the negative *difference* between the two candidate 60s. The equal-rank mean bonus-offer probability of **17.9622%** is far below the three Iron Thorns opponents' **54.8851%**.

## Reproduction and methodological guards

- [Research runner](../../simulation/evaluation/agent2-alchemy-known29-mulligan-field.py), using the separately committed [source-conditioned paired evaluator](../../simulation/evaluation/agent2-alchemy-rank6-mulligan-opportunities.py); requires NumPy, reads both registered candidate manifests and all 29 source inventories. Base RNG seed **20261103**, plus the Basic count per stratum. 40,000 cases per stratum, **320,000 paired setups total**.
- [Machine-readable weighted summary and stratum counts](agent2-alchemy-known29-mulligan-field-320k-summary.json). The runner prints all eight detailed per-stratum results including paired opposite-only counts, allowing independent reproduction of the weighted sampling variance.
- Both candidate lists have 12 Basics, so the initial-seven validity requirement is common. Each source Basic-count-specific opponent mulligan race is calculated from exact finite-population binomial combinations and conditional independent redrawing of Basic-invalid opening sevens. The hypothetical candidate always draws **all offered optional bonuses**. Each trial places six Prizes and ordinary first-turn draw after setup in random physical positions.
- The event requires a Muk/Shake or Budew line **plus Regidrago V**, using independent held Mysterious Treasure/Quick Ball connectors where needed, preserving the initial Active geometry constraint. It does not assert the owner can pay a discard or actually perform the attacks.
- Strata are independently sampled, and the weighted 95% paired interval is formed from the observed within-stratum discordant pair variance with weights `authenticRanksInStratum/29`. These statistical uncertainties exclude game-rule/model error. The source roster is a census, so the interval does not represent unknown variation from ranks 23/25/28.

## Decision and remaining vetoes

The Quick Ball removal in v1 is a robust loss **on the particular broad either-lock-plus-attacker opening resource metric**, over the known source distributions rather than only all-Thorns. The same swap raises Muk+Regidrago access, and Muk may be strategically more valuable than Budew against many opponent archetypes. Thus the resource metric **cannot rank real-game deck strength**. Actual Item discard payment, legal first/second turn action windows, Bench costs, Active mobility, Regidrago VSTAR evolution and Double Dragon Energy funding, Ability/Item lock interference, correct opponent decisions, later follow-through, Prize outcomes and official paper match clock are all unmodeled.

The next genuinely discriminating experiment remains preregistered **paid first-turn resource-and-lock execution** on original-source physical deals, with the stronger integrated two-seat policy currently stewarded outside Agent2. The research status remains **29/32 original 60s authenticated, zero competitively qualified games, no selected best fixed 60, no demonstrated 99.5% field win rate**.
