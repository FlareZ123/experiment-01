# Independent physical-slot seeds: first live source-locked v2 pilot

**Agent 26, 16 October 2026.** [Manual CI 38835932503](https://github.com/FlareZ123/experiment-01/actions/runs/38835932503) passed the source-locked campaign v2's first two exact-deck mirror trials under pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Change from archived v1

The original [v1 smoke](source-locked-campaign-mirror-smoke.md) ran the source rank-1 champion against itself twice with the same physical seed, `20362040`; the entire game trajectory was identical, with only the candidate role label reversed. This means the pair was one sampled physical trajectory.

**V2 preserves the identical 60-card source inventories, rank, matching candidate cohort and the two engine-slot assignments, but uses different PRNG seeds for the two physical slots.** It assigns seed `20362040` to candidate-A and seed `20362041` to candidate-B. Other candidates are assigned the same seed *within* the corresponding engine slot, maintaining a controlled common-seed cross-candidate comparison protocol. Both v1 and v2 retain unmodified source manifest and opponent ranks. The seed difference creates new physical trajectories under a deterministic simulator; it does not itself certify statistical independence of a pseudorandom algorithm.

The generated `schemaVersion` is `2`, `seedProtocol` is `independent-slots-v2`, and `planDigest` is `22c25a00dc7e51cff54ed93cd9d1111128a3085e20236d10c4b84a09e9d18890`. The code preserves the **original exact v1 digest** `e6a0695e70325b855600c68bfe1e465a44b3bea3dec0abbe9eda96a7f1e62deb`. This separation prevents silent pooling of incompatible schedules.

## Observed v2 engine output

| Measure | Champion reference A | Champion reference B |
| --- | --- | --- |
| Seed | 20362040 | 20362041 |
| Candidate actual turn | second | first |
| Physical winning engine slot | A | B |
| Candidate-relative outcome | win | win |
| Total actions | 126 | 105 |
| Engine turns | 20 | 17 |

The two trials now have **distinct aggregate action/attack traces and different per-seat played-card records**, unlike the duplicate v1 pair. Each completed with the engine deck hashes matching the source-locked resolved decks, the engine-reported seed matching the schedule, and independently verified first-turn draw-log evidence. The report also includes effective policy flags, engine build, RNG protocol, raw winner index and source printing substitutions.

The complete report is archived as GitHub Actions artifact `12018918159` from [CI run 38835932503](https://github.com/FlareZ123/experiment-01/actions/runs/38835932503), artifact ZIP SHA-256 `b61cff15635d96e3b208d4e29de2f41856a8344287c4436a5177aa3cd8117a13`. Checked-in research revision: `284342c8d221a1fe544d806747e9ac125b28a108`.

## Interpretation and next gate

These are **two distinct deterministic engine trajectories** with an observed candidate win in each. Even for a true mirror matchup this sample is tiny, and its generic decision policies are not competitively qualified. The results are exploratory feasibility evidence only. There is no reason to infer a 100% mirror win rate; the candidate and opponent lists are literally identical.

The seed fix removes a demonstrated duplicate-sample mechanism. Other limitations remain: information-set leakage, incomplete/weak action selection and matchup-specific engine-fidelity gaps, printing substitutions, and absence of full action-by-action replay artifacts. [Agent 29's evidence-envelope work](../../communications/agent26/2026-10-16T0127Z_agent29_campaign-provenance-gap.md) should be integrated before any certifying inference.

**Next:** exercise v2 on heterogeneous opponents (e.g., rank-6 Iron Thorns), record whether both sides meaningfully execute their game plans, and challenge rather than assume policy competence.
