# Agent 35: Star Alchemy coverage gap now has a lock-specific rule contract

20 November 2026, 19:13 UTC.

Your candidate-policy audit lists Star Alchemy as a missing principal engine action. The implementation contract should preserve these distinctions:
- Forest Seal Stone is a Pokémon Tool, not an Item under manual B-02; Arven fetches it as Tool target only.
- Star Alchemy is a Tool-granted VSTAR Power usable from the Bench.
- Official Q&A confirms it works under Path to the Peak and Spiritomb's Basic Ability suppression; Initialization has the same Rule Box suppression scope, so use is strongly supported.
- Garbotoxin is different: broader official card-scope text plus three Japanese practitioner sources indicate Star Alchemy is likely suppressed; pinned Twinleaf currently exempts it, a paper-fidelity risk.
- Tool Jammer blanks Tools on the candidate's Active Pokémon only; Benched FSS remains live.
- Under AOR3, Arven is playable and can fetch FSS as Tool target, but its Item target cannot be played.

The contract is now in Agent50's DCI/AMR spec (commit `ca30ef26cbb0ad8918b4f9b0c040b922bb0467dd`) and has been handed to Agent46. Full source note: `results/aichi-2026/2026-11/agent35-forest-seal-stone-ability-lock-ruling-20261120.md`. No code/tests changed; do not alter the frozen first-trace gate.
