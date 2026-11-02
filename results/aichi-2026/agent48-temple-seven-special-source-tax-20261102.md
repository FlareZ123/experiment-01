# Agent48: Temple of Sinnoh's attack-funding tax across seven original all-Special-Energy Aichi 60s

**2 November 2026 | Paper-card conditional theorem and exact restricted draw math.** This is a candidate-testing hypothesis, not a game result. There remain **29/32** authenticated original opponent 60s, **zero** competitively qualified games, and no demonstrated 99.5% fixed deck.

## Source-defined seven-deck axis

The immutable [original-source Energy topology](original-source-energy-topology-v1.json), derived from [original printed sixties](full-decklists.json), finds exactly seven original ranks with **zero Basic Energy**: **4, 5, 6, 7, 17, 24, 29**. Each uses only attached Special Energy for printed attack payment. [Temple of Sinnoh ASR155](https://asia.pokemon-card.com/my/card-search/detail/2423/) says all *attached* Special Energy provide **one Colorless** and have no other effect. Consequently, while Temple is active and absent a separate Energy-type provider, attack-cost modifier, Stadium replacement or contrary applicable effect, the following are true.

| Aichi original rank | Original Energy supply | Concrete Temple consequence | In-list Stadium replacement examples |
| --- | --- | --- | --- |
| 4, 17 Raichu/Electrode | Four each Reversal, Counter and Unit LPM | Alolan Raichu UNM57's **Electro Rain** costs Lightning; **Electric Ball** also costs Lightning. Even Electrode-GX attaching more printed Special Energy cannot supply Lightning while Temple applies. This disables both Raichu attacks' ordinary payment, **not every other Pokémon's actions**. | Rank 4: 3 Sky Field; rank 17: 1 PokéStop |
| 6, 24, 29 Iron Thorns | Speed Lightning plus Capture, DCE and/or Spiky | Iron Thorns ex TWM77's **Volt Cyclone** requires Lightning and two Colorless. All three original sources contain only four Iron Thorns ex as Pokémon. Under active Temple, no amount of their original attached Special Energy pays Lightning. **Initialization Ability remains**. | All three include Thunder Mountain Prism Star and other Stadiums |
| 5 Mew/Genesect | Exactly 4 Double Colorless Energy; no other Energy | Mew VMAX FST114's **Cross Fusion Strike** costs two Colorless. Outside Temple, **one** attached DCE supplies both; under Temple, **two distinct attached DCE cards** are necessary. The copied Techno Blast donor is not itself an additional attack-cost payment. A normal single manual attachment cannot establish both in one turn; existing preattachments, search/draw or future attachments matter. | 2 Sky Field and 2 Path to the Peak |
| 7 Snorlax Stall | 2 Capture, 1 Recycle, 1 Jet | Temporal suppression of attached Special Energy effects is potentially disruptive, but a match-denial claim from this inventory alone is unsupported. Its control plan and Stadium competition require separate analysis. | 2 Chaotic Swell, 1 Artazon |

The Raichu cost is supported by [Alolan Raichu UNM57](https://limitlesstcg.com/cards/en/UNM/57), Mew's by [Mew VMAX FST114](https://limitlesstcg.com/cards/FST/114), and Temple's continuous override by the official card text above. [Agent17 independently established the complete five-original Lightning-source denial proof earlier](agent17-temple-five-lightning-originals-20261102.md); the prior [three-Thorns source report](agent48-temple-iron-thorns-original-three-gate-20261102.md) likewise covers those three. The incremental contribution here is the **rank-5 Mew DCE attachment-multiplicity constraint, exact access probability, native payment and original-source counterplay**.

## Exact restricted Mew/Genesect access

Original rank 5 has exactly **11 Basic Pokémon**, **4 Double Colorless Energy**, and **45 other cards**. Let the opening seven be Basic-valid (at least one Basic); let `k` be the number of subsequent ordinary random draws. Six randomly placed Prize cards are marginalized. The probability below is the location event **at least m distinct DCE cards physically seen in the opening seven plus k ordinary draws**, with no Trainer/Ability draw/search, attachment availability, evolution or board-state requirement. This is **not** a probability of attacking.

| Ordinary draws after opening seven | At least 1 DCE seen (normal CC payment resource) | At least 2 DCE seen (Temple CC payment resource) |
| ---: | ---: | ---: |
| 0 | 37.8841677187% | **5.4860820519%** |
| 1 | 42.5721550606% | **7.3199359576%** |
| 2 | 46.9896815944% | **9.3537178289%** |

To reproduce exactly with integer arithmetic, set `B=11, S=4, O=45`, `D=C(60,7)-C(49,7)`. For threshold `m` and subsequent draws `k`, sum over `b>=1, s>=0, o=7-b-s>=0` the products

`C(11,b) C(4,s) C(45,o) * sum_{j=max(0,m-s)}^{min(k,4-s)} C(4-s,j) C(49+s,k-j)`

and divide by `D*C(53,k)`. Out-of-range binomial coefficients contribute zero. For the at-least-two event, exact favorable/total counts for k=0,1,2 are respectively **16,475,052/300,306,336**, **1,165,058,268/15,916,235,808**, **38,707,754,448/413,822,131,008**. These are conditional on a Basic-valid opening and assume no information-based mulligan selection. Marginalizing random Prizes permits ordinary drawn cards to be sampled uniformly from the 53 cards left after the opening seven, but does not guarantee the four Energy cards are unprized or reachable in a real game.

## Research decision and falsification

**Candidate:** The fixed [Temple Shadow Rider v1](candidate-temple-shadow-rider.md) contains two Temple copies and 11 Basic Psychic Energy, so the continuous Energy override does not itself change the candidate's Psychic Energy type. Its own established Radiant Eternatus/VMAX consistency losses remain serious. Source answer Stadiums, their search routes, hand depletion, deadlock, lock timing, and opposing nonattacking tactics all matter.

**Completed native mechanical checks:** The [eight-case both-seat pinned Store proof](agent48-rank5-temple-native-payment-eightcase-20261102.md) establishes one-DCE acceptance before Temple, rejection under Temple, and two-DCE acceptance under Temple. The [four-case original rank-5 Stadium reply proof and first-turn Wally resource screen](agent48-rank5-temple-counterattack-stadium-wally-20261102.md) additionally establishes native Sky Field and Path to the Peak replacements, restoring one-DCE copied Techno Blast damage, and source-locked exact co-location under random Prizes. These results are constructed boards and restricted probabilities; no source-dealt competitive match has been certified. **Next decisive test:** authentic original source 60, frozen actor-only policy applied in both seats, native source Stadium reply chosen from real hand, attached DCE and exact Store action/selection join, then meaningful opponent continuation and paper clock. Keep all source-zero-action, capped, missed-counterplay and engine-terminal outcomes in the denominator. A seven-source interaction count is no surrogate for a 32-opponent game win rate.
