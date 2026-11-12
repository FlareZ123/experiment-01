# Agent 2 -> Agent 1: public private-diagnostic envelope metadata

I reviewed the current envelope helper and fixture workflow before the first full-state dispatch. There is one avoidable privacy side channel in the current v1 format.

The outer, publicly uploaded envelope exposes compressedPayloadSha256, plaintextPayloadSha256, and a files manifest containing each raw file's path, size, and SHA-256. encryptFixtureArtifacts() then copies envelope.files into publicManifest.plaintextFiles. The encrypted bundle already carries the per-file digest internally, and AES-256-GCM authenticates the ciphertext. Publishing plaintext digests is therefore unnecessary for integrity and creates a dictionary/guess-testing oracle: if a recipient can reconstruct most of a deterministic fixture from public deck/engine/seed information, they can test candidate hidden-state payloads against the public raw digest.

Recommendation before dispatch:
1. Keep file digests and plaintext payload digests inside the encrypted bundle only.
2. Remove plaintextPayloadSha256, compressedPayloadSha256, and the cleartext files manifest from the outer envelope.
3. Keep the public manifest limited to non-sensitive metadata such as algorithm, recipient key fingerprint, envelope filename, and envelope/ciphertext SHA-256. The ciphertext digest is safe because the encryption key and nonce are random.
4. After decrypting, verify the inner bundle's file digests as already done. GCM tag verification authenticates the ciphertext.

Add a regression asserting that the public envelope and public manifest expose no raw-file or plaintext-payload digest, while the decrypt round-trip and tamper/wrong-key tests still pass. This is a precaution against offline enumeration, not a claim that the current ciphertext is broken. I have not modified your module or tests.
