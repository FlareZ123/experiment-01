# Wally first-turn Blockade window versus Grand Tree restriction

**Agent 18 | 2 November 2026 | exact physical-card probability; no native match wins.**

The frozen [rank-2-derived Exeggutor/Vileplume v2 60](agent18-exeggutor-vileplume-native-v2.json) contains two Exeggcute (PLF4/VIV4), two Exeggutor PLF5, three Jet Energy, 14 Basic Pokémon and **zero Wally**. This report examines hypothetical decks obtained by replacing 1–4 unrelated non-Basic, non-Energy slots with Wally. **No third 60-card candidate has been defined.**

## Paper-rule distinction

- **Grand Tree SCR136** (resources/cards/en/sv7.json, sv7-136) says a Basic Pokémon cannot be evolved during its player's first turn or on the turn it was put into play. Grand Tree therefore cannot produce a turn-one Exeggutor Blockade. Its later-turn evolution utility remains substantial.
- **Technical Machine: Evolution PAR178** is an attack. The two-attack Bunnelby Omega Barrage/TM setup ends the player's turn and ordinarily exposes an intervening opponent turn before a future Blockade. Agent40's [actual two-turn staged Store test](agent40-exeggutor-blockade-two-turn-native-and-direct-access-20261102.md) proved the timing and subsequent Blockade and player-level Supporter denial under its conditions, with no competitive match.
- **Wally ROS94** (resources/cards/en/xy6.json, xy6-94) explicitly permits an evolution on the player's first turn or on a Pokémon put into play that turn; Exeggcute is eligible because it is not Pokémon-EX. Going second, a held Wally can search the remaining deck for Exeggutor PLF and evolve an Exeggcute just played. **Jet Energy PAL190** (sv2-190) supplies one Colorless for Blockade and, attached from hand to a Benched Exeggutor, promotes it. If Exeggcute was the original Active, Jet may be attached directly. These provide a possible first-turn-going-second Blockade action sequence, subject to opposing effects and legitimate board conditions. Going first, the ordinary first-turn Supporter restriction prevents the Wally route.

[Official Japanese Extra rules](https://www.pokemon-card.com/rules/regulation/index.html) and the [2026 banned-card update](https://www.pokemon-card.com/info/005353.html) contextualize the BW-forward format. An individual event-specific Japanese-print legality check remains a prerequisite to a tournament deck. The [public Wally printing](https://limitlesstcg.com/cards/ros/94) corroborates its first-turn evolution permission.

## Exact untutored physical window

Paper setup draws seven cards, sets six Prizes, and then the player going second draws one card. Condition on a Basic in the first seven. Among the naturally seen first eight, require an Exeggcute, a Wally and a Jet Energy; additionally, at least one Exeggutor must remain searchable **in the deck** after hand and Prizes. No other search, draw, mobility, opponent behavior or policy decision enters this event.

| Hypothetical Wally count | Exact conditional fraction | Rate |
| ---: | ---: | ---: |
| 1 | 1392748831/149873349120 | **0.929283851%** |
| 2 | 69178943381/3896707077120 | **1.775318032%** |
| 3 | 9913837361/389670707712 | **2.544157712%** |
| 4 | 31578165629/974176769280 | **3.241523163%** |

**Proof construction:** Partition 60 physical copies as [2 Exeggcute, 12 other Basic, w Wally, 3 Jet, 2 Exeggutor, 41-w other]. Enumerate eight-card group counts, weighting each by the product of binomial coefficients. For a first-eight composition with exactly one Basic, seven choices of the eighth-drawn card leave a Basic in the initial seven; with at least two Basics, all eight do. Given the first eight, among the other 52 cards the six-Prize choices leaving an Exeggutor in deck equal C(52,6) minus C(52-(2-h_exeggutor),6-(2-h_exeggutor)). Impossible binomial coefficients contribute zero. The sum divides by 53*C(52,6)*(C(60,7)-C(46,7)).

The [BigInt exact calculator](../../scripts/agent18-wally-blockade-window.cjs) and [four pure tests](../../tests/agent18-wally-blockade-window.test.cjs) **passed locally on Node 22.16.0**. An independent exhaustive small-deck test follows actual seven → Prizes → turn-draw order, and exact rational 60-card regressions cover all four profiles. Python Fraction and math.comb independently reproduced these fractions.

**Interpretation:** The rates describe exactly the no-extra-search Wally+Jet physical conjunction, conditional on a Basic-valid seven. They are lower bounds on potential first-turn access through Wally because extra tutors and other payable Energy/mobility can help. They are upper bounds on actual successful Blockade attacks through the precise conjunction because opposing restrictions and player decisions can defeat the route. Neither is a game-win estimate. Opponent mulligan bonus draws are excluded.

## Fixed-deck decision

This identifies a first-turn evolution axis that can avoid the exposed Bunnelby/TM-to-next-turn handoff in rare openings. Even four Wally copies naturally assemble this strict route in only **3.24%** of Basic-valid going-second starts, and Wally competes with Guzma & Hala for the Supporter use. The result does not justify removing four source cards or replacing the current fixed-deck benchmark. A future Wally challenger must be versioned as a complete 60 and tested using the actual two-seat canonical policy, witnessed real source deals, opponent continuations, paper action/effect fidelity, match clock and all censored outcomes.

**Competitive-qualified games: zero. No validated 99.5% field win rate.**
