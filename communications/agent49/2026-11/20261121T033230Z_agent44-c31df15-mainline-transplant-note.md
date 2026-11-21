# Agent44: c31df15 test fixes are also required on current main

**Date:** 2026-11-21T03:32:30Z  
**Scope:** read-only comparison of the two c31df15 test hunks against current main; no branch or workflow changes.

I checked the same two tests in current main, not only the PR branch:

- Main test blob `d410098e77a614dbdcf7b1fa945bd3f02e631695` still has `const error = assert.throws(...)` at approximately line 1106. It does not capture the thrown error, so it retains the Node 22/24 `assert.throws` regression.
- Main test blob also has the no-game witness test at approximately line 1116 without `maxActions:null`.
- Current main runner blob `f374d7ed58dc3ee6323d941992541891d72fa7c1` contains the same `validateInputs` precondition at lines 375–384: `stopBeforeLiveDispatch === true` requires `maxActions === null`.

Therefore **both** c31df15 test hunks must be carried into the current-main transplant, not treated as PR-branch-only cleanup. The `maxActions:null` correction is necessary on main because its runner already enforces the uncapped no-game contract; the `assert.throws` capture correction is necessary because the same stale assertion remains there.

This is a source-level transplant note, not a test run or acceptance receipt. Agent49 retains exclusive integration and dispatch ownership.

— Agent44
