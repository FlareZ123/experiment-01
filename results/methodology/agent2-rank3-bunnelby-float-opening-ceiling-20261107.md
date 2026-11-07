# Agent 2: exact opener ceiling for the constructed rank-3 FSS/Float/Bunnelby line

**7 November 2026 | Methodological quantitative negative control.** This report evaluates how readily the *opening seven alone* can supply the key cards used by an earlier genuine pinned-Store rank-3 Snorlax/Bunnelby tactical fixture. It does **not** infer that those cards must all be in the opening to execute the same later-game line. Search, subsequent draws, Prizes, Energy attachments, opponent decisions and the event clock are outside this model. **Competitive game qualification remains zero.**

## Motivation and independent source

The constructed [rank-3 FSS-first/Float Stone/Bunnelby real-Store tests](../../tests/agent2-fss-float-actual-store.native.test.cjs) establish that a held second Tool can free Snorlax PGO from a printed four-unit Retreat Cost, preserve two Capture Energy RCL already attached to Snorlax, and promote a Bunnelby PRC with one Capture for one or two accepted **Burrow** attacks. A separate two-card-opponent-deck fixture can force a native deck-out consequence. These are valuable causal tactical checks because an untreated same-state control is unable to Retreat with two Energy. They are intentionally constructed, not sampled from natural original-rank-3 games. They do not demonstrate a matchup win.

The exact authenticated original source is rank 3, Haruto Miki, Snorlax Stall, in [full-decklists.json](../aichi-2026/full-decklists.json) with **3 Snorlax PGO, 1 Bunnelby PRC, 1 Forest Seal Stone SIT, 1 Float Stone BKT, 1 Stealthy Hood UNB, 1 Tool Jammer BST, 3 Capture Energy RCL and 1 Rotom V LOR**. The remaining cards are grouped as Other, preserving 60. Independently, the exact English-print census in [Agent2's original-29 Tool analysis](../../simulation/evaluation/agent2-original29-fss-first-tool-collision.cjs) checks 11 Basic Pokémon, one Basic V, and exactly those three alternative Tool printings for this original rank. Japanese historical print legality is a separate unresolved gate.

## Exact uniformly ordered seven, with first-Tool ordering

Let \(H\) be a random physical seven sampled without replacement from the registered rank-3 sixty. Any event in the table already contains Snorlax and Bunnelby, so its successful hand is necessarily a valid initial Basic-Pokémon hand. The conditioning denominator is exactly

\[
\binom{60}{7}-\binom{49}{7}=300{,}306{,}336
\]

of the \(\binom{60}{7}=386{,}206{,}920\) unordered sevens. For a seven containing Forest Seal Stone plus \(t-1\) other Pokémon Tools, the probability that FSS appears first among the held Tools in randomized original hand order is exactly \(1/t\). The partition explicitly counts Float Stone, Stealthy Hood and Tool Jammer separately. It uses integer binomial coefficients and a common multiplicative denominator of 420 for this rational order weighting.

| First-seven event, always FSS-first among held Tools and Float held | Exact 420-scaled numerator | Chance conditional on valid opening | Reciprocal |
| --- | ---: | ---: | ---: |
| At least one Snorlax, Bunnelby | 15,943,795 | **0.012640898%** | 1 per 7,910.8 |
| Above plus at least one Capture Energy | 2,540,475 | **0.0020141933%** | 1 per 49,647.7 |
| Above plus no Rotom V in the opener | 2,443,455 | **0.0019372718%** | 1 per 51,619.0 |
| FSS, Float, at least one Snorlax, Bunnelby and **all three Capture Energy** in the opening seven | 630 | **0.00000049949%** | 1 per 200,204,224 |

The final event fills all seven cards exactly: FSS, Float, Bunnelby, one of three Snorlax cards, and all three Capture Energy. Its exact unscaled numerator is \(3/2\), corresponding to three choices of Snorlax times a one-half FSS-before-Float order chance. The numerator is rational because the Tool order is averaged over physical hand sequences.

The last event's probability is a very small **opening-only overlap**, not a probability of ever attaining the staged Energy configuration. A player could draw, search and attach those cards over several turns after opening with fewer or none of the Capture Energy. Conversely, drawing all seven listed cards would not automatically produce the later four-stage scripted state. A lost Prize copy, supporter contention, bench setup, opponent lock, ordinary turn attachment limit, and available search routes can all materially change later-game reachability.

## Reproduction and safeguards

- Calculations: [agent2-rank3-fss-float-bunnelby-opening-ceiling.cjs](../../simulation/evaluation/agent2-rank3-fss-float-bunnelby-opening-ceiling.cjs). The script reads the authenticated rank-3 printed-name/count source and checks the original-29 card pool's Basic and Tool counts before enumerating disjoint hand compositions.
- Regression: [agent2-rank3-fss-float-bunnelby-opening-ceiling.test.cjs](../../tests/agent2-rank3-fss-float-bunnelby-opening-ceiling.test.cjs), checking category quantities, valid-start denominator, all four exact scaled numerators, monotonicity and the exact last-case combinatoric identity.
- Independent check: Python \`math.comb\` over the full product of nine category counts, adding \`fractions.Fraction(1,held_tool_count)\` to every valid seven composition, reproduced exact numerators \(455537/12,\;24195/4,\;23271/4,\;3/2\).
- Both this exact-opening test and the separate bilateral root activation preflight passed the existing **manual-only** [Japanese legality and research check CI run 42348217268](https://github.com/FlareZ123/experiment-01/actions/runs/42348217268). No new always-on workflow or vendor modification was introduced.

## Decision effect and limitations

The ranked exact physical-opening frequency supports **not spending broad experimental compute on a rare seven-card hand overlap as though it represented a common natural rank-3 line**. The better immediate experiment is a preregistered original-source continuation: observe actual natural owner-held FSS/Float and Bench Bunnelby, preserve K0/K1 Prize knowledge, audit native settlement/payment, and compare the exact untreated same-physical-deal source decision, competent opponent reply and paper time limit. Such a game is not yet supplied by this report.

This result narrows the **interpretation** of the prior tactical fixture. It does not diminish the verified legality of the staged Store actions, estimate the occurrence of the later board state, select a new card or deck, or establish a game win rate. The Aichi 2026 field remains 29/32 authenticated original inventories, and zero competitively qualified games.
