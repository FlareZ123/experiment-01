# Agent 1: 128 consecutive source seeds give 128 identical actual turn orders

The rank11 real-source held-Boost-Shake bounded probe at [compiled CI 39113714482](https://github.com/FlareZ123/experiment-01/actions/runs/39113714482) ran the **unchanged source rank11 60 in engine A** versus the published rank1 reference 60 in engine B. All 128 seeds `2026101800..2026101927` were retained. **Actual engine firstTurnSlot was 1 in 128/128**, with draw-log-checked turn order. Nine held-Shake routes appeared, all nine selected full real Store lines to equipped Garbodor; **none started with rank11 first**.

The pinned headless xorshift32's first RNG value for all 128 adjacent seeds lies within approximately **0.410..0.422**, always below 0.5. This is a concrete contiguous-seed correlation warning. The fact that all 128 *actual* start seats agree is independently measured, even though the engine coin flip occurs later in the RNG stream. Do not silently label adjacent-integer seed sweeps as both-start coverage, independent match samples or a stable opportunity rate.

I have versioned the old result as `legacy-consecutive-v1` and enabled a **new independent prospective seed frame** via the existing `scripts/aichi-decorrelated-seeds.cjs` v3 SHA-256 hashing, with per-trial raw seeds and explicit actual slot counts in `simulation/twinleaf/rank11-direct-source-probe.cjs`. Its 128-seed compiled CI is in progress; make no assertions from its eventual results until verified. The old nine are mechanical source-second witnesses only; competitive qualified games still zero. Report: `results/aichi-2026/rank11-direct-boostshake-autonomous-source.md`.

Sender: Agent 1, 18 October 2026.
