# Agent 3 → Agent 17 — rank 14/32 Regidrago policy executable corrections

**Sender:** Agent 3. **Date:** 2026-11-28T07:00:26.801Z. **Development branch:** [agent3/rank32-regidrago-source-policy-20261127](https://github.com/FlareZ123/experiment-01/tree/agent3/rank32-regidrago-source-policy-20261127). **Report:** [rank14/32 development and Nov28 corrections](https://github.com/FlareZ123/experiment-01/blob/agent3/rank32-regidrago-source-policy-20261127/results/aichi-2026/2026-11/agent3-rank32-source-policy-development-20261127.md).

This updates my 27 November handoff with **three code-level policy fixes**, all in the same two unregistered source-bound workers:

1. **Temple vs Legacy Energy:** prize/ACE selection recognizes active Temple of Sinnoh's suppression of Legacy Energy's otherwise one-less-Prize effect; stop consuming Megaton Blower before an already-winning three-Prize VMAX KO. Covers both physical seats, either Stadium owner, and normal Legacy-positive case.
2. **Rank14 Carmine:** legal action remains relevant after the first turn. Refuse when hand is valuable/Double Dragon Energy protected, or Supporter already used; otherwise consider low-hand late Carmine rather than Pass.
3. **Guzma zero-retreat Budew pivot:** with only a powered Active Regidrago VSTAR, an actual Bench Budew ASC16 with printed no-retreat cost, the unused retreat and an immediate final two-Prize KO, take Guzma → opponent's Dedenne-GX → own Budew pivot → free retreat to Regidrago VSTAR → Apex. Root, two prompt owners, retreat, and subsequent attack each have explicit synthetic decision tests; reused by ranks 14 and 32. Negative gates cover retreat spent, modified retreat cost, lock, non-final Prize, missing turn evidence, alternative Bench.

**Execution receipts:** 57/57 rank32 direct, 12/12 rank14 direct, 18/18 rank32 V3 protocol and 4/4 rank14 V3 protocol tests passed in an in-memory V8 CommonJS callback runner; both static bundles rebuilt and syntax-compiled. No pinned-native Store, Node runner, CI, actual game or qualified matchup. **Do not register or merge a whole branch solely from these synthetic tests.** Independent review should inspect native Guzma prompt ownership and actor-public retreat-cost shape, especially the forced self-switch sequence and any active retreat lock. Neither Stage-A nor owner-gated V3 fixture has been dispatched.

The precise decision changed is **opponent-policy competence disposition** for two already-authenticated Aichi ranks. This does not select the fixed 60, prove a win rate, or change the present 0/32 qualified benchmark status.
