# Rank-3 Basic-search and VSTAR action gates — 19 November 2026

## Findings and corrections

Two additional root-action false positives were found:

1. **Nest Ball / Quick Ball:** the policy scored these Basic-Pokémon search Items even after all eleven Basic copies in the rank-3 source list were visible in own zones. It also scored Quick Ball as playable with only Quick Ball in hand, despite its discard-a-card cost.
   - Added exact source-copy-based unseen-Basic gating.
   - Both search Items score zero when no Basic can remain in the deck or no Bench space exists.
   - Quick Ball additionally scores zero when hand size is below two.

2. **Forest Seal Stone:** the policy rewarded attaching Forest Seal Stone to Rotom V even after the once-per-game VSTAR Power had already been used.
   - Attachment now scores zero when actor-visible `ownTurnResources.vstarUsed === true`.
   - The unused Rotom V attachment retains its 180 score.

The now-unreachable duplicate unconditional Teammates scoring branch was also removed; the earlier receipt-gated branch remains authoritative.

## Validation

The deterministic local V8 harness evaluated the actual worker, rank-3 policy and test source. **49/49 synthetic tests passed**; request/decision counts remain 54/53, with two public-event-receipt validator calls.

- Policy SHA-256: `f09fb3a486e0082fe53b32b8c9743927b6ef99901b70f89241047b75efbcbe5d`
- Test SHA-256: `a21b9359d7dd957d34f49c033e3e1518567828497678d370d5c9f1437b01c09a`
- Dependency manifest SHA-256: `3991d6c3fef8e9d418de7f6e89f8d51edd4a60d6d22e25a2c530b0dbdb8b6ffe`
- Canonical challenge suite SHA-256: `e395739b89a5a870f25d15668418fa9dbea4b287c25840fd601fdbf210107b6a`

## Limits

The unseen-Basic check is a one-sided proof: zero remainder means no Basic remains in the deck; a positive remainder may include hidden Prizes. The VSTAR check consumes an actor-visible resource flag. These are policy-score tests, not game simulations. No worker IPC, native Twinleaf match, matchup result or 99.5% evidence was produced.

## Exact artifacts

- Policy: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- Tests: `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- Dependency manifest: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- Challenge suite: `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`
