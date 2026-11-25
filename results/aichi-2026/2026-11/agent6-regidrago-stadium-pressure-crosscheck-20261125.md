# Regidrago stadium pressure on Hood Shield Shadow Rider's Fairy Zone / Max Geist route

**Agent 6 · 25 November 2026**

## Finding

The published Regidrago slice of the Aichi Top 32 has a concentrated Stadium interaction that directly threatens the candidate's Fairy Zone / Max Geist route and its expanded Bench:

- **Parallel City:** 7 of the 9 published Regidrago lists.
- **Ability-suppressing Stadium:** Path to the Peak in 4/9 and Silent Lab in 2/9; all six of these lists also contain Parallel City.
- **Sky Field:** the remaining 2/9 lists (ranks 14 and 18).
- **Megaton Blower:** 6/9 lists (cross-reported in Agent17's field-pressure report).
- The two missing Regidrago lists are ranks 23 and 28, so these are **9/11 known Regidrago inventories**, not a complete family rate.

This is a deterministic inventory cross-check, not a matchup result or win-rate estimate.

## Exact published-list slice

Source: `results/aichi-2026/full-decklists.json` (29 published inventories; ranks 23, 25 and 28 missing). The nine published Regidrago lists are ranks 10, 12, 13, 14, 18, 20, 21, 27 and 32.

| Rank | Stadium(s) | Ability lock | Megaton Blower | Other relevant item |
|---:|---|---|---:|---|
| 10 | Parallel City | — | — | Faba ×1 |
| 12 | Parallel City | Path to the Peak | 1 | — |
| 13 | Parallel City | Silent Lab | 1 | — |
| 14 | Sky Field | — | 1 | — |
| 18 | Sky Field ×3 | — | — | — |
| 20 | Parallel City | Path to the Peak | 1 | — |
| 21 | Parallel City | Path to the Peak | 1 | — |
| 27 | Parallel City | Path to the Peak | — | — |
| 32 | Parallel City | Silent Lab | 1 | — |

Aggregate counts from these nine exact inventories:

| Card / family | Lists | Interpretation |
|---|---:|---|
| Parallel City | 7/9 | Potential actor Bench cap of 3, depending on the chosen arrow |
| Path to the Peak | 4/9 | Suppresses Rule Box Abilities on both sides |
| Silent Lab | 2/9 | Suppresses Basic Pokémon Abilities on both sides |
| Path to the Peak or Silent Lab | 6/9 | All six also contain Parallel City |
| Sky Field | 2/9 | The two non-Parallel-City lists |
| Megaton Blower | 6/9 | Stadium removal plus all opposing Pokémon Tools and Special Energy |
| Muscle Band | 9/9 | Damage modifier, not an HP increase |
| Big Charm / Hero's Cape / Jamming Tower | 0/9 | No listed HP-increasing Tool in this published subset |

The 7/9 Parallel City and 6/9 ability-lock counts must not be extrapolated to the two missing Regidrago inventories.

## Interaction with the registered candidate

The exact registered `candidate-hood-shadow-rider.json` contains:

- Lillie's Clefairy ex ×2; Shadow Rider Calyrex VMAX ×4; Shadow Rider Calyrex V ×4.
- Basic Psychic Energy ×11.
- Sky Field ×1 and Dimension Valley ×1.
- Field Blower ×1 and Marshadow ×1.
- Mimikyu GRI 58 ×1; Stealthy Hood ×2.

Agent11's [Max Geist / Fairy Zone threshold](agent11-regidrago-max-geist-fairy-zone-threshold-20261125.md) is correct as a card-text derivation: with Fairy Zone active, five Psychic Energy attached across the candidate's Pokémon produces 320 damage to a Dragon Pokémon, enough to Knock Out the listed 280-HP Regidrago VSTAR. Without Fairy Zone, the raw Max Geist threshold is nine Psychic Energy for 280 damage. The published Regidrago lists contain no Big Charm or Hero's Cape, but this does not account for damage reduction or other in-game effects.

The six Path/Silent Lab lists create two different ability-lock states:

- **Path to the Peak:** Lillie's Clefairy ex is a Rule Box Pokémon, so Fairy Zone is suppressed; Shadow Rider Calyrex VMAX is also a Rule Box Pokémon, so Underworld Door is suppressed. Marshadow is not a Rule Box Pokémon, so Resetting Hole is not disabled by Path to the Peak.
- **Silent Lab:** Lillie's Clefairy ex is Basic, so Fairy Zone is suppressed; Shadow Rider Calyrex VMAX is evolved, so Underworld Door is not disabled by Silent Lab. Marshadow is Basic, so its Resetting Hole Ability is suppressed while Silent Lab remains in play.

Stealthy Hood prevents effects of opposing Pokémon Abilities on the attached Pokémon; it does not prevent Stadium text. It therefore does not preserve Fairy Zone or Underworld Door through Path to the Peak / Silent Lab.

Mimikyu GRI 58's Copycat is an **attack**, not an Ability. Neither Path to the Peak nor Silent Lab suppresses the attack itself. Its separate requirement that the opponent used a non-GX attack during the previous turn still applies; the current PR #71 receipt gate is intended to keep that eligibility check evidence-based. This gives the Copycat route a different Stadium vulnerability from the Fairy Zone / Max Geist route.

## Stadium and Bench resource contest

The candidate's two Stadiums are single copies. Seven of nine published Regidrago lists have Parallel City, and six have Megaton Blower. A Parallel City played with its arrow pointing at the candidate can reduce its Bench capacity to three; the exact actor-relative orientation is now represented by the shared capacity helper in PR #71. The two published Sky Field Regidrago lists also show that eight-slot Bench states are present in the field, not only in the candidate.

Megaton Blower can discard a Stadium in play as well as all Pokémon Tools and Special Energy from the opponent's Pokémon. It can therefore remove the candidate's Sky Field and both attached Hoods in one play if they are exposed. Agent17's [field-pressure report](agent17-hood-shield-field-pressure-risk-20261117.md) already documents the wider Aichi Tool-removal counts; this note isolates the Regidrago Stadium / Ability-lock overlay rather than repeating that inventory.

The candidate's direct Stadium answers are limited to Field Blower ×1 and Marshadow Resetting Hole ×1, plus playing its own Sky Field or Dimension Valley from hand. Field Blower is an Item and is unaffected by Path to the Peak / Silent Lab; Marshadow's Resetting Hole is an Ability on a Basic Pokémon, so Silent Lab disables it while Path to the Peak does not. Sky Field leaving play also forces each player to discard Benched Pokémon until five, with the Stadium owner discarding first. Capacity estimation alone does not choose which Pokémon to lose or preserve Gate's terminal slots.

## Implications and limits

1. Treat Stadium state as a primary Regidrago matchup resource, not cosmetic metadata. Parallel City, Path to the Peak, Silent Lab and Megaton Blower interact with the candidate's Bench, Fairy Zone, Underworld Door and Hood package in different ways.
2. Model two distinct Max Geist conditions: five Psychic Energy when Fairy Zone is active; nine when it is not. Under Path to the Peak, both Fairy Zone and Underworld Door are off; under Silent Lab, Fairy Zone and Marshadow's Resetting Hole are off but Underworld Door remains usable.
3. Preserve the separate Copycat line: its attack is not disabled by either Ability-lock Stadium, but eligibility still depends on the opponent's prior-turn attack and the receipt gate.
4. Do not assume Sky Field removal merely changes the future Bench limit; its printed leave-play clause forces a discard down to five. The policy must account for that state transition and the finite Stadium answers.
5. Do not change the fixed 60 from this inventory alone. No simulator game, fixture, matchup sample, or win-rate estimate was produced.

**Evidence classification:** exact source-list counts and card text; deterministic arithmetic and rules-text implications; strategic hypotheses for later full-field testing. The two missing Regidrago lists and all natural access / sequencing probabilities remain unknown.
