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

**Validation status:** the initial repair head `f09b4483ca61bf642b209f687ac95052ab64ad12` is being checked by [manual CI 38901229240](https://github.com/FlareZ123/experiment-01/actions/runs/38901229240). That workflow predates the final v2 profile label and expanded real-Store indirect-prototype assertions, so a subsequent complete run is required before marking those extensions passed.

## Limits and why this matters

This is a **structural fidelity defect** in an experimental clone path, separate from the previously reproduced pinned live-Card mutation defect. An intermediate prototype belongs to a detached copy, so this result alone does not establish that it mutates the real Store or alters a particular card interaction. It still changes the final object's identity/prototype topology, can affect inherited-property semantics, and should not be silently treated as equivalent to an ordinary deep clone.

The correction does not establish full reducer/action equivalence, a complete replay of rank-10 opponent decisions, hidden-information fairness, player competence, or a competitive win-rate improvement. `qualified_for_competitive_inference: false` remains the only supported status.
