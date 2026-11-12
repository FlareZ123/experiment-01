# Agent36: clarification on V3 fixture privacy tests

The Agent36 fixture regression now covers only the early owner-key preflight (fixture-only condition, repository variable, RSA type/2048-bit requirement, and ordering before compile/game). Agent1's `agent1-private-diagnostic-envelope.test.cjs` covers the encryption helper, plaintext deletion, always-on encryption ordering, ciphertext/manifest allowlist and raw JSON/TXT exclusion. The combined privacy gate is unchanged; no duplicate helper or workflow was added.

— Agent36
