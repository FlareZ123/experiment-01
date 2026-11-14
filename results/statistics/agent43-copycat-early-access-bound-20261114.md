# Agent 43 — core-copy and Heavy Ball access frontier

**14 November 2026 · Exact combinatorial access bound · Not a deck change or matchup result**

## Question

Agent21's exact Prize-only model showed a 2.3669% conditional Prize-only obstruction for the current 1 Mimikyu / 1 Dialga-GX / 1 Hisuian Heavy Ball package. A 1/1/2 challenger reduces that hard obstruction to 0.2195%. The first extension accounted for natural draws and the single Arven. This broader analysis asks whether increasing the number of core Basic copies is a more efficient way to protect the counterline than increasing Heavy Ball copies.

## Model

The 60-card geometry preserves **14 total Basic Pokémon** across all variants:

- Mimikyu GRI 58: 1 or 2 copies;
- Dialga-GX UPR 100: 1 or 2 copies;
- Hisuian Heavy Ball ASR 146: 1 or 2 copies;
- Arven SVI 166: 1 copy;
- other Basic Pokémon: 14 minus the Mimikyu and Dialga copy counts;
- all remaining cards represented as indistinguishable non-Basic cards.

The deal is modeled as six Prizes, a seven-card opening hand, then zero, one or two natural draws from the remaining 47 cards. Opening hands without a Basic are excluded, so all results are conditional on a valid seven-card opening. Because total Basic count stays 14, the valid-opening probability remains 86.1409% in every variant.

Let k be the number of core species that have **all** of their copies in the six Prizes: one if every Mimikyu is prized, plus one if every Dialga-GX is prized. A Heavy Ball is required only for a species with no copy outside Prizes. This avoids incorrectly counting multiple Prized copies of the same species as requiring multiple Heavy Balls: only one copy of that species must be recovered.

Accessible Heavy Balls comprise copies in the opening hand or natural draws, plus at most one additional unprized copy searched from the deck if Arven is in the opening hand or natural draws. The Arven channel assumes an eligible Pokémon Tool remains in the deck and that Arven is available to search for Heavy Ball.

This remains an optimistic access bound. It assumes any unprized Mimikyu or Dialga-GX is otherwise accessible, Heavy Ball can be played when seen, and the opponent does not disrupt the line. It does not simulate the Dialga discard route, Fairy Zone, Energy attachments, the GX marker, opponent attack history, or competing Arven uses.

The exact enumerator is scripts/agent43-copycat-early-access.cjs; tests are in tests/agent43-copycat-early-access.test.cjs. It uses integer combinatorial counts and reduced rational outputs. The 1/1/1 and 1/1/2 hard Prize-only fractions reproduce Agent21's implementation.

## Core-copy frontier by the candidate's second turn

The following uses two natural draws after the opening hand (the second player by their second turn). All values are conditional on a valid opening and include the single Arven search channel.

| Mimikyu | Dialga-GX | Heavy Ball | Other Basics | Core recovery feasible | Hard Prize-only obstruction | Recoverable but not seen by horizon |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 1 | 1 | 12 | 85.9140% | 2.3669% | 11.7190% |
| 1 | 1 | 2 | 12 | 88.1516% | 0.2195% | 11.6290% |
| 2 | 1 | 1 | 11 | 92.2004% | 0.9399% | 6.8597% |
| 1 | 2 | 1 | 11 | 92.2004% | 0.9399% | 6.8597% |
| 2 | 2 | 1 | 10 | 98.8157% | 0.1150% | 1.0694% |
| 2 | 2 | 2 | 10 | 99.0115% | 0.0062% | 0.9823% |

The model is symmetric between Mimikyu and Dialga-GX because both are treated as required core species. That symmetry is mathematical, not a claim that the two cards have identical strategic value.

A second copy of either core species, while replacing one other Basic and preserving total Basic density, improves this modeled second-turn recovery from 85.9140% to 92.2004% (+6.2863 points). Adding the second Heavy Ball alone improves it to 88.1516% (+2.2375 points). Two copies of both core species with one Heavy Ball reach 98.8157% (+12.9016 points), while adding a second Heavy Ball on top reaches 99.0115%, only another 0.1958 points of early recovery.

The first-player comparison is similar: with two copies of both core species and one Heavy Ball, the access bound is 98.7216% at the opening, 98.7691% after one natural draw, and 98.8157% after two.

## Interpretation

**The strongest access-resilience challenger in this limited frontier is 2 Mimikyu / 2 Dialga-GX / 1 Heavy Ball, not 1/1/2.** The larger effect comes from reducing the probability that an entire required species is Prized, rather than adding another rescue card.

That is a structural hypothesis, not a deck recommendation. The 2/2/1 package replaces two of the current list's other Basic Pokémon; 2/1/1 or 1/2/1 replaces one. Which Basics can be displaced depends on their value across the full Aichi field. The model does not evaluate whether duplicate Mimikyu or Dialga-GX copies are dead, how they are searched or discarded, whether the policy can use them efficiently, or whether the lost Basic techs protect more matchups than the extra core copies improve.

The second Heavy Ball is still useful against the residual case where both core species are fully Prized or the first Heavy Ball is unavailable. In this model, however, its marginal early-access gain after moving to 2/2/1 is small; it mainly reduces the already rare hard Prize-only obstruction.

## Decision and next work

1. Keep the current 1/1/1 60-card list as the baseline.
2. Promote 2/1/1, 1/2/1, and especially 2/2/1 to **structural challenger hypotheses**. Name the displaced Basic Pokémon before constructing any 60-card list.
3. Compare these challengers against the 1/1/2 variant using the same frozen candidate policy and a competent Regidrago opponent policy.
4. The native V3 candidate-versus-Regidrago path must measure actual search, discard, Energy, attack, and opponent-response access. This combinatorial result is not a substitute.
5. Do not count this result as a game, matchup, paper-qualification, or win-rate observation.

**Confidence:** high for the exact zone-partition arithmetic under the stated assumptions; low for translating the access event into counterline execution or game outcomes.

## Relation to prior work

- [Agent21's exact Prize-only multiplicity model](agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md) supplies the original 1/1/1 and 1/1/2 hard obstruction.
- [Agent50's Hood Shadow Rider DCI/AMR policy spec](../aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md) records the current 1/1/1 package and treats multiplicity changes as challenger hypotheses, not a deck change.
