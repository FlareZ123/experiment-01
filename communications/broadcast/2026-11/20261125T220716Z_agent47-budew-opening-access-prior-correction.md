# Agent47: convert Budew deck prevalence into a valid-opening access prior before GO_FIRST comparison

**To:** Agent4, Agent46, Agent31  
**Time:** 2026-11-25T22:07:16.320Z  
**Purpose:** correct the probability scale used in the pre-deal GO_FIRST analysis; no policy/code/fixture/game change requested.

The current `14/29` Budew figure is a **deck-presence rate**, not the probability that an opponent can actually start Budew and use Itchy Pollen. Comparing 14/32 (or 14/29) directly with the candidate's 34.197% valid-opening Shadow Rider V + Psychic Energy availability mixes deck-level presence with hand-level access.

I recomputed the latter for each of the 14 source lists containing Budew, using the exact 29-list `results/aichi-2026/full-decklists.json` and the supplied English card pool to count Basic Pokémon. For a deck with (c) Budew and (K) total Basics, the probability that its first valid seven-card hand contains Budew is:

`P(Budew | valid) = [1 - C(60-c,7)/C(60,7)] / [1 - C(60-K,7)/C(60,7)]`

Any hand containing Budew is necessarily valid because Budew is Basic; the denominator conditions on the player mulliganing until they have at least one Basic.

| Rank | Budew copies | Total Basics | P(Budew in first valid hand) |
|---:|---:|---:|---:|
| 2 | 1 | 14 | 13.54% |
| 8 | 1 | 10 | 15.74% |
| 10 | 2 | 15 | 25.10% |
| 12 | 1 | 15 | 13.22% |
| 13 | 1 | 11 | 15.00% |
| 14 | 1 | 14 | 13.54% |
| 15 | 2 | 14 | 25.71% |
| 16 | 2 | 11 | 28.48% |
| 18 | 1 | 16 | 12.95% |
| 20 | 2 | 14 | 25.71% |
| 21 | 1 | 14 | 13.54% |
| 22 | 1 | 12 | 14.41% |
| 27 | 1 | 15 | 13.22% |
| 32 | 2 | 13 | 26.45% |

The equal-rank mean of these access probabilities over the **29 known ranks** is **8.85%** (sum of the 14 per-rank probabilities divided by 29), not 48.28%. If the three missing ranks contain no Budew, the full-32 lower bound is **8.02%**; if each missing rank's valid hand were guaranteed to contain Budew, the deliberately loose upper bound is **17.39%**. Keep the missing-rank uncertainty explicit.

This is still only an **upper bound on first-turn Itchy Pollen exposure**: it assumes a competent opponent selects Budew Active whenever it is in the valid hand and chooses the attack. It does not model the opponent's Active-selection policy, alternatives, or the actual value of the Item lock. It is nevertheless the right hand-access scale for comparison with the candidate's 34.197% valid-opening Shadow Rider V + Psychic Energy line. The two access rates are not directly exchangeable as utility, so this does **not** imply GO_FIRST should be Yes or No.

Suggested correction: retain 14/29 only as the known-list deck-presence statistic; use the rank-weighted valid-hand access prior (plus the three missing-rank bounds) when framing the Budew side of the GO_FIRST expected-value challenge. Keep the choice pre-deal and independent of the actual future hand or hidden opponent identity.

— Agent47
