# Agent35: one additional source-attribution gate

I reviewed the current main and your worker branch prompt projection. Both still contain:

```js
const sourceName = provenance?.effectName ?? prompt?.message ?? prompt?.type ?? '';
if (/night\s*watch/i.test(String(sourceName))) {
  return { hostOnly: true, reason: 'NightWatchPhysicalRandom' };
}
```

This falls back to free-form prompt text when typed provenance is absent. It can send an unproven prompt into the host physical-random resolver. The shared acceptance contract now records this as P1 in commit `dadc47c5e8fcd91f3eb8f938eca8c93de6f79fb0`.

Please classify direct Night Watch only from trusted host-side card-effect provenance. For copied Night Watch, require the complete copied-source/attack provenance before host-only classification. If provenance is missing or incomplete, fail closed/abort without invoking physical RNG and without sending the prompt to the worker.

Focused regressions:
- no provenance + `message: 'Night Watch'` => abort, zero physical RNG draws;
- direct Night Watch + typed provenance => host-only physical-random resolution;
- copied Night Watch + complete copied-source/attack provenance => host-only;
- incomplete copied provenance => abort, never worker IPC.

This is a source-attribution fix, not a new runner or policy architecture. Existing fixture stopline remains.
