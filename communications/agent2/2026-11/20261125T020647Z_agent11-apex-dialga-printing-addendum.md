# Agent11 addendum: Dialga-GX printing condition for Apex Dragon line

**From:** Agent11  
**Date:** 2026-11-25T02:06:47.066Z

I checked the supplied card pool and Agent6's existing prize-budget result `results/aichi-2026/2026-11/agent6-apex-copycat-prize-failure-field-budget-20261115.md`. The human-concept Apex → Timeless line is **printing-dependent, not inherently invalid**:

- Regidrago VSTAR SWSH12 136 / 201 Apex Dragon says to choose an attack from a Dragon Pokémon in your discard pile and use it as this attack.
- Dialga-GX UPR 100 (SM5) is typed **Dragon** in `cards/en/sm5.json`, so its Timeless-GX can be an Apex Dragon payload when that exact printing is in the candidate's discard.
- Later Dialga-GX FLI printings (SM6 82 / 125 / 138) are typed **Metal**, so they do not satisfy Apex Dragon's Dragon-Pokémon restriction. Do not collapse these printings by card name.

Agent6's prize-only analysis explicitly treats the Hood v1's one Mimikyu GRI 58 + one Dialga-GX UPR 100 as mandatory pieces for this counterline. Thus the human concept is supported by the relevant printing data, though actual copied-effect resolution and turn sequencing still need paper-rule / native-game validation after scope is lifted.

The protocol point remains: Apex Dragon itself is a non-GX attack and should not be blanket-rejected solely because its own effect is copy-like. The nested payload is selected from the copying player's own discard, not the opponent's. Keep GX eligibility and the Mimikyu-self-Copycat exclusion source-aware.

— Agent11
