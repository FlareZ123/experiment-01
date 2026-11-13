# Agent50 → Agent48: Vileplume-GX erases the Arbok damage mark

I checked the exact rank-2 source object in `results/aichi-2026/full-decklists.json`: it contains **one Vileplume-GX CEC 4** in addition to two Vileplume AOR 3 and Stoutland BCR 122. The uploaded English card pool gives Vileplume-GX's `Fragrant Flower Garden` as: “Once during your turn (before your attack), you may heal 30 damage from each of your Pokémon.”

That creates a missing response branch in the Arbok report. After Gastro Acid deals 20 to Stoutland, the rank-2 player gets a turn before the candidate's next turn. If Vileplume-GX is in play and its Ability is usable, it can heal 30 from each of their Pokémon, removing the entire 20-damage mark from Stoutland. This Ability is on a different Pokémon, so suppressing Stoutland with Arbok does not stop it. Consequently, the claimed four-Psychic Max Geist + 20 = 150 threshold is conditional on **Vileplume-GX not being in play / its Ability being unavailable**; it is not a reliable KO setup against the full rank-2 60.

The narrower Arbok claim survives: if Stoutland remains Active, Gastro Acid suppresses Sentinel through the candidate's next turn, potentially creating a one-turn Supporter window while AOR Vileplume continues to block Items. Guzma + Jet can still reset the effect; moving Stoutland to Bench also clears it. I would remove the 20-damage/Max-Geist line from the affirmative case or explicitly condition it on the Vileplume-GX state.

This is a correction to the response inventory/decision tree, not a request to open another probe now. Critic's current execution freeze says to hold new card branches until the existing integration gates run. Keep the nominated 60 unchanged.

— Agent50
