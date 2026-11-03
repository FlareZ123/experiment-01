# Agent 9: rank-5 original owner K0 tutor/search odds versus hand-bloat at the same live Store root

**3 November 2026. Source-derived, conditional combinatorial model; zero competitively qualified games.** This analysis uses the true Aichi rank-5 Mew/Genesect printed 60 from `results/aichi-2026/full-decklists.json`, the physically observed owner hand/board/deck/Prize sizes at global turn16 seed465442104, and the original pinned Store [A/B/A artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41658633698/artifacts/13240534314). The [archived owner/public fixture](fixtures/agent9-rank5-turn16-public-owner-offer-v1.json), [pure exact-enumeration script](../../scripts/agent9-rank5-turn16-k0-lines.cjs) and [test](../../tests/agent9-rank5-turn16-k0-lines.test.cjs) preserve every input and computation. Source-run head `5a676e43607650f21883e9ca53280e5044ba70cb`; vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; exact two-seat physical deal SHA `27ca31d2d51f0dcb4513dbc7627c1e970d93440dfe30cda5b4cfa6ab4d0d4835`.

## What is known to the paper player at K0

The genuine owner has **14 cards in hand**, Dedenne-GX Active with no Energy, one Genesect V on Bench, **38 own deck cards** and **6 own Prize cards**. The owner has not executed a deck-search action before this root in the recorded control's root-action history; no other own card zones remain occupied, as 14+2+38+6=60. Opponent Mega Absol ex has one Darkness Energy, Latias ex and Trubbish on Bench, **6 Prize cards**, and neither player has a Stadium. The available hand includes **two Quick Ball FST**, **two Ultra Ball MEG**, **Trainers' Mail ROS**, Mew VMAX FST, Secret Box TWM, Special Red Card M4 and six other Trainers. No Mew V, Float Stone or Double Colorless Energy is in this hand or in play.

The original printed source 60 has **42 Trainers, 14 Pokémon, 4 Double Colorless Energy**; among those Trainers are 3 Trainers' Mail and 2 Float Stone. Of the 42 Trainers, 13 are known in hand, including one Mail. The **44 unidentified deck/Prize cards** partition exactly as follows:

| Unidentified card class | Cards |
| --- | ---: |
| Trainers other than Trainers' Mail (eligible Mail selections) | **27** |
| Other copies of Trainers' Mail (excluded from Mail's own selection) | **2** |
| Pokémon | **11** |
| Double Colorless Energy | **4** |
| **Total** | **44** |

This partition uses registered printing counts, the true owner hand and public occupied board, without inspecting the actual shuffled deck or face-down Prize identities. It also improves the coarse source-count Mail lower bound: because at most six of the 27 other eligible Trainers could be in Prizes, at least **21** eligible Trainers must be in the 38-card deck. The existing bridge used only the weaker, still correct **17** lower bound.

## Conditional probabilities

Treat the 44 remaining card positions as uniformly randomized given the printed list and owner-visible information. Before any new search, the top four of the owner's deck behave like a four-card sample without replacement from these 44 unknowns. The resulting exact finite-population probabilities are:

| Event | Conditional model probability |
| --- | ---: |
| Mail top four contains at least one eligible *other* Trainer | **98.24679008%** |
| Mail top four contains at least one Float Stone | **17.54756871%** |
| At least one of four Mew V remains in the 38-card deck for Quick Ball | **99.98895036%** |
| Next ordinary top-card draw is Double Colorless Energy **after successfully searching out one Mew V with Quick Ball and shuffling**, conditioned on Mew access | **9.33650616%** |

Formulas for the first three are `1 − C(17,4)/C(44,4)`, `1 − C(42,4)/C(44,4)`, and `1 − C(6,4)/C(44,4)`. For the final quantity, exclude the rare case of all four Mew V being Prized, condition the expected Double Colorless Energy count in the six Prizes on successful Mew availability, then divide the expected remaining deck Energy by **37** positions after the Mew search and shuffle. The script implements this conditional expectation exactly to floating precision and its pure tests pin the stated decimals.

These percentages are analytical properties of an idealized **K0 conditional random deal**. They are not frequencies from independent games or estimates of wins. They do not reflect the specific already-hidden deck order in the one native Store fixture, opponent behavior, any subsequent forced draws or shuffles, lock effects, or the strategic value of the revealed Trainer.

## Actual hand-bloat stops naive draw follow-through

Printed [Quick Ball FST237](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh8/237/) requires one additional hand discard, then searches a Basic Pokémon; playing the found Mew V onto the Bench after paying Quick Ball changes hand size **14 → 12**. This leaves two Fusion Strike Pokémon in play (Genesect V and Mew V). Printed Genesect V's **Fusion Strike System** draws up to that **2-card** hand size. Consequently the initial 12-card hand cannot draw through Genesect.

A second Quick Ball for the singleton Crobat V, followed by Benching Crobat, would shrink the hand **12 → 10** if Crobat remains unPrized. Crobat V's **Dark Asset** only draws up to **six** hand cards and therefore also produces **zero** cards immediately. At least five further net hand-card expenditures would be needed to get below six before Benching Crobat and generate any Dark Asset draw. This is a direct paper-text arithmetic limitation on an appealing search path; the target's presence in deck does not make its draw effect immediately realistic.

Similarly, Mail finding a Trainer **98.25%** of the time does not mean it finds a useful Trainer. The actual native intervention used it at this root and settled **Float Stone BKT**; that action later displaced control's Crobat V Bench without any observed attack payoff at the 90-root cap. The direct Quick Ball to Mew V setup line can establish a future evolution target with the already held Mew VMAX, yet **no immediate Energy or draw** follows from that single action. The 9.34% next-card Double Colorless chance is an energy-access component, with no implied attack or win probability.

## Comparison gate

For the next selected single bilateral policy, the same **unmodified original source owner root** supports four defensible intents: (1) Quick Ball, paying a deliberate actual hand card, to search a Mew V; (2) Mail to owner-revealed top-four Trainer with real Store prompt; (3) playable switch/Tool/Stadium/disruption actions, conditioned on printed limits and resources; and (4) Pass when strategically justified. Examine expected **complete next own attack** and the consequential opponent reply, with hand depletion and draw thresholds in the evaluation. The native enumerator's simultaneous omission of Mail and offering of dead Special Red Card M4 is separately documented in [the same-root proof](agent9-rank5-turn16-native-enumerator-bidirectional-20261103.md). The Japanese M4 Prize prerequisite is confirmed by the [official Japanese card catalogue](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all).

This is a **reusable source-root K0 methodology and an evidence-backed alternate-line stress test**. The source rank5 opponent is not a substitute for the project-wide 32 opponents. A 99.5% field game win rate has **not** been observed or established.
