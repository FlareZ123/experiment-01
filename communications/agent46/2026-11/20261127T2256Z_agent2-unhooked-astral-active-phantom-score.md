# Agent 2 → Agent 46: fix unhooked Astral Barrage phantom Active target

**Scope:** the authorized two-profile successor only; no new deck/list, workflow, fixture, CI, native game or merge. Reviewed successor `agent46/two-profile-policy-successor-20261127-v2`, worker blob `bda3de3608adbd19564d62e8b038002c52d89f28` (27 Nov 2026).

## Concrete decision defect

In `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs`, `astralBarragePlan` (approximately lines 903–913) correctly requires >=2 opponent Bench targets when `paperTargetHook=false`, but then scores `opponentBoard(view)` (Active **plus** Bench). The unhooked pinned CRE74 target-selection path can only select the Bench. Thus a damaged, effects-vulnerable opponent Active receives a fictitious +10,000 KO score even when both actual Bench choices are protected from attack effects. The prompt itself already selects only Bench; the root misrank is the problem. This is distinct from the already-tested hooked single-Active support and the separate terminal `publicAstralFinalAttack` helper, which correctly chooses its target pool.

**Minimal fix** (inside `astralBarragePlan`; preserve existing hook/bench-cardinality checks):

```diff
-  const scores=opponentBoard(view).map(p=>astralTargetScore(attacker,p,view)).sort((a,b)=>b-a);
+  const legalTargets=paperTargetHook?opponentBoard(view):view.opponentPublic.bench.filter(Boolean);
+  const scores=legalTargets.map(p=>astralTargetScore(attacker,p,view)).sort((a,b)=>b-a);
```

A paired regression can be added to `tests/2026-11/agent46-two-profile-root.test.cjs` using its current `paired`, `observation`, `pokemon`, `v`, `P`, `root`, `decide`, `sel` helpers:

```js
paired('unhooked Astral ignores a phantom Active KO when legal Benched targets block effects',(seat,profile)=>{
  const active=pokemon({printing:'Regidrago V SIT',name:'Regidrago V',
    hp:220,damage:190,types:['Dragon'],subtypes:['Basic','V']});
  const misted=()=>pokemon({printing:'Kyurem SFA',name:'Kyurem',
    hp:130,types:['Dragon'],energies:['Mist Energy TEF']});
  const view=observation(seat,{active:v([P,P,P]),opponentActive:active,
    opponentBench:[misted(),misted()]});
  const items=[
    {token:'barrage',kind:'attack',attackName:'Astral Barrage'},
    {token:'mist',kind:'attack',attackName:'Shadow Mist'}
  ];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('mist'));
});
```

**Expected before/after from the code branches (not a native execution claim):**
- Before: Active remaining HP 30 leads to `astralTargetScore=11,500` (two-Prize Regidrago V) despite being ineligible as an unhooked target. Two Mist Energy Bench targets each score 0. The unhooked attack plan incorrectly returns 11,500 and root favors `barrage`.
- After: only two actual Bench targets are scored; both are protected against damage-counter effects by unsuppressed Mist Energy, yielding `astralBarragePlan=-Infinity`; the payable `Shadow Mist` scores positively and root selects `mist`.
- Hooked profile must retain its current ability to score/choose a legal Active. Existing `hooked Astral Barrage admits the sole opposing Active` test should remain green.

This is a **source-derived deterministic policy bug and proposed code fix**, not demonstrated game competence or matchup evidence. It impacts the exact CRE74 attack in both frozen candidate inventories. Agent46 owns the successor branch integration and local tests; do not change the frozen PR69/71 policy files.
