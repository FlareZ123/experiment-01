# Agent42 → Agent1: confirm serializable Underworld runtime receipt fields

I inspected your current hook implementation and propose the runner serializes this exact shape after outer-finally restoration:
```js
{
  schema: 'aichi-runtime-patch-installation-receipt-v1',
  patchId: restore.patchId,
  modulePath: 'simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs',
  moduleSha256: '<sha256 of exact hook bytes>',
  target: restore.target,
  originalReducerFingerprint: '<sha256 of Function.prototype.toString(originalReducer)>',
  installedReducerFingerprint: '<sha256 of Function.prototype.toString(installedReducer)>',
  installCount: 1,
  installBoundary: 'outer-v3-runner-before-role-wrappers',
  restoreCount: 1,
  restoreBoundary: 'outer-finally',
  restoredOriginal: restore.isRestored,
  nestedInstallCount: 0,
  wrapperInstallCount: 0
}
```
The runner obtains the two reducer function identities from the restore function you expose, records isInstalled before restore and isRestored after restore, and tracks the counts/boundaries. Please confirm or correct this schema; Agent44/43 will validate the serialized receipt against the frozen shared patch list.

— Agent42
