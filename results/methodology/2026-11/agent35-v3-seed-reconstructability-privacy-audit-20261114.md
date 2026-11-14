# V3 sanitized-only seed reconstructability audit

**Agent 35 · 14 November 2026**

**Status:** high-confidence code-level reconstructability risk; not a demonstrated leak into the live actor policy and not an end-to-end reconstruction of this fixture's exact opening zones. This is a threat-model finding that the V3 owners should resolve before describing seeded sanitized artifacts as confidential from repository readers.

## Finding

The sanitized V3 artifact omits explicit hidden-card identities, but the current fixture's shuffle is deterministic from a **public, hardcoded seed** and public ordered 60-card inputs. The native runner uses a 32-bit xorshift PRNG and Fisher–Yates deck permutation. The sanitizer also emits both `trial.seed` and `trial.seed32`. Given the public seed, ordered deck rows, pinned engine and runner code, a repository reader can reproduce the physical shuffle stream and replay setup to reconstruct hidden opening zones. This defeats offline hidden-zone confidentiality even though the artifact's JSON contains no explicit hand/Prize identity fields.

The current fixture seed is `agent36-v3-fixture-hood-rank1-20261112-01`, hardcoded in `simulation/evaluation/2026-11/agent36-v3-runner.cjs`. The native randomization chain is:

1. `resolvePrintedDeck()` expands `deck.cards` in its existing row order into `fullNames` (same runner).
2. `normalizeSeed32()` maps a string seed to SHA-256's first little-endian 32-bit word (`simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`).
3. `seededRandom()` is xorshift32; `deckPermutation()` is Fisher–Yates.
4. The `ShuffleDeckPrompt` handler calls `deckPermutation(owner.deck.cards.length, physicalRandom)`; the physical stream is initialized directly from `seed32`.
5. `sanitizeFixtureArtifact()` currently copies `trial.seed` and `trial.seed32` into the sanitized output (`simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs`).

The effective random state is only 32 bits. Even if the seed string were removed from the artifact, a 32-bit seed is not an adequate secrecy boundary against brute-force reconstruction. In this fixture the seed is additionally public in the runner source and sanitized output.

## Important distinction

This does **not** establish that the candidate/opponent policy consumed hidden information. The native loop temporarily switches `Math.random` to a separate seat-specific `policyRandom` while `decodeNextAction()` executes; physical shuffle randomness is kept in a separate stream. The actor-observation contract still governs the policy's supplied state.

The finding concerns **offline reconstructability** by someone with repository/artifact access. The existing `privacyBoundary.opponentConcealedZonesEmitted:false` only describes explicit serialized fields; it does not prove that concealed zones cannot be inferred from the public seed and deterministic shuffle implementation.

## Required owner decision and safer future contract

For future sanitized-only fixtures, choose and document one of two threat models:

- **Reproducibility over concealment:** explicitly state that seeded hidden zones are reconstructable by repository readers; do not call the artifact confidentiality-preserving or use it to claim hidden zones remained unavailable to all researchers.
- **Concealment from artifact/repository readers:** generate a cryptographically random high-entropy seed outside public source and registration (at least 128 bits, preferably 256); keep it in an owner-controlled secret/private escrow; publish only a salted commitment/hash; use a cryptographically secure PRNG/stream cipher rather than xorshift32; omit raw seed and derived seed from sanitized output. Keep the physical-randomization stream inaccessible to policy code and retain encrypted seed/trace material for owner-controlled reproduction.

Redacting `seed` and `seed32` from the sanitizer alone is insufficient while the seed remains hardcoded in the public runner or a public registration. A one-way hash of the current low-entropy seed is also insufficient as a secrecy measure.

## Immediate handling

- Treat the already executed fixture's hidden zones as **reconstructable to repository readers**; do not claim this run preserved confidentiality against offline reconstruction.
- Do not expose or compute the actual reconstructed opening hand/Prize identities in public messages.
- Ask the owner/privacy reviewer whether the intended guarantee is actor-policy information-set isolation only, or also confidentiality of hidden zones from offline repository readers.
- If confidentiality is required, revise the randomization/seed contract before another sanitized-only fixture. If public seeds are required for reproducibility, document the weaker threat model explicitly.

No gameplay result, matchup result, policy leak, or competitive win-rate conclusion is claimed.


## Stronger live policy-RNG inversion path

The current design has a stronger problem than publishing the seed: **the actor policy's own permitted `Math.random()` stream can reveal the physical shuffle seed.** In `agent49-native-fixture-game.cjs`:

- `policyRandom[seat]` is initialized as `seededRandom((seed32 ^ POLICY_SEED_XORS[seat]) >>> 0)`.
- `decodeWithPolicyRandom(bot,state,randomSource)` temporarily assigns `Math.random = randomSource` while `bot.decodeNextAction(state)` executes.
- `seededRandom()` is xorshift32 and returns the post-step 32-bit state divided by (2^{32}). A JavaScript `Number` exactly represents this binary fraction, so policy code can recover the post-step uint32 as `Math.floor(Math.random() * 2**32)`.
- Xorshift32 is invertible. One output lets policy code reverse the xorshift step to recover its initial `policySeed`; XOR with the public `POLICY_SEED_XORS[seat]` constant then recovers the physical `seed32`.

This is not hypothetical algebra. For the published fixture's seat-0 stream, the public `seed32` is 4065045654; the seat-0 policy seed is 2554481393; the first policy `Math.random()` output is exactly 0.94769749767147. Reversing the xorshift step recovers 2554481393, and XOR with 0x6a09e667 recovers 4065045654. The inverse was independently checked with a local runtime calculation.

Therefore, even if a future fixture moves the physical seed into an owner-held secret and removes it from public source/artifacts, a policy that calls `Math.random()` during `decodeNextAction()` can derive the secret physical seed through the linked policy stream. This is a potential **live information-set side channel**, not merely offline artifact reconstructability. The current actor-only boundary audits state inputs but does not audit the provenance/independence of random values exposed to policy code.

### Required correction

1. **Never derive policy RNG seeds from the physical shuffle seed** (XOR or otherwise). Use independent per-seat policy RNG seeds/streams that have no relation to physical randomness.
2. If policy randomness must be deterministic, its seed may be public or committed independently; it must not encode the physical seed. A policy recovering its own RNG state must reveal nothing about physical shuffling.
3. If hidden-zone confidentiality is required, use a high-entropy owner-held physical seed and a cryptographically secure deterministic stream (e.g. ChaCha20/HMAC-DRBG with a 256-bit key), kept in a runner-only closure and absent from public registration/source/artifacts. Do not rely on xorshift32 for secrecy.
4. Add a regression demonstrating that the old linked streams are invertible, then assert the replacement policy RNG cannot recover or predict the physical stream. Keep policy RNG access separate from physical RNG at the call boundary.

This does not prove any current policy intentionally called `Math.random()` to exploit the channel. It does mean the current implementation permits it; do not treat actor-only observation filtering alone as a complete non-anticipativity guarantee until the RNG streams are decoupled.
