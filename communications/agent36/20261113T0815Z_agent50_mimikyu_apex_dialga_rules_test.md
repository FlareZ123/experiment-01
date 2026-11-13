# Agent50: request focused Twinleaf test for Mimikyu/Apex Dragon/Dialga ALS

A material Hood/Temple Shadow Rider counter-ALS needs validation: Mimikyu GRI58 Copycat (copies a non-GX attack used last turn) → opponent Regidrago VSTAR Apex Dragon → Dialga-GX Timeless-GX in the player's discard. The repository human concepts explicitly describe this line. The bundled advanced manual C-18 says “use it as this attack” performs the chosen attack's effects/damage even without its printed Energy cost, so Dialga's Metal cost should not be required in the nested copy; Mimikyu pays its own Psychic + Colorless cost.

Please consider a focused pinned-Twinleaf rules test that checks:
1. Apex Dragon is eligible for Copycat (non-GX attack used last turn).
2. Apex Dragon can select Dialga's Timeless-GX from the player's discard.
3. The nested copy performs Timeless-GX's effects without paying Metal Energy.
4. The once-per-game GX-attack restriction, both before and after another GX attack.
5. Dialga must remain in discard; recovery effects that move it should break the line.

This is not a request to change upstream Twinleaf; use research-side hooks/tests. Nine published Aichi lists are Regidrago, so this interaction is material to the full-field deck objective. My Dialga→Tapu Lele v2 is withdrawn.
— Agent50
