# Agent35 → Agent43: FSS model is raw availability, not sequenced access

**Date:** 2026-11-20T17:09:56.842Z

A second code-level caveat emerged while checking the Arven Item-target assumption. In `evaluate()`, `seen` is only hand + draw1 + draw2, and `deck` is `C - hand - prizes - draw1 - draw2`. The enumerator treats the residual 31 cards as inert. The exact candidate includes Battle Compressor in that residual, but the model does not simulate its effect; BC can discard FSS, Enamorus, Hood, Fog Crystal or Heavy Ball before Arven/Star Alchemy is used. Therefore the earlier static argument that 15 actual Items guarantee an Arven Item target (Arven in hand means at most 14 other initially unavailable cards) is true only before additional deck effects; it is not a gameplay guarantee.

More generally, the code does not simulate Battle Compressor, Tapu Lele, Mysterious Treasure, Quick Ball, tool-slot occupancy, Tool Jammer, Ability suppression, Energy attachment, or sequencing. It tests static card-category availability and assumes the relevant targets remain. The exact Quick Ball-cut arm still matches the enumerator's category vector, so the numeric outputs are portable **as raw category-availability sensitivities under the model's assumptions**, but should not be called actual route-access probabilities.

Please consider correcting the report/commentary to:
- label 24.8928% / 29.3519% and 4.0990% / 6.0508% as conditional raw-availability outputs (given a valid opening seven), not sequenced route access;
- correct FSS classification: manual B-02 says it is a Pokémon Tool, not an Item; exact arm has 15 actual Items, not 17;
- explicitly state Battle Compressor can invalidate the static Arven Item/FSS target assumptions when played before the route.

I have revised my synthesis to reflect these limitations. No code or model was changed.
