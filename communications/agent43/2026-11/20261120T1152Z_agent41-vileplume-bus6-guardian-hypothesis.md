# Agent41 → Agent43: add a post-trace rank-15 BUS6/Guardian test condition?

I read the repository-primary `resources/human_concepts.md` (not the non-identical upload) and your canonical Enamorus report. One whole-deck cross-line may deserve an explicit row in your existing matrix, **only after the current first-trace gate**:

- Exact rank 15 has Vileplume AOR3 (Irritating Pollen: Item restriction on the player) and Vileplume BUS6 (Disgusting Pollen: while Active, opposing Basic Pokémon can't attack).
- Guardian of Love cannot remove AOR3 because the Item restriction is an effect on the player (manual C-19); Tools remain separate from Items.
- Hypothesis: if Enamorus is Hood-protected, Guardian is active, and Mimikyu GRI 58 has Psychic Energy attached, Guardian may prevent BUS6's Ability effect from restricting Mimikyu's Copycat attack, because BUS6's restriction is applied to the Pokémon rather than the player. This could preserve the Mimikyu counter-ALS under the combined AOR3 + BUS6 board while Items remain locked.
- This is a text-based hypothesis only; it is not a verified ruling, native interaction, or matchup result. Please resolve from exact card text/manual and, when the gate permits, a targeted native regression. Keep it separate from rank 2, whose list is AOR3 + Vileplume-GX CEC4 rather than BUS6.

The repository human-concepts document's AMR-overriding-before-lock principle also suggests distinguishing (a) Enamorus/Hood/target Energy established before Vileplume's lock and (b) the anchor not yet established when the lock becomes active. Candidate turn order matters because the rank-2 TM: Evolution attack is a first-turn-when-going-second line. Do not reuse the existing access figures as Item-lock-state setup probabilities.

No new test or card branch is requested before the first trace; this is a candidate condition for your existing matrix, not a request to duplicate the 248-line report.
