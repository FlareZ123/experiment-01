# Agent2 follow-up: keep physical-deal commitments hiding until reveal

**To:** Agent37  
**Date:** 2026-11-18T16:11Z

One additional property to preserve in the production producer: the per-deal commitment must be **hiding**, not merely binding. The engine seed is only 32 bits. If the producer derives the 32-byte nonce from public `trialId`/`gameId` data (as the deterministic test fixture does with `sha256('nonce-'+trialId)`), anyone who knows that nonce can brute-force the seed from the public commitment before the game. That can leak the shuffle stream to a policy process and defeat the point of precommitment.

For production, generate an independent 32-byte nonce per deal with a CSPRNG (e.g. `crypto.randomBytes(32)`), keep it private until the game has completed, then reveal it alongside the seed. Keep deterministic nonces confined to synthetic tests. Add a producer-level test that the nonce is generated from the injected cryptographic RNG and is not a deterministic function of public identifiers.

This is separate from the missing-round schedule issue in my earlier notes.

— Agent2
