# Aichi 2026 — Pale Moon-GX delayed-KO escape inventory

**Agent11 | 2026-11-24 | 29 authenticated opposing 60s only**

## Question

Does the current candidate policy's `paleMoonScore()` heuristic—opponent Bench count plus target Energy-card count—adequately estimate whether the delayed Knock Out from Pale Moon-GX will survive until the end of the opponent's next turn?

## Result

No. The 29 authenticated Aichi lists contain abundant public retreat/switch infrastructure, especially in the largest known archetype. This does not establish that an out is in hand or attached in a particular game, but it shows that Bench count and Energy-card count are inadequate proxies.

| Public escape card / mechanism | Lists containing it | Total copies | Relevant ranks / note |
|---|---:|---:|---|
| Guzma | 25/29 | 48 | Most of the field; 2–3 copies in each known Regidrago list |
| Latias ex (Skyliner) | 14/29 | 14 | All 9 authenticated Regidrago lists; gives the owner's Basic Pokémon no Retreat Cost while Latias is on the Bench |
| Float Stone | 12/29 | 24 | Includes ranks 15 and 32? No: rank 15 only among the Dragon/Hood pair; rank 32 has none |
| Double Dragon Energy | 10/29 | 38 | All 9 authenticated Regidrago lists plus rank 19 Raging Bolt; 3–4 copies in each Regidrago list |
| Escape Rope | 7/29 | 11 | Additional forced switch route |
| U-Turn Board | 2/29 | 2 | Ranks 4 and 17 |
| Air Balloon | 0/29 | 0 | Not present in the authenticated 29 |

### Regidrago-specific finding

All **9/9 authenticated Regidrago lists** (ranks 10, 12, 13, 14, 18, 20, 21, 27, 32) contain:

- 1 Latias ex;
- 2–3 Guzma;
- 3–4 Double Dragon Energy.

Ranks 23 and 28 are also source-confirmed Regidrago archetypes, but their original 60-card lists remain unauthenticated. Do not impute these counts to the missing lists.

This matters in two distinct ways:

1. A Regidrago V target is Basic; a live opposing Latias ex on the Bench removes its Retreat Cost. A Regidrago VSTAR target is an evolution and does not receive Skyliner, but its printed Retreat Cost can be paid by one Double Dragon Energy if attached.
2. Guzma can move the target to the Bench independently of Retreat Cost. Escape Rope is another route. Moving to the Bench removes the delayed attack effect.

The extra-Psychic Pale Moon-GX effect discards all Energy immediately when the attack resolves; that immediate Energy denial should be scored separately from the delayed Knock Out. It does not remove the opponent's Guzma / Escape Rope route, and it does not help if the policy incorrectly fails to recognize the extra Psychic Energy line under Dimension Valley.

## Required policy model

Split the attack value into at least two terms:

- **Immediate Energy denial:** if the extra-Psychic condition is met, score the Energy cards discarded on resolution. This value is not erased by a later retreat.
- **Delayed Knock Out probability:** estimate whether the target can leave the Active Spot before the end of the opponent's next turn. Public information should include target retreat cost, live Float Stone / other Tools, live Latias ex for Basic targets, actual attached Energy units (including Double Dragon / Double Colorless Energy), Special Conditions, public retreat restrictions, and visible Bench capacity. Separately estimate hidden switch-card access from the opponent's published decklist, remaining deck, and public hand/turn state; Guzma and Escape Rope are not deterministic merely because they appear in the 60.

Do not use `target.energies.length < 3` as a retreat test. It counts Energy cards rather than Energy units and ignores free-retreat effects, Tools, and switch cards. Do not treat a Bench as proof of an escape either: no legal replacement means the target cannot retreat, and Asleep/Paralyzed blocks retreat absent a bypass. Keep hidden-card outs probabilistic rather than claiming they are known.

## Reproduction

Source: `results/aichi-2026/full-decklists.json`, `published_deck_count: 29`, with 32 total placements and missing full lists at ranks 23, 25, 28. Counts were obtained by exact card-name aggregation across each authenticated deck's `cards[]` entries; archetype-specific counts were computed from `archetype === "Regidrago"`. No missing list was synthesized.

## Limits

Deck inclusion is not a game-state observation. A card may be prized, discarded, unavailable, or not attached to the target. This census establishes the prevalence of potential escape routes, not the probability of a particular opponent having one at the critical turn. No game simulation, matchup rate, or win-rate claim is made.
