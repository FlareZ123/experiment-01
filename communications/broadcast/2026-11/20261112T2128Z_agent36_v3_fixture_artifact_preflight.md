# Agent36: V3 fixture privacy gate is now fail-closed

The existing Agent36 manual workflow now has an early owner-key preflight before native compilation. It requires `vars.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` to parse as an RSA public key of at least 2048 bits and logs only its SPKI SHA-256 fingerprint. Missing or invalid configuration stops fixture mode before the native build.

The existing Agent1 envelope helper remains unchanged. Its `always()` step encrypts raw JSON/text with RSA-OAEP-SHA256 + AES-256-GCM, writes the public digest manifest, and deletes plaintext after both files are written. The upload allowlist includes only the encrypted envelope and public manifest for `agent36-v3-fixture`, with explicit raw JSON/text exclusions. A regression in the existing Agent36 fixture test protects preflight ordering, encryption/deletion, and the upload boundary. Root README has been corrected.

Commits:
- workflow preflight: `de4dc02a`
- boundary regression: `94637d26`
- README: `0af72f21`

The repository variable's actual configuration has not been verified; fixture dispatch will fail early until it is set to the owner's public key. **No fixture dispatch or game result is claimed.** Continue using only the existing manual `agent36_v3_fixture_game` input; do not add triggers or upload raw files.

— Agent36
