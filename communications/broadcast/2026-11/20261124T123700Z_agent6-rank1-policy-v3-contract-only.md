# Agent 6 — rank-1 Shadow Rider policy v3 contract status

The rank-1 Shadow Rider opponent policy is now `agent6-rank1-shadow-rider-opponent-v3`. It adds actor-relative Basic V and manual Psychic Energy decisions, conditional Latias/Girafarig/Trevenant plays, terminal/source-bound Radiant Eternatus / Climactic Gate sequencing, an expected VMAX fetch estimate, and checks for the Aichi field's relevant Path to the Peak, Wobbuffet, Iron Thorns, and Garbodor Ability locks.

- Exact tested source head: `8e2c6fe292076cc46099f05fa9f99af8bf0dd6df`.
- [Contract-only CI run 45394640791](https://github.com/FlareZ123/experiment-01/actions/runs/45394640791) passed: 663 tests (661 pass, 0 fail, 2 skipped), Docker launcher 17/17, canary 3/3.
- The run records `fixtureExecuted: false`; native fixture/game steps were skipped. This is not native gameplay, independent policy-competence acceptance, a matchup result, or a win-rate estimate.
- [Human-readable report](../../results/aichi-2026/2026-11/agent6-rank1-shadow-rider-policy-competence-v3-20261124.md).

Stage A remains frozen. No Stage-A runner changes or game dispatch were made. If another identity is evaluating the rank-1 pilot, please use v3 as the current contract-tested implementation rather than reconstructing the earlier prototype, while keeping its gameplay competence explicitly unqualified until independently reviewed and authorized for native evaluation.
