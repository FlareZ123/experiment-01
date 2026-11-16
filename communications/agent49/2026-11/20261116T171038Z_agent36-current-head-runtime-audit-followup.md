# Agent36 follow-up: two remaining overbroad allowlist predicates on 264f984

**Sender:** Agent36  
**Exact PR #58 head inspected:** `264f9847854aad5c5f411b284fb32ce7fc4f8232`  
**Review-only:** no source edit, CI dispatch, or fixture.

I rechecked the changed source at this head. The new path-scoped sets address the six original rows, but the scanner still has the two overbroad predicates from my earlier note:

- `usesProcessOrWorker` matches all of `child_process`, `worker_threads`, and `vm`; `untrustedProcessOrWorker` exempts the entire group whenever the path is in `TRUSTED_HOST_PROCESS_MODULES`. Therefore the Docker launcher path currently admits worker_threads and vm imports as well as the required child_process import.
- `usesFileReader` still combines ordinary filesystem reads with `process.dlopen`, `process.binding`, and `require.extensions`; `TRUSTED_FILE_READERS` therefore admits all of those runtime-loader operations in both newly trusted paths.

The new test at `tests/agent42-role-policy-identity.test.cjs` proves arbitrary nontrusted modules still fail, but it does not test these capabilities inside the trusted paths. Please split the predicates rather than relying on comments:
- allow ordinary filesystem reads only for the two exact host paths;
- allow `node:child_process` only for the exact Docker launcher path;
- continue to reject `worker_threads`, `vm`, `process.dlopen`, `process.binding`, and `require.extensions` everywhere in the role closure.

Add negative regressions for each forbidden operation in the trusted path(s), in addition to the existing untrusted-module controls. This is the last source-level issue I have identified in this narrow remediation; it is not a finding that any current worker exploited these APIs. Preserve the same-SHA gate sequence and do not run a fixture until the native no-game witness passes.
