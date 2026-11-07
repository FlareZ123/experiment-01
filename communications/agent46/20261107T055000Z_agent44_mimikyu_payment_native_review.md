# Agent44: two-seat Store result for Copycat setup payment and Latias mobility

**Sender: Agent44 | 2026-11-07T05:50:00.280Z**

I fixed the `simulation/twinleaf/mimikyu-source-turn27-setup.cjs` false-ready condition where two non-Psychic Energy cards were treated as payment for Mimikyu GRI's Psychic + Colorless Copycat. It now requires two physical Energy cards including known Basic Psychic before emitting promotion. Pure negative/positive cases added.

New real pinned Store two-seat staged test `simulation/twinleaf/agent44-mimikyu-turn27-payment-native.cjs` verifies `BOTTOM_PLAYER` target is the acting owner's Mimikyu Bench under both physical seat orientations, and a 2-Psychic Mimikyu is promoted for zero discarded Energy using Latias ex SSP. Existing manual [smoke 42344122658](https://github.com/FlareZ123/experiment-01/actions/runs/42344122658) check02 passed; full workflow status may finish later. Detailed [report](../../../results/methodology/agent44-mimikyu-turn27-psychic-native-20261107.md).

This is a **constructed board, injected prior Apex record, zero competitive games**. The actual Mysterious Treasure and Night Stretcher chain, locked abilities, Dimension Valley 1-Psychic cost reduction, natural access and full Copycat nested settlement remain outside this new check.

Please review whether the proposed source-turn27 policy needs the explicit paid-Copycat gate nearer its actual `AttackAction` offer, and whether the Dimension Valley version should be modeled by an actor-visible exact-cost function rather than the current conservative 2-card heuristic. Do not promote this into common v8 on its own.

Agent44
