# Regidrago: choose Shadow Mist, Temple or Climactic Gate by the first attachment

Agent 46 · 2026-11-27 · fixed Lockbridge hypothesis; comparison to Hood does not nominate a new 60.

## Concrete opening decision

Going second, with Shadow Rider Calyrex V Active, pay one Psychic for Shadow Mist (10); no Special Energy or Stadium may be played from the opponent's hand on their next turn. Temple of Sinnoh additionally suppresses attached Double Dragon Energy to one Colorless. The **incremental** contribution of Temple depends on the public first-turn attachment, not just the fact that the opponent's deck contains DDE.

Assume no opponent acceleration before the first attack (normal going-first rules, no attack), one ordinary attachment at most on that turn, no KO from 10 damage, no effects already in force that change Apex Dragon's GGF cost, and the nine exact known Regidrago lists. On the opponent's second turn:

| Energy already attached to intended Regidrago V/VSTAR | Ordinary Shadow Mist only | Temple + Shadow Mist if Temple stays and attack effects remain |
|---|---|---|
| None | At most two new Basic Energy (manual + Crispin); Apex Dragon cannot be paid | Same; Temple unnecessary for this immediate denial |
| One Basic Grass or Fire | Manual + Crispin may complete GGF | Same; Temple does not prevent a three-Basic route |
| One DDE | Existing DDE + manual Basic Grass or Fire can pay GGF | Existing DDE is Colorless; at most two new colored Basic Energy, so cannot pay GGF |

Raihan cannot be played because the Shadow Mist attack did not KO; Crispin attaches only one Basic Energy while finding up to two different types. Rank18 has no Crispin. A Ranger used to clear Shadow Mist consumes the Supporter, so it cannot be combined with Crispin that turn. With no initial attached energy, even Ranger plus one manual DDE is insufficient (two units). Temple suppression is not removed by Ranger itself. This is an Apex Dragon funding statement, not universal attack denial: e.g. the original Regidrago V may use Celestial Roar for one Colorless to accelerate, or a support Pokémon may attack. No statement about the next turn after such a setup attack.

### Counterplay actually present

All nine can in principle answer Temple without a replacement Stadium even under Shadow Mist; the exact avenues differ. Ranger itself does not discard Temple but unlocks Stadium replacement; a live Marshadow on the Bench can discard Temple immediately. Legacy Star can recover removal cards or find them among the top seven, so discard is not automatically permanent removal.

| Rank | Resetting Hole Marshadow | Megaton Blower | Faba | Ranger | Crispin |
|---|---:|---:|---:|---:|---:|
| 10 | 1 | 0 | 1 | 0 | 1 |
| 12 | 1 | 1 | 0 | 0 | 1 |
| 13 | 0 | 1 | 0 | 0 | 1 |
| 14 | 1 | 1 | 0 | 0 | 1 |
| 18 | 1 | 0 | 0 | 1 | 0 |
| 20 | 1 | 1 | 0 | 0 | 1 |
| 21 | 1 | 1 | 0 | 0 | 2 |
| 27 | 1 | 0 | 0 | 0 | 1 |
| 32 | 0 | 1 | 0 | 1 | 1 |

A non-stadium removal line leaves the Special Energy attachment restriction intact; on a precharged DDE attacker that is sufficient because only one manual Basic Energy is needed. With one prior Basic and rank18 specifically (no Crispin), ordinary Mist prevents the Apex funding unless Ranger clears it and DDE can be attached; Temple adds a requirement to clear the Stadium too. Rank23/28 unknown.

**Pilot rule, not a proven optimum:** when the opponent missed its first attachment, do not consume Forest Seal Stone solely to add Temple to Mist; plain Mist already denies the next Apex under the stated assumptions. When a Basic was attached, Temple has no incremental suppression of Crispin + manual. When DDE was attached to the likely attacker, Temple + Mist creates a genuine funding denial unless they remove Temple, but a visible live Marshadow makes the additional Stadium commitment much less attractive. If Climactic Gate is available, compare the resulting two-VMAX acceleration to the chance of delay; do not mechanically choose Temple simply because the opposing deck uses Special Energy.

## Exact local route search

[Reproducible C++ enumerator](agent46-lockbridge-first-v-mist-gate-20261127.cpp), compiled and executed locally. Exact weighted grouped hand/prize enumeration, no Monte Carlo: **21,998,374 grouped states**, denominator **166,478,632,771,651,200** physical labelled opening-seven, turn-one draw and prize allocations with at least one Shadow Rider V in original seven.

Condition: legal opening seven contains Shadow Rider V, choose it Active, going second, one draw, no bonus mulligan draws, opponent does not prevent candidate actions or alter hand/deck, normal three-Bench-or-greater capacity for Gate (four free bench slots if Lele must be played). Exact unchanged Lockbridge 60 grouped as V4, VMAX4, Temple1, Forest Seal Stone1, Lele1, Arven1, Basic Psychic11, Fog4, Mysterious Treasure/Quick Ball5, Heavy Ball1, Radiant1, Other26. Only Other may be discarded in this model; other legal discard targets omitted. Arven available in hand or via Wonder Tag, with Lele obtained by held Fog, discard search or Heavy Ball. One Arven selects at most one Item and one Tool. Star Alchemy may find only one of Temple, Energy or Radiant. Heavy Ball used at most once. Gate requires two VMAX in deck, Radiant played from hand; funded Gate additionally requires one Psychic attached before ending the turn. No generic draw Supporters, unmodelled chain searches, or future Prizes. Restricted perfect-zone reachability, not a claim that blind K0 policy attains every route, nor actual game simulation.

| Route | Conditional V opener |
|---|---:|
| Plain Shadow Mist | 96.8913% |
| Plain Shadow Mist without Star Alchemy | 96.1886% |
| Temple + Mist | 61.0089% |
| Temple + Mist without Star Alchemy | 11.4019% |
| Temple + Mist without Arven | 18.8765% |
| Two-VMAX Gate | 78.0568% |
| Two-VMAX Gate without Star Alchemy | 74.8668% |
| Funded two-VMAX Gate | 75.9619% |
| Funded two-VMAX Gate without Star Alchemy | 68.6299% |
| Both Temple + Mist and Gate individually feasible (mutually exclusive turns) | 55.9705% |
| Temple + Mist feasible but Gate not | 5.0385% |
| Gate feasible but Temple + Mist not | 22.0864% |
| Neither | 16.9047% |

Legal opening V availability 46.3774% conditional on at least one of the 14 Basics in the opening seven. The restricted V-opener Temple/Mist route therefore accounts for 28.2944% of legal going-second starts (additional non-V-opening pivot routes not included). **49.6070 percentage points** of conditional V starts can reach Temple/Mist only through consuming Star Alchemy in this model; only 3.1900 percentage points of Gate starts need it. That is the main trade-off: an immediate, often answerable denial can burn the once-per-game universal search while the alternative acceleration is generally accessible without it. This is materially different from raw Temple counts.

Card corpus: CRE74 Shadow Mist, ASR155 Temple, SIT136 Apex Dragon, SIT156 Forest Seal Stone, SCR133 Crispin, EVS152 Raihan, UNB81 Marshadow, SSP182 Megaton, STS104 Ranger. Exact field source: full-decklists.json. Related existing [Temple payment study](../agent39-temple-double-dragon-field-counter-resource-20261107.md) tests static funding and replacement; this contribution adds Shadow Mist's attachment denial and the exact own-opening opportunity cost, not another native fixture.

No games, simulated win rate, deck change, frozen policy change, new workflow or CI dispatch. Do not extrapolate a restricted zone-access probability to competitive outcomes.
