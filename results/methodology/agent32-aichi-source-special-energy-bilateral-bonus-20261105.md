# Conditional source Special Energy exposure under bilateral mulligans

**Agent 32, 5 November 2026.** Exact setup probability with independent physical shuffle simulation. This is a physical-card availability screen. It does not model legal Energy attachments, player action selection, an opponent reply, or game wins.

## Source, controlled contrast and question

The authenticated original Aichi Open League 2026 Top32 data are 29 exact name/count 60-card inventories in `results/aichi-2026/full-decklists.json` (original roster Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`). Ranks **23, 25 and 28** remain missing. The previously audited Basic counts are in [Agent32's bilateral mulligan census](../aichi-2026/agent32-adp-original29-mulligan-bonus-offers-20261103.md). Seven exact original 60s contain only Special Energy: ranks **4, 5, 6, 7, 17, 24 and 29** (independently confirmed in [Agent12's source audit](agent12-issue25-special-energy-only-source-root-coverage-20261104.md)).

Compare two *unchanged* historical 60-card candidates: Agent5's seven-Basic ADP/Thorton/Regidrago v2 (`bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`) and the fourteen-Basic rank-1 Shadow Rider reference. The measured event is that an original source player has **at least one Special Energy card in its valid initial seven or in its elected mulligan bonus draws**. The source elects to draw every bonus card offered. An optional ordinary turn draw is treated separately.

## Bilateral setup, conditional derivation

Let `B` be original source Basic Pokémon count, `E` original source Special Energy copies, and `C` candidate Basic copies. Write `q_s = C(60-B,7)/C(60,7)` and `q_c = C(60-C,7)/C(60,7)`, where `C(n,k)` denotes a binomial coefficient. The source receives a positive compensation offer only when its seven is valid and the candidate needs a mulligan. Simultaneous invalid opening sevens reset *both* players without an offer. The exact probability of one or more offers is:

`p = q_c(1-q_s)/(1-q_s*q_c)`.

Conditional on at least one source offer, the source receives exactly `m>=1` optional cards with probability `(1-q_c)*q_c^(m-1)`. The expected number of offers is `p/(1-q_c)`. Given the source accepted a seven containing a Basic, the chance of **no** Special Energy initially is:

`h = [C(60-E,7)-C(60-E-B,7)]/[C(60,7)-C(60-B,7)]`.

If its first seven contain no Special Energy, `d` further ordinary draws plus `m` bonus draws likewise contain no Special Energy with probability `(53-E)_(m+d)/(53)_(m+d)`. The six random Prizes set aside before bonus cards preserve this unconditional marginal. Mix `m=0` with mass `1-p` and `m>=1` with mass `p(1-q_c)q_c^(m-1)`. This computes the physical Special Energy access probability conditional on an eventual Basic-valid source seven.

The program censors the vanishingly small physically impossible tail of 47 or more offered extras. It returns explicit lower/upper access bounds of width no more than `p*q_c^46`. For these comparisons the width is below 1e-18. No player is assumed to know its face-down Prizes.

## Seven Special-Energy-only original 60s

| Original rank | Source Basics | Source Special Energy | Source access vs 7 Basics | Source access vs 14 Basics | Difference |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 4 Raichu/Electrode | 13 | 12 | 81.7471% | 79.9310% | +1.8161 pp |
| 5 Mew/Genesect | 11 | 4 | 40.4421% | 38.4837% | +1.9584 pp |
| 6 Iron Thorns | 4 | 8 | 62.8950% | 61.4151% | +1.4799 pp |
| 7 Snorlax | 12 | 4 | 40.6828% | 38.6839% | +1.9989 pp |
| 17 Raichu/Electrode | 13 | 12 | 81.7471% | 79.9310% | +1.8161 pp |
| 24 Iron Thorns | 4 | 8 | 62.8950% | 61.4151% | +1.4799 pp |
| 29 Iron Thorns | 4 | 8 | 62.8950% | 61.4151% | +1.4799 pp |

Equal weight across these **seven** (not all 32) gives **61.9006% versus 60.1822%**, a **+1.7184 percentage-point** physical-card access difference. This makes the candidates' impact on the *opponent's opening resources* visible, even though the original source deck is unchanged. The contrast is an exposure difference, not a competitive effect estimate.

For **rank 6**, chance of at least one bonus offer is **20.9710% vs 6.0393%**, and expected offered cards **0.3490 vs 0.0701** against the 7- and 14-Basic candidate respectively. With no contender-generated bonus the baseline source valid-seven Special Energy access is **61.0113%**. With one ordinary turn draw in addition to all offered bonuses, original-rank-6 access becomes **68.5239% vs 67.2457%**, a **+1.2782 pp** contrast; first-turn draw availability depends on seat/turn rules and is reported separately.

## Independent simulation and reproducibility

The exact expression was checked with two **100,000-trial** seeded independent physical-deal simulations for source rank6: for challenger Basics=7, empirical source access 62.696%, offer probability 21.058%, mean offers 0.34812; for Basics=14, empirical access 61.625%, offer probability 6.106%, mean offers 0.07086. Trials literally redrew both invalid seven-card hands together, awarded offers for contender-only failures, accepted source's valid seven, randomly removed six Prizes and then drew the full optional offers. Differences from exact probabilities are sampling variation, not engine evidence.

Reproduce the deterministic calculation with [source-only CJS](../../simulation/evaluation/agent32-source-special-energy-exposure.cjs) and [six Node test cases](../../tests/agent32-source-special-energy-exposure.test.cjs). On 5 November the six tests passed locally (Node native test runner, 0 failures). The code checks known rank6 baseline values and compares all seven original sources; it does not invoke Twinleaf.

## Decision relevance, bounds and exclusions

The joined Issue #25 policy still lacks a generally selected owner-held Special Energy attachment branch in its default executing root. Earlier [Agent12's static analysis](agent12-issue25-special-energy-only-source-root-coverage-20261104.md) established this independently. The new calculation explains one opening-hand resource confounder in candidate comparisons; it cannot repair the policy, certify a paper-valid recipient, or establish source attack payoff. Actual player choice to decline bonus cards, card draw/search, opponent pressure, Prize information acquisition, card-specific attachment restrictions, evolution and battle continuation can materially alter performance.

**Benchmark status:** 29/32 original card-name/count 60s authenticated, ranks 23/25/28 missing, zero competitively qualified games, no selected best fixed 60 and no evidence of the 99.5% target. Retain all naturally randomized pre-registered attempts when testing candidates; do not condition comparisons on candidate-induced original-source opening hands.
