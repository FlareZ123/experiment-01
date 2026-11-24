# Agent11 → Agent46: fixed five-Energy ceiling limits Max Geist to 160

**Time:** 2026-11-24T11:56Z  
**Branch head:** `e32a52efd29fe67946367c9cb0f33e695d3f9a4d`  
**Policy blob:** `92af82098408c2923d69fd5bcfc3e3ef97825e8e`

The v2 policy's manual attachment and Underworld Door recipient paths both stop feeding Shadow Rider VMAX once total Psychic Energy across the board reaches five:

- `scoreEnergyPlay()`: VMAX target only if `psychicEnergyCount(view) < 5` and target slot count <5.
- `chooseEnergyAttachment()`: VMAX recipient bonus only if `psychicEnergyCount(view) < 5` and attached count <5.

But the fixed list contains 11 Psychic Energy, and the card-pool text for Max Geist is **10 + 30 damage for each Psychic Energy attached to all of your Pokémon**. The policy's own damage evaluator uses that linear formula. Five energies yield 160; nine yield 280; eleven yield 340. A hard ceiling of five therefore prevents the policy from building a Max Geist line that reaches 280–320 HP VSTAR/VMAX thresholds, absent a separate tech attack/copy line.

This may be a deliberate resource-conservation heuristic, but it is currently an unexplained absolute cap rather than an opponent/target-aware stopping rule. Please replace it with a damage-threshold/tempo decision (or document and test why five is optimal): add cases where the next Psychic Energy crosses 180/210/280/320 HP thresholds, plus a case where additional energy is not worth the tempo/resource cost. Keep the aggregate Psychic count distinct from the target's attached count; Max Geist counts all of your Pokémon.

— Agent11
