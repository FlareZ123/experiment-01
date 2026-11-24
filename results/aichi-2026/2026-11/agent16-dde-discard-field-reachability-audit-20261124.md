# Aichi field reachability of the Double Dragon Energy host-type discard rule

**Agent16 — 24 November 2026.**

## Decision question

Does the separate paper rule that discards Double Dragon Energy (DDE) when its attached Pokémon ceases to be Dragon need to block simulation of the current Aichi Open League 2026 Top 32 field, or is it a generic engine-completeness gap with no reachable interaction in this benchmark?

## Method

- Read the canonical `results/aichi-2026/full-decklists.json`: 29 exact published lists, with ranks 23, 25 and 28 still missing.
- Identified the ten published lists containing DDE: ranks 10, 12, 13, 14, 18, 19, 20, 21, 27 and 32.
- Matched all 30 unique Pokémon printings in those ten DDE-bearing lists to the repository's exact `resources/cards/en/*.json` records and inspected their Abilities.
- Scanned the complete supplied card-pool archive for Ability, attack and Trainer-rule text that changes Pokémon type, distinguishes Pokémon types, or changes Energy type. Classified direct Pokémon-type changes separately from Energy-type changes, Weakness changes and type comparisons.
- Compared the known type-changing Pokémon / Trainer effects against all 29 published decklists. Verified the exact current-field printings that might look similar by name (Mew V/VMAX, Ditto Prism Star, Crobat V, Ho-Oh-EX, Fan Rotom SCR #118 and Rotom V LOR #58) against repository card JSON.

## Findings

### 1. No DDE host in the ten DDE lists has a type-changing Ability

The 30 exact Pokémon printings across the ten DDE lists have no Ability that changes that Pokémon's type. The generic dynamic-type controls used by PR #65 (Kecleon, Gallade and Magnezone) are not present in any of the 29 published lists.

The Energy-attachment effects present in the DDE-bearing lists do not change Pokémon type: Regidrago V's Celestial Roar, ADP-GX's Ultimate Ray, Sandy Shocks ex's Magnetic Absorption, Galarian Moltres V's Direflame Wings, Ho-Oh-EX's Rebirth and Tapu Koko Prism Star's Dance of the Ancients attach Energy but do not change the recipient's Pokémon type.

### 2. Known type-changing Pokémon effects are absent from the field

The card-pool scan found the expected self-type-changing families, including Kecleon, Venomoth, Ninetales, Porygon-Z, Mew (the older Type Change printing), Arceus LV.X, Lanturn, Slowbro, Magcargo, Kingdra, Lugia, Nidoking, Celebi, Crobat (Crystal Type printing), Ho-Oh (Crystal Type printing), Rotom (older Shift printings), Gallade, Magnezone, Carbink, Scovillain, Iron Treads, Hoopa V and Blaziken. None of those type-changing printings appears in the 29 published lists.

The superficially similar current-field printings are different cards with no Pokémon-type-changing effect: Mew V / Mew VMAX (Fusion Strike), Ditto Prism Star (Lost Thunder), Crobat V (Darkness Ablaze), Ho-Oh-EX (Dragons Exalted), Fan Rotom (Stellar Crown) and Rotom V (Lost Origin). Their exact repository records confirm this distinction.

### 3. The only direct type-changing Trainer effect found is own-side

Crystal Shard (repository record `ecard3-122`) says to attach it to one of **your** Pokémon and makes that attached Pokémon Colorless. No published Aichi list contains Crystal Shard. Even if one of the three missing opponent lists contained it, it could only change a Pokémon controlled by that opponent, not the DDE host on the other side.

The other global type-changing Abilities found (Flareon / Vaporeon / Jolteon) change **your** Stage 1 Pokémon. None of those cards appears in the published field, and an opponent's own-side Ability cannot change the opposing DDE host.

### 4. No opponent attack was found that changes the defending Pokémon's type

The full-pool attack-text scan found type comparisons, Energy-type references, status effects and attacks that change the Defending Pokémon's Weakness. It found no attack that changes the Defending Pokémon's Pokémon type. Weakness changes are not Pokémon-type changes and do not trigger DDE's Dragon-host restriction.

## Field-specific conclusion

**The DDE host-ceases-to-be-Dragon discard condition appears unreachable in the current Aichi benchmark.** The DDE-owning decks have no type-changing host Ability; the known own-side global / Tool type-changing effects are absent or cannot affect the opposing host; and no attack that changes an opponent's Pokémon type was found in the card pool. The three missing lists are opponents, so their own-side type-changing Abilities or Tools cannot change a DDE host controlled by the other player.

Accordingly, the ongoing DDE discard rule should remain documented as a **generic simulator completeness gap**, with a dedicated regression retained in the backlog, but it should not be treated as a field-specific blocker to Aichi matchup simulation once the independent Stage-A / Stage-B gates are satisfied. The same distinction applies to PR #65's preflight-before-AttachEnergyEffect ordering assumption: universal equivalence remains unproven, but no reachable Aichi DDE target-type change was identified.

## Limitations

- This is a static card-text reachability audit, not a Twinleaf state-transition test or proof of engine implementation.
- The supplied card-pool archive was scanned broadly; the exact Aichi decklists and key relevant card records were cross-checked against repository data. An independent full-pool scan would increase confidence.
- The three missing opponent lists remain unauthenticated. Their own-side effects cannot alter an opposing DDE host under the card text found, but the absence of a full list remains a separate source-coverage limitation.
- This does not resolve the generic DDE discard rule for other Expanded matchups, future card pools or synthetic game states.

## Proposed disposition

Reclassify the DDE host-type-change/discard regression from a hard Aichi-field simulation gate to a documented generic-engine follow-up, subject to independent review of this reachability audit. Do not claim that Twinleaf implements the rule; do not remove the regression from the general correctness backlog.
