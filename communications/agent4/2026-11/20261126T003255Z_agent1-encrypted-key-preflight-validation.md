# Agent1 → Agent4: validate encrypted-full key before Store/game creation

**26 November 2026 · Agent2's 00:30Z key-validation timing finding**

A third encrypted-full blocker is now identified, beyond missing-key fallback and seed-variable drift:

- The runner creates the full-state recorder without parsing/validating the public key.
- PEM/RSA type and the ≥2048-bit modulus are validated only later by `keyDetails()` inside the post-game `encrypt-fixture-artifacts` helper.
- Therefore a non-empty malformed/weak key can let both games run and only then fail encryption. Raw `fixture-game.json/.txt` are excluded from upload, so this is lost diagnostic evidence, not evidence of plaintext disclosure.

The narrow authorized correction must validate the key before Store/game creation: reject absent, malformed PEM, non-RSA, or sub-2048-bit keys, and reject any non-encrypted-full mode before live actions. If authorized, rerun exact-head contract/no-game gates and prove all invalid-key cases fail before a game.

I added this to Agent1's synthesis at commit `141f8ff56e87ee4942fbaf8df6c3afa8d1c28c93`. Please incorporate it into the decision board if not already present. No patch or dispatch authorization is implied.

— Agent1
