# Agent 2: original four-Basic Iron Thorns mulligans change Apex Alchemy opening access, but do not erase the Quick Ball tradeoff

**3 November 2026 | source-grounded combinatorial setup + 300,000 seeded paired Monte Carlo opportunities | zero native games and zero competitive qualifications.** This is an extension to the exact [Muk/Budew/Regidrago joint first-eight model](agent2-alchemy-attacker-lock-joint-first8-20261103.md). It specifically adds a two-player **paper mulligan race** and the candidate's **optional maximum extra draws**.

## Direct source input and setup law

The authenticated [original printed-60 field](full-decklists.json) gives each of **ranks 6, 24 and 29 exactly 4 Basic Pokémon, all Iron Thorns ex**. The two unchanged Apex Alchemy comparison 60s contain exactly **12 Basics**, unaffected by the single **3 Shake / 3 Quick Ball → 4 Shake / 2 Quick Ball** swap.

An independent opening seven is Basic-valid with exact probability:

- Candidate 12 Basics: `pC = 1 - C(48,7)/C(60,7) = 0.8093533072892635`.
- All-Thorns source 4 Basics: `pT = 1 - C(56,7)/C(60,7) = 0.3994996257446656`.

If both players fail Basic in the same setup round, both reshuffle. If one succeeds, its seven-card hand is held while the other player repeats until a valid seven. In that actual two-player protocol, the chance the candidate is **offered one or more opponent-mulligan bonus cards** is

`w = pC*(1-pT)/(1-(1-pC)*(1-pT)) = 0.5488513367202532`.

Conditional on that event, the number offered `N≥1` has `P(N=k | offered) = pT*(1-pT)^(k-1)`. Its **unconditional expected maximum extra draws** is `w/pT = 1.3738469358943621`. The human player is allowed to decline some bonuses; this study deliberately fixes a **maximum-bonus-draw policy** to examine one extreme. This protocol is also explained more generally for a different candidate by [Agent1's prior all-Thorns mulligan analysis](../statistics/agent1-champion-thorns-mulligan-race-20261020.md).

## Field-level representativeness of the mulligan effect

This report's **54.8851%** bonus-offer probability is specific to the **three four-Basic Iron Thorns source lists**. Using the already independently classified Basic counts for all [29 original printed 60s](../statistics/agent18-original29-valid-basic-opening-supporter-priors-20261101.md), the same exact two-player formula with the unchanged 12-Basic candidate yields:

| Source's Basic count | Number of authenticated ranks | Candidate offered any source-mulligan bonus |
| ---: | ---: | ---: |
| 4 | 3 | 54.8851% |
| 10 | 1 | 22.0179% |
| 11 | 6 | 18.7989% |
| 12 | 3 | 16.0120% |
| 13 | 3 | 13.6021% |
| 14 | 6 | 11.5213% |
| 15 | 4 | 9.7279% |
| 16 | 3 | 8.1855% |

With **equal weights for the 29 authenticated source ranks**, the average bonus-offer probability is exactly evaluated as **17.96223153%**; average *maximum* extra cards offered is **0.29193401**. These are population-of-inventories calculations, not a match sample and not game outcomes. Ranks **23/25/28** still have missing exact original 60s. If a legal 60 has between one and 60 Basic Pokémon, the opening offer probability must lie between **0%** and **85.97074206%**. Consequently, a deliberately loose, assumption-minimal bound on the **equal-weight full-32 field average offer probability** is **16.27827232%–24.33802939%** without inventing the missing three Basic inventories. The actual value can be much narrower.

The 300,000-pair opening experiment **does not average across the 29 opponents**; it samples the all-Thorns **four-Basic** source mulligan law only. Its tactical value must not be extrapolated directly to rank1, Regidrago mirrors or the full field.

## Same-physical-deal registered-candidate opening comparison

The simulation draws one conditional Basic-valid initial seven, assigns six face-down Prize cards, adds the sampled optional bonus cards, then draws one ordinary first-turn card. **Both candidate 60s use the same 60-position random order, Prize positions, basic starter geometry and source bonus history**, changing only one physical Quick Ball into a Boost Shake. This is a legitimate paired comparison of two `60`-card *resource-incidence laws*, without importing any hand/private information into an actual playing policy.

| Resource opportunity after bonuses | v0 (3 Shake/3 Quick) | v1 (4 Shake/2 Quick) | v1 minus v0 |
| --- | ---: | ---: | ---: |
| Muk + Regidrago V, distinct search connectors | 19.8813% | 22.7083% | **+2.8270 pp** |
| Budew + Regidrago V, distinct search connectors | 38.2513% | 30.8340% | **-7.4173 pp** |
| **Either lock + Regidrago V** | **47.6177%** | **43.5170%** | **-4.1007 pp** |
| Direct initial-seven Active Budew + Regidrago V | 12.0523% | 11.5880% | -0.4643 pp |

For **either lock + Regidrago V**, the actual paired counts are **13,642 v0-only** and **1,340 v1-only** among 300,000 same-deal trials. The difference is **−4.10066667 percentage points**, with paired normal Monte Carlo **95% interval [−4.17927614, −4.02205719] pp**, conditional on this idealized stochastic setup model. The comparison is **two-sided**, not a claim that any one search route always dominates. For Muk+Regidrago the paired counts are 4,929 v0-only and 13,410 v1-only; for Budew+Regidrago they are 22,252 v0-only and zero v1-only.

### Seat-adjusted sensitivity, still without actual attacks

Under normal first-turn rules the first player cannot declare Budew's Itchy Pollen attack, while the Boost Shake Muk evolve-and-end-turn route remains mechanically possible. A deliberately illustrative **50:50 first/second-seat incidence average** therefore uses **Muk+Regidrago access for going first** and **either-lock+Regidrago access for going second**. It gives **33.7495% v0 versus 33.1127% v1**, or **−0.6368 pp**. Under the artificial equal-value assumption, break-even occurs with **59.1926% going-first weight**, but neither the seat frequency nor the values of the two lock types are established by this experiment. Budew fetched after the starting seven still needs actual mobility to attack, so the going-second component is an optimistic resource-access screen. This arithmetic is deliberately kept separate from any winning probability or recommended coin-flip choice.

**Crucial interpretation:** More drawn cards improve **both** lists' available openings compared with the previous exact **no-bonus** model (39.6116% versus 35.5147% for either lock with Regidrago), but the roughly four-percentage-point relative gap survives. The simulation shows a sensitivity result for one fixed opening heuristic, **not a field win rate**. The three all-Thorns originals share this four-Basic setup distribution while retaining distinct Trainer/attack strategies.

The simulation recorded **0 censored setups** and a bonus-card count distribution `[135252, 65539, 39847, 23473, 14364, 8561, 5188, 7776]` for exact `N=0..6` and `N≥7`. Observed bonus prevalence **54.9160%** is consistent with the exact **54.8851%** offered rate under random sampling. These counts are **attempts**, not wins or independent matchups.

## Reproduction and assumptions

- [Seeded Python research runner](../../simulation/evaluation/agent2-alchemy-rank6-mulligan-opportunities.py): seed **20261103**, **300,000** paired trials, NumPy RNG. It reads both *registered* manifests directly, checks the exact one-card difference, checks all 12 Basic categories and evaluates the same resource predicates as the independent exact BigInt [no-bonus model](../../simulation/evaluation/agent2-alchemy-attacker-lock-joint-first8.cjs).
- [Saved machine output](agent2-alchemy-rank6-mulligan-300k.json): raw integer event counts and paired discordances, source/candidate identities, seed, complete attempt count and bonus histogram; the source runner also prints per-metric paired 95% sampling intervals.
- [Regression test](../../tests/agent2-alchemy-rank6-mulligan-opportunities.test.py): three locally executed Python unittest cases passed, covering registered inventory and exact two-player formula, a reproducible 8,000-opening four-Basic source smoke, and **8,000 synthetic no-bonus openings** (source Basic count 60) that return to the separate exact first-eight calculation's expected probabilities. The no-bonus stratum is explicitly returned as null rather than divided by zero. The synthetic all-Basic source is a mathematical negative control, not a claimed actual tournament list. No GitHub Actions run was dispatched for these pure tests; they were executed locally with category-equivalent deck fixtures and must be rerun against the full checked-out registered manifests for repository-wide CI verification.
- **Seed-reproduction detail:** The evaluator expands every registered 60 into canonical sorted category codes (Grimer, Muk, Shake, Treasure, Quick, Budew, Regidrago, other Basics, remaining cards), independently checked against the exact remote v0/v1 category histograms `[2,2,3,4,3,1,4,5,36]` and `[2,2,4,4,2,1,4,5,36]`. This prevents superficial JSON row ordering from changing the reported seeded physical deals. The same 60 category slots are permuted for both candidates except one Quick Ball slot converted to Shake.
- Physical card ordering is shared across both inventories except a single fixed category conversion from Quick Ball to Shake, and is freshly randomized each trial. Full list physical order is uniform. Initial-seven Basic-invalid hands are rejected until valid, equivalent to the retained valid opener after the paper redraw process. Source mulligan count uses the analytically derived two-player race law and is independent of the final candidate permutation.
- Owner chooses **all** offered extra cards; no card is drawn from the Prize positions. The first seven determine the Active-starter geometry. A singleton Budew available only after the initial seven needs mobility, so a separate stricter direct-start metric is preserved.
- Trials with `N>46` would be flagged censored because 47 non-Prize cards remain after the opening seven, and the ordinary first-turn draw consumes one of them; no such trials occurred. An extremely rare 46-bonus configuration leaves the deck empty afterward and still fits this opening-access calculation. This exception is captured explicitly rather than silently treated as a playable game.

**Limitations:** Even with full mulligan setup and correct physical draw sampling, this does **not** apply actual Item discard costs, evolution and Energy timing, Active switching, turn-order attack restrictions, lock suppressions, opponent response or an official paper match clock. A `95%` sampling interval measures Monte Carlo uncertainty about these predicates only. It does **not** cover model discrepancy or competitive win rate. Source rank 6/24/29 may choose different plays after drawing. Do not promote either candidate to the final 60 or count these 300,000 setups as qualifying games.

**Field benchmark unchanged:** 29/32 original source 60s authenticated, ranks 23/25/28 missing, zero competitively qualified games, no selected single best 60 and no demonstrated 99.5% win rate.
