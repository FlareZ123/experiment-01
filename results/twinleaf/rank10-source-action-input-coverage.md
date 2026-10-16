# Source-ranked rank-10 action input transport: two-arm zero-gap capture

**Agent 3, 16 October 2026.** Narrow instrumentation evidence for the fixed Aichi rank-1 Shadow Rider reference versus the published rank-10 Regidrago opponent. This is a live Store input-transport test, **not independently qualified game performance**.

## Frozen source and reproducible verification

The source program is [`simulation/twinleaf/rank10-source-branch-transcript.cjs`](../../simulation/twinleaf/rank10-source-branch-transcript.cjs), using pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, physical candidate seat B (the candidate actually plays first), schedule seed **4246551499**, and immutable source 60-card inventories in `results/aichi-2026/full-decklists.json`. Candidate action changes are confined to the reported turn-27 Mimikyu Copycat/Timeless-GX policy branch. The unchanged game control is rerun after the alternate to check in-process deterministic repeatability.

[Manual CI 38917790777](https://github.com/FlareZ123/experiment-01/actions/runs/38917790777), head `a766c3f118326d164f692e914715ab828d007ca4`, successfully ran **59 source/unit tests with zero failures** and compiled the pinned engine. The source Store recorder was restricted to the first actual AddPlayerAction Store instance, excluding speculative Store dispatches.

| Capture property | Original control | Turn-27 alternate |
| --- | ---: | ---: |
| Real Store dispatches, including two AddPlayer actions | 350 | 235 |
| Original strict JSON-style action capture failures | 221 | 149 |
| New direct typed action-value envelopes | 318 | 208 |
| New typed action-value failures | 32 | 27 |
| **Union: action events with a typed envelope or exact prompt-reference envelope** | **350 / 350** | **235 / 235** |
| Exact prompt-reference capture failures | **0** | **0** |
| Qualified competitive game observations | **0** | **0** |

New `source-action-value-codec.cjs` preserves undefined, null, negative zero, key descriptors, and null-prototype plain objects. It deliberately rejects repeated object identity, nested engine instances, cycles, accessors, symbol keys, and unexpected constructors. The `source-prompt-action-codec.cjs` uses earlier independently tested source-index/prompt resolvers for ChooseCards, ChooseAttack, ChoosePokemon, ChoosePrize, ChooseEnergy, and AttachEnergy; it reconstructs identities against a **new live prompt**, rejecting changed source inventories. Together they transport a representation for every actual source dispatch in both archived arms. Unsupported live references would fail closed rather than be coerced into lookalike card data.

Important distinction: the original `parametersCaptured` flag and replay-eligible `traceSha256` remain **false/null** by design, because they refer to the earlier strict JSON-only path. The new envelopes are separately captured fields. A full-source canonical replay-eligible digest has **not** yet been certified. The new `source-game-action-replay.cjs` driver is an experimental next gate for independently checking exact Store dispatch arguments, before/after public counts, game continuation, and strict failure attribution.

## Status and next falsification target

**Input availability: passed for the frozen source 350/235 action traces.** This closes a concrete obstacle without claiming that complete source-State transitions, all prompt and reducer semantics, hidden-information noninterference, or a fresh-process reconstruction have been validated. A follow-up manual CI with strict action replay was dispatched after this successful run. Until an actual replay reproduces both arms without undocumented substitutions, `sourceReplayMechanicsVerified:false` remains correct.

Even a clean mechanical replay cannot qualify a game for competitive inference without independent paper-rule, bot policy and information-set review, two physical candidate seats and appropriately sampled trials. This research does not show a 99.5% win rate.
