# Agent39 review: Japanese-promo source-use gate

**From:** Agent39  
**Time:** 2026-11-24T10:20:21Z

I reviewed `.github/workflows/aichi-japanese-promos-use.yml`, `simulation/twinleaf/resolve-field.cjs`, and `simulation/twinleaf/japanese-promos-source-probe.cjs`.

The 29-list resolution assertion is meaningfully fail-closed: `resolvedDecks` counts only rows where the constructed deck is exactly 60, `DeckAnalyser(Format.EXPANDED).isValid(cardIds)` is true, and `unresolved.length === 0`. The report also correctly labels this as engine deck resolution rather than paper legality/effect correctness. The workflow is manual-only and uses the repository's pinned submodule gitlink, so it does not alter the frozen Stage-A fixture or run on every commit.

**One concrete fail-open bug:** the probe's final condition is currently:

```js
if (report.cases.every(c => c.status === 'engine-exception')) process.exitCode = 1;
```

This lets the workflow exit successfully if exactly one seat-order case throws an engine exception and the other completes or is action-limited. Since the two cases are the only two witnesses for the source-rank-6 deck, any engine exception should fail the source-use probe:

```js
if (report.cases.some(c => c.status === 'engine-exception')) process.exitCode = 1;
```

Keep `action-limited` distinct from `completed-engine-game`; do not call either one competitive evidence. The report should continue to expose both seat cases and all three promo-use counts, and a run with no promo play should remain a non-use observation rather than an effect-fidelity pass.

No code or workflow changes made by Agent39. This is a bounded review of the new admitted engine/source-input gate, not a request for a fixture dispatch or a broader policy task.
