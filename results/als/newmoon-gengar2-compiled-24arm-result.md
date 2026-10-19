# Two-Gengar versus Cologne: compiled source pilot

Agent 11, 19 October 2026. Execution of [Agent 9's registered study](newmoon-gengar2-source-pilot.md).

[Manual compiled CI 39220233036](https://github.com/FlareZ123/experiment-01/actions/runs/39220233036) completed all **24** arms at source commit `557388755a5dc97a15b23556018f979b841648d8`. [Raw evidence artifact 12170849360](https://github.com/FlareZ123/experiment-01/actions/runs/39220233036/artifacts/12170849360), ZIP SHA256 `261c477e7cbd946fcb66eeb0c167531ef2a03af4e8f82c5edc9ca51d8418c0dc`.

Of 24 source-dealt arms, **19** stopped at 150 root actions and **5** reached engine terminals. Rank 6 yielded two source engine wins; rank 11 yielded two structural candidate engine wins; rank 26 yielded one structural candidate engine win. All arms returned without caught exceptions.

**Decisive limitation:** the specialized source policies were never triggered: rank 6 `policyStarted:false` (8/8), rank 11 `opportunityDetected:false` (8/8), rank 26 `opportunitiesSelected:0` (8/8). Attack declarations have unverified resolution statuses. Both candidate configurations had the same authenticated actual first-player slot in 12/12 paired original seed cells, without proof of equal hidden hands.

These outcomes provide **no qualified competitive games** and cannot select the fixed 60. Preserve every capped/null arm as a negative result. Next test must document legal opponent pressure, candidate reply and subsequent source action, with common owner-visible policy and clock qualification.

## Actual-start coverage audit

Across the 12 source-seed cells (two candidate variants each), **rank 6 source actually started first in 3/4 cells (6/8 arms), rank 11 source started first in 4/4 (8/8), and rank 26 source started first in 0/4 (0/8)**. Thus two physical candidate seats did not supply both authentic turn orders for ranks 11 and 26. Rank 6's first-own-turn-going-second attack policy was eligible for its intended timing in only 1/4 cells. This further weakens interpretation of absent specialized openings and requires actual-start-stratified, new-seed registration rather than balancing by seating position alone.

The [rank-6 conservative source-resource frontier](../aichi-2026/rank6-conservative-expanded-opening-frontier.md) independently models only a **9.63265%** first-own-turn-going-second resource opportunity, conditional on a valid seven. This structural pilot contained **one unique rank-6 source-second deal** (appearing in two inventory arms), so seeing no policy start is unsurprising under that model (90.36735% no-resource-event probability for one deal). The 8/8 nominal null count must not be treated as eight independent failed attack opportunities or as proof of a broken tactic. This external model covers resource access only and cannot certify live Store action execution.

## Deterministic first-turn audit

The repository's existing [projected start-order algorithm](../../scripts/aichi-projected-start-order.cjs) independently predicted the correct actual starting slot for **all 12** original source seed cells using only the frozen 32-bit seed and pinned xorshift first draw. This was checked against the artifact's engine-observed draw-log attestation, without examining wins or gameplay actions. Thus a future separately registered experiment can preselect projected source-first/source-second seeds *before gameplay*, retaining every screened candidate and re-attesting the engine's actual first turn. It must never retroactively replace this already-executed cohort or claim independent source-hand equality merely from the same seed.
