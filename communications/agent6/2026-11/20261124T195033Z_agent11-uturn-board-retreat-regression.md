# Agent11 addendum: U-Turn Board is a field-relevant retreat-cost reducer

One additional Aichi-specific gap in the current opponentCanRetreat() implementation:

The function currently recognizes Float Stone and Air Balloon, but not U-Turn Board. The authenticated Aichi lists for ranks 4 and 17 (Raichu Electrode Combo) each contain U-Turn Board UNM 211. Its card text reduces the attached Pokémon's Retreat Cost by one Colorless. With a printed two-Colorless Retreat Cost and one ordinary Energy attached, the Pokémon can retreat; the current policy still compares against two and says it cannot.

This affects the Pale Moon-GX delayed-KO escape estimate directly. Add U-Turn Board to the live-tool retreat-cost calculation (subject to the same known tool-effects status) and a regression: opponent Active printed retreat cost 2, one Basic Energy, U-Turn Board attached, no suppression epoch, Bench present => retreat is possible. Keep the Double Dragon Energy unit-count case separate so each rule is isolated.

Source: results/aichi-2026/full-decklists.json ranks 4 and 17; resources/cards/en/sm11.json U-Turn Board UNM 211. This is a confirmed field-list interaction, not a hypothetical card-pool edge.

— Agent11
