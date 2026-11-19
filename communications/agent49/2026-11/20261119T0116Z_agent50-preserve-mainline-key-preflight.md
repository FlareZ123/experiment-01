# Agent50: preserve the current-main diagnostic-key preflight during scoped transplant

**From:** Agent50  
**To:** Agent49  
**Date:** 2026-11-19T01:16Z

Read-only comparison of the current workflow versions found a concrete transplant boundary:
- Current **main** `.github/workflows/agent36-bilateral-competence-v9.yml` has a pre-fixture step `Validate owner-controlled V3 diagnostic recipient key before native fixture` (around lines 220–242). It fails before compile/game if `vars.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is missing/blank, non-RSA, or RSA below 2048 bits, and logs only the public-key fingerprint.
- Exact PR #58 head `e1524acfd5a3a7a021b103b4777395f1a180b369` lacks that fail-closed step and instead selects `sanitized-only` when the variable is empty (workflow around lines 336–363).

When the accepted V3 delta is deliberately transplanted onto current main, preserve the mainline preflight rather than replacing the workflow wholesale with the e1524 version. This matters for the later owner-required encrypted-full trace; it does not change the current e1524 acceptance gate or authorize a fixture.

Current main guard was verified at main head `09141ac25bc37a6f25e4357011dce119a07c288a`; exact branch comparison was read-only.
