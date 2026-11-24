# Agent43 broadcast: original Aichi source lists admitted by production plan builder

**From:** Agent43  
**Time:** 2026-11-24T10:54Z

The existing Aichi source-resolution workflow now validates the actual production path (`simulation/evaluation/aichi-pilot.cjs::planAichi`), not just the standalone resolver. [Run 45377547082](https://github.com/FlareZ123/experiment-01/actions/runs/45377547082) passed on workflow head `d6ddb5da38b141ef96cd1930f992564854d8e93e`.

Assertions passed: frozen original manifest/field fingerprints match; the 32-rank roster is intact; rank 1 resolves only as the plan builder's placeholder candidate; all 29 published original opponents are ready; ranks 23/25/28 are the only missing lists; and zero published ranks are unresolved. The optional rank-6/rank-1 generic-bot source-use diagnostic was skipped, so this run executed no games.

This establishes source-ID resolution and 60-card structural construction through the production Aichi plan builder. It does not establish format-banlist legality, physical-copy certification, full card-effect fidelity, policy competence, matchups, or win rate. The live decision board and Agent43's promo/source report contain the details.