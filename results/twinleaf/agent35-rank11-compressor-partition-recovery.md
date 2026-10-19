# Recovering the registered New Moon rank-11 Compressor comparison

**Agent 35, 19 October 2026.** Evidence class: recovery of a preexisting fixed twelve-deal *mechanical* intervention cohort. No claim of competitive win rate or deck superiority.

## Research question and frozen inventory

The candidate remains the previously registered 60-card **New Moon Lockbreaker v1** against the published Aichi rank-11 Absol/Garbodor 60. The comparator and treatment use the same printed candidate cards, actual 60-card source opponent, physical engine source-deal seed, source policy, deck-slot assignment and maximum 200 root actions. The treatment adds an opt-in owner-side Battle Compressor tactic that tries to put Gengar & Mimikyu-GX and Trevenant & Dusknoir-GX into its own discard, while the control leaves that owner tactic disabled. Genuine prompt validation, failed setup, missing eligible decks, passes, action caps and engine errors must be preserved.

Original registration was already encoded in [the runner](../../simulation/twinleaf/newmoon-rank11-payload-prospective.cjs): source rank **11** seat A, candidate seat B, `SEED_BASE=20261018`, `REPEATS=12`, and unchanged `deriveSlotSeeds(SEED_BASE,'pilot',11,repeat).B` for every repeat **0 through 11**. Treat this as a fixed prior schedule, without choosing seeds after seeing outcomes. The same-seed paired arms need not share complete downstream random streams once decisions diverge. Printed Japanese equivalence and human-strength opponent policies are not certified.

## Why the previous run did not finish

The first all-at-once [manual CI run 39288752303](https://github.com/FlareZ123/experiment-01/actions/runs/39288752303) was **cancelled** in its all-twelve source-comparison step after its 15-minute workflow limit. It cannot supply an outcome denominator, completed cohort or evidence for the treatment. A passing pure policy test in that run does not mean its complete Store campaign ran.

## Exact failure-preserving recovery

The cohort is now divided by a deterministic, disjoint `scheduledRepeats` function that does not inspect a seed, hand, result, Prize card or game state:

| Partition | Original repeat numbers |
| --- | --- |
| 0 | 0, 1, 2 |
| 1 | 3, 4, 5 |
| 2 | 6, 7, 8 |
| 3 | 9, 10, 11 |

Pure exhaustiveness and invalid-input tests live in [partition-plan tests](../../tests/newmoon-payload-partition-plan.test.cjs); the [partition plan](../../simulation/twinleaf/newmoon-payload-partition-plan.cjs) preserves legacy all-twelve execution if no partition is specified. Source runner records `scheduledRepeats`, `partitionIndex`, original `repeats=12`, row count and `fullCohortPresent`, preventing a three-row partition from being misrepresented as the finished whole.

The [single-partition writer](../../simulation/twinleaf/newmoon-payload-partition-write.cjs) uses an exclusive lock and atomic JSON rename, and asserts that all prescribed repeat IDs are represented even if an arm returns an error. The new [manual-only workflow](../../.github/workflows/newmoon-compressor-source-partitions.yml) pins and compiles the preexisting Twinleaf submodule, runs the pure tests, executes just three prescribed pairs, and archives an all-attempts JSON artifact. It does not run on commit.

**Completion criterion:** all four archived partitions exist and jointly show exactly twelve prescribed unique repeat IDs with complete control and treatment envelopes, retaining errors and caps. Only after this can we report descriptive mechanical opportunities, owner Compressor actions, copied attacks and terminal outcomes. Even that is **not** a professionally qualified matchup comparison; opponent-policy competence, hidden-information integrity, full paper legality and the Aichi match clock are separate blockers.

Current field and target qualification remain **29 of 32 exact published Top-32 opponent lists, zero competitively qualified games and no demonstrated fixed 99.5% deck**.
