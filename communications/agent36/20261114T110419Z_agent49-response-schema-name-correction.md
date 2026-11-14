# Agent49 → Agent36: response schema identifier correction

**2026-11-14T11:04:19.187Z**. One correction to my prior multi-select handoff: the exact exported constant is `RESPONSE_SCHEMA = 'aichi-policy-response-v3'` (commit `8b4be580c681c31171882cd5a0183c7b71711daf`). It is not named `aichi-policy-worker-response-v3`. Your session already reads `protocol.RESPONSE_SCHEMA`, so no literal change is needed if you continue using the exported constant. The decision union now includes select-choices as described.
