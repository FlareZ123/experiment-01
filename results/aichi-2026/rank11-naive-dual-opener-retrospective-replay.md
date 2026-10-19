# Rank-11 naive dual-opener wrapper: five source-first replay observations

**Agent 1; 19 October 2026 UTC. Evidence class: compiled, retrospective source-dealt control-flow diagnostic. Not a competitive matchup result.**

## Hypothesis and experiment

The [overlap hazard](rank11-two-opener-composition-hazard.md) notes that nesting the held-Forest-Seal and held-Boost-Shake Store decoders may allow the outer direct-Shake wrapper to intervene **after** the inner Seal route obtains Boost Shake. Initial opportunity predicates are disjoint, but that does not establish noninterference of stateful decoders.

[Runner](../../simulation/twinleaf/rank11-dual-opener-nesting-probe.cjs) compares two source-first plays for each of five **retrospectively preselected held-Seal-positive** source deals:

1. Rank 11's published source 60 in physical seat 0, with the held-Seal decoder alone.
2. The same physical source deal, unchanged New Moon Lockbreaker v1 60 in the other seat, with direct-Boost-Shake wrapping held-Seal.

The runner checks draw-log verification, first-turn slot 0, identical deck hashes, and compares the complete **rank-11 first-turn root-action ledger** between arms. It records the action lists, independent wrapper audits and source deal seeds. It does not establish observational equivalence for all later turns or all reducer/clone internals.

## Compiled result

Manual [GitHub Actions run 39202502347](https://github.com/FlareZ123/experiment-01/actions/runs/39202502347), head `dce9817b49be703068903aa854fdfb4cf28b2a4b`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, **passed**. Its `direct-source-probe` job recorded:

| Source seed | First-turn source-action ledgers equal | Nested held-Seal complete | Nested direct-Shake complete | Nested direct-Shake opportunity |
| --- | --- | --- | --- | --- |
| 1097193676 | yes | yes | no | none |
| 188431119 | yes | yes | no | none |
| 3003119583 | yes | yes | no | none |
| 1056048178 | yes | yes | no | none |
| 3278716788 | yes | yes | no | none |

The runner output is archived in Actions artifact `rank11-direct-boostshake-unqualified-seat-0`, artifact ID **12163879974** (ZIP SHA-256 `e8d3e40aaff5217d08a28bacedba0a2a8dee799c201acd98a2fd2f6d49c47fa9`); file `rank11-dual-opener-nesting-audit.json`.

**Observed result:** No competing direct wrapper claimed any of these five source-first positive controls; the rank-11 source first-turn root-action sequence was identical between the standalone and nested arms. This is a narrow failure to falsify composition on the tested fixtures, **not a proof that nested policies are generally safe**.

## Limits and next test

The fixtures were selected for a held-Seal completion, so the 5/5 agreement cannot estimate natural opportunity rate or any game win rate. It cannot test diverse fallback paths, held/deck prize failures, K1 aborts, source-second starts, candidate responses, or the potential post-search intervention in other source states. The wrappers were not frozen as a competitive opponent policy.

An appropriate follow-up is a **prospectively fixed, failure-inclusive**, source-dealt suite spanning both physical source seats and actual starting orders, with simultaneous routing audits, deck/hand legality and later-turn action comparisons. For a robust production policy, explicitly latch the owner-visible opening-route choice at its first decision and forbid the other route from claiming an overlapping line later. Qualify a complete New Moon response, legal copied-attack outcomes and realistic opposing continuations before any competitive inference.

**Qualified competitive games added: 0.** The fixed-deck field target remains unevidenced.
