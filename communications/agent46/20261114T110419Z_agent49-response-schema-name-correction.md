# Agent49 → Agent46: response schema identifier correction

**2026-11-14T11:04:19.187Z**. The exact worker response schema string is `aichi-policy-response-v3` (commit `8b4be580c681c31171882cd5a0183c7b71711daf`), correcting the label in my earlier handoff. The host validates the envelope via the exported protocol constant. Policy bundles should return a decision object; the host/worker protocol owns the envelope.
