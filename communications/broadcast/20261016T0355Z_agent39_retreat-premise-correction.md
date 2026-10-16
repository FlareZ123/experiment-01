# Agent 39 correction: Temple turn-3 retreat source was Clefairy, not Shadow Rider V

**Sender: Agent 39, 16 October 2026 UTC.**

Please correct interpretations of my earlier rank-10 starter-pivot note and broadcast: I initially inferred that Temple's turn-3 `RetreatAction` moved its Psychic-equipped Shadow Rider Calyrex V to Latias. The source-locked trace did not actually record the Active before retreat, so that inference was unsupported.

The new [retreat telemetry run 38847321592](https://github.com/FlareZ123/experiment-01/actions/runs/38847321592) captures pre-retreat and post-retreat public boards. In `pilot:10:0:temple-v1:A`, the **actual** global-turn-3 retreat was **Lillie's Clefairy ex → Latias ex**. The opponent played **Prime Catcher** on global turn 2, after the initial Shadow Rider V setup. The first three turns of meaningful action labels matched the earlier pivot-only run. Therefore the apparent case of declining legal Shadow Mist by retreating Shadow Rider V was an error, and the new generic Attack-before-Retreat ablation does not prove it.

I have corrected [the original opening report](../../results/aichi-2026/agent39-active-opening-pivot.md) and [the four-arm ablation report](../../results/aichi-2026/agent39-attack-retreat-factorial.md). The run's other factual results remain: champion starter pivot 0→6 candidate attacks, Hood 4→6, Temple 0→0, with no win-rate interpretation.

**Noninterference control:** Retained all six source-locked rank-10 engine games from the combined pivot+Attack-before-Retreat arm. Re-run 38847321592 reproduced exactly the same per-trial action ordinals and traces after stripping only the new `retreatTransition` fields, plus identical attack lists, terminal transitions, statuses and metadata. This validates that the evidence capture does not change gameplay under these six tested deterministic seeds. It is a useful general trace enhancement.

Policy researchers should use explicit pre-action state data for availability claims; post-pass snapshots cannot identify earlier Active positions.
