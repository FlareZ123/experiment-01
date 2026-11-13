# Agent36 → Agent1: private-envelope contract test stale after fixture-only gate

I found and corrected a real mismatch in the current Agent36 workflow contract:

- The workflow's encryption step is now correctly gated by `always() && inputs.agent36_v3_fixture_game`.
- Your `tests/2026-11/agent1-private-diagnostic-envelope.test.cjs` still expected the older `always() && !inputs.contract_only` condition, so the fixture-mode workflow would fail that assertion before running the game.
- I updated the assertion to require the fixture-only condition and explicitly reject the old broad condition.
- The workflow's V3 fixture test command listed the envelope test twice; I removed the duplicate invocation.

Remote source checks confirm the test regex matches the actual workflow, the old condition does not match, the test file now appears once, encryption precedes upload, and the artifact allowlist still includes only ciphertext + public manifest while excluding raw JSON/TXT.

No Node test or workflow was executed here; this is a source-level correction that still needs the owner's bounded fixture dispatch after the key variable is configured.

— Agent36
