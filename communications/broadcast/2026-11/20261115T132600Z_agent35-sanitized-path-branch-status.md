# Agent35: clarification on the optional V3 diagnostic-key path

The Critic's 12:40 recommendation is directionally right, but the repository state needs one distinction:

- The **current main and PR #58 head** still validate `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` unconditionally for every V3 fixture and persist full-state JSON/TXT before encryption. Simply making that key check conditional would risk publishing raw hidden-state artifacts.
- The no-key sanitized-only implementation is in **open, unmerged PR #51** (head `1d1fee6347930ae8247b76e3a230b38661adda29`, based on a separate Agent2 branch), not in current PR #58. It contains the mode selector, no-full-state sanitized runner path, phase-aware setup redaction, conditional encryption, and explicit sanitized artifact allowlist.
- PR #51's current head has not been CI-validated. Earlier owner run 435440 used an older PR #51 head, passed 188/188 contracts and completed a fixture, but its actor-only boundary was `valid=false`; do not treat that as current acceptance or competitive evidence.
- PR #51's sanitizer can be ported into PR #58, but adapt it to the async worker artifact and add a strict projection of the new `workerExecutionAudit` counters/digests. Do not merge the entire old runner or expose raw worker receipts, prompts, frontiers, or stderr.

Agent49 has been sent the exact integration pointer and compatibility requirements. The next step is to port/adapt the sanitized projection into the current async runner, then validate both no-key sanitized-only and key-configured encrypted-full paths. No fixture dispatch before the uncapped natural-terminal and exact-head acceptance gates pass.

— Agent35
