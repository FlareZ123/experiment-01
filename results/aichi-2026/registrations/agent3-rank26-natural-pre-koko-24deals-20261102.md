# Preregistered exact-source natural-deal holdout: rank26 pre-Koko Cologne v2 vs frozen v1

**Agent 3 | 2 November 2026 | seed and metric schedule frozen before experiment code / dispatch**

## Question and policy arms

The staged native original-60 line [reports](../agent3-rank26-unown-complete-crisis-source60-native-20261102.md) that an early Canceling Cologne is a legitimate owner-only option when source rank26 holds Cologne with Unown Active, Benched Meloetta + Koko, and two Lightning in own discard against Active Iron Thorns. The canonical `RANK26_PROPAGATION_PROFILE` source policy triggers Cologne only when Meloetta is *already* Active.

Compare **frozen canonical v1** versus **the same canonical profile wrapped with opt-in `withRank26CologneOpener(seat, source, {unlockBenchedKoko:true})`**, holding exactly the same original registered rank26 and rank6 printed 60s, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and original run options. No other action policies changed. The outer opt-in wrapper calls the existing canonical profile for all other decisions. Record actual owner-selected and Store-accepted Cologne root proposals. Default v1 remains untouched in other research.

## Complete preregistered denominator

`deriveSlotSeeds(20261102,'pilot',26,repeat)` for **repeats 140 through 151 inclusive**, both physical source seats A/B. Exactly **24 physical randomized source/opponent setup attempts**, **48 native-game arms** (control + opt-in) from same declared seed for each. Maximum 120 native actions per arm; full first-turn source action trace plus any native terminal/cap/error preserved. Include opponent-first, source-first, solo opponent, unusable source openings, caps and errors. No hunting for positive seeds or truncating no-hit results.

## Pairing, evidence and disposition

Capture an **independent native Store first stable player-turn root** for each arm with `fingerprintInitialSourceDeal` / `createFullPhysicalDealObserver`, hashing all physically ordered source and opponent zones including hidden original prizes and deck *for offline evidence only*. Do not use that hidden information in any bot policy. Report `EXACT_SOURCE_DEAL_MATCH`, `SOURCE_DEAL_DIFFERENT` or `UNVERIFIED` from actual per-arm fingerprints, never from seed equality. Compare owner source first turn only for arms with authenticated first draw and exact source deal; preserve every unmatched row and failure in the denominator. Report all source-first rank26 held/played Cologne, Koko Ability actions, source Pump and Propagation, opponent Prize reductions, actual Crisis Punch attacks (if any), action cap/native error, source first-player seat. Suppress inferred win percentages.

Observe whether v2 ever actually triggers in natural source games. A **zero-hit result** is informative about the missing source 60 search/setup driver, and must not be promoted to evidence that the ability line is impossible or strategically weak. A positive hit without native real KO payment, opponent continuation and game qualification remains developmental. The full 29/32 Aichi original field, time control and opponent-policy competence remain separate blockers.

## Version constraints and postanalysis

Pinned deck hashes, source code and vendor revision are required on output. Do not change trial seed range or code in response to trial outcomes; any follow-up must be a separate explicit version. Native mismatches and errors are separate outcomes. This specific experiment cannot establish improved fixed-60 win rate. A next stage would require an owner-only search/preparation policy that actually assembles registered rank26 non-staged resources and a meaningful rank6 opponent continuation.


## Prospective seed-API erratum, 02:57 UTC, before any successful source trial

The first workflow attempt [41380099291](https://github.com/FlareZ123/experiment-01/actions/runs/41380099291) **failed before the first random deal**. The existing repository's `scripts/aichi-decorrelated-seeds.cjs` explicitly requires `repeat` to be 0 through 99, while this registration mistakenly prescribed 140 through 151. No game state or result was observed, and no seed outcome could be selected or excluded.

Replacement **version 1.1** for the same sample size, both seats and phase/seed-base uses **repeats 84 through 95 inclusive**. The new range is declared here **before changing the source file or dispatching the amended trial**, with zero earlier gameplay observations. All other policies, caps, reporting, and 24 unique source setups / 48 native arms remain identical. Preserve [41380099291](https://github.com/FlareZ123/experiment-01/actions/runs/41380099291) as a failed protocol attempt; no unregistered replacement or postselection.
