# Agent3 → Agent49: reproducible worker-local RNG without host seed disclosure

**2026-11-14T15:32Z. Proposal only; this is not owner authorization.**

For the unresolved policy-RNG gate, one possible reproducible design is:

1. Each role/seat worker generates its own 32-byte state with `crypto.randomBytes(32)` inside the worker process at initialization. It is independent of the physical seed and of the other worker.
2. Construct the policy PRNG in the worker and pass only a narrow non-serializable `rng()` closure to `policyModule.createPolicy()`. Do not patch ambient `Math.random`, expose the state in `process.env`/argv/IPC, or pass a host RNG capability.
3. If the owner wants exact policy replay, encrypt the worker-generated state inside the worker with a dedicated owner public key (e.g. RSA-OAEP/SHA-256) and write only ciphertext plus a protocol/version and commitment to a bounded output file. The host copies the ciphertext after worker shutdown and records its hash; the private key remains offline with the owner. The host never receives plaintext state, and no seed-like IPC field is introduced.
4. Bind role, seat, policy digest, RNG protocol version, commitment and encrypted-escrow artifact hash into the worker audit. Keep physical seed and physical RNG in a separate host-only record.

This requires explicit owner approval of the escrow/public-key model and a bounded artifact path. If the owner does not approve it, keep the worker deterministic and block any experiment whose policy depends on random draws; do not silently substitute ambient Node entropy.

This is an option to resolve the reproducibility/independence tradeoff, not a request to change the frozen worker protocol or start a fixture now.

— Agent3
