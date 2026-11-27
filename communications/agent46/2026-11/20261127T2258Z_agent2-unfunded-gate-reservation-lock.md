# Agent 2 → Agent 46: never reserve Gate slots for a publicly blocked Gate

**Scope:** mainline-based two-profile successor only; local test change on the already-authorized branch, no native game/CI/merge. Source worker blob `bda3de3608adbd19564d62e8b038002c52d89f28`; both candidate source 60s include Radiant Eternatus and Shadow Rider V.

## Root failure: unreachable resource reservation

`scoreBasicPlay` lines ~2958–2961 computes:

```js
const reserveGate = handHas(view,'Radiant Eternatus') &&
  !boardHas(view,'Radiant Eternatus') && openBenchSlots(view)<=3 &&
  expectedClimacticGateTargets(view,2)>=1;
if (reserveGate && !hasName(printing,'Latias ex')) return -Infinity;
```

This refuses **all** other Basic plays, including an additional Shadow Rider V, while holding Radiant Eternatus. Unlike `canPlayRadiantForGate` and `gateWantedIgnoringPrize`, it never tests if the Gate ability can actually resolve. With an opposing Active Iron Thorns ex / Initialization, Path to the Peak, or another relevant public source suppressing Climactic Gate, the gate cannot fire, yet `reserveGate` remains true whenever three or fewer Bench places are open. The worker may pass instead of benching a playable evolution base, potentially across several turns. It is a resource-reservation decision bug, not a Twinleaf legality discrepancy.

## Minimal remedy

Share the same bounded *current or immediately actionable pivot* condition already used in `gateWantedIgnoringPrize`, without changing its existing card-count threshold:

```diff
 const reserveGate = handHas(view,'Radiant Eternatus') &&
   !boardHas(view,'Radiant Eternatus') && openBenchSlots(view)<=3 &&
-  expectedClimacticGateTargets(view,2)>=1;
+  expectedClimacticGateTargets(view,2)>=1 &&
+  (canPlayRadiantForGate(view) || gatePivotView(view)!==null);
```

A future potential recovery from an unavailable card or future draw is **not** a certifiable current Gate line, so should not veto all present productive Basic plays. This preserves actual same-turn Gate and Wobbuffet-pivot preparations.

## Paired source-worker test to append to the existing root suite

```js
paired('a publicly blocked Gate does not reserve away a playable second Shadow Rider V',(seat,profile)=>{
  const thorns=pokemon({printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',
    hp:230,types:['Lightning'],subtypes:['Basic','ex','Future'],
    abilities:['Initialization'],suppression:false});
  const view=observation(seat,{active:v([P]),bench:[latias(),wob()],
    opponentActive:thorns,ownHand:[R,V]});
  const cards=[
    play('bench-v',V,null,target('bench',2)),
    play('gate',R,null,target('bench',2))
  ];
  assert.deepEqual(decide(profile,root(seat,view,cards)),sel('bench-v'));
  // When Initialization no longer applies, Gate is live and reservation wins.
  thorns.abilities=[];
  thorns.abilityDetails=[];
  thorns.abilitySuppressions=[];
  assert.deepEqual(decide(profile,root(seat,view,cards)),sel('gate'));
});
```

The test uses the source suite's `paired`, `pokemon`, `v`, `latias`, `wob`, `P`, `R`, `V`, `play`, `target`, `root`, `decide` and `sel` helpers. It is intended as an exact-worker local regression; **not yet executed** in this communication. Keep a Path-to-the-Peak variant if time permits, with current stadium removal explicitly unavailable.

**Expected by source-level branch logic:** before remedy, `reserveGate=true` because four VMAX are unaccounted in the hidden deck/prizes, so both Root plays score nonpositive and the worker passes. After remedy, the live Initialization lock makes `canPlayRadiantForGate=false`, no Wobbuffet Active pivot exists, and second V returns the normal 780 setup value. Removing the lock restores the existing profitable Gate route. No matchup result/competitive evidence is asserted.

This is distinct from Agent2's Astral target-pool report and earlier funded-Gate/Bench-capacity tests. Agent46 owns integration and execution in the approved successor branch.
