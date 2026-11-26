# Hood Shield Shadow Rider: exact Underworld Door Energy-race screen

**Author:** Agent11  
**Date:** 26 November 2026  
**Decision relevance:** fixed-60 candidate ranking. This tests whether the registered 11-Psychic-Energy candidate can realistically reach its five-Energy Max Geist damage breakpoint after the Radiant Eternatus setup. It does not nominate or reject the candidate.

## Question

The existing Regidrago damage-threshold derivation establishes that Shadow Rider Calyrex VMAX reaches 320 damage against a 280-HP Regidrago VSTAR when Fairy Zone is active and five Psychic Energy are attached across the candidate's Pokémon. The deterministic attachment ceiling is not a probability. This analysis isolates the Energy-access bottleneck after Radiant Eternatus has already placed two VMAX onto the Bench.

## Fixed-list facts and breakpoint

The registered Hood Shield Shadow Rider v1 contains 11 Basic Psychic Energy, four Shadow Rider Calyrex VMAX, one Radiant Eternatus, and two Lillie's Clefairy ex. With Fairy Zone active, Max Geist damage is 2 × (10 + 30E), so five attached Psychic Energy produce 320 damage. The Energy count is across all of the candidate's Pokémon; the eventual attacker still needs enough Energy in its own attachment zone to pay Max Geist's attack cost.

The card-text and damage derivation is preserved in the earlier Agent11 report, results/aichi-2026/2026-11/agent11-regidrago-max-geist-fairy-zone-threshold-20261125.md. That report correctly labels the five-Energy line as a structural possibility, not a setup or matchup probability.

## Exact conditional model

The model starts after Climactic Gate has resolved and Radiant Eternatus plus two VMAX have left the 60-card list and entered play. It conditions on the remaining cards being randomly distributed among the player's hand, six Prizes, and deck.

- The post-Gate population is 57 cards, including all 11 Psychic Energy, before any pre-Gate manual attachment.
- H is the hand size after the Gate turn's plays and before the normal draw at the start of the next turn.
- A is the number of Psychic Energy manually attached before Gate: zero or one. If A=1, that Energy is removed from both the unknown-card and unknown-Energy populations; it is not counted twice.
- On each of the next two turns, the player takes the normal draw, then may use each available Underworld Door once. A successful Door requires a Psychic Energy in hand, attaches it to a Benched Psychic Pokémon, and then draws two cards. One manual attachment is available each turn.
- Door uses are sequenced before the manual attachment. Under this model that is optimal for maximizing attachments: it spends the same Energy but adds two cards before the manual attachment is committed.
- The baseline has two usable Door activations each turn, corresponding to the two VMAX placed by Radiant. A four-activation ceiling assumes all four VMAX are already in play and all four Abilities are usable on both turns.

The dynamic program tracks hand Energy, deck Energy, deck non-Energy, and total attached Energy. Initial hand and Prize counts and all subsequent draws are finite-population hypergeometric transitions. The event counted is at least five total Psychic Energy attached by the end of the second post-Gate turn.

### 11-Energy results

A simple turn-one line from a seven-card opening hand gives two useful starting cases: Radiant played from hand with no Energy attachment (H=6, A=0), or Radiant played from hand after the manual Energy attachment (H=5, A=1). Both have 45 cards in the deck at the start of the next turn under the stated population assumptions.

| Start state | Door uses per turn | Probability of at least five total Energy by end of turn 3 | Mean total Energy attached |
|---|---:|---:|---:|
| H=6, A=0 | 2 | **8.10%** | 2.16 |
| H=5, A=1 | 2 | **10.66%** | 2.72 |
| H=6, A=0 | 4 | **13.19%** | 2.16 |
| H=5, A=1 | 4 | **15.01%** | 2.72 |

The four-Door ceiling adds only 5.09 percentage points in the no-pre-Gate-attachment case and 4.34 points in the one-attachment case. Extra VMAX Abilities help, but Energy-in-hand availability is still the binding resource in this submodel.

### Energy-count sensitivity

| Basic Psychic Energy in the fixed 60 | H=6, A=0; two Doors/turn | H=5, A=1; two Doors/turn |
|---:|---:|---:|
| 9 | 3.07% | 4.61% |
| 10 | 5.21% | 7.29% |
| **11 (registered list)** | **8.10%** | **10.66%** |
| 12 | 11.75% | 14.69% |
| 13 | 16.14% | 19.29% |

In this narrow model, a twelfth Energy raises the five-Energy threshold rate by 3.65–4.02 percentage points across the two simple starting states. That is a measurable card-slot benefit, not a recommendation to add Energy: the displaced card's value across the other 31 opponents has not been evaluated.


### Conditional Forest Seal Stone tutor

The registered 60 contains one Forest Seal Stone (SIT 156). The pinned card pool, resources/cards/en/swsh12.json, marks it Expanded Legal and gives the attached Pokémon V the Star Alchemy VSTAR Power: search the deck for any card and put it into hand. This creates a real Energy-access route, but only when the Tool is already attached to a Pokémon V, the VSTAR Power remains unused, and no Ability lock prevents it.

The sensitivity below conditions on Forest Seal Stone already being in play and usable. The Stone is removed from the post-Gate unknown population, leaving 56 cards after Radiant and the two VMAX are also out. Star Alchemy is modeled as moving one Psychic Energy from deck to hand before the turn-two draw, if an Energy remains in deck. It does not create Energy.

| Conditional FSS state | Without Star Alchemy Energy search | With one Energy search | Four-Door ceiling with search |
|---|---:|---:|---:|
| H=5, A=0 | 6.22% | **17.86%** | 26.12% |
| H=4, A=1 | 8.22% | **23.92%** | 31.46% |

The tutor materially improves this narrow line, but these are conditional probabilities, not the chance of drawing/attaching Forest Seal Stone. The model does not account for the one-Tool-per-Pokémon constraint, the Bench needed to host the Stone separately from Stealthy Hood, the VSTAR Power's competing uses, or Ability-lock exposure. It is not a recommendation to spend Star Alchemy on Energy in every game.


### Natural Forest Seal Stone / Arven access

The candidate also contains one Arven (SV1 166). The pinned card pool confirms Arven searches the deck for an Item and a Pokémon Tool, so it can fetch Forest Seal Stone. The new joint model no longer assumes the Stone is already attached: after the post-Gate population is dealt into hand, six Prizes, and deck, it tracks the one FSS and one Arven alongside the 11 Psychic Energy. It allows the player to use FSS if drawn, or use Arven to fetch FSS if Arven is in hand and FSS remains in deck. The one Star Alchemy Energy search is used at the first opportunity on either post-Gate turn when an Energy remains in deck. It also recognizes FSS or Arven drawn by the normal draw or Underworld Door.

| Start state | Five-Energy probability, two Doors/turn | FSS used to search Energy by end of turn 3 | Four-Door ceiling |
|---|---:|---:|---:|
| H=6, A=0 | **13.40%** | 34.70% | 20.77% |
| H=5, A=1 | **16.80%** | 30.79% | 22.94% |

Compared with the no-FSS/Arven baseline (8.10% and 10.66%), this natural-access model improves the five-Energy event by 5.30 and 6.13 percentage points. The conditional “FSS already attached” figures above (17.86% and 23.92%) are a separate upper scenario and should not be conflated with this joint access model.

This is still conditional on Radiant plus two VMAX already being in play. It assumes an available Tool slot on a Pokémon V, no Ability lock, no other Supporter played on either turn (so Arven is always available when drawn), and that spending Star Alchemy on Energy is the chosen policy. It does not model Tapu Lele-GX finding Arven, Arven's second Item search, other Supporter/draw competition, or FSS used before Gate. Those omissions can move the result in either direction. The reported 34.70% / 30.79% is the probability the model actually spends Star Alchemy on Energy, not a standalone FSS access rate.

## Interpretation

The candidate's five-Energy Max Geist line should not be treated as an early deterministic Regidrago answer merely because four VMAX can theoretically produce four Underworld Door attachments. Even after conditioning on the Radiant-plus-two-VMAX board, the 11-Energy list reaches five total attachments only 8.10–10.66% of the time in the two-Door baseline for the simple turn-one hand states above. The four-Door ceiling reaches 13.19–15.01%.

This is a useful constraint on the fixed-60 hypothesis: the five-Energy line is a possible later or draw-assisted route, not demonstrated early coverage. The result does not invalidate the candidate or its separate Mimikyu/Dialga counterline. It does prevent the deterministic ceiling from being mistaken for a likely game line.

## Limitations

This is an exact calculation for the declared submodel, not a game simulation, matchup estimate, or full-deck setup probability.

It conditions on Radiant Eternatus and two VMAX already being in play. It does not estimate the probability of finding Radiant, establishing Fairy Zone, or reaching the required board before the opponent acts. It does not model:

- the Active/Bench allocation needed to make a VMAX attack-ready, or the two/three Psychic Energy needed on that specific attacker;
- Parallel City, Sky Field, Bench-slot contention, the Active Spot, or the switch/retreat route from the Gate turn;
- Ability lock, Stealthy Hood, Tool removal, Stadium changes, or Energy denial;
- Lillie's Determination, Iono, Tapu Lele-GX finding Arven, or other draw engines. Forest Seal Stone is modeled in the conditional-tutor and natural FSS/Arven-access sensitivities above, but Tool/Bench constraints, Ability lock, and competing Supporter/VSTAR uses remain omitted;
- Quick Ball discard costs, Energy recovery, Supporter contention, Prize knowledge after a deck search, or opponent choices;
- damage modifiers, Weakness prevention, or changes to the 280-HP target.

Those omitted effects can move the full-game probability in either direction. The total-Energy event is necessary but not sufficient for an executable Max Geist attack. No lower bound, upper bound, matchup win rate, or 99.5% claim is inferred.

## Reproduction and status

- Implementation: scripts/agent11-underworld-door-energy-race.cjs
- Tests: tests/agent11-underworld-door-energy-race.test.cjs
- Local Node v22.16.0 test result: 10/10 passed.
- Exhaustive small-deck tests independently validate the Energy-only transition, the conditional tutor transition, and natural FSS/Arven tutor use to within 1e-12.
- The registered candidate 60, its policy, Twinleaf pin, workflows, fixtures, and game authorization were not changed. No CI or simulator game was run.
