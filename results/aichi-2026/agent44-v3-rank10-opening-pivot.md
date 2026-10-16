# Agent 44: v3 rank-10 opening-pivot controlled comparison

**16 October 2026 UTC.** Evidence class: six fixed-source deterministic policy-control engine diagnostics. Neither result is qualified competitive gameplay or a win-rate measurement.

## Paired workflow evidence

- Baseline source-locked six trials: [workflow 38852887516](https://github.com/FlareZ123/experiment-01/actions/runs/38852887516), commit `6310a91added68738d693d5731ad6d4582840a56`, artifact **12025629963**, input `shadow_rider_opening_pivot=false`.
- One-flag counterfactual: [workflow 38853269947](https://github.com/FlareZ123/experiment-01/actions/runs/38853269947), commit `9c18f9e1f08184273d9f40f00644a22a0a678208`, artifact **12026475291**. The workflow log explicitly confirms `AICHI_OPENING_PIVOT: 1` and `AICHI_DIAGNOSTIC_SEED_PROTOCOL: decorrelated-slots-v3`. Both workflows succeeded.
- Identical three 60-card candidate inventories, Aichi rank-10 Regidrago opponent, `pilot` repeat 0, physical engine slots A and B, 600-action budget, fixed-core policy profile, v3 seed plan.
- The code revisions differ by intervening documentation edits, direct test additions and post-run archive-reporting safeguards. No deliberate opponent/candidate inventory change or further gameplay policy change was made by Agent 44 between these runs. Rechecking a full ordered trace and all third-party concurrent changes is necessary before calling them action-equivalent.

## Observed action-count / terminal-board comparison

Each cell is baseline → opening-pivot counterfactual. Both reports have six `completed-engine-game` records and zero independently qualified games.

| Trial ID suffix | Candidate actual turn | Candidate attacks | Opponent attacks | Terminal deck counts | Terminal Prize counts |
| --- | --- | ---: | ---: | --- | --- |
| champion-reference:A | Second | 3 → 3 | 4 → 4 | [13,18] → [13,18] | [2,0] → [2,0] |
| champion-reference:B | First | 4 → 4 | 3 → 3 | [26,24] → [26,24] | [0,4] → [0,4] |
| hood-shield-v1:A | Second | 3 → 3 | 2 → 2 | [39,32] → [39,32] | [0,6] → [0,6] |
| hood-shield-v1:B | First | 5 → 5 | 2 → 2 | [28,17] → [28,17] | [6,0] → [6,0] |
| temple-v1:A | Second | **0 → 0** | 7 → 7 | [19,17] → [19,17] | [6,0] → [6,0] |
| temple-v1:B | First | 5 → 5 | **0 → 0** | [37,31] → [37,31] | [6,0] → [6,0] |

Both runs recorded exactly **51 pass actions** and had zero post-choice pass probes because `audit_passed_attacks=false`.

## Interpretation

This intervention produced **no change to the reported attack counts, actual starting order, terminal remaining-deck counts, or terminal Prize counts** in these six v3 rank-10 cases. A bytewise-normalized comparison of the two downloaded diagnostic archives establishes **exact equality of all 438 captured meaningful action events across the six source-locked trials** (87, 75, 51, 99, 78 and 48 events). Every source trace SHA-256 verified against the stored digest. [The strict paired-comparison utility](../../scripts/aichi-frozen-policy-compare.cjs) and [its regressions](../../tests/aichi-frozen-policy-compare.test.cjs) provide a reusable audit for source, slot, flag, seed and trace identity. The event capture is still incomplete: a full prompt/reducer replay was not captured. In particular, the Temple A zero-attack trajectory and the Temple B opponent zero-attack trajectory persisted, without proving that the opening-pivot code did or did not trigger internally.

The result narrows the next question: inspect source-locked first-turn position and candidate choices in Temple A and characterize any attack options at its selected Pass actions through the existing detached Store pass-announcement probe. Avoid generalizing the negative pivot observation to different seeds, opponent ranks or startup states.

Full baseline [v3 pilot note](agent44-v3-rank10-pilot.md); generator/seed claims [v3 protocol note](agent44-v3-seed-protocol.md); past v2 rank-10 quality diagnosis [Agent 39](agent39-rank2-rank10-policy-diagnostic.md).
