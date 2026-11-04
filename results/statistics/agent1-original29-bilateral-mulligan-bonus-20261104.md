# Exact two-player mulligan compensation across 29 original Aichi sixties

**Agent 1 | 4 November 2026 | Exact opening combinatorics | Zero games**

## Result for four unchanged registered candidates

A candidate's own single-seven mulligan probability differs from the probability of offering extra draw cards to the opponent. Both players first attempt a Basic-containing seven. When **both** lack a Basic, both restart, earning no bonus. When one has a valid seven, the other alone mulligans, and each repeat can entitle the valid player to an *optional* bonus card.

The following averages weight the **29 authenticated original Aichi Top32 sixties equally**, excluding ranks 23,25,28 with unknown exact decks. They are **optional maximum cards OFFERED**, not actual chosen cards, game results or winning probabilities.

| Frozen candidate | Basic copies | Single-seven mulligan | Opponent offered at least one | Expected maximum bonus OFFERED to opponent | Expected maximum bonus OFFERED to candidate | Net expected bonus to opponent |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| [Agent5 ADP Thorton Regidrago v2](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json) | **7** | **39.9120%** | **34.1669%** | **0.568615** | **0.238633** | **+0.329982** |
| [Agent43 Apex Alchemy v0](../aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json) | **12** | **19.0647%** | **15.6402%** | **0.193244** | **0.291934** | **-0.098690** |
| [Agent28 Sentinel Lopunny Vileplume v1](../aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json) | **14** | **13.8591%** | **11.2553%** | **0.130661** | **0.304018** | **-0.173357** |
| [Agent38 Arven Shake Absol v1](../aichi-2026/candidate-arven-shake-absol-v1.json) | **12** | **19.0647%** | **15.6402%** | **0.193244** | **0.291934** | **-0.098690** |

The seven-Basic ADP proposal thus offers opponents approximately **0.568615 maximum optional bonus cards per initial game**, and is offered **0.238633** by opposing mulligans, for a **+0.329982 net opportunity to opponents** across the 29. These figures are a possible early consistency hazard in games where opposing initial setup and search are decisive. **They do not prove one candidate stronger**: deck composition and full policies vary, bonus offers are optional, and an opponent with very few Basics can reverse the sign.

## Audited original source Basic counts

Each printed Pokémon is resolved by original printed set code and card number against the repository's resources/sets/en.json and resources/cards/en/ metadata. The script validates its name and checks for a printed Basic subtype. The original-29 data comes from [full-decklists.json](../aichi-2026/full-decklists.json). All 29 count to exactly 60. For the same printed Prism Star card, the source's diamond glyph ♢ and indexed diamond glyph ◇ are treated as equivalent **only when the indexed Pokémon has the Prism Star subtype and exact printing matches**.

Three promo card *identities* are absent in the supplied corpus and are resolved with explicit name-locked, printing-locked Basic exceptions, independently verified by printed card documentation: [Trevenant & Dusknoir-GX SMP217](https://pokebase.app/pokemon-tcg/cards/trevenant-and-dusknoir-gx-sm-black-star-promos-sm217), [Jirachi XYP67](https://pokestats.gg/tcg/card/xyp-XY67), [Regirock XYP49](https://pokestats.gg/tcg/card/xyp-XY49). Original ranks 1, 2 and 3 respectively contain one each; rank 7 has **two** Regirock XYP49. An unrecognized printing fails closed. Card stages are not guessed from their English names.

| Exact eligible Basic cards in original sixty | Original source ranks |
| ---: | --- |
| 4 | 6, 24, 29 |
| 10 | 8 |
| 11 | 3, 5, 9, 11, 13, 16 |
| 12 | 7, 22, 26 |
| 13 | 4, 17, 32 |
| 14 | 1, 2, 14, 15, 20, 21 |
| 15 | 10, 12, 27, 31 |
| 16 | 18, 19, 30 |

The three missing original opponents (ranks 23,25,28) are **not imputed**. Their still-absent decks prevent a complete 32-opponent numerical average.

## Correct two-player setup model

For a uniform seven-card hand from a physical 60 with B eligible Basic Pokémon, the chance of no Basic is

\[
p(B)=\frac{\binom{60-B}{7}}{\binom{60}{7}}.
\]

Let \(p_A=p(B_A)\), \(p_B=p(B_B)\) and \(q_i=1-p_i\). Both players need to retry jointly with probability \(p_Ap_B\), with no compensation. Summing any number of such joint retries, the three mutually exclusive first successful joint-decision states are

\[
P(A\text{ alone mulligans})=\frac{p_Aq_B}{1-p_Ap_B},
\quad
P(B\text{ alone mulligans})=\frac{p_Bq_A}{1-p_Ap_B},
\quad
P(\text{both valid})=\frac{q_Aq_B}{1-p_Ap_B}.
\]

If A alone mulligans, A continues until a Basic-containing seven. The expected number of failures, *including the first failed hand*, is \(1/q_A\). Thus the probability that B is offered at least one or at least two cards and the expected **maximum offered** cards are respectively

\[
P_B(\ge 1)=\frac{p_A q_B}{1-p_Ap_B},\quad
P_B(\ge 2)=\frac{p_A^2 q_B}{1-p_Ap_B},\quad
E[\text{maximum offer to B}]=\frac{p_Aq_B}{q_A(1-p_Ap_B)}.
\]

Exchange A and B for the other direction. The supplied Advanced Player's Rulebook I.G confirms both-no-Basic resets, asymmetrical solo mulligans, the opponent's right to draw *up to* the number of relevant mulligans, and the right to Bench newly drawn Basics during setup. The results here use the offers and never presume the receiver takes all optional cards.

## Exact public compensation histogram for native policy calibration

The [same mathematical module](../../simulation/evaluation/agent1-original-field-mulligan-bonus.cjs) now exposes **exactBonusMultiplicity(candidateBasics, opponentBasics, maxCount)**, which yields the entire mutually exclusive discrete distribution of optional bonus card **offers**, with an explicit geometric tail. Set A=candidate, B=original opponent, pA and pB as above. The exact mass that **neither** is offered cards is qA qB / (1 - pA pB); for each integer j ≥ 1:

\[
P(\text{opponent offered exactly }j)=\frac{q_Aq_Bp_A^j}{1-p_Ap_B},
\qquad
P(\text{candidate offered exactly }j)=\frac{q_Aq_Bp_B^j}{1-p_Ap_B}.
\]

This is a more discriminating **read-only calibration target** for the already-implemented native setup compensation observer than merely checking the average offered count. Against rank 1 with 14 Basics, the seven-Basic ADP candidate produces exact hypothetical rates: **54.7911% neither offered**, **21.8682% rank1 offered exactly one**, **8.7281% rank1 offered exactly two**, **3.4835% rank1 offered exactly three**, and **7.5935% ADP offered exactly one**. Both-sided simultaneous bonus entitlement is impossible in a single completed setup. These are offered count masses before the receiver's optional draw choice.

The [extended regression](../../tests/agent1-original-field-mulligan-bonus.test.cjs) checks the exact category masses, sums all geometric tails to one, tests both-seat symmetry for 25 pairs of Basic counts, and verifies every event's consistency with the earlier at-least-one expressions. [Manual CI 41782800996](https://github.com/FlareZ123/experiment-01/actions/runs/41782800996) completed **SUCCESS**. No additional native match was run, and no private card identity is required for an empirical setup-receipt comparison.

## Specific matchup examples

Against **rank 1 Shadow Rider Calyrex**, with **14** original Basics, the seven-Basic ADP list offers rank 1 at least one extra card in **36.3937%** of setups, versus rank 1 offering ADP at least one in **8.8152%**. Expected maximum offers are **0.605674 to rank 1** and **0.102335 to ADP**.

Against **rank 6 Iron Thorns**, with just **4** original Basics, the seven-Basic ADP list instead is offered at least one by rank 6 in **47.4569%** of setups, versus offering rank 6 at least one in **20.9710%**. Expected maximum offers are **1.187909 to ADP** and **0.349005 to rank 6**. A universal penalty for each candidate mulligan would mischaracterize this opponent.

## Evidence, validation, and experimental application

- [Pure CommonJS model](../../simulation/evaluation/agent1-original-field-mulligan-bonus.cjs) uses exact BigInt combinations, an indexed full-source Basic census with explicitly bounded promo exceptions, two-party mulligan logic, and every 29-field matchup mean.
- [Node regression test](../../tests/agent1-original-field-mulligan-bonus.test.cjs) asserts the 29 original Basic counts and four candidate counts, all three mutually exclusive setup states, mathematical symmetry, 61-term explicit geometric-retry summation, conditional at-least-two offers, selected original matchup values, weighted field means and missing-source veto.
- [Manual GitHub Actions run 41779269738](https://github.com/FlareZ123/experiment-01/actions/runs/41779269738), head 04f088222ed98d112e2b53acb5dbf630c61e4f8b, **SUCCESS**. This invoked an ordinary Node test, without a new native Twinleaf match or engine build.
- The frozen owner-safe bilateral policy in [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25) should later distinguish actual mulligan history, *offered* bonus count, *accepted* draws, and post-bonus Bench Basic placements in authentic source/candidate physical deals. Preserve inaccessible Prize cards and other hidden state from the actor. Evaluate downstream competent attack/control and real opponent continuation before attributing any win-rate value to the offered cards.

**Benchmark remains 29/32 authenticated original opponent sixties, 0 competitively qualified games, no selected final fixed 60 and no demonstrated 99.5% field win rate.**
