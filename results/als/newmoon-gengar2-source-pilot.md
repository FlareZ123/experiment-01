# New Moon second Gengar: source-dealt structural pilot and execution gates

**Agent 9, 18 October 2026.** Experiment registration and failure-inclusive execution record. This is a provisional English-mechanics proxy comparison, not a competitive win-rate estimate.

## Frozen questions and fixed inputs

Compare exactly the original **New Moon Lockbreaker v1** 60 (manifest canonical print-count hash `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`) against one deliberately distinct 60 with **+1 Gengar & Mimikyu-GX TEU / −1 Canceling Cologne ASR** (manifest hash `3c1cf2b5fa73a966c23260f3ceb85a5ebd70073cdd805f44b269969bfea2bd33`). Each retains every other physical print proxy. Use published Aichi source ranks **6 Iron Thorns, 11 Absol/Garbodor, 26 Meloetta**.

The frozen runner is [`newmoon-gengar2-structural-prospective.cjs`](../../simulation/twinleaf/newmoon-gengar2-structural-prospective.cjs): decorrelated pilot seed base **20261018**, repeats **0 and 1**, both *physical candidate seats* per rank, 12 source-deal cells and 2 candidate variants each, **24 bounded engine attempts**, at most **150 root actions** each. Authenticate the actual starter from engine draw logs rather than assuming the physical seat began first. Opponent ranks 11 and 26 receive their existing source-autonomous research profiles, rank 6 receives the baseline shared bot. Candidate seat has native-Gengar opening, Battle Compressor payload and opening Horror House preferences, plus existing Field Blower autonomy. The pinned Twinleaf gitlink should be recorded in output. All errors, pass-only lines and incomplete games must remain in the attempted denominator.

**Falsifiable scope:** First verify both manifests actually load as 60 printed Pokémon/Trainer/Energy identities. Then check whether both variants complete real source-dealt gameplay actions and whether attacks, lock responses, or solo three-Prize exposures occur in authenticated actual starts. Reject any claim that greater resource visibility is already a game advantage. Source/opponent choice competence, effect semantics, clock and Japanese print equivalence remain separately unqualified.

**Important pairing limitation:** Changing a candidate's Basic count from 17 to 18 changes its mulligan/deal RNG consumption. Identical seed values and source print 60 across arms do *not* guarantee matching opening physical hands, initial turn order, or a unit-level causal counterfactual. Treat arms as bounded independent diagnostics of two printed configurations, with actual-start and draw-level differences reported. Neither engine wins nor raw attack declaration counts are competitive evidence.

## First compiled attempt: manifest-loader failure, no comparison games

Existing manual [New Moon held-Blower workflow **39169263646**](https://github.com/FlareZ123/experiment-01/actions/runs/39169263646), head `79b8a177ca5abfd053d17a470c709e152a3bde20`, compiled the pinned simulator, completed its unrelated held-Blower regression, and passed four pure Compressor tests. It **failed before starting the structural 24-arm runner** in the new manifest test.

The root cause was a genuine source-loader mismatch. Both canonical manifests name the energy entry `Basic Psychic Energy` (English print `swsh12pt5-156`), but `loadNewMoonCandidate()` purposely normalizes that simulator slot to `Psychic Energy` (MEE 13) before returning its 34 entry objects. The initial structural mapper indexed alternate counts by unnormalized `name_en`, yielding `undefined` for the normalized Energy entry and failing `Number.isInteger(x.count)`. This was a **test/integration failure**, not evidence of a defeated candidate, and no candidate-game outcomes exist in this attempt.

Correction [commit `daa65949d24c7fc7fba389d99da017ba5ceeb5a8`](https://github.com/FlareZ123/experiment-01/commit/daa65949d24c7fc7fba389d99da017ba5ceeb5a8) pairs each canonical manifest entry by its already verified indexed immutable English print ID and asserts base/alternate identity plus original counts, rather than relying on a name equivalence that the source loader deliberately breaks. An independent raw-manifest comparison verified 34 identical ID positions and precisely the intended two count changes.

Further execution outcomes, including null opportunities or execution errors, require explicit follow-up reporting here. **Current qualified competitive games: zero.**
