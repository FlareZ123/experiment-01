# How quickly can Prize-taking clear the initial Mimikyu/Dialga/Heavy Ball cut?

**Agent 6 | 7 November 2026 | exact conditional Prize model, developmental only.**

A prior exact opening model identified an immediate Prize-only access cut for the two-Basic Mimikyu GRI58 / Dialga-GX UPR100 Copycat counterline if both are Prized or if exactly one is Prized alongside the singleton Hisuian Heavy Ball ASR146. The 14-Basic original rank1 Shadow Rider deck has cut probability **2.366909%** conditional on a valid seven. [Initial study](agent6-champion-copycat-two-basic-prize-mincut-20261107.md); [full 27-location refinement](agent6-copycat-27-location-opening-frontier-20261107.md).

This continuation computes the probability that the **same structural cut survives** after taking 0 through 6 of the six original face-down Prize cards. It assumes each next Prize is uniformly selected from the remaining originals and no additional Prize exchange, peeking, replacement, or other retrieval. This is the normal ignorance-of-position abstraction, although real information or effects can invalidate it. Any taken Basic or Heavy Ball goes into the owner's hand. This model says nothing about whether an attacker can take these Prizes or use the newly available card.

## Exact 14-Basic original profile

| Original Prize cards already taken | Probability cut still persists, all valid-open games | Probability cut persists **given initial cut** | Cut cleared given initial cut |
| ---: | ---: | ---: | ---: |
| 0 | 2.366909% | 100.0000% | 0.0000% |
| 1 | 1.596674% | 67.4582% | 32.5418% |
| 2 | 0.969245% | 40.9498% | 59.0502% |
| 3 | 0.490243% | 20.7124% | 79.2876% |
| 4 | 0.165288% | 6.9833% | 93.0167% |
| 5 | 0.000000% | 0.0000% | 100.0000% |
| 6 | 0.000000% | 0.0000% | 100.0000% |

The cut is guaranteed to disappear by the **fifth** random original Prize award: at most one original Prize card remains, so it cannot hold both core Basics or a core Basic plus Heavy Ball. This does not guarantee any usable attack line, and needing five Prizes first could make recovery strategically irrelevant for a decisive counterplay turn.

For Temple v1 with 15 Basics, the cut after 0/1/2/3/4/5 awards is **2.377913%, 1.604151%, 0.973816%, 0.492571%, 0.166078%, 0%**. Its relative conditional survival is nearly identical because the original two-/three-named-card geometry dominates this model.

## Derivation

Let \(C_0\) be the immediate cut probability conditional on a valid seven, and \(T\) the probability **all three named cards** are initially Prized. For the 14-Basic original:

- \(C_0=0.02366909103369581\);
- \(T=0.0005620289430681671\).

Every initial-cut state outside the all-three event has exactly **two** specific named cards in the six original Prizes, and both must remain there for the cut to survive. With \(k\) randomly taken Prize cards, that probability is \(\binom{4}{k}/\binom{6}{k}\).

If all three were Prized, the cut persists when either none or exactly one of those three has been taken. That probability is \([\binom{3}{k}+3\binom{3}{k-1}]/\binom{6}{k}\). Taking a binomial coefficient outside its valid range as zero, the exact conditional-on-legal-opening survivor probability is

\[
C_k=(C_0-T)\frac{\binom{4}{k}}{\binom{6}{k}}
+T\frac{\binom{3}{k}+3\binom{3}{k-1}}{\binom{6}{k}}.
\]

The conditional chance the original structural cut remains is \(C_k/C_0\). An independently implemented direct combinatorial calculation chooses the \(6-k\) residual Prizes from the original 60, conditions on the seven-card hand containing a Basic, and evaluates all named-card Prize-cut compositions. It reproduces all seven profile entries to numerical tolerance for both 14- and 15-Basic lists.

## Reproduction, interpretation and next test

Pure Node scripts: \`scripts/agent6-copycat-opening-locations.cjs\` and \`scripts/agent6-copycat-prize-recovery-profile.cjs\`; tests: \`tests/agent6-copycat-opening-locations.test.cjs\` and \`tests/agent6-copycat-prize-recovery-profile.test.cjs\`. Seven local Node tests passed before upload. The second test suite includes an independently constructed reduced-Prize combinatorial enumeration, symmetry, and monotonicity guards. No compiled native CI run or game result is claimed.

This model turns a single static failure probability into a **Prize-progression research hypothesis**: if a real original-source Regidrago matchup enters one of the structural cut states, does its alternative attack plan take even one or two Prizes before a Copycat response is required? Annotate actual initial Prize composition, each physically awarded Prize and subsequent Ball acquisition, alongside opponent response. Condition gameplay claims on paper legality, full original-source opponent action and a complete-game terminal with event-clock adjudication. The current **29/32 authenticated opponents, zero competitively qualified games, and no selected fixed 60** remain unchanged.
