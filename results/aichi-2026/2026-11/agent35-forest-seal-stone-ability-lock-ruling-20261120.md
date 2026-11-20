# Forest Seal Stone's Star Alchemy under Ability suppression

**20 November 2026 — Agent35**
**Evidence class:** official-ruling-backed paper inference
**Scope:** Forest Seal Stone / Star Alchemy only; not a deck-strength result

## Finding

The official Japanese Pokémon Card Game Q&A directly confirms that a Pokémon V with Forest Seal Stone attached can use the Tool-granted VSTAR Power **Star Alchemy** under two relevant Ability-suppression effects:

1. While Spiritomb's *Dark's Shadow* Ability is active, a Basic Pokémon V with Forest Seal Stone may still use Star Alchemy.
2. While the Stadium *Path to the Peak* is in play, Unown V with Forest Seal Stone may still use Star Alchemy.

Both answers are explicitly “yes” in the official [Forest Seal Stone Q&A search](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E6%A3%AE%E3%81%AE%E5%B0%81%E5%8D%B0%E7%9F%B3&regulation_faq_main_item1=all), in the entries associated with Spiritomb and Path to the Peak. The [official Forest Seal Stone card entry](https://www.pokemon-card.com/card-search/details.php/card/42184/regu/DP) identifies Star Alchemy as the VSTAR Power granted by the Pokémon Tool. The local advanced manual's B-02 also states that Sword & Shield-era and earlier Pokémon Tools with “Item” printed on the card are **not treated as Items**. The local card-pool JSON retains a legacy `Item` subtype label for Forest Seal Stone, but under the manual it is a Pokémon Tool only: Arven can fetch it as the Tool target, not as the Item target.

## Consequence for the Enamorus / Shadow Rider hypothesis

Iron Thorns ex's Initialization suppresses Abilities on Rule Box Pokémon. Its scope matches the relevant Rule Box suppression in Path to the Peak's official Q&A. The Q&A therefore gives strong official-analogue support that **Forest Seal Stone's Star Alchemy remains usable under Initialization**. The attached Pokémon does not need Psychic Energy or Guardian of Love merely to preserve Star Alchemy through that lock.

The Spiritomb ruling independently demonstrates that a Pokémon Ability which suppresses Basic Pokémon Abilities does not stop the Tool-granted Star Alchemy. Taken together, these rulings support the interpretation that Star Alchemy is not treated as an Ability belonging to the attached Pokémon for these suppression effects.

## Garbotoxin is a different lock

No direct publisher Q&A pairing Garbotoxin with Forest Seal Stone / Star Alchemy was found. The official Japanese Garbodor FAQ describes Garbotoxin as removing Abilities written on cards in both players' play zones, hands and discard piles; unlike Path to the Peak and Spiritomb's Dark's Shadow, this is not limited to Abilities of Pokémon. Three independent Japanese practitioner sources (a 2023 Expanded tournament report, a deck-guide note, and a 2026 firsthand match account) report that Star Alchemy **cannot** be used while Garbotoxin is active. This is strong practitioner evidence plus a broader official card-text scope, but still not a direct publisher ruling for the exact pairing. The conservative paper-Expanded treatment is therefore: **Star Alchemy is likely suppressed by Garbotoxin**, while it remains supported under Path to the Peak / Initialization and Spiritomb's Basic-Pokémon Ability suppression.

There is also a simulator fidelity warning. The repository's current pinned Twinleaf submodule is still `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Agent30's source audit found Forest Seal Stone's Twinleaf implementation sets `exemptFromAbilityLock: true`, while Garbodor uses the standard ability-lock filter that respects that flag. Thus the inspected native implementation appears to let Star Alchemy escape Garbotoxin, contrary to the Japanese practitioner evidence. This is a static source inference, not a witnessed Store action outcome. Before using Twinleaf for the Garbotoxin matchups (the 29-list census has Garbodor in Aichi ranks 8, 11, 16 and 22; ranks 8, 16 and 22 are the Budew+Garbodor subset), require a both-seat Store check or a research-side hook in `simulation/twinleaf/`; do not modify upstream/vendor code. See [Agent30's source-vs-paper fidelity analysis](../agent30-garbotoxin-forest-seal-stone-rule-fidelity-gap-20261105.md).

## What this does not solve

- It does not bypass Item lock. Forest Seal Stone is a Pokémon Tool, but common access lines also need playable Items such as Fog Crystal or Hisuian Heavy Ball and may require an Arven turn.
- It does not establish that Enamorus V is accessible, that a Hooded Enamorus board is assembled, or that Guardian of Love protects the rest of the board.
- It does not establish the same-turn Guardian → Underworld Door restoration sequence.
- It does not validate the pinned Twinleaf implementation or any matchup.
- It does not justify changing the nominated 60 before the canonical V3 / first-trace stopline clears.

## Integration

This narrows the caveat in [Agent43's Enamorus board-shield report](agent43-enamorus-v-board-shield-hypothesis-20261117.md): Forest Seal Stone / Star Alchemy should not be treated as needing Guardian or attached Psychic Energy to function under Initialization. Keep the direct Garbotoxin boundary and all access / setup limitations. Agent43 was notified at [the direct handoff](../../../communications/agent43/2026-11/20261120T183314Z_agent35-forest-seal-stone-ability-lock-ruling.md).

No candidate list, policy, fixture, simulator, workflow, CI or Twinleaf revision was changed.
