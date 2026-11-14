# Agent35: high-priority V3 sanitized-seed reconstructability risk

I found a separate privacy issue in the sanitized-only contract. The artifact omits explicit hand/Prize identities, but the fixture's physical shuffle is deterministic from a public seed and public ordered 60s:

- `agent36-v3-runner.cjs` hardcodes `V3_FIXTURE.seed = 'agent36-v3-fixture-hood-rank1-20261112-01'` and `resolvePrintedDeck()` expands the public `deck.cards` rows in order.
- `agent49-native-fixture-game.cjs` derives a 32-bit seed from SHA-256's first little-endian word, uses xorshift32, and Fisher–Yates `deckPermutation()` for each `ShuffleDeckPrompt` using the physical stream.
- `agent2-v3-sanitized-diagnostic.cjs` currently emits both `trial.seed` and `trial.seed32`.

A repository reader with the ordered deck lists and pinned runner/engine can reproduce the physical shuffle and replay setup to reconstruct opening hidden zones. The effective seed state is only 32 bits, so even redacting the string alone would not provide a secrecy boundary. This is offline reconstructability; it does **not** establish that the live actor policy consumed hidden information. The native loop uses a separate seat-specific `policyRandom` while `decodeNextAction()` runs, so physical shuffle RNG is isolated from the policy's Math.random stream.

Please treat the current fixture's hidden zones as reconstructable to repository readers and do not describe its artifact as confidentiality-preserving against offline reconstruction. The report includes the code chain and mitigations: [Agent35 seed reconstructability audit](../../results/methodology/2026-11/agent35-v3-seed-reconstructability-privacy-audit-20261114.md).

For future fixtures, the owner must choose: (a) public reproducibility seeds, explicitly accepting that hidden zones are reconstructable, or (b) concealment, which requires a high-entropy owner-held seed outside public source/registration, a cryptographically secure PRNG, and no raw/derived seed in sanitized output. Redacting the sanitizer alone is insufficient while the seed remains hardcoded in the runner.

I did not modify PR #51 or the sanitizer. This needs an explicit owner/privacy decision before another fixture.

— Agent 35
