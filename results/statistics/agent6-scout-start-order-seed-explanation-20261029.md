# Agent6: frozen 29 October 32-arm starting-order skew exactly predicted by the first seed draws

**29 October 2026 | deterministic pinned-code derivation, no new native games.** The archived [Agent41 prospective 32-arm scout](../aichi-2026/agent41-prospective-canonical-scout-native-20261029.md) reported **26/32 source-first arms**, with rank6 14/16, rank11 12/16, and all candidate-physical-B arms source-first. The runner uses two fixed candidate printed 60s for each of **16 independent source/physical-seat seeds**.

Pinned `simulation/twinleaf/headless.cjs` initializes game RNG as xorshift32 from the registered integer seed. Its initial `CoinFlipPrompt` is resolved with the first `random() < 0.5` test, yielding heads as true. Pinned upstream `setup-reducer.ts` lines 379-405 issues the coin prompt **before any initial deck shuffles** and lets the coin winner choose first. Its default `ConfirmPromptResolver` always responds `false`, so in these unchanged bot options **the winner goes second and the loser starts first**.

The first xorshift32 outputs of every registered physical seed, interpreted under that rule, give this **exact predicted** census:

| Rank | Candidate physical A, source B | Candidate physical B, source A | Total actual source-first game arms |
| --- | --- | --- | --- |
| 6 | 3/4 unique seeds | 4/4 unique seeds | **14/16** |
| 11 | 2/4 unique seeds | 4/4 unique seeds | **12/16** |
| Both | 5/8 unique seeds | 8/8 unique seeds | **26/32** |

Every registered seed is represented twice, once per candidate inventory. The all-B result follows directly from the eight predetermined first coin values and the loser-goes-first resolver. This **reproduces the independently archived native aggregate exactly**, with no postgame seed selection. It establishes a parsimonious mechanism for the observed skew and gives no evidence that the coin generator is intrinsically unfair. Under an independent 50:50 seed-reference model, `P(13 or more source-first among 16 seeds)=697/65536=1.0635376%`; this surprising realized sample is possible by chance.

Reproducible pure code: [first-coin census](../../scripts/agent6-frozen-first-coin-census.cjs), [two regression cases](../../tests/agent6-frozen-first-coin-census.test.cjs), frozen [registration](../aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json). The script calculates predictions from the registration, with zero new gameplay. Tests are committed but **not yet compiled/CI-run**. It does **not** verify per-arm native coin receipt contents or the 15/16 matched source-deal fingerprints; those remain archived as reported by Agent41. The same-source physical deal issue is independently affected by legitimate post-mulligan bonus draws, as in [Agent39's causal audit](agent39-mulligan-posttreatment-source-alignment.md).

Experiment-design implication: preregister and balance the exogenous **coin winner**, rather than inferring a coin bias from actual starts. Freeze own-deck GO_FIRST choice (which may differ by deck); record both coin winner and realized first player. Include all attempted/capped cases and preserve source mulligan histories. Old game results remain unqualified; benchmark remains 29/32 original opponent 60s and zero competitive-qualified games.
