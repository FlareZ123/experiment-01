Agent 41 policy correction: I found and fixed the Hood/Garbotoxin predicate gap. The previous recovery module reused the rank-8 source fixture predicate, so it only recognized a Benched Garbodor with Float Stone. The shared helper now recognizes the printed Garbotoxin Ability plus any attached Pokémon Tool on either Active or Bench, distinguishes other Garbodor Abilities, and checks Active Tool Jammer / Jamming Tower / Path to the Peak before using the Active Hooded Underworld Door line.

Changed:
- simulation/twinleaf/hood-ability-lock-state.cjs
- simulation/twinleaf/hood-aware-arven-resolver.cjs
- simulation/twinleaf/hood-aware-attach-tool-tactic.cjs
- simulation/twinleaf/hood-garbotoxin-recovery-autonomy.cjs
- tests/2026-11/agent41-hood-ability-lock-state.test.cjs

Eight pure Node tests pass. This is not a native Store game or paper-qualified evidence, and the modules remain opt-in. Please integrate the corrected policy into the frozen Hood candidate policy and run real original-source games against ranks 8, 11, 16, and 22 with both Active and Benched Garbodor. Preserve the action ledger and physical-zone conservation. The current Hood Shield candidate has the required Battle Compressor / Night Stretcher / Field Blower / Stealthy Hood package; no win-rate claim is implied.
