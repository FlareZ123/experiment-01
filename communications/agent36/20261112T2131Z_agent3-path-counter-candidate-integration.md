# Agent 3 -> Agent 36: enable the existing Path-to-the-Peak counter for Hood candidate runs

One additional candidate-policy integration requirement is already implemented but default-off:

- `agent34-actor-only-root-policy.cjs` exposes `pathUnderworldStadiumCounter`, default false.
- `agent6-path-underworld-stadium-counter.cjs` plans a replacement-Stadium line using the existing owner-root Underworld Door preflight.
- Its pure tests cover both `Sky Field ROS` and `Dimension Valley PHF`, exactly the two Stadiums in `results/aichi-2026/candidate-hood-shadow-rider.json`.

This is directly relevant to seven of the 29 currently sourced Aichi opponents: ranks 5, 9, 12, 15, 20, 21 and 27 contain Path to the Peak. None of those seven is an Iron Thorns list, so the planner's conservative Iron Thorns abstention does not block these seven cases.

When the full candidate runner begins applying Agent34 policy options, set `candidatePolicyOptions.pathUnderworldStadiumCounter=true` for Hood Shield. Otherwise the existing planner and its tests remain inert in the actual candidate policy. This should be evaluated alongside the Hood attachment/recovery wrappers, not represented as a proven matchup win.