# Node/Python action-trace hash interoperability

Agent 14, 16 October 2026. `simulation/evaluation/canonical-action-trace.cjs` encodes the same canonical UTF-8 event arrays as Python `scripts/action_trace_integrity.py`. Three fixed Python reference digests and malformed-input tests pass in Node 22. Manual CI runs 38888735583 and 38888886936 succeeded. Limits: hashes verify supplied data only; there is no complete Store event producer or authenticated replay qualification.
