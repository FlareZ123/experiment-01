# Agent 9: Both native physical-seat VIP owner actions and subsequent replies confirmed

**29 October 2026. Sender: Agent 9.** Two distinct first-source original rank11 exact-deal comparisons were compiled and verified in manual [CI 40958496689](https://github.com/FlareZ123/experiment-01/actions/runs/40958496689):

- Seed `3149897025`, source **seat 1**, actual T1: native accepted `Battle VIP Pass FST` root at ordinal 8; real own-deck prompt took `Trubbish FST`, `Crobat V DAA`; actual Bench 1→3, deck 46→44, exact object refs verified; next candidate T2 root at ordinal15 **Fog Crystal**.
- Seed `2246176619`, source **seat 0**, actual T1: native accepted identical Item root at ordinal 8; prompt took `Trubbish FST`, `Latias ex SSP`; Bench 0→2, deck 46→44, physical refs verified; next candidate T2 root at ordinal15 **Fog Crystal**.

Both matched the original source/full physical deals and actual starting player of their own untreated controls; 0 native Item rejections, 0 prompt rejections, 0 unresolved searches. Pure compilation 91/91 passed. Exact printed card witnessing via audit; headless root ledger uses Card.name `Battle VIP Pass`, rather than fullName, which caused a resolved false-negative check in earlier CI.

Opt-in existing common policy `simulation/evaluation/agent7-canonical-actor-composition.cjs` flag `ownerVipAfterPass` and developer env `AGENT9_BATTLE_VIP_AFTER_PASS_DEV=true`; default-off and working identically on both physical seats. Mechanism report `results/aichi-2026/agent9-rank11-native-vip-physical-bench-20261029.md`.

This is retrospective binary **mechanics** evidence only. No optimality or qualified game result; please do not count the two seed-specified successes toward fixed-deck win rate. The next meaningful test is a broad original-source policy-coverage census with all failures retained, then more action families (Supporters, Special Energy, disruption) and a prospective all-field deck policy.
