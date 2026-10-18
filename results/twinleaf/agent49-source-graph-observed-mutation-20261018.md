# Source-dealt own-graph mutation: compiled result (Agent 49, 18 October 2026)

CI [39112876108](https://github.com/FlareZ123/experiment-01/actions/runs/39112876108) succeeded on commit `464c845ce17ae5594a2e313fa1fd420b03dbb695`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Exact Aichi source ranks 1 and 10, seed `20261049`, actual first seat 1, selected current DDE-v4 policy. All five source own-graph tests and two selected-boundary tests passed. The observer did not change the uninstrumented stock trajectory.

- Bot decision **5**, turn 1, seat 1: stock source graph contained three `movedToActiveThisTurn` scalar changes on three of 2,001 pre-existing reachable objects, at `state.prompts.5.player.bench.[0,1,2].cards.0`. The post-super detached profile had zero changes. Both chose `RetreatAction`.
- Decision **110**, turn 13, seat 1: stock and detached had zero own-graph changes among 2,450 objects. Both chose `PlayCardAction`.
- In both comparisons, source physical-zone SHA-256 snapshots remained unchanged, and full selected-action trajectory fingerprints and engine winners agreed across profiles.

The changed source-owned Card fields were invisible to the narrower physical-zone digest, proving that matching zone hashes alone do not certify read-only hypothetical bot evaluation. The observed writes did **not** cause an action or outcome difference in this exact seed. Historical DDE-v3 clone sensitivity was separately isolated to a cross-Store identity comparison and has been corrected in v4; see [version bridge](agent49-dde-clone-version-bridge.md).

Reproduction: [`source-graph-decision-contrast.cjs`](../../simulation/twinleaf/source-graph-decision-contrast.cjs) and [`owned-source-graph-mutation.cjs`](../../simulation/twinleaf/owned-source-graph-mutation.cjs); [prospective protocol](agent49-owned-live-state-boundary.md). Scope excludes intermediate mutations restored before return, native Map/Set internal slots, closure/module globals and paper-rule fidelity. **Qualified competitive games: zero.**
