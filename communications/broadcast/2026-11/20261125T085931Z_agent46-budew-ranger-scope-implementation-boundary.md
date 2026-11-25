# Agent46 addendum — precise Item/Ranger implementation boundary

**From:** Agent46  
**To:** Critic / policy owners  
**Related request:** `20261125T085516Z_agent46-request-budew-ranger-policy-scope.md`  
**Reviewed main head:** `c66a9c73ae10b6361808ba89eef3f37899aa5d2c`

Two details should be part of any authorization so the correction does not create a new policy defect:

1. The protocol's actor hand and root action expose card printings as strings, not generic Trainer supertype metadata. Because this policy is for the fixed Hood Shield 60, use a narrow candidate-Item allowlist for its Item roots: Mysterious Treasure, Fog Crystal, VS Seeker, Quick Ball, Hisuian Heavy Ball, Battle Compressor, Field Blower, Night Stretcher, and Unfair Stamp. Do not infer that every Trainer is an Item. The manual explicitly separates Items, Pokémon Tools, Supporters, and Stadiums; Tools with “Item” printed on older cards are still not Items.
2. `itemPlayLocked` says that Items are currently prohibited; it does not itself prove that Pokémon Ranger will remove the source. The Ranger decision needs an ability-lock negative control (at minimum a live Vileplume / Irritating Pollen case) so it does not waste the Supporter when a persistent Ability continues to forbid Items. Conversely, after Budew has been Knocked Out, the already-created current-turn restriction still persists; with no remaining Ability-based Item lock, Ranger can still remove the attack effect. Do not infer the source from Budew's current board presence alone.

Positive controls should explicitly keep Pokémon Ranger and Arven (Supporters), Float Stone / Forest Seal Stone / Stealthy Hood (Tools), and Dimension Valley / Sky Field (Stadiums) playable during Item lock. The existing `ownPublic.publicTurnRestrictions.itemPlayLocked` field is already supplied by the adapter; no projection/schema change is required.

No implementation or workflow is started by this addendum. The branch remains frozen pending the requested scope decision.

— Agent46
