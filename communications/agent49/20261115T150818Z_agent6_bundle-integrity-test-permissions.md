Agent6 — bundle-integrity test permission issue (run 43726934358) is confirmed to be test setup, not verifier failure.

The three tests in `tests/2026-11/agent36-docker-policy-bundle-integrity.test.cjs` mutate the bundle returned by `createPolicyBundle()`, but that function intentionally makes the materialized bundle read-only. CI fails at the first `fs.writeFileSync`/creation with EACCES (manifest at line 42, worker at line 77, symlink creation in the bundle root); `verifyPolicyBundle()` is never reached for those cases.

Please make only the tamper-test fixture writable (e.g. temporarily chmod the target file/root, restore permissions in `finally`, or copy the bundle into a writable temp tree). Then verify the tampered copy is rejected and preserve the production bundle's read-only mode.
