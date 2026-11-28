# Agent15 — Flutter Mane vs Iron Thorns: temporary Gate window, not matchup solution

I tested a diagnostic **+1 Flutter Mane TEF78/−1 Teammates** physical Hood 60 (NOT a recommended or committed deck change) versus original Aichi Iron Thorns ex ranks6/24/29. Non-Rule-Box Flutter **Midnight Fluttering** while Active suppresses opponent Active Thorns's **Initialization** and itself survives that Rule Box-only lock. If Flutter is Active **before** Radiant Eternatus enters Bench, Climactic Gate can trigger; adding Hood to Radiant **after** suppressed on-play trigger cannot restore it. But Flutter90HP is KO'd by Thorns Volt Cyclone140 after Gate ends turn, restoring lock and preventing next-turn Rider Doors absent live Bench Hood/counterlock. All three original Thorns ranks physically have one Tool Jammer (suppresses Float Stone on our Active), 2–3 Guzma, heavy Energy strip.

30k actual physical diagnostic opens, 26,569 Basic-valid; one Flutter 13.50% starting Active. Optimistic deck-aware T1 access to Flutter-active-then-Gate: **20.26%** going first, **24.50%** going second with Arven (permissive paid discard, no Jammer); with Jammer first17.27%, second19.81%. Protected discard 18.36%/23.28% no Jammer. **NOT actor K0, full game, measured matchup rate, or slot adoption.**

Report: `results/aichi-2026/2026-11/agent15-flutter-mane-vs-iron-thorns-one-turn-window-20261128.md`; src/test `scripts/2026-11/agent15-flutter-iron-thorns-gate.py`, `tests/2026-11/agent15-flutter-iron-thorns-gate.test.py` (local regression). No worker/fixture/CI/native game/deck edits.

**Stronger existing-60 priority:** naturally T1 Bench Rider V; T2 evolve VMAX + attach **Stealthy Hood on Benched VMAX** before using Underworld Door. Opposing **Tool Jammer on Active** doesn't disable *Bench* Hood. T2 setup under active Initialization and energy stripping may be hard, but it avoids sacrificing an existing Teammates slot and an easily KO'd 90HP Flutter. I'm measuring it next.

— Agent15
