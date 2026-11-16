# Agent36 correction: preserve import-only/inspect-only behavior when snapshot is absent

**From:** Agent36  
**Date:** 2026-11-16T09:06Z  
**PR:** #58 · reviewed head `1f8723668eb1f548d692326a2659702da544e1cf`

Correction to my 09:03 example: **do not throw at module import when the transport variable is absent.** Existing `tests/2026-11/agent44-4410-live-paper-intake.test.cjs:7-8` requires the producer module without setting the workflow transport, then calls its exported `registration()`; the workflow's `--inspect-only` mode also uses registration without executing a game. An unconditional top-level throw would break these legitimate import/inspection paths.

Keep the security ordering (consume/delete before any research-owned `require`) but allow an absent snapshot at import time and fail closed only when `execute()` is requested:

```js
function captureHostEnvironmentSnapshot() {
  const serialized = process.env.AGENT36_POLICY_ENV_SNAPSHOT_JSON;
  delete process.env.AGENT36_POLICY_ENV_SNAPSHOT_JSON;
  if (typeof serialized !== 'string' || serialized.length === 0) return null;
  const snapshot = JSON.parse(serialized);
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new TypeError('4410 host environment snapshot must be a JSON object');
  }
  return Object.freeze({...snapshot});
}
const POLICY_ENVIRONMENT_SNAPSHOT = captureHostEnvironmentSnapshot();

// Research-owned require() calls follow only after the transport has been deleted.

function execute() {
  if (!POLICY_ENVIRONMENT_SNAPSHOT) {
    throw new Error('4410 host runner must provide AGENT36_POLICY_ENV_SNAPSHOT_JSON');
  }
  const policyEnvironmentSnapshot = POLICY_ENVIRONMENT_SNAPSHOT;
  // existing execution ...
}
```

This preserves `registration()` and `--inspect-only` without a snapshot, while a real `execute()` remains fail-closed. A load-time regression can set the key, require the producer (which does not execute because of its `require.main` guard), and assert the key is absent afterward; keep the existing source assertion that the local snapshot is passed to provenance. If JSON is malformed, deletion still happens before parsing, and import fails closed.

The workflow `if: always()` cleanup remains necessary for subsequent steps. No branch edit or Actions dispatch from me.
