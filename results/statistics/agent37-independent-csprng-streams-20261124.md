# Independent CSPRNG streams and Aichi paper-shuffle routing

**Status:** protocol v2 implemented; focused unit, campaign-contract, and compiled Twinleaf integration tests passed. This is still engine/reproducibility evidence, not competitive matchup evidence.

## Why this exists

The legacy headless path remains the default and retains its historical 32-bit xorshift seed handling. Its single game stream historically served both physical shuffle and coin prompts, and its Fisher–Yates index selection used `floor(randomFloat * bound)`. That is not an adequate random-input contract for a large fixed-field campaign.

The opt-in `independent-csprng-streams-v2` path provides separately replayable game, physical-seat, coin, and policy streams. Version 2 additionally routes the paper-relevant direct card shuffle callsites present in the published Aichi field through the correct physical owner's unbiased shuffle stream.

## RNG material and streams

- `simulation/evaluation/agent37-independent-rng-v1.cjs` creates six separately sampled 256-bit keys using Node's OS-backed `crypto.randomBytes(32)`: `shuffleSeat0`, `shuffleSeat1`, `coin`, `engine`, `policySeat0`, and `policySeat1`.
- Each key drives its own HMAC-SHA256 counter stream. This is computationally pseudorandom under the HMAC and OS-CSPRNG assumptions; it is not a claim of literal independence.
- Each stream exposes a 32-bit sample, a float-compatible `Math.random` function, and `randomInt(bound)`. Bounded integers use rejection sampling, avoiding modulo/floor bias for integer bounds up to (2^{32}).
- `simulation/twinleaf/headless.cjs` accepts `rngProtocol: 'independent-csprng-streams-v2'`, validated `rngMaterial`, and its SHA-256 `rngMaterialCommitment`. It assigns distinct streams to each physical seat's ordinary deck shuffles, live `CoinFlipPrompt`, other engine randomness, and each seat's policy randomness. The legacy 32-bit `seed` remains a schedule/trial label under this protocol; it is not the entropy source.
- The material schema remains `aichi-independent-rng-material-v1`; the protocol version is v2 because the mapping of direct Aichi card shuffles to the physical-seat streams changes deterministic replay semantics.
- `simulation/evaluation/aichi-campaign-runner.cjs` accepts v2, creates fresh material for each attempted trial, and retains the raw keys and commitment in each trial record, including caught engine-exception records.
- `simulation/evaluation/aichi-evidence-envelope.cjs` validates the material schema, unique stream keys, per-trial commitment, observed protocol, and the required v2 paper-shuffle receipts.

## Aichi-field direct-randomness audit and correction

A targeted scan of the 29 authenticated original Aichi lists found four card implementations whose paper shuffle effects called `Math.random()` directly rather than using the explicit seat shuffle streams:

| Card / printing | Lists containing it | Copies | Paper operation |
|---|---:|---:|---|
| Gladion CIN 95 | 6 | 6 | Reorder the acting player's face-down Prizes |
| Marnie SSH 169 | 13 | 16 | Shuffle each player's hand before putting it on the bottom of that player's deck |
| Iono PAL 185 | 10 | 11 | Same two-owner hand shuffle |
| Hisuian Heavy Ball ASR 146 | 20 | 25 | Reorder the acting player's face-down Prizes |

The nominated Hood Shield candidate contains both Iono and Hisuian Heavy Ball. The three unavailable original lists (ranks 23, 25 and 28) are not covered by this inventory.

Research-side integration:

- `simulation/twinleaf/paper-shuffle-rng-utils.cjs` supplies Fisher–Yates shuffles using the stream's exact `randomInt`, and preserves face-up/empty Prize positions.
- `simulation/twinleaf/aichi-paper-shuffle-rng-hook.cjs` patches the pinned Gladion, Marnie and Iono methods. Hand shuffles resolve the owner from live Store state, so the acting and opposing players consume their own streams independently.
- The hook is scoped to the live root Store. Speculative bot Stores retain the policy RNG installed around `decodeNextAction()`; they do not consume live physical-shuffle streams.
- `simulation/twinleaf/hisuian-heavy-ball-prize-hook.cjs` now accepts the live root Store and owner streams. In v2 it uses unbiased owner-local Prize shuffles and preserves the existing physical Prize-position correction.
- `simulation/twinleaf/headless.cjs` installs these hooks only for the independent CSPRNG protocol, restores them after each match, and reports the exact hook receipt. The campaign runner and evidence envelope reject a completed v2 record that omits this receipt.

This is a field-targeted correction, not a complete audit of every random call in the entire Expanded card pool. Direct random effects outside the four identified Aichi card families remain to be classified. The pinned `attack-coin-reflip` helper was not found in the 29 available Aichi lists; the three missing lists could change that conclusion.

## Verification

- Final v2 compiled Twinleaf lane [run 45479689101](https://github.com/FlareZ123/experiment-01/actions/runs/45479689101) passed on head `eaec6261488218bef6bb8941453e8962ab66dfec`. It passed the no-Twinleaf RNG, campaign-contract and evidence-envelope tests; compiled the pinned engine; passed owner-local card-shuffle tests and the real Store Hisuian Heavy Ball test; and passed the three-game same-process A/B/A replay smoke plus the existing native policy/RNG checks.
- The smoke sequence runs independent-material game A, game B with a different commitment, then replays A after B in the same Node process. The A outputs must match exactly; both materials must be echoed by their games; all isolation and Aichi paper-shuffle receipts must be present.
- The v2 campaign contract rejects completed results without the Gladion / Heavy Ball / Marnie / Iono hook receipt, and the evidence envelope independently checks the same receipt.
- The existing workflow `.github/workflows/twinleaf-policy-rng.yml` is reused; no new workflow was created.

Coverage also includes:
- exact six-stream material schema, key uniqueness, and stable commitment;
- rejection of malformed material and conflicting isolation flags;
- rejection sampling at the uint32 tail;
- deterministic HMAC replay and distinct per-stream sequences;
- Fisher–Yates index bounds;
- per-seat shuffle routing for both physical seats;
- policy-Store noninterference;
- Heavy Ball's real Store prompt, Prize-position behavior, and unbiased owner stream;
- synthetic campaign material archival, receipt echo, evidence-envelope audit, and tamper rejection.

All these tests are implementation/contract checks. No Aichi matchup or competitive game is qualified by this result.

## Important limits

1. **No pre-game custody ledger.** Material is retained in the resulting trial archive, but the campaign runner does not append a durable, externally anchored commitment before the first game action. A crash, retry, or restarted campaign is not yet governed by the campaign-global abort/attempt ledger required for admissible field evidence.
2. **No V3 worker integration.** The v2 path is wired into the legacy headless adapter and diagnostic campaign runner. It does not yet bind the V3 worker/container lifecycle or independently prove policy-process isolation.
3. **Incomplete field source coverage.** The four-card audit covers the 29 authenticated original lists only. Ranks 23, 25 and 28 remain unavailable; other direct-randomness callsites in the pinned engine/card pool are not fully classified.
4. **No paper qualification.** The campaign runner still identifies itself as exploratory engine feasibility and keeps competitive and rules/bot-competence certification flags false.
5. **No deck or matchup evidence.** No candidate ranking, opponent result, win-rate estimate, or fixed-deck claim changed. No 99.5% result is demonstrated.

## Next useful work

- Build a trusted host pre-game append-only attempt ledger that binds campaign ID, trial ID, attempt ID, full registered roster, and RNG commitment before the first action; make partial/aborted attempts fail closed across restarts.
- Integrate v2 with the V3 worker host without exposing raw seed material to policy workers.
- Extend the direct-randomness inventory to any newly authenticated Aichi source lists and remaining paper-relevant card callsites.
- Keep this path out of competitive reporting until the Stage-A trace and independent policy-competence gates are satisfied.

No deck is nominated by this result, and no 99.5% claim is made.
