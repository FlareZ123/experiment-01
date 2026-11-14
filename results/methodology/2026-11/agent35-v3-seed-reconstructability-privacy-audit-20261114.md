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


### Call-path confirmation

The policy callback path is inside the protected decode call, not outside it: `runNativeFixtureGame()` invokes `decodeWithPolicyRandom(seats[actingSeat], state, policyRandom[actingSeat])`; that helper assigns global `Math.random` before calling `bot.decodeNextAction(state)`. Within `withActorOnlyRootPolicy()`, a configured `rootIntentProvider` is invoked synchronously from that wrapped decode path via `invokeActorRootIntentProvider()`. The provider receives actor seat, public view, catalog, bounded root options and a one-shot search callback rather than raw state, but it still executes while the policy RNG stream is installed and can call global `Math.random`. The RNG side channel therefore survives actor-view projection; it is not dependent on the provider receiving the full engine state.


### Minimal xorshift32 inverse for a regression

The inverse can be written without brute force:

```js
function undoXorShiftLeft(y, shift) {
  let x = y >>> 0;
  for (let s = shift; s < 32; s += shift) x ^= (y << s) >>> 0;
  return x >>> 0;
}
function undoXorShiftRight(y, shift) {
  let x = y >>> 0;
  for (let s = shift; s < 32; s += shift) x ^= y >>> s;
  return x >>> 0;
}
function undoXorShift32(outputState) {
  let x = undoXorShiftLeft(outputState, 5);
  x = undoXorShiftRight(x, 17);
  x = undoXorShiftLeft(x, 13);
  return x >>> 0;
}
const outputState = Math.floor(Math.random() * 0x100000000) >>> 0;
const policySeed = undoXorShift32(outputState);
const physicalSeed32 = (policySeed ^ POLICY_SEED_XORS[seat]) >>> 0;
```

This assumes the policy stream's first draw is being sampled; if earlier calls occurred, reverse the known number of xorshift steps. The root policy callback can deliberately sample at entry, before its own random calls. The snippet is for a regression demonstrating the old vulnerability; it must not be retained as a production policy helper.

---

## 14 November 2026 05:35 UTC — remediation status and remaining seed-contract edge

- Agent36's main commit `fb514b277a3033b4a36120cb41843ded52b1ac14` replaces the former `physicalSeed32 XOR POLICY_SEED_XORS[seat]` policy stream derivation with explicit per-seat policy seeds. The V3 fixture runner now supplies `policySeedBySeat`; policy `Math.random` is independent of the physical shuffle seed for the current fixed fixture inputs. The prior live inversion path described above is therefore **closed in current main**. This does not establish that any policy exploited the old path.
- The same commit fixes the Prize-count snapshot projection by summing the cards in Prize slots and adds regressions for sparse, full, and malformed slot arrays.
- Contract-only run [43561723505](https://github.com/FlareZ123/experiment-01/actions/runs/43561723505) passed on main head `0436cde116238cf75cf3244e6a0cafcefda1edf8`. The adapter/runner syntax check and pure contract suite succeeded, including `tests/2026-11/agent49-native-fixture-game.test.cjs`. Twinleaf checkout/compile, V3 fixture execution, and competitive tests were skipped. This is source-contract validation, not a native game.
- Independent code review found a narrow generic accepted-input collision: `seededRandom(0)` remaps its initial state to `0x9e3779b9`, but `normalizePolicySeedBySeat()` compares the raw normalized integers. Thus `[0,0x9e3779b9]` can pass the distinct-seat check while producing identical streams; physical seed 0 and policy seed `0x9e3779b9` can likewise pass the raw inequality check while sharing a stream. The current fixture's explicit seeds `[0x243f6a88,0x85a308d3]` are nonzero and unaffected. Agent36 was notified in `communications/agent36/20261114T053013Z_agent35_policy-rng-effective-seed-collision.md`; the existing contract-only run predates any fix for this edge.
- **Offline reconstructability remains open and distinct from the fixed live side channel.** The public fixture seed, ordered public deck rows, and deterministic xorshift32/Fisher–Yates physical shuffle still permit post-game reconstruction of hidden zones. The owner must choose public reproducibility (accepting that exposure) or confidentiality (owner-held high-entropy physical seed, cryptographic stream, and no raw/derived seed in public source, registration, or artifacts). A private diagnostic encryption key alone does not hide a seed published in the runner.
- No further fixture should be dispatched until the actor-only execution boundary is valid and the owner has selected the physical-seed confidentiality model. Do not change the fixed 60 or infer competitive strength from the first fixture.
