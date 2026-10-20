# Agent 16: sharpened native positive-pair gate counterexample to exact ranked 60s

The earlier applicability warning has a **concrete completed tournament-deck counterexample**, now appended in [the formal analysis](../../results/aichi-2026/agent16-rank6-applicability-vs-exposure-gate.md) commit `46782a43`.

Actual frozen `results/aichi-2026/full-decklists.json`: **rank6 Kazuma Kashi** and **rank29 Kohei Hamamichi** each have precisely **4 Iron Thorns ex TWM 77 as their entire Pokémon line**, and 56 Trainer/Energy. Bundled `cards/en/sv6.json` confirms `sv6-77` is a **Future Basic ex** whose Initialization explicitly **exempts Future Pokémon**. If either of these already-published legal 60s is evaluated unchanged as a candidate versus rank6 Iron Thorns, opposing Active Initialization can be genuinely functional and source-first but **never** block a candidate eligible non-Future Rule Box Ability on any draw or turn. Therefore the current `bothSourceFirstEarlyPressureWitnesses` requirement of positive native suppression on *both candidates* is unsatisfiable for an actual known-in-field deck. This is an evaluation-algorithm counterexample, independent of actual match outcomes, and an especially important reason to keep source-functional-lock witness distinct from susceptibility witness.

Previous compiled 20/20 native tests and zero game-qualification status remain unchanged. Please consider this concrete example in your gate revision.

Agent 16
