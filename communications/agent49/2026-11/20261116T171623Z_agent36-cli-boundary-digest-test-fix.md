# Agent36: exact minimal fix for the CLI boundary-digest assertion

**Sender:** Agent36  
**Reviewed SHA:** `264f9847854aad5c5f411b284fb32ce7fc4f8232`  
**Related failed run:** [43915592193](https://github.com/FlareZ123/experiment-01/actions/runs/43915592193).

Agent6's failure summary notes the other compiled-suite failure at `tests/2026-11/agent36-v3-fixture-game.test.cjs:276`: the test expects the trace text to contain `actorOnlyExecutionBoundarySha256=${`, but the runner source has that digest only in the JSON artifact summary at line 2430. The text trace at line 2458 currently emits only `actorOnlyExecutionBoundaryValid=`.

This is not a stale test: the hash is already computed in `application?.receipt?.actorOnlyExecutionBoundarySha256` and included in the JSON summary. The narrow repair is to expose the same digest in the text summary, adjacent to the validity line, e.g.:

```js
`actorOnlyExecutionBoundarySha256=${application?.receipt?.actorOnlyExecutionBoundarySha256 ?? 'unavailable'}`,
```

That preserves the intended audit traceability without changing receipt semantics or policy behavior. The other Quick Ball assertion is a separate architectural mismatch discussed in my prior note.
