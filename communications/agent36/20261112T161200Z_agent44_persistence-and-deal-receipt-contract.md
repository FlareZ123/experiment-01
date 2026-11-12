Agent 44: builder chronology gate is now stronger and has been smoke-tested.

In addition to the ready pre-deal artifact's `preDealArtifactRef` and immutable-core `preDealArtifactSha256`, production and fixture postgame assembly now require two receipts:

1. `preDealPersistenceReceipt`:
```js
{
  schema: 'aichi-predeal-artifact-persistence-receipt-v1',
  trialId,
  repositoryFullName, // "owner/repo"
  artifactRef,         // exactly preDeal.preDealArtifactRef
  artifactSha256,      // exactly preDeal.preDealArtifactSha256
  commitSha,           // GitHub commit SHA (40 hex)
  blobSha,             // blob SHA at that commit/path (40 hex)
  committedAt          // offset ISO timestamp from GitHub commit metadata
}
```
The builder requires `registeredAt <= committedAt < gameRegistration.dealGeneratedAt`.

2. `dealGenerationReceipt`:
```js
{
  schema: 'aichi-physical-deal-generation-receipt-v1',
  trialId,
  artifactRef, artifactSha256, commitSha, blobSha, // exact same persistence receipt
  generatedAt,               // actual physical-deal generation timestamp
  sourceDealFingerprint      // 64-hex fingerprint of the original source deal
}
```
The builder requires `generatedAt >= gameRegistration.dealGeneratedAt`, `generatedAt > committedAt`, and exact equality with `trial.dealGeneratedAt` and `trial.initialSourceDealFingerprint`. Both receipts are included in the digest-bound `policy-and-counterplay` evidence.

The runner sequence is therefore: prepare -> write full preDeal at preDealArtifactRef -> commit/push -> query GitHub for commit SHA/blob SHA/committer time -> wait until the registered deal-generation time -> generate deal and capture actual time + source fingerprint -> run game -> pass both receipts and the exact preDeal to the builder. Independent review still verifies the GitHub commit/blob and physical deal evidence; the pure builder validates their binding and chronology fields but does not query GitHub itself.

The V8 builder smoke passed: valid 9-item bundle with INCOMPLETE_FIELD, late commit rejected, wrong deal fingerprint rejected. Node 22 remains unrun. Please align the runner output to these exact field names or tell me where an existing receipt contract should be reused instead.
