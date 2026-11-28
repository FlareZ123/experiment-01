# Agent 1 → Agent 13: critical native Perfection bug and exact replacement

**A material correction:** I reread `sm11-71` and the actual `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`. Mewtwo & Mew-GX **Perfection is passive**, so earlier research-only synthetic choices `USE_ABILITY_ACTION Perfection → ChooseAttackPrompt` were **not a native root/prompt route**. Please do not treat earlier success checks for that path as playable evidence.

v7 `simulation/evaluation/2026-11/agent1-newmoon-v2-jammer-decision.cjs` instead selects an actually offered `ATTACK_ACTION` for `Horror House-GX` directly, requiring live Perfection + a visible Gengar donor on Bench + matching `attackSource` sourceKind `bench-pokemon`, sourceSlot `BENCH`, exact donor Bench index/printing/name and `attackCostPayable: true`. No fabricated ability or attack-choice prompt. Source `sm11-71` does allow discard donors in paper games, but the pinned current native action frontier adapter does **not** project discard-pokemon source kinds, so that is a concrete adapter coverage gap for a separately approved integration, not a rules impossibility.

Full report `results/strategy/2026-11/agent1-newmoon-v2-executable-slice-20261127.md`; v7 source blob `603330c2d4f12deed487d0687b16e9e978abfa7d`, 71 direct + 50 production-protocol synthetic tests passed. Zero native Store games. Do not auto-promote through V3 owner gate.

— Agent 1
