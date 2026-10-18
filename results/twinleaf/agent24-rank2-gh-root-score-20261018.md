# Rank-2 source GH root-score probe: predeclared protocol

Agent 24, 18 October 2026. Manual compiled test [39135466559](https://github.com/FlareZ123/experiment-01/actions/runs/39135466559) launched at head `a6b41e9b9197189c98f3c6c9376e3d561fb10a73`. At publication of this protocol, its outcome is pending.

**Input:** exact source rank-1 Shadow Rider seat A versus rank-2 Vileplume seat B, seed 20261023, 70 root-action cap, strict prompt validation, isolated policy RNG, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The source-K0 Bunnelby and Stage-target policies are ON in both arms, as are existing Expanded correction hooks. The only intended policy toggle is `bunnelbyGuzmaHalaMode1` OFF or ON.

**Measurement:** First run the source match unobserved, then with a read-only bot-call ordinal discovery hook, then with the independently developed read-only `SimpleTactic` score/validity observer at the discovered target. Record each root Action-68 card, the owner's predecision physical-zone digest and hand, all actual `evaluateAction` candidate returns, base-state scores and `isValidAction` results. [Source probe](../../simulation/twinleaf/rank2-gh-root-score-probe.cjs) reuses the prior generic [score observer](../../simulation/twinleaf/decision-tactic-evaluation-observer.cjs), avoiding a second implementation of speculative scoring. [Regression](../../tests/rank2-gh-root-score-probe.test.cjs) checks original/observed selected-action parity.

**Falsification:** A changed root action under passive score tracing invalidates the observation. A changed input source digest across mode arms invalidates a same-state score attribution. If scores never appear for relevant Supporters, the inherited tactic hooks are insufficient, and the correct conclusion is instrumentation incompleteness. If scores differ, record the first differing candidate valuation and any validity failure without assuming human-play quality or causality of the internal state-score formula.

**Limit:** This examines a single bot decision in a source-dealt simulator, with no qualified competitive games. It cannot establish a correct real-human Supporter decision or improve the reported 99.5% target.

## Compiled results

[Manual CI 39135466559](https://github.com/FlareZ123/experiment-01/actions/runs/39135466559) completed **successfully** at head `a6b41e9b9197189c98f3c6c9376e3d561fb10a73`. The paired source-dealt probe regression passed. Artifact `rank2-gh-root-score-probe` is ID **12139593312**, ZIP SHA256 `41e77ca1203c3927efe04754de3e2dc2fcb40c015c4e148200e1792dfeadf0c2`. The JSON inside the ZIP is `rank2-gh-root-score.json`. No other card, deck, source, or matchup is claimed tested by this probe.

All three runs within each arm (baseline, ordinal discovery, score observer) independently selected the same root Supporter at global root action 68, turn 5. The exact target was **bot-call ordinal 59**, physical seat B. The rank-2 hand was [`Stoutland BCR`, `Bellelba & Brycen-Man CEC`, `Guzma & Hala CEC`]; the Active was `Bunnelby PRC` without Energy. Source-deck hashes and first-turn slot matched. All modes shared full predecision source-zone SHA256 `e2ebe2476ee2f04d9b42b9a6a9ec3c8f3466be7e402a1eaa66bd875b85f92d3b`.
