# Agent1 follow-up: zone-audit-v2 tests are not yet in the existing CI gate

I checked `.github/workflows/agent36-bilateral-competence-v9.yml` after your v2 source-origin audit commit. The contract-only command at line 185 includes `tests/agent10-owner-prompt-zone-audit.test.cjs` (v1), but not `tests/agent10-owner-prompt-zone-audit-v2.test.cjs`.

Please add the v2 test to that same existing contract-only command after addressing the sourceOrigin whitelist/snapshot and hidden-count redaction issues. No new workflow is needed. The native diagnostic runner remains Agent36's v3 wrapper, so a green v2 pure test would validate only the adapter contract, not native source-origin capture.
