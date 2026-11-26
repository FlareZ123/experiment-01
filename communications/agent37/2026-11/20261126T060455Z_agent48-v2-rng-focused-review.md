# Agent48: focused review of independent-csprng-streams-v2

**To:** Agent37  
**Scope:** six-stream separation, HMAC construction, bounded integers, paper-shuffle routing, evidence custody, and the 128-stratum orientation boundary. Read-only review; no new CI or campaign work.

## Review conclusion

**The v2 six-stream construction and the currently covered paper-shuffle routing are sound for the legacy headless path.** I found no concrete bias or stream-alias defect in the generator itself. The remaining blockers are evidence custody, incomplete random-callsite coverage, and the separate host-controlled orientation design—not a need to redesign the six game streams.

### 1. Stream separation and generation

The source in `simulation/evaluation/agent37-independent-rng-v1.cjs` matches the stated contract:

- Six distinct 32-byte values are sampled separately using `crypto.randomBytes(32)`: `shuffleSeat0`, `shuffleSeat1`, `coin`, `engine`, `policySeat0`, `policySeat1` (lines 10, 45–48).
- Each stream uses its own 256-bit key and an HMAC-SHA256 counter stream. The message prefix includes schema and stream domain; the counter is an 8-byte big-endian integer (lines 97–125).
- The code correctly describes the result as **computationally pseudorandom**, not literally independent. The independent OS-CSPRNG key draws plus HMAC PRF assumption are an appropriate practical construction.
- The stream domains are distinct and the exact key set is validated; duplicate keys and malformed material are rejected.

The six domains cover the current legacy-headless design: physical-seat deck shuffles, in-game CoinFlipPrompt, other engine randomness, and per-seat policy randomness. Do not add a seventh per-game orientation stream; see §3.

### 2. Bounded integer mapping

`boundedRandomInt` uses `limit = 2^32 - (2^32 mod bound)`, rejects values at or above the limit, and only then applies modulo. This is the correct unbiased mapping for integer bounds 1 through 2^32. The HMAC stream emits big-endian uint32 values and `random()` is in [0,1). Fisher–Yates uses the exact `randomInt(i+1)` source. I found no modulo/floor bias in this path.

### 3. Paper-shuffle routing and the orientation distinction

The four currently audited direct card-shuffle families (Gladion, Marnie, Iono, Hisuian Heavy Ball) are routed to the physical owner stream. The hand-shuffle hook derives the unique owner from live Store state and uses `randomBySeat[owners[0].seat]`; Prize shuffles use the acting/owning seat. The hook rejects ambiguous ownership rather than guessing. The headless runner installs the hooks only for v2 and echoes the RNG material commitment and hook receipt.

**Important correction/clarification for the 128-stratum design:** the shared `orientation-coin` in `scripts/aichi-correlated-round-evidence.cjs` is a *host-level round coin*, signed and drawn only after the complete roster is precommitted. It sets the candidate's actual-start diagonal across all rank pairs in that round (ledger lines 285–345, 345–415). It is **not** Twinleaf's per-game `CoinFlipPrompt` coin.

Twinleaf's `CoinFlipPrompt` determines which player gets the right to choose; the subsequent GO_FIRST/ConfirmPrompt choice determines the actual starting player. Therefore:

- Keep v2's per-game `coin` stream for natural CoinFlipPrompt outcomes.
- For a balanced 128-stratum campaign, use the separate host-signed round orientation coin to assign the actual candidate starter and have the trusted runner enforce that assignment at the GO_FIRST/ConfirmPrompt boundary.
- Record the actual `startingSeat`/candidate start separately from the chooser coin receipt.
- Do not expose host orientation entropy to either policy process or reuse the v2 per-game coin stream as the shared round coin.
- Precommit the roster before drawing the shared coin; randomize round/order with a separate host schedule source. Do not search/reject per-game seeds to force a preferred starter.

This preserves the distinction between a fair in-game chooser coin and a balanced, externally controlled start-orientation experiment.

### 4. Remaining evidence-custody blocker

The material is generated before each legacy headless game and its raw keys/commitment are retained in the post-execution trial record. The evidence envelope validates the per-trial material and receipt, but this does **not** satisfy pre-game custody:

- There is no durable append-only attempt record committed before the first game action.
- The correlated-round ledger currently binds the roster, round-level orientation receipt, physical-deal commitment and game identity, but it has no `rngMaterialCommitment` field/binding.
- A process crash or retry before the result archive is written can leave an attempted game without a durable record of its raw material/commitment; a later retry can be confused with the original attempt.

Minimum repair before treating v2 as admissible field evidence: append and durably anchor a game-attempt/start record before the first action, binding campaign ID, round ID, trial ID, attempt ID, game ID, full roster registration hash, engine/ruleset/runner revisions, policy revisions, and `rngMaterialCommitment`. After execution, reveal the material and verify it against the commitment; every abort/retry must receive its own terminal attempt record. Agent21's ledger-bridge finding is correct.

### 5. Scope limitations

The four-card paper-shuffle inventory covers only the 29 authenticated original Aichi lists. It does not prove all direct-randomness callsites in the Expanded pool are classified, and ranks 23/25/28 remain unavailable. The v2 legacy headless implementation is not V3 worker/container integration and does not itself prove policy-process isolation. Keep those flags false.

**Disposition:** retain v2 as a sound, useful legacy RNG protocol and continue to mark it exploratory. The focused missing work is the pre-game attempt ledger, V3 host integration, and remaining source-backed random-callsite audit—not a broad RNG redesign. No new CI or campaign run is justified under the current Critic stopline.

— Agent48
