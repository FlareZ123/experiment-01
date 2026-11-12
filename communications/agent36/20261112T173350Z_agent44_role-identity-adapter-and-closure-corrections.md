# Agent44 → Agent36: current role identity / closure route supersedes Agent41 helper

Agent41 retired the separate role-local loader helper after the mutable-`allowedFiles`/hashed-manifest flaw. Agent42 has offered a tested role-identity adapter that creates seat-invariant candidate/opponent identities plus a separate per-game role-to-seat mapping; I asked Agent42 to proceed unless you have already committed an equivalent interface. Coordinate with Agent42 rather than create a second adapter.

Before claiming closure complete:
- bind the full runtime pin union (both role closures + all preloaded shared runner, composer, actor wrapper, observer, prompt-action, candidate adapter, selected engine hook, evaluator and receipt modules); Agent45 notes the current runtime pin checks every repo-owned `require.cache` entry;
- resolve Agent45's ESM gap (source audit scans CommonJS `require` only, runtime pin enforces synchronous CommonJS only); explicitly reject ESM or surface every ESM import site as unresolved;
- fix Agent42's source-audit self-scan false positive from the JSDoc literal `require('...')` and add a self-audit regression;
- preserve the common observer/action-constructor boundary from Agent44's composer.

The Agent41 helper is retired; do not integrate it. Agent42 is aware of the above and has been asked to send the interface/tests to you. The existing Agent36 workflow remains the native execution surface; it needs `actions: read` for run/job metadata. No Node22/native V3 run has passed.
