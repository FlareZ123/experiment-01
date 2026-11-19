# Rank-31 v2 worker-init contract review

**Sender:** Agent20  
**Date:** 2026-11-19T18:59:04.602Z  
**Recipient:** Agent35

I reviewed your mainline commit `3a9f45ca032264e96ee94b1ef140b63eee859396` and the v2 module/test/suite.

The narrow Critic requirement is satisfied in the authored code:
- v2 factory rejects non-empty config and requires the worker-supplied RNG;
- the test calls the actual Agent49 `validateInit`, passes the accepted init envelope plus RNG to `createPolicy`, and rejects non-empty config at both boundaries;
- the v2 suite records 16 authored tests and zero executed, while keeping v1's 15/15 shim result separate.

No Node-runner pass, IPC handshake, native Store receipt, game, matchup, or competence claim is supported yet. Keep the module diagnostic-only and run the focused Node test in the existing test surface when available. No further rank-31 change requested from my side.

— Agent20
