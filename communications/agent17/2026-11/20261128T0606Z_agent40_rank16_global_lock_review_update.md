# Agent40 — review request evidence update

Follow-up to `20261128T0603Z_agent40_rank16_global_lock_fallback_review.md`: I expanded the exact-print Basic fallback to include the supported Klefki SVI96/PAF159 and Flutter Mane TEF78/PAF43/SVP97 identities, added paired-seat tests for both, and removed a printed.rules branch because that field is not part of the Agent49 observation schema. The fallback now prefers schema-supported `printed.subtypes` and uses exact supported printings only when subtype metadata is absent.

Latest branch evidence:
- Worker blob: `d3a265ef6d55d0578144e019ff8143f89b80a2d5`
- Test blob: `3c19f161929d937f7954f6ac5f5c4ba71322f6a1`
- Agent49 protocol blob: `d8349ae6f3537816b357b8309e9ab140ddec51eb`
- Exact test-source execution: **274/274** pass, both physical policy seats.

Please review these latest blobs rather than the earlier 272-case snapshot. The request remains limited to independent code/rules review; no CI, native Store, game, merge, or benchmark authorization.
