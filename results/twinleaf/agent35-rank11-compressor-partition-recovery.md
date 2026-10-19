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


## Completed recovery: all twelve original deals, zero tactic dispatches

**Compiled CI result (19 October 2026 UTC):** all four manual-only runs succeeded on the **same frozen Git tree** `08fd956020d4e6e20bec5ca9fd65d51b4e61429f`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and English-proxy New Moon inventory hash `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`. Partitions 1 to 3 were dispatched from the immutable research branch `agent35-newmoon-payload-frozen-20261019` pointing to exactly the same commit as partition 0. The first abandoned all-twelve CI remains recorded as cancelled.

| Partition | Verified manual CI | Archived artifact ID | ZIP SHA-256 |
| ---: | --- | ---: | --- |
| 0 | [39323599382](https://github.com/FlareZ123/experiment-01/actions/runs/39323599382) | 12220819150 | `b03be5a2ac36c2f38f04e65c467a9c3db574448db5475f184006ac5a408cf4af` |
| 1 | [39324215968](https://github.com/FlareZ123/experiment-01/actions/runs/39324215968) | 12221122656 | `0ef44f22c9007d9d8dbb975f1db601bfcf1814092a26dd186631d14ed54b285c` |
| 2 | [39324222499](https://github.com/FlareZ123/experiment-01/actions/runs/39324222499) | 12221707845 | `4d0f5ca659e3b94b79131a23b13ef6dbc677b72c7fb19cb37078d53e1699a2c8` |
| 3 | [39324229478](https://github.com/FlareZ123/experiment-01/actions/runs/39324229478) | 12221882253 | `9572467529c017355aa806f066cfd50650e292132eaf928c2506567aef10faaf` |

These four raw archived JSONs contain the exhaustive original repeat IDs **0 through 11**, three per partition. All **24/24** actual Store execution arms returned successfully without engine exceptions; the paired physical start identities agreed for every source deal. The actual first-player seat was source rank11 **A in four** paired deals and candidate New Moon **B in eight**. This is a realized split, with no selective exclusion to force artificial 50/50 starts.

| Repeat | Frozen seed | Actual first seat | Roots per arm | Engine ending in both arms |
| ---: | ---: | :---: | ---: | --- |
| 0 | 2404400655 | Source A | 200 | Action cap |
| 1 | 599726095 | Source A | 174 | Source A winner |
| 2 | 3108075845 | Candidate B | 200 | Action cap |
| 3 | 595709390 | Candidate B | 177 | Source A winner |
| 4 | 14106025 | Candidate B | 200 | Action cap |
| 5 | 694942114 | Source A | 163 | Candidate B winner |
| 6 | 2689621664 | Source A | 200 | Action cap |
| 7 | 1299767519 | Candidate B | 82 | Candidate B winner |
| 8 | 920016387 | Candidate B | 200 | Action cap |
| 9 | 4190873986 | Candidate B | 200 | Action cap |
| 10 | 2237303905 | Candidate B | 200 | Action cap |
| 11 | 3079166887 | Candidate B | 200 | Action cap |

The key **negative treatment result** is stronger than a simple win/loss tally: **zero actual candidate `PlayCardAction` events for Battle Compressor were observed in either arm of any of the twelve paired deals**. Control and treatment emitted identical entire available `observations` objects after removing the explicit policy-label string. There was thus no observed Compressor conversion or distinct engine outcome. Across 24 arms, **eight** generic GX-bearing `ResolvePromptAction` selection records appeared, four per policy, but these cannot be called *Compressor discards*: the recorder filtered any prompt that selected a GX donor and did not attribute its effect. For example, repeat 1 selected Trevenant & Dusknoir-GX and Duskull at **turn 0, ordinal 7** under both arms while recording no actual Compressor play. The [fail-closed aggregate audit](../../scripts/newmoon-compressor-cohort-audit.cjs) explicitly renames them `unattributedGxSelections` and refuses competitive qualification.

The first **five own-turn snapshots per deal** provide a bounded explanation for the narrow proactive gate failing to fire: across those 60 correlated snapshots, New Moon had Mewtwo & Mew-GX Active **13** times, and Battle Compressor in hand **five** times (all five from repeat 1 with Trevenant & Dusknoir-GX Active); the intersection was **zero**. These are repeated within-game turns, not 60 independent observations. A Mewtwo already on the Bench or a held Compressor later than that window is not evaluated by this restricted snapshot. The policy itself required **both** an Active Mewtwo and held Compressor before its search tactic could run; that precondition was never visibly converted to a real card play in the full twelve-seed cohort.

Of the twelve paired deals, four pairs reached a simulator-defined terminal condition (two source wins, two candidate wins) and eight pairs reached the 200-action cap; each control and treatment arm agreed. These untimed engine statuses remain **unqualified**, with generic hidden-information-unsafe bot decisions, missing printed-rule qualification, weak or capped gameplay, and no official match-clock model. They are **not** a 50% candidate win rate: eight independent deal outcomes did not finish, and even those four terminals were never competitively certified.

The [manual Node regression run 39324789172](https://github.com/FlareZ123/experiment-01/actions/runs/39324789172) initially flagged a test-only assertion whose error text lacked a human-readable duplicate-partition label. That diagnostic was fixed in commit `c185ee4`, and the later [manual benchmark suite 39324984113](https://github.com/FlareZ123/experiment-01/actions/runs/39324984113) passed the complete fixed-partition and cohort-audit regression step. No test failure or fabricated pair was omitted from this history.

**Decision:** retire the isolated Active-Mewtwo-only Compressor intervention as a cross-rank candidate-policy improvement. Its source-visibility and decision preconditions are too restrictive in this sample. Future policy work should separately test a preregistered earlier **Mewtwo positioning/Bench access** action and owner-hand Compressor sequencing against a competent source reply, preferably on additional hard archetypes. It should never relabel these twelve old outcomes as v2 confirmatory deck wins. The status remains **29/32 exact field 60s, zero competitive-qualified games and no demonstrated 99.5% fixed list**.
