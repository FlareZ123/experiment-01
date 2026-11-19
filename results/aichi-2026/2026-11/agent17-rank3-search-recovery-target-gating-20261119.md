# Rank-3 search recovery target gating — 19 November 2026

## Finding

The rank-3 opponent policy's `vs-seeker` and `trainers-mail` scoring contexts assigned Faba a high unconditional score. The corresponding synthetic fixtures had an empty opponent board and no Stadium, yet still selected Faba. That contradicts Faba's printed effect: it needs an opponent Pokémon Tool or Special Energy attached to a Pokémon, or a Stadium in play. The same search contexts did not score Lusamine according to the available Supporter/Stadium cards in the actor's discard.

## Correction

- Faba is now scored only when an eligible opponent Tool, Special Energy or Stadium is actor-visible.
- Plumeria and Team Flare Grunt are gated on the corresponding opponent Energy target and Plumeria's hand-cost precondition.
- Guzma is gated on an opponent Bench target; Eri is scaled by the actor-visible opponent hand and revealed Item state.
- Lusamine now receives no search score with zero recoverable Supporter/Stadium targets and increases with the observed target count. The one-target score remains a heuristic and is not a native resolution ruling.
- Handiwork, Arven, Lillie, Penny, Gladion and ordinary Item/Tool choices retain explicit context priorities.
- The two existing tests now expose the dead-Faba counterexample and assert the target-aware Faba/Lusamine scoring without increasing the validated request count.

## Validation

The deterministic local V8 harness evaluated the actual worker, rank-3 policy and test source. **49/49 synthetic tests passed**. Validated request/decision counts remain 54/53; prompt-type and selection-type coverage remain unchanged. The exact hashes are:

- Policy SHA-256: `570a29b510d2d4f97c0ed82f02186946b07c1d7ae6d95e9cf50fba096dac7a1a`
- Test SHA-256: `4b5d7833c2152c87a607b629aacd96f28be52cb64fac4c4498896c3b43c341ae`
- Dependency manifest SHA-256: `6d6dbb1024a4d113ca390ade7ee9c162fc99b0bbf74bfc789d5ef9411051cadd`
- Canonical challenge suite SHA-256: `3b8f9e45d64392baa8f27642e06529b4553c9cb1ade144be244fe97e8c5898ac`

## Limits

This is a source-specific heuristic correction, not a paper-game proof. No worker IPC, native Twinleaf execution, completed game, matchup result, confidence interval or win-rate estimate was produced. Rank 3 remains a standalone, unbundled prototype. The candidate 60, rank-1 policy, PR #58, workflows, seeds, seats and Twinleaf revision were not changed.

## Exact artifacts

- Policy: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- Tests: `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- Dependency manifest: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- Challenge suite: `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`
