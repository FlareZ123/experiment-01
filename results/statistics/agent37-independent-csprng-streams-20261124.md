# Independent CSPRNG streams for campaign execution (opt-in)

**Status:** implemented and unit/contract tested; not yet a production field-campaign or competitive-evidence qualification.

## Why this exists

The legacy headless path remains the default and retains its historical 32-bit xorshift seed handling. Its single game stream has historically served both physical shuffle and coin prompts, and its Fisher–Yates index selection used `floor(randomFloat * bound)`. That is not the required evidence path for a large fixed-field campaign.

The opt-in `independent-csprng-streams-v1` path provides a stronger, replayable random-input contract without changing the legacy default or the current Stage-A registered fixture.

## Implementation

- `simulation/evaluation/agent37-independent-rng-v1.cjs` creates six separately sampled 256-bit keys using Node's OS-backed `crypto.randomBytes(32)`: `shuffleSeat0`, `shuffleSeat1`, `coin`, `engine`, `policySeat0`, and `policySeat1`.
- Each key drives its own HMAC-SHA256 counter stream. This is computationally pseudorandom under the HMAC and OS-CSPRNG assumptions; it is not a claim of literal independence.
- Each stream exposes a 32-bit sample, a float-compatible `Math.random` function, and `randomInt(bound)`. The bounded integer method uses rejection sampling, avoiding modulo/floor bias for integer bounds up to (2^{32}).
- `simulation/twinleaf/headless.cjs` accepts `rngProtocol: 'independent-csprng-streams-v1'`, a validated `rngMaterial`, and its SHA-256 `rngMaterialCommitment`. It assigns distinct streams to each physical seat's deck shuffle, live `CoinFlipPrompt`, other engine randomness, and each seat's policy randomness. `deckPermutation` uses `randomInt` when the supplied stream supports it. The legacy 32-bit `seed` remains a schedule/trial label under this protocol; it is not used as the entropy source.
- `simulation/evaluation/aichi-campaign-runner.cjs` supports an explicit `rngProtocol` option and the `CAMPAIGN_RNG_PROTOCOL` environment variable. For each attempted, resolved trial it generates fresh stream material and retains the raw seeds plus commitment in the trial record, including engine-exception records.
- `simulation/evaluation/aichi-evidence-envelope.cjs` validates the material schema, distinct stream keys, per-trial commitment, observed protocol, and the completed-game isolation receipts. The archive/provenance comparison also binds the RNG protocol.

The default campaign runner path remains `separate-game-and-per-seat-policy-prng-v1`. Existing campaign plans and their published seed digests are unchanged.

## Verification

Focused manual CI: [run 45296812550](https://github.com/FlareZ123/experiment-01/actions/runs/45296812550) completed successfully on main (run 10; head `108ef0621ccfc6f183bd40b1d1111e453352b279`). The lane runs syntax checks and the new RNG tests alongside the existing campaign-runner tests.

Coverage includes:
- exact six-stream material schema, uniqueness, and stable commitment;
- rejection of the incomplete uint32 tail in bounded integer selection;
- deterministic HMAC stream replay and distinct per-stream sequences;
- Fisher–Yates permutation/index bounds;
- headless deck-permutation use of the bounded-integer API;
- rejection of malformed material, bad commitments, and conflicting legacy isolation flags before engine initialization;
- synthetic campaign generation, receipt echo, raw-material archive retention, evidence-envelope audit, and tamper rejection.

This is code/contract evidence only. No Twinleaf game was played under the new protocol in this change.

## Important limits

1. **No pre-game custody ledger.** Material is retained in the resulting trial archive, but this runner does not append a durable, externally anchored commitment before the first game action. A crash, retry, or restarted campaign is not yet governed by the campaign-global abort/attempt ledger required for admissible field evidence.
2. **No V3 worker integration.** The path is wired into the legacy headless adapter and its diagnostic campaign runner. It does not yet bind the V3 worker/container lifecycle or independently prove policy-process isolation.
3. **No paper qualification.** The campaign runner still identifies itself as exploratory engine feasibility and keeps both competitive and rules/bot-competence certification flags false.
4. **Random-call audit remains open.** The explicit live `CoinFlipPrompt` and `ShuffleDeckPrompt` paths are separated. Any other pinned-engine/card implementation that calls `Math.random` directly remains on the engine stream and must be audited for its exact paper-randomness semantics.
5. **No deck or matchup evidence.** No candidate list, policy, opponent list, game result, or win-rate estimate changed. This implementation does not demonstrate any progress toward a 99.5% win rate by itself.

## Next useful work

- Add the six stream commitments to the trusted host's pre-game append-only ledger, binding campaign ID, trial ID, attempt ID, and the full registered roster before the first action. Make any partial/aborted attempt fail closed across campaign restarts.
- Integrate the stream contract with the V3 worker host without exposing raw seed material to policy workers.
- Add a two-consecutive-game Twinleaf regression proving fresh per-game streams, per-seat shuffle separation, and no state leakage across resets.
- Audit all pinned-engine random call sites and route every paper-relevant random event through an explicit stream and unbiased bounded-integer operation where appropriate.
- Keep this path out of competitive reporting until the Stage-A trace and independent policy-competence gates are satisfied.

No deck is nominated by this result, and no 99.5% claim is made.
