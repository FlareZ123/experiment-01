# Agent 15: prospective rank-8 Garbodor-pressure exposure registration

**Registration date:** 19 October 2026 UTC. **Status:** frozen schedule and analysis contract; no games from this schedule have been run or scored. The new executable runner submission was blocked by host safety checks, so this document must not be described as an executed experiment.

## Objective and reason for registration

The rank-8 Secret Box → Quick Ball → Float Stone → Boost Shake Garbodor source line, followed by candidate Hood-protected Underworld Door, has been reproduced on a single retrospectively selected deal (1260748957). Even conditional seed-independent action code tested on that deal cannot establish how frequently the source opportunity actually arises. The nearest reusable adapters are `simulation/twinleaf/rank8-boostshake-autonomous-policy.cjs` (opponent) and `simulation/twinleaf/hood-garbotoxin-recovery-autonomy.cjs` (candidate). This schedule is a prospective opportunity/abort exposure test, not a competitive win-rate test.

Use **unchanged exact published rank-8 source 60**, **unchanged Hood Shield v1 source 60**, the same pinned Twinleaf revision, and the exact `runMatch` flags used in `simulation/twinleaf/rank8-boostshake-autonomous-source-run.cjs`: strict prompts, Forest Seal, Double Dragon recovery, Supporter correction, policy RNG isolation, Lele entry, Radiant gate and entry draw corrections, plus decision trace. Fix **200 root actions** per arm.

## Predeclared source seeds

Derive via existing `scripts/aichi-decorrelated-seeds.cjs`:
`deriveSlotSeeds(20261019, 'pilot', 8, repeat)` for repeats 0 through 7. Candidate in physical A uses the A seed, candidate in physical B uses the B seed. This is a pinned, decorrelated-v3 physical-slot schedule. All sixteen enrolled deals and **both baseline/conditional-policy arms** must be retained regardless of outcome.

| Repeat | Candidate physical A seed | Candidate physical B seed |
| ---: | ---: | ---: |
| 0 | 3580313645 | 1296269687 |
| 1 | 3305309984 | 3900365967 |
| 2 | 2227001189 | 4288638436 |
| 3 | 3188254129 | 1506605601 |
| 4 | 3609036223 | 2180029452 |
| 5 | 3613796106 | 1619250289 |
| 6 | 2209810282 | 4120584197 |
| 7 | 161120940 | 1218517344 |

Seeds calculated independently with `SHA-256(JSON.stringify(['aichi-decorrelated-slots-v3', 20261019, 'pilot', 8, repeat, slot, nonce]))`, reading the first four digest bytes little-endian, rejecting zero and pair duplicates as in the existing library. All 16 are distinct.

## Intended execution and predefined counters

For every seed, run:

1. **Baseline:** current `runMatch` policy unmodified; keep the actual first-turn slot, action count, finished state, Prize totals, and a full decision or root-dispatch transcript digest.
2. **Conditional pair:** wrap the rank-8 source-opponent seat with `withRank8AutonomousBoostShake` and the Hood challenger seat with `withHoodGarbotoxinRecoveryAutonomy`; record both policy audits and terminal/cap output.
3. Retain the same original deal/seat/engine settings across both arms. Treat them as *paired counterfactuals*, not independent game samples. Check actual first-player identity remains the same; do not infer it from physical A/B.
4. Record per trial: presence/absence of legal opponent opportunity, attempt, abort reason, actual completed equipped Garbodor, candidate protected-Door trigger, attached Energy/drawn-two completion, both game caps and raw engine errors.
5. When neither conditional policy triggers, require full baseline/conditional action-stream equality or report the drift explicitly. When one triggers, audit the genuine Store root actions and relevant prompt legality. Verify adapter restoration after each run.
6. Count all failures, zero-trigger seeds, early losses, incomplete games, exceptions, incorrect starts and divergent paths. Publish both actual-start denominators separately, and distinguish **source opportunity** from **game result**.

**Falsification:** any failed prompt, hidden-information access, source-deck drift, missing attached Garbodor after an alleged completion, missing actual Hooded Door effect, or unexpected no-op control divergence invalidates the corresponding positive mechanical inference and must remain visible in the output. Even a clean 16-deal execution cannot qualify a competitive rank-8 matchup without strong full-game opponent/challenger policies, printed-rule review and a paper match clock.

## Current status

There are **no trial results** for these predeclared seeds. The previous reproducible fixed-deal positive control and the independent structural Prize gate remain at `results/aichi-2026/agent44-rank8-autonomous-opponent-pressure.md` and `results/statistics/agent15-rank8-boostshake-prize-gate.md`. No 99.5% or competitive win-rate inference is warranted.

Repository-wide source coverage as of registration: 29/32 exact published opposing 60s, missing ranks 23/25/28; zero competitively qualified games.
