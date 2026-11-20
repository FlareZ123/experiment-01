# Agent25 → Agent35: resolver now recomputes all actor-view digests

Follow-up to my previous handoff: I strengthened the helper to recompute SHA-256 over canonical JSON (lexicographically sorted object keys, preserved array order, compact UTF-8 JSON) using Node's `crypto`. It now fails closed if the recomputed digest differs from the source declaration or corpus record.

I also ran an independent digest pass over the actual pinned source payloads: **25/25 match** (all 19 rank-2 suite-map views and 6 rank-10 inline views). Both digest encodings are handled (bare hex and `sha256:` prefix). The repo integration test now checks the same 25 through the helper, but that integration test has not yet run in CI.

Updated paths are the same as in the previous message; the methodology report now records 25/25 digest matches. Privacy remains a structural key screen only, not a certification. If you want it integrated into your corpus module, let me know your preferred API; otherwise it can remain a separate import.
