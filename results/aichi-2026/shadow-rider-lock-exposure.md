# Shadow Rider Calyrex baseline: exposure to Aichi disruption

**Status:** source-backed static analysis of the [published 60-card champion reference](benchmark-shadow-rider.md). This is neither a played-match result nor a proposed optimized replacement.

## Trainer-type accounting

Card subtypes were checked against the bundled English card snapshot. For older printings, a Pokémon Tool may also have an `Item` subtype in the database; under the Advanced Player's Rulebook B-02, a Pokémon Tool is treated as a Tool, rather than as a playable Item. The field's `Battle Compressor` PHF 92 is titled `Battle Compressor Team Flare Gear` in the English snapshot, so it was counted by verified set/number and effect.

| Function | Count | Named cards |
| --- | ---: | --- |
| Items | **17** | Mysterious Treasure ×4, Fog Crystal ×4, VS Seeker ×3, Quick Ball ×1, Hisuian Heavy Ball ×1, Battle Compressor ×1, Field Blower ×1, Night Stretcher ×1, Unfair Stamp ×1 |
| Supporters | **9** | Lillie's Determination ×2; Carmine, Iono, Teammates, Raihan, Acerola, Guzma, Tulip ×1 each |
| Pokémon Tools | **2** | Float Stone ×1, Forest Seal Stone ×1 |
| Stadiums | **3** | Sky Field ×2, Dimension Valley ×1 |
| **Total Trainers** | **31** | |

A resolved opponent Item lock disables playing the 17 Items while the effect applies, including Mysterious Treasure, Fog Crystal, VS Seeker and Battle Compressor. These cards comprise 17 of the 60 slots, or 28.33% of the deck, and 54.84% of its Trainers. The figures indicate **resource exposure only**. Items may have been used before lock, and Supporters, Tools, Stadiums, and Pokémon Abilities may provide other actions.

## Critical Ability dependencies

- **Shadow Rider Calyrex VMAX ×4:** Underworld Door attaches Psychic Energy from hand to a Benched Psychic Pokémon and draws two cards if the attachment happened. Each VMAX has a Rule Box, and this Ability may be suppressed by active Iron Thorns ex or Tool-enabled Garbotoxin.
- **Tapu Lele-GX ×2:** Wonder Tag supplies Supporter access upon playing the Pokémon from hand onto the Bench. It is an Ability on a Rule Box Pokémon and is vulnerable to the same locks.
- **Radiant Eternatus ×1:** Climactic Gate can establish up to two VMAX directly from the deck when this Pokémon is played from the hand onto the Bench, with the cost that using it ends the turn. This Ability belongs to a Radiant Pokémon with a Rule Box and can likewise be suppressed.
- **Latias ex ×1:** Skyliner gives Basic Pokémon no Retreat Cost. Under Snorlax's Block, however, the restriction on retreat itself applies even when the Retreat Cost is zero. Rule Box Ability lock may also turn off Skyliner.
- **Forest Seal Stone ×1:** A Tool granting access to Star Alchemy on a Pokémon V. Item lock alone does not prevent attaching a Tool, but relevant Ability suppression can prevent using its granted Ability.

The nominal count of 4 Underworld Door Pokémon is not four immediately available uses. The game must establish the VMAX, supply Psychic Energy in hand, satisfy Bench and other conditions, and avoid ongoing Ability suppression.

## High-priority matchup state fixtures

| Published opposing rank | Threat state | What a simulator must demonstrate |
| ---: | --- | --- |
| 10 (Regidrago) | Budew's Itchy Pollen resolves going second | On the opponent's subsequent turn, the Shadow Rider player cannot play Items, but can still play a Pokémon Tool absent another prohibition; lock ends at the correct time |
| 2 (Vileplume Control) | Vileplume AOR 3 has live Irritating Pollen; Stoutland BCR 122 may occupy Active | Item lock applies to both players; Supporter lock applies to the opponent of an Active Stoutland, with independent positional and Ability dependencies |
| 6 (Iron Thorns) | Iron Thorns ex is Active with Initialization | Rule Box Abilities such as Underworld Door, Wonder Tag, and Skyliner are suppressed; non-Rule Box and Future exceptions remain faithful to card text |
| 8 (Absol Garbodor) | Garbodor LTR 68 has a Tool attached | Underworld Door and other covered Abilities become unavailable; removing the attached Tool or disabling Garbotoxin changes the legal action set |
| 3 (Snorlax Stall) | Snorlax PGO 55 is Active with Block | Free Retreat Cost does not override an explicit ban on retreat; separately validate legal card-effect switching |
| 15 (Lopunny Vileplume) | Vileplume BUS 6 is Active | Basic Pokémon attack prohibition is respected while Evolution Pokémon attacks remain eligible under otherwise valid conditions |

## Evidence limits and optimization implications

The [seven-effect field inventory](disruption-inventory.md) finds at least one selected disruption printing in 20 of 29 published opponent lists. Every published Regidrago list contains Budew. None of those observations establishes which lock is assembled, how early it resolves, how long it survives, or whether Shadow Rider wins or loses the matchup.

A useful next comparison would preserve the fixed candidate and measure setup/attack rates after verified opponent lock transitions in both starting seats, including Prize cards, pre-lock Item use, defensive Bench placement and relevant Supporter decisions. The present champion benchmark remains unoptimized and untested in actual match trials.
