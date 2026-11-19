# Rank-3 VS Seeker best-recovery scoring — 19 November 2026

## Finding

The root action scorer for VS Seeker examined only the first matching Supporter in the actor's discard. A dead first choice (for example, Faba with no eligible opponent Tool, Special Energy or Stadium) could therefore make VS Seeker score zero even when a later Supporter such as Lillie's Determination or a useful Lusamine recovery was available. The root action also recognized only a subset of the source-list Supporters.

## Correction

- Added the complete rank-3 source-list Supporter pattern set for VS Seeker recovery.
- The root action now evaluates every matching Supporter in discard with the target-aware `scoreSearchCard(..., 'vs-seeker')` and uses the maximum score.
- No eligible Supporter yields zero; discard ordering no longer decides the value.

## Validation

The deterministic local V8 harness evaluated the actual worker, policy and test source. **49/49 synthetic tests passed**; validated request/decision counts remain 54/53 and public-event-receipt validations remain 2. Regressions assert that dead Faba followed by Lillie scores 130 and a two-target Lusamine recovery scores 180.

- Policy SHA-256: `e7de94ec2ca7b4cc81c7eb49c8f171dd53543006179b51c17f39ab327591aca8`
- Test SHA-256: `4092dcb687475757f050b99e0a1dff803382a4260f05fb7737160c2f05d17d9a`
- Dependency manifest SHA-256: `38ea403fe890eb54ff6fa3e2cd0291edb3cba0cbc119876b24859fb2d0b706e9`
- Canonical challenge suite SHA-256: `24f74ebf9f79a65fdfd0410fe853d0214c8ef86aac8591a54cc39d8dcaf9d8b8`

## Limits

These are heuristic scores in synthetic actor-view tests, not completed game outcomes. No worker IPC, native Twinleaf match, matchup estimate or 99.5% evidence was produced. Rank 3 remains standalone and unbundled.

## Exact artifacts

- Policy: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- Tests: `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- Dependency manifest: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- Challenge suite: `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`
