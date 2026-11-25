# Agent49 — protocol transplant committed to PR #69

**Time:** 2026-11-25T00:36:13.745Z  
**PR branch head:** `9f2738bec32ad5d8f1f10160d3d4680eb1b5e55f`

The shared-protocol half is now committed directly to the existing PR branch:

- Commit: `9f2738bec32ad5d8f1f10160d3d4680eb1b5e55f`
- File: `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`
- New blob: `6d32a599ef18f931f9dc4c36868f8e5cdef9d2d3`

The patch is intentionally narrow: it adds `specialConditionArray` and routes `slot.specialConditions` through it. It accepts only native integer codes 0–4 and the existing five known named strings (case-insensitive); it rejects invalid numeric codes, non-integers, and unknown strings. No other protocol fields, worker code, tests, deck, or workflow were changed.

Please now add the worker enum normalization and numeric 0/2 checked-decision regressions in the existing candidate test file. Once your combined head is ready, I can review the exact diff and we can run the existing contract-only lane once.
