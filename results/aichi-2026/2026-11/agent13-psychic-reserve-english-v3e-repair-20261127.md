# Psychic Reserve v3e: one exact English Expanded role-repair 60, still parked

**Agent 13 · 27 November 2026**  
**Decision affected:** whether Psychic Reserve can remain in the non-Shadow-Rider candidate queue after correcting its format conflict.  
**Evidence class:** exact fixed-60 construction, bundled English card-text/legality records, and previously established exact opening/mulligan analysis. **No game, policy implementation, native CI, or win-rate claim.**

## Decision

A complete English/international Expanded 60 **can** be constructed without changing the five-Basic Iron Thorns / Mimikyu shell:

- replace **Palace Book SMP NAN25** with **Rotom Bike SSH 181**;
- replace **Palace Belt BWP 153** with **Lucky Helmet AOR 77**;
- leave the other **58 physical cards unchanged**.

Machine-readable list: [Psychic Reserve v3e](agent13-psychic-reserve-english-v3e.json).

This corrects the earlier overly broad statement that there was no plausible English role repair. There is one.

The candidate remains **parked for policy investment**, however, because this repair does not address the larger structural objection: the deck still has only five Basic Pokémon and therefore retains the exact opening/mulligan burden already measured for v3. In addition, the two English substitutes are role-adjacent rather than text-equivalent, so the old v3 policy/native evidence does not transfer cleanly.

## Why these two replacements

The repository's bundled English card corpus resolves:

### Rotom Bike — SSH 181 / `swsh1-181`

- Trainer — Item;
- Expanded legality: **Legal**;
- printed effect: draw until the hand has six cards, then the turn ends.

This is a legitimate role-adjacent replacement for Palace Book because both are **Item draw effects that end the turn**. It is not a text-equivalent substitute:

- Palace Book draws exactly three;
- Rotom Bike draws to six, so its output depends strongly on current hand size;
- Rotom Bike can draw fewer than three or more than three;
- its optimal sequencing and DCI interactions therefore differ.

### Lucky Helmet — AOR 77 / `xy7-77`

- Trainer — Pokémon Tool;
- Expanded legality: **Legal**;
- while the holder is Active and is damaged by an opponent's attack, draw two cards.

This is a legitimate role-adjacent replacement for Palace Belt because both are **Active-position Tool draw engines**. Again, it is not text-equivalent:

- Palace Belt's role is an automatic beginning-of-turn extra draw while the holder remains Active;
- Lucky Helmet requires the opponent to damage the Active holder;
- the opponent can attack around it, gust around it, use non-damage effects, or Knock Out a strategically different target;
- the trigger timing is reactive rather than guaranteed every turn.

Therefore v3e is a real legal 60, but **not** “the same deck with English names.”

## Exact v3e 60

### Pokémon — 5

| Count | Card |
|---:|---|
| 4 | Iron Thorns ex — TWM 77 |
| 1 | Mimikyu — PAL 97 |

### Trainers — 44

| Count | Card |
|---:|---|
| 4 | Plumeria — BUS 120 |
| 3 | Guzma — BUS 115 |
| 2 | Guzma & Hala — CEC 193 |
| 2 | Team Flare Grunt — XY 129 |
| 2 | Lusamine — CIN 96 |
| 1 | Cynthia & Caitlin — CEC 189 |
| 1 | Team Skull Grunt — SUM 133 |
| 1 | Faba — LOT 173 |
| 1 | Eri — TEF 146 |
| 1 | Sidney — FST 241 |
| 1 | Gladion — CIN 95 |
| 1 | Lillie's Determination — MEG 119 |
| 1 | Team Rocket's Handiwork — FCO 112 |
| 4 | Crushing Hammer — POR 71 |
| 3 | Trainers' Mail — ROS 92 |
| 3 | VS Seeker — PHF 109 |
| 2 | Tag Call — CEC 206 |
| 2 | Enhanced Hammer — TWM 148 |
| 1 | **Rotom Bike — SSH 181** |
| 1 | Echoing Horn — CRE 136 |
| 1 | Megaton Blower — SSP 182 |
| 1 | Handheld Fan — TWM 150 |
| 1 | Tool Jammer — BST 136 |
| 1 | **Lucky Helmet — AOR 77** |
| 1 | Tropical Beach — BWP 50 |
| 1 | Thunder Mountain Prism Star — LOT 191 |
| 1 | Wondrous Labyrinth Prism Star — TEU 158 |

### Energy — 11

| Count | Card |
|---:|---|
| 4 | Speed Lightning Energy — RCL 173 |
| 2 | Capture Energy — RCL 171 |
| 1 | Spiky Energy — JTG 159 |
| 1 | Double Colorless Energy — SUM 136 |
| 1 | Jet Energy — PAL 190 |
| 2 | Basic Psychic Energy |

**Total: 60.**

## What does not change

Because the only two changes are Trainer/Tool substitutions, the v3 opening-Basic mathematics remain **exactly unchanged**.

The already-published exact screen therefore still applies:

- random initial seven contains a Basic: **47.4562%**;
- among valid openings, exactly one Basic: **79.0861%**;
- among valid openings, at least two Basics: **20.9139%**;
- among valid openings, Mimikyu but no Iron Thorns: **15.8172%**;
- across the 29 authenticated Aichi source lists, the equal-weighted mean maximum optional bonus-draw ceiling is **0.975 cards to the opponent vs 0.202 to the candidate**;
- **26/29** authenticated opponents have the higher optional-draw ceiling.

This remains the dominant structural reason to park v3e.

The count-only sensitivity in the same exact study crosses roughly field-neutral around **10–11 Basics**. Moving from five Basics to that range would require adding about five or six Basic Pokémon and cutting the same number of control/draw/resource slots. That is not an English-print normalization; it is a materially different architecture.

## Why prior v3 native evidence does not transfer

The earlier v1/v3 native A/B used the Japan-format v3 list and its old draw-tool semantics under an unqualified shared policy. Even if every other card and seed were identical:

- Rotom Bike's value depends on hand size and turn-ending timing;
- Lucky Helmet depends on whether the opponent damages the Active holder;
- an actor policy must decide when to expose Lucky Helmet, when to keep Tool Jammer/other Tools available, and whether ending the turn with Rotom Bike is better than using a Supporter or other Trainer sequence.

Those are not cosmetic differences.

The prior native A/B is still useful historical evidence that adding the second Psychic Energy can enable more Mimikyu lines in some cells. It is **not evidence that v3e preserves the old control performance**.

## Adversarial reason to keep it parked

The five-Basic burden is especially costly for a denial deck because the opponent often receives the extra setup resources.

That creates a strategic paradox:

- the deck's central plan is to reduce the opponent's options through Ability lock, Energy denial, hand disruption and Stadium/Tool pressure;
- but its own five-Basic construction frequently grants the opponent extra optional setup draws before the first normal turn;
- a role-adjacent Rotom Bike/Lucky Helmet repair does nothing to remove that initial resource donation.

A control architecture can still be worth this cost if its lock strength is extraordinary. The current repository does not have qualified evidence that Psychic Reserve's lock advantage is large enough to pay it.

## Reopening condition

Do **not** spend the next shared policy slot on v3e.

Reopen Psychic Reserve only if one of the following occurs:

1. a complete English Expanded redesign raises the Basic count materially while preserving a concrete denial engine, with explicit slot costs; or
2. a source-specific adversarial analysis demonstrates that the five-Basic shell's lock sequence is uniquely strong enough to justify the measured setup tax, followed by an actor-visible policy that can actually execute it.

Merely running the old v3 policy with Rotom Bike/Lucky Helmet is not enough.

## Architecture allocation consequence

The non-Shadow-Rider recommendation remains:

- **retain unchanged New Moon Lockbreaker v1** for the next policy-investment slot;
- **park Psychic Reserve v3e** despite having repaired its English format conflict.

This is now a strategic allocation decision rather than a legality-only rejection.

No qualified matchup or 99.5% claim is created.
