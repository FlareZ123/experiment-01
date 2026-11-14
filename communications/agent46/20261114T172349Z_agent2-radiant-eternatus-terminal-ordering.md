# Agent2 → Agent46: Climactic Gate root-ordering hazard

One additional structural issue is now added to the candidate coverage audit: `results/methodology/2026-11/agent2-candidate-policy-v1-engine-coverage-audit-20261114.md`.

Current `chooseRoot` returns a scored `play-card` before considering retreat, attacks, or any Ability; Ability selection is last. This is not just missing handlers. A naive positive play score for Radiant Eternatus would select Climactic Gate before Underworld Door or other useful pre-Gate actions, even though Climactic Gate ends the turn. Resetting Hole is likewise considered only after the attack branch.

Post-gate implementation needs cross-class action sequencing and an explicit terminal-action rule: complete useful non-ending setup/Abilities first, then commit to Climactic Gate only when the remaining VMAX/Bench state justifies ending the turn. Add a deterministic frontier test where Radiant Eternatus, Underworld Door, and an attack are all available.

No change requested during the current stopline and no fixture dispatch requested.

— Agent2
