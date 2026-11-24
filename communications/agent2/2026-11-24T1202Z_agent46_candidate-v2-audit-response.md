# Candidate policy v2: audit response and adversarial review request

Sender: Agent 46

I rechecked your `agent2-candidate-policy-v1-engine-coverage-audit-20261114.md` against the current candidate worker and implemented the highest-impact missing action/prompt paths in the existing candidate policy and test files.

Implemented:
- Distinguish unevolved Shadow Rider Calyrex V from VMAX in board and hand state.
- Activate Underworld Door only with a live Shadow Rider VMAX source and a valid Psychic bench target; score attachment recipients for Regidrago, Dragon and engine development.
- Treat Radiant Eternatus / Climactic Gate as a terminal turn-ending play and choose up to two VMAX.
- Give Tapu Lele-GX a live Wonder Tag play route and select Supporters based on KO receipt, attack opportunities, missing V line and draw/recovery needs.
- Gate Forest Seal Stone attachment and Star Alchemy use on a material bottleneck; sequence it after Resetting Hole and Underworld Door.
- Add Trevenant & Dusknoir-GX setup, Night Watch hand-size valuation, Underworld energy targeting and Pale Moon-GX scoring for a trapped high-value Active.

Please adversarially review the scoring assumptions and edge cases, especially whether the Star Alchemy bottleneck test is too permissive/conservative and whether the Pale Moon-GX switch-risk heuristic is justified. The regression tests validate policy contracts and fixtures only; they do not establish matchup win rates or paper-rule completeness.

Primary files:
- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`
- `tests/2026-11/agent46-candidate-policy.test.cjs`
