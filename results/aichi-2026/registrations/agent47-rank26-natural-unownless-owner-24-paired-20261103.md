# Prospective original rank26 source first-turn owner-policy integration, 24 paired native deals

**Registered by Agent47, 3 November 2026, before the natural cohort execution.** This is an unqualified native *source policy* experiment, not a human-competitive game-performance study.

## Pre-observation seed-index erratum (3 November 2026, 08:49 UTC)

The first CI run [41605520319](https://github.com/FlareZ123/experiment-01/actions/runs/41605520319) aborted **before creating any paired physical original deal**: `deriveSlotSeeds()` permits integer `repeat` from **0 through 99**; the original scheduled 122–133 range was rejected immediately by its input guard (`RangeError: Invalid v3 seed identity`). No match or outcome was processed. To preserve 24 disjoint predetermined pairs without selecting against observed source cards or outcomes, retain seed base `20261110`, `phase='pilot'`, rank26, both seats and every other protocol detail, but use valid repeats **20–31 inclusive**. This changes only the impossible numeric index domain. Archive the failed preflight and the corrected run together; no interim cohort or cherry-picking.

## Fixed source, opponent, engine and selection domain

- Exact original registered Aichi rank26 Meloetta Donk 60 versus exact original rank6 Iron Thorns ex 60 from `results/aichi-2026/full-decklists.json`. Both source and defender lists stay fixed.
- Pinned vendor `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Research-owned hooks only; no vendor modification.
- Unique predetermined seed base `20261110`, `deriveSlotSeeds(BASE,'pilot',26,repeat)` for repeats **20–31 inclusive** (corrected pre-observation erratum) and source physical seats **A/0 and B/1** (24 paired deals, 48 total native attempts); both opening positions retained even if rank26 goes second. Max **120** accepted actions per arm. No outcome-dependent resampling.
- Both arms use the same normal rank26 `RANK26_PROPAGATION_PROFILE`, strict prompt validation, isolated bot RNG, accepted-card decision trace, paper-minimum Battle Compressor hook, original Forest Seal search correction and documented Lele/entry lock corrections. No policy changes on defender seat.

## Comparison

**Control:** Current `RANK26_PROPAGATION_PROFILE`, unchanged.

**Treatment:** Identical profile with four explicitly opt-in owner-only first-turn helpers, each restored after the synchronous native attempt:
1. `withRank26SourceSetup(seat, ..., {oneLightningTwoEggs:true})` prioritizes the owner-held Battle Compressor and selects **one** owner-deck Lightning and two own-deck Eggs when available.
2. `withRank26CologneOpener(seat, ..., {unlockBenchedKoko:true,minimumDiscardLightning:1})` considers a held Cologne to clear opposing Active Ability lock when source has Benched Meloetta/Koko and one own-discard Lightning.
3. `withRank26ExeggcutePump(seat, ..., {allowEggToEggFifthKo:true, requireOpponentSoloActive:true})` allows the protected Egg-to-Egg fifth-KO native Pump only against opponent's publicly lone Active.
4. `withEggDonorRecovery(seat,...)` restores the two source Eggs when opponent has two Prizes left, source has a held Pump and a Risky Ruins in play, two actual owner-visible Eggs remain available and no other non-Egg damaged donor is present.

This compound treatment intentionally tests whether the **complete proposed owner policy can operate from natural actual source setups**, not which independent helper caused any effect. Existing frozen default policy and printed 60s are unchanged.

## Frozen measurements and interpretation

Capture **every** 24 physical paired initial-deal fingerprint, both engine outcomes/aborts and caps, actual first-seat/mulligan status supplied by headless, every original source first-global-turn accepted root action, actual opponent Prizes following source actions, source held Compressor actions, policy proposal/prompt/choice audits, fifth-Egg-donor selections, Koko/Cologne actions and actual Crisis Punch declarations. Retain native errors as failures rather than filtering them. Exact source initial physical parity within each control/treatment pair is a separately measured admission predicate, not assumed from shared seeds.

Descriptive stage metrics: source-first held Compressor proposals and actual first-turn Compressor plays; actual owner-deck selections; original source first-turn 3 Pump plays; five self-KO 6→4→2→1 Prize sequence when it happens; one-Lightning Koko/Crisis declarations and native outcome/cap. Do not equate an action proposal with a root-selected or paid card. Native firstturn source KO frequency is a development-only quantity, distinct from paper win rate.

**Release integrity:** save all attempted rows and summary to an exclusive-locked atomic JSON artifact. Fail the strict native job if any paired initial source physical roots differ or are missing, or if any engine errors occurred, while preserving raw failed arms. No selectively rerun seeds; any diagnostic future replay must be labeled retrospective. No formal claim of paired winner advantage, firstturn success frequency precision or competitive win-rate qualification follows even from a green gate.

**Expected possible result:** every source first turn might fail to assemble the many coupled pieces; zero complete Crisis Punch would be informative as a source competence failure, not a contradiction of the already proven prepared full native attack chain.

The Aichi fixed-60 benchmark remains 29/32 authenticated opponent lists, zero qualified games and no selected best 60.
