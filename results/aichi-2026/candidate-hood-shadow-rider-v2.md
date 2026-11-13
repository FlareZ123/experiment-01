# Hood Shield Shadow Rider v2 — Tapu Lele consistency challenger

**Agent 50 · 13 November 2026 · fixed 60-card structural hypothesis · untested in games**

[Machine-readable 60-card list](candidate-hood-shadow-rider-v2.json) · [v1 parent candidate](candidate-hood-shadow-rider.md) · [slot audit and calculations](2026-11/agent50-hood-shadow-rider-dialga-slot-audit-20261113.md)

## Fixed 60

### Pokémon (18)
- 4 Shadow Rider Calyrex V (CRE 74)
- 4 Shadow Rider Calyrex VMAX (CRE 75)
- 2 Lillie's Clefairy ex (JTG 56)
- 2 Tapu Lele-GX (GRI 60)
- 1 Trevenant & Dusknoir-GX (SMP 217)
- 1 Latias ex (SSP 76)
- 1 Mimikyu (GRI 58)
- 1 Girafarig (LOT 94)
- 1 Marshadow (UNB 81)
- 1 Radiant Eternatus (CRZ 105)

### Trainers (31)
- 2 Lillie's Determination
- 1 Iono
- 1 Teammates
- 1 Raihan
- 1 Acerola
- 1 Guzma
- 1 Pokémon Ranger
- 4 Mysterious Treasure
- 4 Fog Crystal
- 2 VS Seeker
- 1 Quick Ball
- 1 Hisuian Heavy Ball
- 1 Battle Compressor
- 1 Field Blower
- 1 Night Stretcher
- 1 Unfair Stamp
- 1 Float Stone
- 1 Forest Seal Stone
- 1 Sky Field
- 1 Dimension Valley
- 2 Stealthy Hood
- 1 Arven

### Energy (11)
- 11 Basic Psychic Energy

**Total: 60 cards.** The v2 retains 18 Pokémon, 31 Trainers, 11 Energy, and 14 Basic Pokémon. It preserves the v1 four Shadow Rider V, four VMAX, two Hood, Arven and all other card counts.

## Single change from Hood Shield Shadow Rider v1

- Remove 1 Dialga-GX (UPR 100).
- Increase Tapu Lele-GX (GRI 60) from 1 to 2.

This is a functional slot challenger, not a demonstrated strength improvement.

## Why test the change?

The bundled English card pool records Dialga-GX UPR 100 as a **Dragon-type, 180-HP Basic Pokémon with no Ability**. Its three attacks require Metal Energy:

- Overclock: 1 Metal.
- Shred: 1 Metal + 2 Colorless.
- Timeless-GX: 3 Metal + 2 Colorless.

The v1 list contains 11 Basic Psychic Energy and no Metal Energy. Psychic Energy can pay Colorless requirements, but it cannot pay the Metal symbols. Dimension Valley reduces the attack costs of Psychic Pokémon only; Dialga is Dragon-type. No card in this 60 supplies or changes Energy to Metal. Consequently Dialga has no payable attack in this list. It remains a searchable 180-HP two-Prize Basic body, so it is not literally blank: Mysterious Treasure can find it as a Dragon, and Latias ex can remove its Retreat Cost while Skyliner is active. Its possible value as a high-HP pivot must be weighed against its lack of an attack or Ability. Radiant Eternatus also has an unpayable attack in this Psychic-only list, but it stays because Climactic Gate is a core VMAX setup Ability; an unpayable attack alone is not a cut criterion. Dialga's distinct issue is that it has no Ability or documented engine role beyond its body, Dragon typing and discard/search utility.

Tapu Lele-GX is a 170-HP Psychic Basic with Wonder Tag: when played from hand onto the Bench, it can search any Supporter. Its Energy Drive attack costs two Colorless, payable with Psychic Energy, and Tapu Cure-GX costs one Psychic Energy. The second copy offers another live Supporter-search opportunity and a playable attack while preserving the same Basic count and Prize liability class. It loses 10 HP relative to Dialga and is still vulnerable to Ability suppression; this is not a strict upgrade in every matchup.

## Search access

The exact printed search text matters:

| Search card | Count | Dialga-GX (Dragon) | Tapu Lele-GX (Psychic Basic) |
| --- | ---: | --- | --- |
| Mysterious Treasure | 4 | Yes — Dragon Pokémon | Yes — Psychic Pokémon |
| Fog Crystal | 4 | No | Yes — Basic Psychic Pokémon |
| Quick Ball | 1 | Yes — Basic Pokémon | Yes — Basic Pokémon |
| Forest Seal Stone | 1 | Yes — once-per-game any card search | Yes — once-per-game any card search |
| Hisuian Heavy Ball | 1 | Only if in the Prizes | Only if in the Prizes |

The replacement adds four no-discard Fog Crystal outs to the second Tapu Lele, while retaining Mysterious Treasure access. Mysterious Treasure and Quick Ball still have discard costs; this table is a search-path inventory, not a probability that the line is playable in a real hand. The DCI/AMR of discard costs, Supporter contention, Ability lock, Bench space and K0/K1 Prize knowledge remain state-dependent.

## Exact direct-draw effects

Let (N=60), (B=14) Basic Pokémon, (t) be the number of Tapu Lele copies and (n) the number of cards seen. The raw probability of seeing at least one Tapu Lele is:

[
P(Tge1)=1-\frac{\binom{60-t}{n}}{\binom{60}{n}}.
]

The probability of a valid initial seven is (1-\binom{46}{7}/\binom{60}{7}=86.1409\%). Since Tapu Lele is itself a Basic, its probability conditional on a valid initial seven is its unconditional opening probability divided by this valid-opening probability.

| Direct access event | v1: 1 Tapu Lele | v2: 2 Tapu Lele |
| --- | ---: | ---: |
| Tapu Lele in initial 7, unconditional | 11.6667% | 22.1469% |
| Tapu Lele in initial 7, conditional on a valid Basic start | 13.5437% | 25.7101% |
| Tapu Lele in first 9 cards (opening 7 + two draws) | 15.0000% | 27.9661% |
| All Tapu Lele copies in six Prizes | 10.0000% | 0.8475% |
| At least one Tapu Lele outside the six Prizes | 90.0000% | 99.1525% |

These are exact hypergeometric card-location probabilities, not Wonder Tag activation rates or game outcomes. They ignore search effects, discard costs, mulligan bonuses, Ability suppression, Supporter availability and opponent actions. The v2 does not change the 14-Basic opening probability or the v1 V/VMAX/Hood counts, so the v1 restricted direct V-plus-VMAX setup figures remain unchanged.

## Costs and unresolved questions

- Tapu Lele has 10 less HP than Dialga. Identify whether any relevant opponent attack damage breakpoints make this loss material.
- Wonder Tag is an Ability and can be suppressed by Ability lock; measure activation and suppression by matchup rather than counting it as unconditional access.
- The second Tapu Lele is another Bench occupant. The v1 also used one slot for Dialga, so raw Bench occupancy is unchanged, but the value of the slot changes.
- Tapu Cure-GX competes with Trevenant & Dusknoir-GX's GX attack; only one GX attack can be used per game.
- The v2 may increase Supporter access while making the list more dependent on Ability access. Test against Iron Thorns/Garbodor and other Ability-lock lines.
- Dialga may have served as a deliberate 180-HP pivot or a high-DCI discard target. The card-text audit does not prove that its removal wins more games.

## Required comparison

Compare v1 and v2 under the same deck-aware policy, source deals, starting seats and opponent policies. Record:
1. Wonder Tag activation rate, Supporter found, and turns when no useful Supporter remains.
2. How often Dialga's 180 HP survives a breakpoint that would Knock Out Tapu Lele's 170 HP.
3. Tapu Lele suppression under Ability lock, including whether the second copy is still useful as an attacker.
4. Bench congestion and whether the additional Tapu Lele displaces a necessary Shadow Rider or support Pokémon.
5. Full-game wins, losses, ties, caps and censored games by opponent—not only opening consistency.

**Decision:** retain v1 as the current leading modified-list hypothesis and register v2 as a structural challenger. Do not nominate v2, merge the variants, or claim a matchup advantage without paired full-game evidence. Neither list has a paper-qualified competitive win-rate result, and neither establishes the 99.5% target.
