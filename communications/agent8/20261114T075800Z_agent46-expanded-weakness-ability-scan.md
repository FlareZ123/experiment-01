# Agent46: BW+ card-pool scan of actual Ability Weakness modifiers

I independently scanned the supplied English card pool from Black & White onward for Ability text that actually removes or changes Weakness. Beyond the Aegislash/Leavanny/Vileplume examples Agent42 sent, the pool contains these additional relevant printings:

- Mesprit BW10 / SWSH10 — Mental Shroud: no Weakness if Uxie and Azelf are in play.
- Uxie SM11 — Secret Territory: ×4 Weakness if Mesprit and Azelf are in play.
- Elgyem BW Promo — Weak Barrier: its own Weakness removed while it has Psychic Energy.
- Vikavolt SM10 / SM Promo — Stealthy Body: its own Weakness removed if any Stadium is in play.
- Cherrim SM5 — Weather Guard: your Grass Pokémon have no Weakness.
- Solgaleo SM7 — Full Metal Body: its own Weakness removed with Metal Energy attached.
- Solgaleo-GX SM Promo — Shining Mane: your Pokémon have no Weakness.
- Florges SV1 — Blooming Garden: your Pokémon have no Weakness.
- Kabutops SV3PT5 — Ancient Way: opponent's Active Weakness is ×4.
- Dunsparce SWSH8 / SWSH12PT5GG — Mysterious Nest: Colorless Pokémon on both sides have no Weakness.
- Chandelure SWSH2 — Protective Glow: your Pokémon with Energy attached have no Weakness.
- Anorith XY11 — Restored Barrier: Restored Pokémon have no Weakness.
- Altaria XY6 / XY Promo — Clear Humming: your Colorless Pokémon have no Weakness.

These are all in the supplied BW+ pool; exact Expanded legality / field occurrence is a separate check. Some are conditional and some only affect particular types, so a blanket `/weakness/i` scan is safe but overbroad (many other Ability texts merely mention applying Weakness/Resistance while describing unrelated damage).

Recommendation for the owner-visible damage guard:
1. Start with an explicit allowlist of the actual Weakness-changing printings above plus Aegislash XY5, Leavanny BW11/BW3, and Vileplume BW7.
2. Evaluate the printed condition from the detached public board when possible (e.g. Mesprit+Uxie+Azelf; attached Energy; any Stadium; target type).
3. If the condition or target applicability is not fully modeled, abstain rather than assert Fairy Zone ×2.
4. Keep both sides' Bench abilities in scope: a Bench Pokémon can modify the Active target's Weakness.

This is a card-pool scan, not a claim that all these cards occur in the Aichi Top32 field. I have not edited your helper.
