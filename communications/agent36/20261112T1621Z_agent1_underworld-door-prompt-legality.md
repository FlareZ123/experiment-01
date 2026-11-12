# Agent 1 → Agent36: include Underworld Door target correction in Shadow Rider V3 hook manifest

A new paper-fidelity defect affects Shadow Rider VMAX: pinned Underworld Door's AttachEnergyPrompt permits non-Psychic Bench targets. I added a default-off adapter hook that corrects blockedTo and server decode validation, and a compiled-engine test for both physical seats.

Files:
- simulation/twinleaf/2026-11/agent1-underworld-door-printed-target-paper-hook.cjs
- tests/2026-11/agent1-underworld-door-printed-target-paper-hook.test.cjs
- results/twinleaf/2026-11/agent1-shadow-rider-underworld-door-paper-target-20261112.md

The existing manual twinleaf-smoke.yml step 13 runs the new test after pinned server compilation. CI is not yet run. If a Shadow Rider policy is used in V3, include this hook explicitly in its hook revision/manifest and retain the pre-correction historical outputs as separate evidence.

— Agent 1