# Agent16 — rank26 Meloetta donk: executable prize-donation and candidate opening countermeasure

2026-11-27. Source rank26 unchanged, opponent-policy lead Agent21. Both Hood Shield and Lockbridge fixed lists unchanged. No native CI, game, merge, frozen fixture change or qualified win-rate result.

## Attacker subproblem solved

Rank26's 12 Basics, 4 Damage Pump, 2 Exeggcute PLF4 (30 HP), 4 Risky Ruins, 2 Rescue Carrier, Koko Prism Star, 2 Lightning, DCE, 2 Crisis Punch, and Dowsing Machine permit the following conditional sequence. Risky Ruins places two counters on a Basic benched from hand during a turn. Damage Pump can move up to two counters from one Pokemon to another Pokemon in any way; allocate one to each of two Eggs with two counters each: both KO, opponent takes two Prizes. Propagation can recover both Eggs from discard and rebench them; repeat with a second two-counter donor. Rebench both once more and use one counter from Egg A to Egg B: B KO, A survives at one counter. Thus **3 Pumps, 4 external counters, 2 accessible Eggs** suffice for exactly five Prizes; the sixth is prohibited. Rulebook E-18 supports reuse after leaving/reentering the zone, subject to suppression. Two Rescue Carriers can replace the two pair recoveries under suppressed Propagation if otherwise legal. One accessible Egg needs five Pump uses including legal Dowsing recovery, five external counters, repeated recovery.

Before starting the irreversible sequence, require known legal lethal Crisis Punch against opposing sole Pokemon, Meloetta Active with effective Tool and three Colorless energy units, effective Debut Performance if attacking on first turn going first, usable Items, Risky Ruins active and sufficient resources. Koko must fund Meloetta while Benched and have another eligible Benched recipient before pivoting Active. Wobbuffet PHF suppresses both Koko and Exeggcute abilities while Active; Cologne can suppress opposing Active's Ability for the turn if legal. Carrier is no substitute for Koko. Do not assume the donation loop is always strategically correct: opponent with a backup is not eliminated by this single-target attack, and giving five Prizes creates extreme loss risk. A complete policy must account for all KO/Prize triggers, actual native receipts, target damage/protection, prompt tokens and counter allocations.

[donk_pump_plan.cjs](donk_pump_plan.cjs) is a bounded actor-known BFS for that narrow allocation problem, not a full-game policy. [donk_pump_plan.test.cjs](donk_pump_plan.test.cjs) passed **11/11** local Node 22.16.0 tests. Initial test assumptions incorrectly required five external counters and a specific KO ordering; corrected against constructive solver result. No native tests. Replan after every action; caller owns legality and the finishReady gate. Agent21 handoff: communications/agent21/2026-11/20261127T1700Z_agent16-rank26-pump-solver-handoff.md.

## Defender: structural exposure to a first-turn game loss

Both fixed profiles have 14 Basics; original rank26 has 12. The [exact rational calculator](setup_exposure.py) uses seven-card hands, independent shuffles for each mulligan, canceling simultaneous failures, and maximum bonus draws after random Prize placement. Let p and q be the candidate and rank26 probabilities of no Basic in seven. For net bonus K, P(K=0)=(1-q)/(1-pq) and P(K=k)=(1-p)(1-q)q^k/(1-pq) for k>0. Given exactly one Basic in the valid opening seven, the marginal bonus draw misses remaining Basics with probability C(54-B,k)/C(53,k), capped at 47 available cards. Multiplying by P(exactly one Basic|valid opening) gives forced singleton exposure assuming every available backup is placed. This is **not** a loss rate or a prediction of combo success.

| Basic count | Forced singleton after maximum bonus | Joint with rank26 first if both choose first | Joint if rank26 always first |
|---:|---:|---:|---:|
|14|37.506796%|18.753398%|37.506796%|
|15|33.945705%|16.972853%|33.945705%|
|16|30.597656%|15.298828%|30.597656%|
|17|27.462789%|13.731395%|27.462789%|
|18|24.539940%|12.269970%|24.539940%|

Under an equal-weight 32-opponent mean, a 99.5% target allows at most 16 percentage points of loss at any one rank even if the other 31 are perfect. If rank26 chooses first and our candidate always chooses second, rank26 goes first regardless of coin. The unavoidable-singleton subset alone exceeds the entire budget if conditional conversion exceeds **42.658936%**. If our policy also chooses first, fair coin reduces that joint exposure to 18.753398%, and break-even conversion is **85.317871%**. These are conditional sensitivity thresholds, not measurements of conversion. At hypothetical 100% conversion, this subset alone would cost 1.172087 percentage points of field mean when choosing second versus 0.586044 points when choosing first. Increasing Basic count is not free; even 16 Basics and first preference leaves almost no field loss budget under worst-case conversion. No recommendation to change frozen 60s.

## Actual successor policy issue and tested alternative

Agent46 successor branch agent46/two-profile-policy-successor-20261127-v2, exact worker blob b2a801a73894126d1cfe36cf17309f382194d215, protocol blob 02a746bd2ee796c175af942770909a6e791ad2f0. The pre-deal GO_FIRST policy unconditionally selects No for both profiles. It cannot see an opponent identity or future hand; do not introduce hidden rank-conditioned choices. Global first/second preference is a field-level tradeoff, not decided by this one match. Candidate worker's setup also declines an available Dialga, Lele or Radiant backup when starting V alone, including post-bonus placement, even though they can legally be benched. Its existing tests explicitly encode some of these decisions. Preserving entry triggers is valuable, but there is a survival cost distinct from the unavoidable forced-singleton probability. Actual pure V8 worker+protocol calls reproduced all six initial/post-bonus avoidable singleton patterns on both profiles and both seats.

Exact-preimage experimental variant replaces the existing fragile-single-Prize-only Lele fallback in chooseStartingPokemonSetup with:

```js
  if (room>0 && bench.length+placed===0 && candidates.length>0) {
    const backup=candidates.find(row=>hasName(row.choice.printing,'Dialga-GX')) ||
      candidates.find(row=>hasName(row.choice.printing,'Tapu Lele-GX')) ||
      candidates[0];
    selected.push(backup.choice);
  }
```

When already safe, preserve existing triggers and Bench reserve. If only costly backups are available and none placed, prefer Dialga over Lele over Radiant (provisional priority preserving the Gate; actual matchup tradeoffs unresolved). Executed both original and modified exact worker source with actual protocol.validateDecision across 11 setup cases x 2 profiles x 2 seats: **44/44 expected alternative decisions**, 32 changed, 12 unchanged. Cases: initial V+R/L/D (now both), V+A (unchanged), post-bonus R/D/L with V and empty bench (now place one), post-bonus R with another V benched (unchanged decline), V alone (unchanged), V+R+L+D (choose V,D), V+R+L (choose V,L). Pure actor inputs, no hidden zones or new CI. Not integrated; variant breaks previous deliberately trigger-preserving expectations, so re-evaluate those tests rather than pretending no behavior changed. Neither proposed first preference nor backup variant is proven globally better; compare against baseline with the same fixed profiles and accepted competent opponent policies after owner authorization.

Action: Agent46/Agent31 assess safe-setup variant and first preference using field-weighted risk; Agent21 implement/review rank26 opponent policy including 3-Pump/4-external-counter line, then measure rank26 conversion and broader decisions once qualified game authorization exists. This report is not source-rank-specific cheating, a new worker, or a reason to change admission status.
