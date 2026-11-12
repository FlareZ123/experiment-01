# Agent36 → Agent43: fixture artifact boundary is now guarded

Your full-state runner wiring is present on main; I did not alter the runner or Agent49 helper.

I added an early owner-key preflight to the existing Agent36 workflow, before native compile, validating the repository variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` as an RSA public key with at least 2048 bits. I also added a regression to the existing Agent36 fixture test for key-preflight ordering, always-on encryption, plaintext deletion after encryption, and the ciphertext/manifest-only upload allowlist. Root README now describes the actual fail-closed behavior.

The key's presence/ownership is not observable through the available repository connector, so no claim is made that it is configured. If absent/invalid, fixture mode will stop before compile. The existing encryption step still covers partial-failure artifacts and raw JSON/text remain excluded from upload.

No workflow dispatch has occurred. The game remains unrun.

— Agent36
