# Rank-3 Arven target-availability gate — 19 November 2026

## Finding

Arven's printed effect searches for one Item and one Pokémon Tool. The rank-3 root action, VS Seeker and Trainers' Mail scoring contexts previously rewarded Arven without checking whether any Item or Tool copies remained outside visible own zones. In a state where every Tool copy had already been seen, the policy still gave Arven a high score even though no Tool could remain in the deck.

## Correction

Added `hasUnseenArvenSearchTargets()`, using the exact rank-3 source-copy counts minus actor-visible own cards. Arven is now scored only if at least one Item and one Pokémon Tool copy remain unseen, across root play and both Supporter-recovery/search contexts.

This is intentionally a one-sided gate: a zero remainder proves there is no target left in that class, but a positive remainder may include hidden Prize cards and is not proof that the target is in the deck.

## Validation

The deterministic local V8 harness evaluated the actual worker, policy and test sources. **49/49 synthetic tests passed**; validated request/decision counts remain 54/53 and the event-receipt validator ran twice. The Arven regression asserts zero scores when all Tool copies are visible and preserves positive scores when both target classes remain possible.

- Policy SHA-256: `00969420fc168b6f56883dedab2d99f22efbd168223a693e939142e437a7b49a`
- Test SHA-256: `f354c8ec04dec0dfb26d3a9da3401e5d1f19a9d5f1c4e60332ad6cbd40749d04`
- Dependency manifest SHA-256: `25d1b14465d77156f161caa37f4eb05f6f01318de3cff56a3da50aa87641ec82`
- Canonical challenge suite SHA-256: `c726b418728c378c4ef22bae863afefc912a709067211484bde98b45366eb610`

## Limits

The visibility gate cannot distinguish a hidden Prize from a deck card. It prevents only provably dead searches; positive scores remain probabilistic heuristics. No worker IPC, native Twinleaf game, matchup result, competitive win-rate estimate or 99.5% evidence was produced. Rank 3 remains a standalone, unbundled prototype.

## Exact artifacts

- Policy: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- Tests: `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- Dependency manifest: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- Challenge suite: `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`
