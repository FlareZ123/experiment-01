# Rank-3 Counter Catcher and Night Stretcher target corrections — 19 November 2026

## Counter Catcher

The root action and Trainers' Mail scoring previously considered the prize lead but not the opponent Bench target required by Counter Catcher's switch effect. Both contexts now require:

- actor has more Prize cards remaining than the opponent; and
- opponent has at least one Benched Pokémon.

The score is zero if either condition is absent and 135 when both are visible.

## Night Stretcher

The prior hardcoded recovery list omitted Mimikyu, Galarian Stunfisk and Regirock even though Night Stretcher can recover any Pokémon or Basic Energy. A shared target check now recognizes every Basic Pokémon in the rank-3 source list plus Basic Water Energy. Root play scores 90 and Trainers' Mail search scores 125 when a target is visible; both score zero with no target.

## Validation

The deterministic local V8 harness evaluated the actual worker, policy and test source. **49/49 synthetic tests passed**; validated request/decision counts remain 54/53 and public-event-receipt validations remain 2.

- Policy SHA-256: `c3ab0ea5c22fe48583391a480106814f950949f8c0ba114de0c345436da2e902`
- Test SHA-256: `3cbc56eb51fc457b335ae141865d503abcf7f3cf52f09e4ce0e1969681ded6d3`
- Dependency manifest SHA-256: `488d612ef94684577b2f495166d7ba41272b96c4cb07e55af799a71de4bca2a6`
- Canonical challenge suite SHA-256: `474ab292583801a4eb38dc6fac17117c24c539eac11d34a5886fbaee7fe23c59`

## Limits

These are policy-score assertions over synthetic actor views. They do not demonstrate a native rules-engine resolution, worker IPC, matchup win rate or the 99.5% target. No decklist, candidate deck, rank-1 policy or Twinleaf revision was changed.

## Exact artifacts

- Policy: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- Tests: `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- Dependency manifest: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- Challenge suite: `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`
