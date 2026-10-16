# Two-stage Twinleaf Simulator clone: inherited intermediate-instance prototypes

**Agent 16, 16 October 2026.** Scope: pinned `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, opt-in research-owned detached/reconciled Simulator, structural source-graph fidelity. **No qualified match wins.**

## Mechanism and adversarial detection

The pinned vendor `deepClone` constructs each non-Array object by `Object.create(source)`. The first research-side prepared clone has that direct source prototype reference deliberately severed. The pinned `Simulator` constructor **clones the prepared State again**, however. Its final objects therefore inherit from corresponding *intermediate detached objects*.

Before this correction, `normalizeDeepClonePrototypes(originalSource, finalClone)` only reset a destination prototype when it was exactly the original source object. In the two-stage path that comparison is false because the destination prototype is an intermediate first-stage clone. Original class constructors can still appear correct through a longer inheritance chain. Existing graph-audit checks based on direct original-source links and inherited constructor identity did not detect this extra level.

A pure strict-mode JavaScript witness reproduces this shape. The [new deterministic two-pass clone test](../../tests/twinleaf-post-super-graph-fuzz.test.cjs) uses the *compiled pinned vendor `deepClone`*, a first-stage Card-inclusive clone, source-instance prototype severance, a second clone excluding card instances, then final reconciliation. It covers 96 reproducible graphs with class instances, repeated shared attack-history references, nested Arrays and object self-cycles.

At research head `fe03d673d7beef32ade5240ec42306fa59b54375`, [manual CI 38900775910](https://github.com/FlareZ123/experiment-01/actions/runs/38900775910) **failed two assertions**: the generated source graphs and object-cycle control retained intermediate instance prototypes where the test required original class prototypes. Sixteen other checks passed, including the separate readonly-field and Array-metadata compatibility guards. This is expected failure evidence, preserved rather than silently discarded.

## Research-owned intervention

- [Final-stage normalizer](../../simulation/twinleaf/normalize-deep-clone.cjs) now computes `stableClassPrototype(original)` and assigns that exact prototype on every differing final cloned object. This handles both single-pass and second-pass inherited instances, subject to the existing source-shape compatibility preflight.
- [Real Store graph auditor](../../simulation/twinleaf/prototype-safe-state-graph-audit.cjs) adds `indirectInstancePrototypes`, independently measuring whether cloned object prototypes are the expected source class prototype. A constructor-name or `instanceof` test alone is insufficient.
- [Compiled graph regression](../../tests/prototype-safe-state-graph-audit.test.cjs) now expects the earlier two-pass prototype-safe profile to have indirect instance links and the reconciled profile to have zero, including after a real Crisis Punch and its three Wait prompts.
- The opt-in [headless research profile](../../simulation/twinleaf/headless.cjs) is explicitly versioned `PostSuperAliasRepairIsolation-experimental-v2`, with its lifecycle assertion updated. Prior v1 actions or engine completions must never silently be represented as v2.
- The vendor submodule is untouched. The repair remains opt-in and must be independently reviewed.

**Validation status:** [manual compiled CI 38901229240](https://github.com/FlareZ123/experiment-01/actions/runs/38901229240) **passed** the 96 generated graphs and prior real Store clone regressions at repair head `f09b4483ca61bf642b209f687ac95052ab64ad12`. The subsequent [manual compiled CI 38902028078](https://github.com/FlareZ123/experiment-01/actions/runs/38902028078) **passed** the v2 opt-in label, exact class-prototype metric, positive/negative real Store graph assertions, post-Crisis Punch fixture, and source-ranked clone lifecycle/contrast at head `54ed89b7b31d79e721ebe891334b9eb76a815710`. A further fail-closed data-integrity validation run was separately queued, so it must be reported by its own revision.

## Real Store metric and fixed-source policy contrast

The compiled [CI 38902028078](https://github.com/FlareZ123/experiment-01/actions/runs/38902028078) emitted `indirectInstancePrototypes` counts of **106** for each earlier pinned/prototype-safe clone in the source Tool-attack-ready State and **158** for each in the post-real-Crisis-Punch State. The repaired post-super v2 profile reported **zero** in both. These counts are object-path discrepancies under this auditor, not unique extra class instances or rates of gameplay corruption.

Under identical published rank-1/rank-10 60-card source hashes, actual first-turn slot 1, seed `20261049` and 350-action cap, the v2 clone produced **192 actions / 17 turns / engine-reported rank-10 winner**, the same 83-event meaningful-action digest as the earlier prototype-safe profile (`b3083ecf66eff260a4e819abe83a3dc27b5c1db470a22105e5d386299d8cece2`). Pinned unmodified cloning instead recorded **203 actions / 18 turns / engine-reported rank-1 winner**. The original-run replay was byte-identical. This observation establishes one-seed action-trace nonregression of the v2 prototype correction against the older detached model; it cannot establish internal-effect equivalence or independently sampled winner evidence.

In an independently fixed rank-10 v3 seed `3162592764` comparison, the original weak bot still passed with Koraidon after scoring Retribution Strike `-2305` against threshold `-199` on turn 5. The repaired v2 profile followed another action trajectory from captured-event index **2**, and its game ended with a different engine winner after 164 rather than 183 actions. The original Koraidon turn-5 source State therefore was not reached in that altered trajectory. This is a policy-and-simulator sensitivity signal, with no causal attribution to the prototype change alone and no competitive win-rate meaning.

## Additional fail-closed cloned-data contract

Following the prototype fix, `normalizeDeepClonePrototypes` was strengthened to reject changed primitive values, extra/missing own enumerable properties and distinct source nodes merged into one clone. The duplicate-source canonicalizer still repairs repeated references that the pinned Array copying splits. [Adversarial pure Node tests](../../tests/agent16-clone-fail-closed.test.cjs) cover those rejections and sparse-array preservation, and are included in the manual workflow. This detects additional input corruption before a speculative bot action can use the state.

**Current CI verification:** [manual run 38902634280](https://github.com/FlareZ123/experiment-01/actions/runs/38902634280) **passed** the strengthened clone-data guards, 96-graph suite and pinned-Store integration at head `0f011890fb1ce961e6deb7a59a0100aca613d847`.

## Limits and why this matters

This is a **structural fidelity defect** in an experimental clone path, separate from the previously reproduced pinned live-Card mutation defect. An intermediate prototype belongs to a detached copy, so this result alone does not establish that it mutates the real Store or alters a particular card interaction. It still changes the final object's identity/prototype topology, can affect inherited-property semantics, and should not be silently treated as equivalent to an ordinary deep clone.

The correction does not establish full reducer/action equivalence, a complete replay of rank-10 opponent decisions, hidden-information fairness, player competence, or a competitive win-rate improvement. `qualified_for_competitive_inference: false` remains the only supported status.
