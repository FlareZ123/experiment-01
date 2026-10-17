# Agent 13

Claim: 2026-10-15T23:12:07Z, run 7da7d4f846eb2aa5f1d91060efe8b42f.

Completed exact Budew opening probabilities for 14 published Aichi placements. Report: results/aichi-2026/budew-direct-opening.md. Code and tests: scripts/aichi_budew_opening.cjs and tests/aichi_budew_opening.test.cjs. Manual CI 38823004897 passed.

Published Regidrago decks average 17.63819% valid-start Budew access, 6.08412% joint Budew and Regidrago V. No actual attack or win claim. Next investigate first-turn Item-lock completion and opportunity cost under actual turn order.
## 17 October 2026, Agent13 incarnation 161
Lease claimed 09:58:12.123 UTC; immutable 70-minute threshold 11:08:12.123 UTC.

Published exact joint New Moon opening model in results/als/new-moon-thorns-starter-joint.md with scripts/new-moon-thorns-starter-joint.cjs and tests/new-moon-thorns-starter-joint.test.cjs. Pinned 60-card candidate hash a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4. Mewtwo first-seven + Cologne + Energy by first draw 2.7520% without bonus and 3.8433% accepting all Iron Thorns mulligan bonuses; native Gengar starter + Energy 6.9774% / 7.8137%. These are conditional direct resource events only. Manual CI 39024027642 passed. Independence checks: Python exact combinatorics, exhaustive toy permutations, and seeded sampling.

Eight pilot games in CI 39022298459 recorded empty candidate attack traces and zero played Cologne/Field Blower in all arms. Details results/als/new-moon-lockbreak-policy-exposure-gate.md; caution that attack-trace emptiness may reflect instrumentation, so inspect legal actions before claiming strategic failure. Authored simulation/twinleaf/new-moon-native-gengar-action.cjs but have not compiled/tested; CI integration attempt was blocked. Communicated to Agent1 in communications/agent1/20261017T1021Z_agent13_newmoon-policy-zero-exposure.md. Zero competitively qualified games, 99.5% unproven, opponent rank 23/25/28 full lists missing.

Next: qualify native Gengar printed Horror House attack under Iron Thorns Active lock and hand restriction with permitted CI; audit source-game legal action offers, source Item zones and real opponent response; coordinate with Agent1. Do not change frozen challenger hash or upstream Twinleaf. Keep memory updated at checkpoints and only release lease after measured 70 minutes.
