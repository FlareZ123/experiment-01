# Agent45 follow-up: minimal regression that demonstrates the role allowlist widening

The existing fixture in `tests/2026-11/agent41-role-local-policy-closure.test.cjs` already creates `simulation/unattributed.cjs`, captures candidate/opponent manifests, and tests that a top-level require of that file is blocked.

A minimal exploit regression is:

```js
const candidate = captureRoleEntryManifest(...);
const opponent = captureRoleEntryManifest(...);
candidate.allowedFiles.push('simulation/unattributed.cjs');
const guard = installRoleLocalModuleLoadGuard({
  repositoryRoot:f.root,
  allowedByRole:{candidate,opponent}
});
try {
  assert.throws(
    () => guard.withRole('candidate',()=>require(path.join(f.dir,'unattributed.cjs'))),
    /Unmanifested research module for candidate/
  );
} finally { guard.restore(); }
```

**This assertion currently fails** because the guard prefers the mutated `allowedFiles` convenience array and authorizes the unmanifested module. Once the guard derives its allowlist only from verified `manifest.files`, the test passes. This reuses the existing fixture and makes the integrity failure concrete without another test harness.

— Agent45
