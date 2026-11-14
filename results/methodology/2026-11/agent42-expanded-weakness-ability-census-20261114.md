# Agent42 — Expanded Weakness-modifying Ability census for attack-policy guards

**14 November 2026 · Static card-pool enumeration · No game or matchup evidence**

## Question

Does the Max Geist owner-view damage guard account for all Expanded-legal Pokémon Abilities whose printed text can alter Weakness but does not contain the words `damage` or `prize`?

This matters because the candidate's Max Geist projection applies a Psychic Weakness multiplier to Dragon targets under Lillie's Clefairy ex's Fairy Zone. A board-visible Ability may remove Weakness, change the Weakness type, or change the multiplier without being caught by a guard that scans only for `damage` / `prize`.

## Method

- Input: supplied English card-pool archive, SHA-256 `c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a`.
- Enumerate every English card JSON in `cards/en/`.
- Keep Pokémon Abilities on cards whose `legalities.expanded` field is exactly `Legal`.
- Select Ability text matching `/weakness/i` but not matching `/damage|prize/i`.
- Deduplicate by card name, Ability name and exact Ability text; retain all legal printing identities.
- Reproducer: `scripts/agent42-expanded-weakness-ability-census.py`. It runs against the repository's `resources/cards/en` directory and emits deterministic JSON.

## Result

<badge color="warning">Guard coverage gap</badge>

<text strong>17 distinct Expanded-legal Ability texts across 27 printings</text> match the filter and therefore are not caught by a damage/prize-only Ability-text guard.

| Pokémon / Ability | Expanded-legal printings | Relevant printed effect |
|---|---|---|
| Aegislash — Miracle Guard | XY5 100 | Your Pokémon have no Weakness |
| Altaria — Clear Humming | XY6 74; XY46 | Your Colorless Pokémon have no Weakness |
| Anorith — Restored Barrier | XY11 56 | Your Restored Pokémon have no Weakness |
| Chandelure — Protective Glow | SWSH2 33 | Your Pokémon with Energy have no Weakness |
| Cherrim — Weather Guard | SM5 11 | Your Grass Pokémon have no Weakness |
| Dunsparce — Mysterious Nest | SWSH8 207; GG23 | Colorless Pokémon on both sides have no Weakness |
| Elgyem — Weak Barrier | BW Promo BW55 | This Pokémon has no Weakness while it has Psychic Energy |
| Florges — Blooming Garden | SV1 93 | Your Pokémon have no Weakness |
| Kabutops — Ancient Way | SV3pt5 141 | Opponent's Active Pokémon Weakness is ×4 |
| Leavanny — Leaf Tailor | BW3 3; BW11 12 | Your Pokémon with Energy have no Weakness |
| Lillie's Clefairy ex — Fairy Zone | ME2.5 76/280; SV9 56/173/184 | Opponent's Dragon Pokémon become Psychic-weak (×2) |
| Mesprit — Mental Shroud | BW10 37; SWSH10 66 | With Uxie and Azelf, your Pokémon have no Weakness |
| Solgaleo — Full Metal Body | SM7 99 | This Pokémon has no Weakness with Metal Energy |
| Solgaleo-GX — Shining Mane | Promo SM104/SM104a | Your Pokémon have no Weakness |
| Uxie — Secret Territory | SM11 83 | With Mesprit and Azelf, Weakness is ×4 for both players |
| Vikavolt — Stealthy Body | SM10 59; Promo SM208 | This Pokémon has no Weakness while a Stadium is in play |
| Vileplume — Allergy Panic | BW7 3 | Weakness is ×4 for both players |

The filter intentionally includes narrow/self-only Abilities as well as board-wide ones. It is a census of text the current guard does not recognize, not a claim that every row applies to every target.

## Consequence for the current Max Geist proposal

The current Agent8 helper's `opponentHasUnmodeledDamageOrPrizeText(view)` checks opponent-board Ability text for `damage` or `prize`, but not `weakness`. The enumerated cards show that this leaves a real class of public modifiers outside the fail-closed boundary.

For example, an opponent-Bench Aegislash with Miracle Guard has text that can affect the opponent's Active Dragon target's Weakness; it contains neither searched word. Separately, Vileplume Allergy Panic, Uxie Secret Territory and Kabutops Ancient Way change Weakness multipliers. The exact interaction/precedence between these Abilities and Fairy Zone should not be inferred from this census; it requires rules review and, where relevant, a pinned-Store regression.

**Recommended safe interim policy:** include `weakness` in the unmodeled Ability-text veto (or use a reviewed allowlist of explicitly modeled Weakness effects). Continue to require the host's native action validation. Only relax the veto for an individual Ability after its target scope, activation conditions, suppression interactions and ordering against Fairy Zone are represented and tested.

## Limitations

- This is a static enumeration of supplied English Expanded-legal Ability text, not a complete rules engine or a census of Stadium, Tool, attack, Supporter or Special Condition effects.
- The result does not prove any listed card appears in the Aichi field or any specific matchup.
- It does not resolve interactions between simultaneous Weakness-changing Abilities and Fairy Zone.
- No Twinleaf fixture, CI run, completed game, deck change or competitive win-rate claim was made.

## Related review

Agent42 sent the direct implementation finding to Agent8 in `communications/agent8/20261114T075700Z_agent42-weakness-modifier-guard.md`. Related post-Timeless policy findings are in the two Agent42 reviews immediately preceding it in that mailbox.
