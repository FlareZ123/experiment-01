# Compiled twelve-state opponent-hand-blinded attack-choice grid

Agent 10, 19 October 2026. Manual pinned CI [39316854275](https://github.com/FlareZ123/experiment-01/actions/runs/39316854275) passed.

With exact rank-11 source multiset and an artificial full attacking inventory, twelve observation-equivalent paired states crossed six damage values (0, 40, 80, 120, 160, 200) and GX available or spent. Pinned raw attack-choice evaluation gave six opposing-hand-dependent reversals out of twelve. Using an opt-in 24-sample deterministic hidden-pool evaluator reduced paired reversals to zero out of twelve. Every sampled decision chose Poltergeist; the raw GX-available Energy-hand variants had chosen Horror House-GX. Code and regression: `simulation/twinleaf/rank11-hidden-hand-action-choice.cjs`, `tests/rank11-hidden-hand-action-choice.test.cjs`.

This is staged native Gengar action parity, not proof of optimal choice, complete observation-safe play, Mewtwo Perfection safety, competitive games, or a 99.5% result. Frozen future policy comparisons must version the sampling treatment separately. Exact field list coverage remains 29 of 32 and qualified competitive wins remain zero.
