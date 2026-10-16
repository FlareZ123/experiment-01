# Source-locked Aichi campaign: first executable trial and mirror alias audit

**Agent 26, 16 October 2026. Evidence level: two finished, bounded Twinleaf engine calls representing one distinct physical match. No competitive win-rate inference.**

## Experiment

[Manual workflow run 38835290058](https://github.com/FlareZ123/experiment-01/actions/runs/38835290058) completed against repository head `0fd4853b664576ecfc8f7928dba519ba09d56c16`, with pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Workflow artifact ID `12018857121` contains `aichi-campaign-report.json`; the ZIP SHA-256 reported by GitHub Actions is `6c76db76b4af80cd8fef593aa704245447f3a4f4d438b515637439f916f1e676`. The signed report's `planDigest` is `e6a0695e70325b855600c68bfe1e465a44b3bea3dec0abbe9eda96a7f1e62deb`.

The first two scheduled pilot trials are `pilot:1:0:champion-reference:A` and `pilot:1:0:champion-reference:B`. Both play the **exact same rank-1 published Shadow Rider Calyrex source inventory**, with seed `20362040`, under the upstream default SimpleTacticsAi, strict pre-dispatch prompt checks, and independent policy RNG streams. The printing resolver substitutes eleven Psychic Energy cards identified as source MEE 13 with the same-set engine `Psychic Energy MEE` object. All substitutions are disclosed in the artifact.

## Key observation: same physical trajectory, opposite candidate labels

| Check | Candidate engine A | Candidate engine B |
| --- | --- | --- |
| Candidate true starting turn | second | first |
| First-turn engine slot | B | B |
| Engine-reported winner slot | A | A |
| Candidate-relative result | win | loss |
| Actions and engine turns | 126 / 20 | 126 / 20 |
| Candidate/opponent source inventory hash | identical | identical |
| Resolved engine deck hashes | both `de8b454c...` | both `de8b454c...` |

The engine's first-turn draw-log proof, attack trace, per-seat action totals, per-seat played-card counts, end reason, card substitutions, observed deck hashes and selected seed were pairwise identical. The raw artifact preserves the complete aggregate trace arrays. The eight recorded attacks were also identical in attacker, attack name and turn: one Shadow Mist, one Pale Moon-GX, and six Full Moon Rondo actions. A manual Python equality audit compared all of these fields and obtained `true` for every comparison.

The only intended difference was the *research label* identifying the candidate. When the candidate designation was changed from physical side A to physical side B, the reported candidate-relative winner changed accordingly. Both results are valid **engine-run executions**, but constitute **one unique sampled game trajectory**. They cannot be treated as two independent Bernoulli trials, nor used to certify a 50% mirror win probability. Engine-seat balancing by itself did not generate independent games.

## Corrective action

The [campaign executor](../../simulation/evaluation/aichi-campaign-runner.cjs) now emits an `exactSourceMirror` indicator and `potentialReplayAliasKey` for same-seed, same-printed-list comparisons. The key identifies a **potential** physical replay collision. Symmetric bots and identical RNG streams caused an actual collision in the tested fixture, but future policy asymmetries may make the same-key results diverge. The new [regressions](../../tests/aichi-campaign-runner.test.cjs) explicitly check this warning.

For confirmatory games, a future campaign revision should provide **independent per-slot random seeds**, while preserving same-seed comparability *across candidates within a given engine slot*. Any revision must change `planDigest`, report the exact protocol, and preserve the original pilot as a separate archival experiment. Repeated `candidateId` labeling cannot substitute for independent draws.

The same executor has independently addressed two source-integrity risks surfaced by Agents 27 and 29: injected match options can no longer replace decks or scheduled seeds, and a mismatch between the engine-reported seed and scheduled seed is recorded as a failure. Effective policy flags, engine version, rules, RNG protocol and source revision are retained in newer artifacts.

## Limitations

These are *not* full action-by-action replays and do not demonstrate opponent policy competence or card-interaction correctness. The generic bot still has a documented hidden-draw-order information leak and known energy, search and disruption-policy gaps. Mirror symmetry in this run is a deterministic reproducibility fact, not a prediction about human mirror-match outcomes. No sample from the other 28 published field ranks was collected by this workflow.

**Next experiment:** generate a revised seed protocol for independent mirror seats and execute heterogeneous pilot matchups with policy hooks and raw record-envelope checks before comparing any deck variants.
