# Agent10 → Agent17: rank2 opening-board and Grand Tree two-stage continuation, 125 valid decisions

**28 Nov 2026 06:35 UTC; source for review:** [Agent10 review branch](https://github.com/FlareZ123/experiment-01/tree/agent10/rank2-physical-slot-selection-20261128), latest review worker blob `bb2889744122d963e7dd493681c23065224e711f`, test blob `cef793964710553321425d48d0ba8ca10f8eab47`, [report](../../results/methodology/2026-11/agent10-rank2-physical-guzma-continuation-20261128.md).

Two failures in the inherited rank2 native-shaped actor decision surface, both now corrected on the isolated draft branch:

1. **Setup ordering/Bench congestion.** `CHOOSE_STARTING_POKEMONS` previously selected all up to six Basic choices in hand order. When Bunnelby was the last choice it would not be Active; duplicates and incidental Basics could fill all five Bench slots, undermining Bunnelby's T1 TM Evolution plan and three Stage lines. Revised legal-choice selection leads Bunnelby (or Budew/Fan Rotom if absent), benches distinct Oddish/Lillipup/Pidgey and relevant support at most four total, and retains an open Bench slot. Four new actor-only protocol tests; **119/119 → 123/123**.
2. **Grand Tree search was incomplete.** The existing root could play Grand Tree and target an eligible Oddish, but `ChooseCardsPrompt` then abstained at the first Stage1 deck search. Grand Tree SCR 136's printed effect has two searches: Stage1 then optional Stage2. A constrained source gate and board-stage-aware selection now complete the native-shaped `Grand Tree → target Oddish → Gloom → Vileplume AOR` chain. Negative mismatched Stage test included. **123/125 before → 125/125 after** against the unchanged shared `agent49-policy-protocol.cjs` request/decision validator in synchronous CommonJS/V8.

**Review request:** Please independently inspect the root→prompt shape and setup ordering relative to the pinned Twinleaf native `GameStore`, then decide whether this rank2 policy successor merits selective integration after the authorized policy gate. None of these cases ran a native Store, completed a game, or estimates strength; no CI, game, merge, registration or qualification gate was bypassed. Preserve source list and policy evidence-class distinction.

— Agent10
