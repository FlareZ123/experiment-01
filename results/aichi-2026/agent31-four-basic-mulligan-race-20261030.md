# The four-Basic setup tax: exact two-player mulligan race against Aichi rank 6

**Agent 31 | 30 October 2026 | Evidence class: exact combinatorics, independent 400,000-game setup-only Monte Carlo, and seven local Node 22 tests.** This is a new *pre-turn opponent resource* factor. It is not a competitive game simulation, a deck-quality ranking or evidence of a 99.5% win rate.

## Source-locked populations and official setup mechanism

The [Aichi 2026 original 60 manifest](full-decklists.json) fixes **rank 6 Kazuma Kashi Iron Thorns ex at four Pokémon, all four Basic**, and **rank 1 Yasunori Kato Shadow Rider at 14 Basics plus four VMAX Evolutions**. The frozen [New Moon English challenger proxy](../als/new-moon-lockbreak-english-proxy-60.json) has **17 Basics and two Dusclops Evolutions**. The rank-24 and rank-29 Iron Thorns printed source lists likewise have just four Basic Pokémon. The supplied Advanced Player's Rulebook, Section I.G, setup Steps 5–7, establishes:

- Each participant opens seven cards and needs at least one Basic.
- If both initial hands lack Basics, both reveal, reshuffle and retry, with no opponent bonus accrued on that both-invalid iteration.
- When exactly one has a Basic, that player keeps the opening hand, prepares the Bench and six Prizes, while the other player redraws until having a Basic.
- Only after the invalid player's redraws can the already-valid player **choose to draw up to the number of opponent mulligans**. The bonus count is an *option*, not mandatory card draw.

Every result below follows those simultaneous first-hand rules. It differs from mistakenly assigning an extra card for every invalid hand independently, or treating both-invalid rounds as free draws.

## Exact distribution

For a 60-card deck with b Basic cards, let

p(b) = 1 - C(60-b, 7)/C(60, 7)  and  q(b) = 1-p(b).

Let A be rank-6 Iron Thorns (4 Basics) and B the competing fixed candidate. The first round in which both players are not simultaneously invalid has denominator D = 1-q_A*q_B. Then

- P(neither player earns a mulligan bonus) = p_A*p_B/D.
- P(A receives at least one optional bonus draw) = p_A*q_B/D.
- P(B receives at least one optional bonus draw) = q_A*p_B/D.
- For k>=1, P(B is offered at least k bonus draws) = P(B bonus)*q_A^(k-1).
- E[number offered to B] = P(B bonus)/p_A. The corresponding A expression swaps the labels.

These are exact probabilities for shuffled opening hands under the stipulated setup rules, regardless of who is selected to play first. They include the possibility of arbitrarily many redraws; their very small upper tail does not meaningfully affect the numerical conclusions.

| Statistic | Rank 6: four Basics vs rank-1 champion: fourteen Basics |
| --- | ---: |
| Rank-6 opening seven is Basic-valid | 39.94996257% |
| Champion opening seven is Basic-valid | 86.14093191% |
| No player receives a mulligan bonus | 37.53726198% |
| Champion is offered at least one extra draw | **56.42343175%** |
| Rank 6 is offered at least one extra draw | **6.03930626%** |
| Champion is offered at least three extra draws | **20.34632896%** |
| Champion expected offered bonus draws | **1.41235256 cards** |
| Rank-6 expected offered bonus draws | **0.07010960 cards** |

This is a substantial **pre-turn card-access asymmetry** associated with the exact four-Basic source, even before the source can exploit passive Initialization, support-denial effects, or control strategies. It is not necessarily a gameplay disadvantage of equal magnitude: the valid player may decline some draws, hand disruption may erase an opening advantage, and card usefulness depends on matchup and actions.

For comparison, the 17-Basic New Moon proxy against the same rank-6 four-Basic source is offered >=1 extra draw in **57.94279437%** of setups and **1.45038420 expected optional cards**. These are structural opening counts, with no assertion that the two candidates convert extra cards equally well.

## Exact one-card access implication: champion Radiant Eternatus

The original champion 60 has exactly one **Radiant Eternatus CRZ**, a Basic Pokémon, among its 14 Basics. With a Basic-valid initial seven, the chance it is already in the opening hand is:

P(Radiant in first seven | valid) = (7/60)/p(14) = **13.54369683%**.

If the champion elects to take every allowed bonus draw from rank-6 mulligans, the average probability that its hand contains Radiant **after setup bonus draws**, before its first normal turn, becomes **15.84759836%**, an increase of **2.30390152 percentage points**.

The exact conditioned non-target probability after k bonus draws is

P(no Radiant | valid and k additional draws)
= [(C(59,7)-C(46,7))/(C(60,7)-C(46,7))] * C(52,k)/C(53,k).

There are six face-down Prizes before the bonus draw, but averaging their unknown random identities makes the extra k draws equivalent to a uniform sample of the 53 cards absent from the original seven. Computational evaluation truncates actual bonus draws to the 47 cards physically remaining after removing the seven and six Prizes, then places the remaining geometric probability into the cap. The tail probability of being offered at least 47 draws is **3.65654e-11**.

This is a **direct hand-access event**. It deliberately excludes Quick Ball/Mysterious Treasure access, Bench occupancy, the condition that Radiant be played from the hand, opposing Ability suppression, the VMAX targets remaining in deck, discard affordability, turn order, and subsequent actions. It is not a Climactic Gate success probability, much less a game-win estimate. The previously documented direct-access and Forest Seal Stone models are distinct and cannot be added mechanically.

## Evidence and replication

- [Pure CommonJS evaluator](../../scripts/aichi-setup-mulligan-race.cjs) computes exact binomial opening probabilities, race outcome probabilities, long geometric tails and target-access marginalization over unknown Prizes.
- [Seven independent regressions](../../tests/aichi-setup-mulligan-race.test.cjs) include two-seat symmetry, all-Basic controls, the physical Prize cap, a miniature exhaustive sample of ordered opening hands and the rank6/champion exact numerical milestones. **All seven passed locally under Node 22.16.0.** No compiled Twinleaf or Actions claim is made.
- An additional independent 400,000-trial Python NumPy setup-race experiment (seed 20261030, batches of 20,000) returned: P(rank6 bonus)=**0.0599800**, P(champion bonus)=**0.5649225**, P(no bonus)=**0.3750975**, average rank6 bonus **0.06964** and champion **1.4153725**. This is a stochastic check of the equations; the exact values above take precedence.

The evaluator is deliberately a **paper setup model** and does not consult opponent-private cards or game-state internals. It can be applied to other Basic counts, but including a card in the target set does not assert playable legality or strategic desirability.

## Implication for fixed-60 deck research

When measuring four-Basic Iron Thorns control, report both players' **actual optional mulligan draw opportunities and accepted draws**, source hand validity, final physical seven, source Prize setup, and postbonus first-turn owner state. The generic bot's policy of choosing an opening bonus size can substantially change how much setup material the opposing player receives. A reproducible headless comparison that ignores this mechanism may misattribute early candidate consistency to the deck's 60-card composition.

The rank-6 source still has a potent passive Ability lock and a deliberate control plan. Its generous mulligan exposure motivates testing whether opponent extra cards materially improve first-turn search/setup **under that live passive lock**. The source's exact control decision policy, active target choice and official tournament clock remain unqualified. The program still has 29/32 complete original opposing 60s, zero competitively qualified games, and no demonstrated fixed 99.5% deck.
