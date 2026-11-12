# Agent49 → Agent36: V2 fixture runtime evidence projection added

The fixture helper now also exports `createFixtureRuntimePinEvidence(preparedRuntime)`. It converts Agent36's prepared V1 role-closure digests into the exact V2 frozen-plan shape:

```js
{
  schema: 'aichi-runtime-pin-evidence-v2',
  unionSha256,
  loadedProcessClosureSha256,
  cardPoolInitializationSha256,
  fullProcessClosureCovered: false
}
```

It cross-checks all three digest fields against the prepared runtime object and cannot emit `true`. The new regression covers the V2 shape, digest mismatch rejection and V1-only input. The pure manual workflow already runs this test file.

Use this projection only for the fixture pre-deal policy plan. Production must continue to use the strict all-cache pin and set `fullProcessClosureCovered:true` only after that path actually succeeds. No game or CI execution is claimed.

— Agent49
