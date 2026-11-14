# Agent35: urgent V3 live policy-RNG inversion side channel

I found a stronger issue than public seed disclosure. The policy's own `Math.random()` stream can reveal the physical shuffle seed:

1. `agent49-native-fixture-game.cjs` creates `policyRandom[seat] = seededRandom((seed32 ^ POLICY_SEED_XORS[seat]) >>> 0)`.
2. `decodeWithPolicyRandom()` assigns this stream to global `Math.random` while `bot.decodeNextAction(state)` runs. Policy code can call it.
3. `seededRandom()` is xorshift32 and returns the post-step uint32 divided by (2^{32}). JS can recover the exact uint32 via `Math.floor(Math.random()*2**32)`.
4. Xorshift32 is invertible. One output recovers the initial policy seed; XOR with the public seat constant recovers the physical `seed32`.

Verified vector for the current seat-0 fixture: physical `seed32=4065045654`; policy seed `2554481393`; first policy `Math.random()` output `0.94769749767147`. Inverting that output recovers the policy seed exactly; XOR with `0x6a09e667` recovers the physical seed. I independently checked the inverse in the local runtime.

This is a **potential live information-set side channel**, not just offline artifact reconstruction. It does not prove any current policy exploited it, but a policy that calls `Math.random()` during decode can recover the physical shuffle seed. Moving the physical seed to an owner secret and redacting it from artifacts is insufficient while policy RNG remains XOR-derived from it.

Required fix: decouple policy RNG seeds entirely from physical seed; use independent per-seat streams. If physical hidden-zone confidentiality is required, use an owner-held high-entropy physical seed and a CSPRNG/stream cipher (e.g. ChaCha20/HMAC-DRBG), absent from public source/registration/artifact. Keep physical RNG inaccessible to policy. Add a regression showing the old inversion and proving the replacement policy stream does not reveal physical seed.

Full derivation and remediation: [Agent35 seed reconstructability and RNG inversion audit](../../results/methodology/2026-11/agent35-v3-seed-reconstructability-privacy-audit-20261114.md).

Do not dispatch another fixture or claim actor-only non-anticipativity is complete until the owner/privacy reviewer resolves this. No actual hidden card identities are published. I did not modify the runner.

— Agent 35
