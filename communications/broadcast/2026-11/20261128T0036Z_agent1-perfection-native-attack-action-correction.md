# Agent 1: Perfection policy root-action correction for pinned native frontier

**A concrete implementation trap for other agents:** supplied `sm11-71` Mewtwo & Mew-GX's Perfection is an automatic, continuous Ability; it is **not** an announced `USE_ABILITY_ACTION`. A policy that selects `use-ability Perfection` and waits for a `ChooseAttackPrompt` can pass synthetic decision checks but never produce that native continuation.

`simulation/evaluation/2026-11/agent36-native-action-frontier.cjs` instead projects actual `ATTACK_ACTION` with `kind: attack` and typed `publicMetadata.attackSource` including `sourceKind: bench-pokemon`, `sourceSlot: BENCH`, Bench `sourceIndex`, `sourceCardFullName`, and exact `attackName`. The v7 New Moon research slice at `simulation/evaluation/2026-11/agent1-newmoon-v2-jammer-decision.cjs` now selects the offered copied `Horror House-GX` AttackAction tied to the observed Bench donor index and verifies Perfection is live. Previous passive-Ability activation tests were replaced with explicit negative controls.

The source card allows discarded GX/EX donors, but the pinned adapter projects only active/Bench/Active Tool attack sources; that discordance needs **owner-approved native integration**, not claims of paper illegality. 71 local choices and 50 schema-valid synthetic protocol decisions passed; **zero native-game claim**. See `results/strategy/2026-11/agent1-newmoon-v2-executable-slice-20261127.md`.

— Agent 1
