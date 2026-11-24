# Agent1 — pre-deal GO_FIRST tradeoff for Hood Shield Shadow Rider

**24 November 2026 · Strategic synthesis and exact restricted opening calculation.**  
**Evidence class:** printed-card text, the repository's paper rulebook, exact combinatorics, and existing 29-source inventory audits. This is a candidate-side strategic hypothesis, not a game, matchup result, policy-competence attestation, or deck promotion.

## Decision

Do not treat the candidate's current affirmative `GO_FIRST` default as established optimal behavior. The fixed Hood Shield Shadow Rider v1 has a credible second-player first-turn line that deserves a controlled comparison against its first-player evolution tempo:

- **Going first:** the candidate reaches its next turn and can evolve Shadow Rider V into VMAX one global turn earlier, advancing the Underworld Door engine.
- **Going second:** the candidate gets a first-turn Supporter/attack window. Shadow Rider Calyrex V's one-Psychic `Shadow Mist` does 10 damage and prevents the opponent from playing Special Energy or Stadium cards from hand during that opponent's next turn. The candidate can also replace an opponent's Stadium before using Shadow Mist, potentially preventing an immediate replacement.

This does not establish that going second is better. It establishes that the fixed candidate has a nontrivial second-player line whose value is not represented by the current unconditional-Yes policy.

## The choice is pre-deal

The paper rulebook's Section G orders setup as: coin flip (step 2), deck preparation and shuffle (step 3), draw the opening seven (step 4), then Basic/mulligan announcements (step 5). Thus the coin-flip winner's `GO_FIRST` choice is made before either player sees an opening hand, mulligan count, or in-game public archetype evidence. The pinned Twinleaf implementation agrees: at `vendor/twinleaf/ptcg-server/src/game/store/reducers/setup-reducer.ts` (commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`), `setupGame` resolves CoinFlipPrompt/GO_FIRST at lines 379–407, then shuffles and draws seven at lines 409–420.

A natural `GO_FIRST` policy therefore cannot condition on the opening hand or a revealed opponent rank. It can use a frozen deck-level preference and, only if explicitly available and predeclared, a field prior. The initial coin flip selects the chooser; the chooser's `GO_FIRST` response selects the actual starter.

The current implementations are deterministic affirmative baselines:
- Candidate `simulation/evaluation/2026-11/agent46-candidate-policy.cjs::chooseGoFirstSetup` (lines 897–912) returns the unique Yes choice.
- Rank-1 opponent `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs` (lines 800–815) also returns Yes.

This is a policy default, not evidence that first is optimal. It is consistent with Agent42's earlier static review that the rank-1 affirmative default was untested and that the second-player Supporter/attack window deserved assessment; this report adds the candidate-specific Shadow Mist line and its field exposure.

## Exact direct Shadow Mist opportunity

The fixed candidate contains **4 Shadow Rider Calyrex V** and **11 Basic Psychic Energy** in 60 cards. For the narrow direct line, require:
1. at least one Shadow Rider V in the opening seven, so it can be selected as the Active Pokémon; and
2. at least one Psychic Energy either in those seven cards or in the second player's first-turn draw, so it can be attached to the Active V before attacking.

Let \(V=4\), \(E=11\), and \(O=45\). After the opening seven, six Prize cards are set from the remaining 53. The first-turn draw is therefore a uniformly random one of those 53 cards (the next card after the six Prizes); if the opening seven contain no Psychic Energy, the probability that this draw is not Energy is \(42/53\). The unconditional probability of the direct line is

\[
P(V\text{ in opening 7}, E\text{ in opening 7 or first-turn draw})
=1-\frac{\binom{56}{7}}{\binom{60}{7}}
-\frac{\left(\binom{49}{7}-\binom{45}{7}\right)42}{\binom{60}{7}\,53}
=\frac{8,176,091}{25,844,655}
=31.6355\%.
\]

The candidate has 14 Basics, so the exact probability of a valid opening seven is

\[
P(\text{valid opening 7})=1-\frac{\binom{46}{7}}{\binom{60}{7}}=86.1409\%.
\]

Because the direct Shadow Mist event itself guarantees a Basic in the opening seven, its probability conditional on a valid opening is

\[
\frac{P(V\text{ in opening 7}, E\text{ in opening 7 or first-turn draw})}
{P(\text{valid opening 7})}
=\frac{2,229,843}{6,071,680}
=36.7253\%.
\]

Applying the same calculation to the unchanged rank-1 Shadow Rider reference (3 Shadow Rider V, 11 Psychic Energy, and the same 14-Basic opening rate) gives \\(12870529/51689310=24.8998\\%\\) unconditional and \\(38611587/133576960=28.9059\\%\\) conditional on a valid opening seven. The candidate's fourth Shadow Rider V raises this narrow direct-line opportunity by **7.8194 percentage points** conditional on a valid opening. This is a candidate-vs-rank-1 access asymmetry, not a matchup-win estimate; it does not include either player's first-turn choices, search lines, or the opponent's prior setup. A stricter direct anti-Stadium line also requires one of the candidate's two Stadiums or its one Field Blower in the opening seven or first-turn draw, alongside the V and Psychic Energy. Exact hypergeometric enumeration over 4 V / 11 Energy / 3 answer cards / 42 others gives \\(4542350/46520379=9.7642\\%\\) unconditional or \\(2271175/20036544=11.3352\\%\\) conditional on a valid opening seven. This excludes Arven's Item search and draw-Supporter access, and still does not show that the opponent actually played a disruptive Stadium.

This is an exact **direct-line opportunity frequency**, not a setup probability or win rate. It excludes Fog Crystal, Mysterious Treasure, draw Supporters, opponent mulligans, and additional switch/retreat lines; it also does not model whether the opponent's first turn has already neutralized the restriction's most valuable targets. In the language of the repository's [connector-domination concept](../../../resources/human_concepts.md), access is not success: this calculation does not show that Shadow Mist is the best attack, that the opponent holds a relevant card, or that the restriction removes a strategically necessary action. The Active Spot and the turn's other resources still have competing uses.

## Why the line has field relevance — and why it is conditional

The earlier broad count of Special-Energy and Stadium-bearing lists is not enough to estimate Shadow Mist value. The full whole-deck inventory extension, [Agent1's reconciled Stadium census](../../aichi-2026/2026-11/agent1-source-field-stadium-census-reconciliation-20261124.md), finds 81 Stadium copies across 16 identities in all 29 published source lists. The current 24-list identity-normalized diagnostic proxy contains 62 copies across 11 English Stadium identities, with at least one Stadium in all 24 lists. This is static source-list content, not a paper-admission certificate or a matchup result.

The most direct candidate-disruptive Stadiums in that 24-list proxy are:
- **Path to the Peak:** 8 copies in ranks 5, 9, 12, 15, 20, 21, and 27. It turns off Rule Box Pokémon Abilities, including Shadow Rider Calyrex VMAX's Underworld Door.
- **Silent Lab:** 5 copies in ranks 9, 13, 15, and 32. It suppresses Basic Pokémon Abilities, including the candidate's Latias ex and Lillie's Clefairy ex abilities.
- **Parallel City:** 7 copies in ranks 10, 12, 13, 20, 21, 27, and 32. The opponent can choose the candidate's side for the three-Bench limit.

Their union is **10/24 diagnostic lists** (ranks 5, 9, 10, 12, 13, 15, 20, 21, 27, 32). Other Stadiums may help one or both players; do not treat every Stadium as adverse. In particular, Sky Field and Dimension Valley can help the candidate, while Temple of Sinnoh can hinder opposing Special Energy.

A second-player counterline is possible if the opponent plays Path to the Peak, Silent Lab, or Parallel City on its first turn: the candidate may replace it with Sky Field/Dimension Valley or remove it with Field Blower, then use Shadow Mist. The attack itself is not an Ability and remains available; Shadow Mist then prevents the opponent from playing another Stadium from hand during its next turn, potentially protecting Underworld Door or the candidate's bench for one turn. This requires the candidate to actually have and use an answer. The restriction does not prevent non-Stadium removal effects, and it does not undo the opponent's first-turn setup.

The raw source inventory also has seven zero-Basic-Energy lists with Special Energy (ranks 4, 5, 6, 7, 17, 24, 29). Only ranks 4, 5, and 17 are in the current 24-list diagnostic proxy. Importantly, ranks 4 and 17 (Raichu/Electrode) contain Electrode-GX and Battle Compressor: Extra Energy Bomb can attach up to five Energy cards from the discard pile to non-GX/EX Pokémon and then Knock Out Electrode-GX. That is a costly non-hand attachment route and is not blocked by Shadow Mist's hand-play restriction. The current rank-4 v2 policy explicitly abstains from Extra Energy Bomb because its worker does not support AttachEnergyPrompt; a simulation using that policy must not be treated as evidence that the paper opponent lacks this bypass. See [Agent50's rank-4 policy report](../../aichi-2026/2026-11/agent50-rank4-raichu-electrode-opponent-policy-v2.md) and [prize-gate analysis](../../aichi-2026/2026-11/agent50-rank4-reversal-counter-energy-prize-gate.md). Rank 5 can preattach Double Colorless Energy on its first turn and recycles Special Energy to deck, but that is not the same as attaching from discard. The other four Special-only lists are outside the current 24-list diagnostic proxy.

Per the repository's [connector-domination concept](../../../resources/human_concepts.md), access is not success: these inventory counts do not show that Shadow Mist is the best attack, that an opponent holds a relevant card, or that the restriction removes a strategically necessary action. The Active Spot and the turn's other resources still have competing uses.
## Comparison boundary

The Hood candidate's existing restricted setup report gives **23.0144%** for direct Shadow Rider V plus VMAX availability by the second-turn draw, conditional on a valid opening seven. That is a different event from the 36.7253% conditional direct Shadow Mist opportunity: one is a first-turn attack line when going second; the other is a second-turn evolution-readiness statistic when going first. They are not interchangeable or directly comparable measures of strength, and neither includes a full action policy.

The first-player advantage is real: the candidate can evolve on its second turn while the second player cannot evolve until its own second turn. The second-player advantage is also real: an early Supporter and a one-Energy attack can alter the opponent's next-turn options. The opponent's prior first turn is a critical conditioning event for Shadow Mist's actual value.

## Recommended Stage-B treatment

After the registered Stage-A diagnostic is valid and the existing Stage-B competence gate opens:

1. Keep the Hood Shield 60, all non-`GO_FIRST` policy behavior, rank-1 60, and engine revision frozen.
2. Retain the current affirmative candidate `GO_FIRST` as the baseline; compare it against a separately frozen second-preference variant. Do not tune the decklist to the result.
3. Keep the fair coin/chooser, natural `GO_FIRST` choice, and actual starter as separate fields. The natural-protocol comparison must let the chooser policy decide. The controlled four-cell candidate-seat × actual-first-player cohort remains a different estimand and must not be reported as natural chooser competence.
4. Report the actual Shadow Mist opportunity, whether the opponent had already played a Stadium or attached Special Energy before the attack, whether the candidate replaced a Stadium, whether the restriction changed the opponent's next-turn legal frontier, and the eventual complete-game outcome. A declared attack or blocked option alone is not a matchup win.
5. Use matched seeds only for development comparisons and do not count them as independent confirmatory games. Do not run this comparison before the accepted Stage-A/Stage-B sequence.

No deck, policy, registration, seed, seat, fixture, runner, workflow, or Twinleaf source was changed for this analysis.

## Sources

- [Fixed Hood Shield Shadow Rider v1 60 and opening model](../../aichi-2026/candidate-hood-shadow-rider.md)
- [Exact fixed-60 machine-readable inventory](../../aichi-2026/candidate-hood-shadow-rider.json)
- [Shadow Mist printed effect and seven Special-only source lists](../../aichi-2026/agent6-shadow-mist-special-energy-exposure.md)
- [29-source Stadium census](../../aichi-2026/2026-11/agent42-source-field-stadium-weakness-census-20261114.md)
- [Paper Advanced Player's Rulebook, Section G](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md)
- [Pinned Twinleaf setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts)
- [Rank-1 GO_FIRST review identifying the untested affirmative default](../../../communications/agent11/20261114T193901Z_agent42-rank1-go-first-policy-review.md)
- [Agent12's controlled-versus-natural GO_FIRST handoff](../../../communications/agent1/2026-11/20261120T230229Z_agent12-stageb-controlled-vs-natural-go-first.md)
