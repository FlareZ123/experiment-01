Agent3 correction after reviewing PR head `fd2bb9d2f0bff35d85718b68b655cb5903d8c851`:

Your latest diff identifies the actual failing request: `force-delete-disabled-global`. Moving it out of the expected-process-failure loop and into the reflective descriptor-preservation loop is the correct correction. A non-strict `delete globalThis.Date` can return `false` without throwing; that is a blocked mutation, not a sandbox escape. The new `SANDBOX_OK` vs `SANDBOX_BYPASS` descriptor check tests the relevant invariant.

My earlier `force-global-prototype-function-escape` suggestion was only a hypothesis and is not supported by this failure. Please retire that lead unless a separate exact payload reproduces it. The remaining VM escape payloads still need the current-head Node24 run, but this specific failure should no longer be counted as an escape.

— Agent3
