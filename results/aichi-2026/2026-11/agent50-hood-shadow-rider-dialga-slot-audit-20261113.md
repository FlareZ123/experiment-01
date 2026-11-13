# Hood Shadow Rider slot audit: Dialga-GX versus a second Tapu Lele-GX

**Date:** 13 November 2026  
**Author:** Agent 50  
**Status:** structural candidate hypothesis; no game-strength evidence

## Question

Is the single Dialga-GX in the current Hood Shield Shadow Rider v1 candidate a high-value slot, or should the deck test a second Tapu Lele-GX instead?

## Card-pool finding

The exact source is the bundled English card pool, not an assumed type from the card name:

- `resources/cards/en/sm5.json`, Dialga-GX UPR 100: Dragon-type, 180 HP, no Ability. Its attacks are Overclock (Metal), Shred (Metal + 2 Colorless), and Timeless-GX (3 Metal + 2 Colorless).
- `resources/cards/en/sm2.json`, Tapu Lele-GX GRI 60: Psychic Basic, 170 HP, with Wonder Tag. Energy Drive costs 2 Colorless; Tapu Cure-GX costs 1 Psychic.
- `resources/cards/en/sm6.json`, Mysterious Treasure: searches Psychic or Dragon Pokémon, so it can search either card.
- `resources/cards/en/swsh6.json`, Fog Crystal: searches a Basic Psychic Pokémon or Psychic Energy. It can search Tapu Lele-GX, not Dialga-GX.
- `resources/cards/en/xy5.json`, Dimension Valley: reduces attack costs of Psychic Pokémon, not Dragon Pokémon.

The v1 list `results/aichi-2026/candidate-hood-shadow-rider.json` has 11 Basic Psychic Energy and no Metal Energy. Psychic Energy can satisfy Colorless symbols, but not Metal symbols. No card in this 60 supplies Metal Energy or changes Psychic Energy into Metal. Therefore **none of Dialga-GX's attacks is payable in this list**. This does not make Dialga a literal blank: it is a searchable 180-HP Dragon Basic body, can be found by Mysterious Treasure, and Latias ex can remove its Retreat Cost while Skyliner is active. Its value as a high-HP pivot or deliberate discard target is unproven. Radiant Eternatus also has an unpayable Power Beam attack (Fire + Darkness + Colorless) in this Energy suite, but remains essential because its Climactic Gate Ability searches two Pokémon VMAX and ends the turn. This is why the slot judgment is not based on attack-cost mismatch alone: Dialga has no Ability or other documented deck role beyond its body/typing/search/discard value.

Tapu Lele-GX is also a two-Prize Basic but offers Wonder Tag when played from hand onto the Bench, can find any Supporter, and has attacks payable with the deck's Psychic Energy. It is searchable by all four Mysterious Treasure and all four Fog Crystal, plus Quick Ball and the one-time Forest Seal Stone search. Dialga is searchable by Mysterious Treasure and Quick Ball, but not Fog Crystal. Thus the proposed replacement adds four no-discard search outs and another potential Wonder Tag activation, at the cost of 10 HP and Dragon typing.

## Candidate variant

Created a fixed 60-card challenger:

- [Hood Shield Shadow Rider v2 JSON](../candidate-hood-shadow-rider-v2.json)
- [Hood Shield Shadow Rider v2 human-readable list](../candidate-hood-shadow-rider-v2.md)

The only change is Dialga-GX 1 → Tapu Lele-GX +1. The v2 preserves 60 cards, 18 Pokémon, 31 Trainers, 11 Energy and 14 Basic Pokémon; it also preserves the four Shadow Rider V, four VMAX, two Stealthy Hood, Arven and all other counts. The v1 remains the current leading modified-list hypothesis; v2 is a challenger only.

## Exact direct-draw calculations

For (N=60), (t) Tapu Lele copies and (n) cards seen:

[
P(\text{at least one Tapu})=1-\frac{\binom{60-t}{n}}{\binom{60}{n}}.
]

The v1 and v2 each have 14 Basic Pokémon, so their valid-opening-seven probability is identical:

[
1-\frac{\binom{46}{7}}{\binom{60}{7}}=86.1409\%.
]

| Direct card-location event | v1 (1 Tapu) | v2 (2 Tapu) |
| --- | ---: | ---: |
| Tapu Lele in initial 7, unconditional | 11.6667% | 22.1469% |
| Tapu Lele in initial 7, conditional on valid Basic start | 13.5437% | 25.7101% |
| Tapu Lele in first 9 cards | 15.0000% | 27.9661% |
| All Tapu copies in six Prizes | 10.0000% | 0.8475% |
| At least one Tapu outside the six Prizes | 90.0000% | 99.1525% |

These are exact hypergeometric card-location probabilities, not search-chain probabilities, Wonder Tag activation rates, or match results. They do not model discard costs, Supporter contention, Ability lock, Bench congestion, or the value of Dialga's extra 10 HP. The v1 restricted V/VMAX/Hood setup probabilities are unchanged because none of those card counts changes.

## Strategic interpretation

The case for v2 is not merely “Tapu Lele is a better card.” It is that the v1 candidate spends one Basic slot on a Dragon with no Ability and no payable attack, while the deck has an all-Psychic energy suite and a dense Psychic search engine. A second Tapu Lele is an additional Supporter-access engine and is directly accessible through Fog Crystal as well as Mysterious Treasure. It also reduces the chance that all copies are Prized from 10% to 0.8475%.

The counter-case is real: Dialga has 10 more HP, is a Dragon-type body, and may be intentionally retained as a high-HP pivot or discard target. Tapu Lele's Wonder Tag is an Ability and can be suppressed; its GX attack competes with Trevenant & Dusknoir-GX's GX attack. The 10-HP loss may matter at specific damage breakpoints. This audit does not resolve those tradeoffs.

## Required paired test

Compare v1 and v2 with the same seeds, source deals, starting seats, policy versions and opponent field. Record by matchup:

1. Wonder Tag activations, Supporters found and turns when no useful Supporter remains.
2. Damage breakpoints where Dialga survives but Tapu Lele is Knocked Out.
3. Tapu Lele suppression under Ability lock and its value as an attacker while suppressed.
4. Bench congestion and whether the second Tapu displaces a necessary setup Pokémon.
5. Full-game wins, losses, ties, caps and censored games.

**Decision:** keep v1 nominated; register v2 for paired evaluation. Do not claim v2 is stronger, select it, or infer a matchup advantage from the card-text and draw-probability audit alone.
