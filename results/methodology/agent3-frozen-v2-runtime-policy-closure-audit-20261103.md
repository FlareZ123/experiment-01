# Agent 3: frozen selected-v2 has identical outer flags but distinct executing actor closures

**3 November 2026 | independent 52-arm archival audit | zero qualified games.**

## Original, unchanged evidence

Downloaded Agent23's complete [immutable GitHub Actions artifact 13206810193](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876/artifacts/13206810193) from [compiled native run 41581727876](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876). ZIP SHA256 `9f4b1d249a7d46d5f3f352e651b7400d83fcb3711cfe37af6d9cd3337fe84b73`, one original **70,653,701-byte** JSON member `agent23-selected-joint-v2-native-52arm.json`. The preserved original manifest git blob is `8cd0c4b0734d3223d5c8c1f705f3af651f815c02`, pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This audit did not run new games, modify the old frozen manifest or change candidate decks.

Each of the two historical modes has 26 registered original physical trial identities. The original source field covers original ranks 5, 6 and 11 and two candidate 60s, not the complete Top32. They remain historical developmental comparisons.

## First systemically relevant finding

The `runDevelopment` returned mode object exposes **61 Boolean `*OptIn` flags**, 30 true in each arm. They are **identical in both modes**; canonical sorted-key JSON SHA256 for both is:

`7a42d89974e7d6fe0aaee73224778020fd320619fa496389aab6bf919437e3b5`

That equality conceals a real selected-policy difference. The archived `agent23-selected-joint-v2-release.cjs` runs the selected variant through `AGENT9_BATTLE_VIP_AFTER_PASS_DEV=true`, an environment-selected actor subpolicy not represented by those top-level Boolean flags. The original Store actor receipts preserve `ownerVipAfterPassOptIn`, `actorOnlyPolicyVersion`, `actorOnlyDecisionCoverage.version`, the actual ordered `selectedHandlerPriority`, and `componentVersions`.

Across **25 native rows per mode** with actor coverage, the actual actor version, handler priority and component versions are each internally constant. `actorOnlyPolicyVersion`, `actorOnlyDecisionCoverage.version` and mode-level `actorOnlyCompositionVersion` agree for all 25 in each mode. The following fingerprints are canonical SHA256 of the actual emitted actor version, ordered handler priority, component versions and VIP-after-Pass selection.

| Historical policy mode | Full top-level flag SHA256 | Runtime actor closure SHA256 | Manifest + pin + flags + actor closure SHA256 |
| --- | --- | --- | --- |
| `joint-v1-control` | `7a42d899...437e3b5` | `5b3aaa38528799d24a3b1f5adc700d23d9fb5adda36a7153c85da8e0a931de3d` | `d3bedd7b24b76e5675199c312a3fd892f045b81182a75861e429f924b7007d02` |
| `selected-v2-symmetric-vip` | `7a42d899...437e3b5` | `dba022c2bac49dad2fdbf8c41dd95e352af90bb4559cbdf28ad414e913cf0266` | `a5dce242a0c5bb3fe63540cd553a0a233bf28212093fa8ef1716abd2d66ff6e7` |

The selected runtime version explicitly contains `agent9-battle-vip-owner-after-pass-v3-positive-bench-witness`; the control version does not. Both show the same ten-handler order, starting `OwnerAttackContendedVipFirstTurn` and ending `ActorOnlyRoot`, as emitted by the actual actor receipts. The recorded component versions are mode-specific because only the selected closure includes the additional VIP-after-Pass component. This result proves **effective policy identity differs** under an otherwise identical high-level Boolean feature summary. It says nothing about whether the selected option made superior decisions.

## Failure-inclusive per-trial qualification

In each mode, **25/26 rows carry the real actor runtime coverage**. Among those covered rows, candidate-seat 0 appears 13 times and seat 1 appears 12 times. The same registered original-source attempt `6:300:A:champion-reference` aborted on both modes with a native `UNKNOWN_POWER` error before emitting complete actor coverage. Its abort sidecar retains original source-deal custody and a partial accepted root history (see [Agent41's earlier independent analysis](../aichi-2026/agent41-selected-joint-v2-independent-first-divergence-audit-20261103.md)), but that sidecar cannot certify a missing actor version. Our auditor marks each **one missing trial as `NO_ACTOR_RUNTIME_COVERAGE`** and rejects full-mode closure admission. Its mode verdict is `PARTIAL_RUNTIME_COVERAGE`; whole archive verdict is `INCOMPLETE_RUNTIME_ACTOR_COVERAGE`.

The observational policy closure is a tighter identity check than top-level options alone. It still cannot establish opponent quality, original paper source legality, battle payoffs or a 99.5% game win rate.

## Reproduction and transfer

- Pure reusable [closure attestor](../../simulation/evaluation/agent3-observed-policy-closure.cjs) inspects original native rows without running bots, hashing the emitted component versions and **preserving handler ordering**.
- [Regression tests](../../tests/agent3-observed-policy-closure.test.cjs) require the two-mode policy distinction, both-seat coverage, missing-abort quarantine, version consistency, handler-priority sensitivity and registered trial alignment. The existing manual smoke [CI run 41694214516](https://github.com/FlareZ123/experiment-01/actions/runs/41694214516) **passed** on head `a3902c14a71d705f9d6e07b39f2b40ca0a5b6456`, covering the new attestor tests without a new CI workflow. The full-archive counts and SHA256 values above were independently recomputed with canonical sorted-key JSON in Python and Node on the original 70 MB artifact.
- A new immutable **selected-v3** configuration should bind runtime-executed environment overrides, all effective actor component versions, handler precedence, real source/candidate printed 60 identities, full source trial/deal fingerprints, and release predicates. A frozen top-level Boolean list alone demonstrably conflates historical control and selected variants.

**Research status:** 29/32 authenticated original 60s, missing 23/25/28, zero competitively qualified games, no selected final fixed 60.
