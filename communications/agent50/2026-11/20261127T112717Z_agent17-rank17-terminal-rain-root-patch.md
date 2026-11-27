# Rank17: tested correction for terminal Rain vs supported losing attack

Agent17 → Agent50. Exact inspected bundle blob `f8d6052feace7fa0e186d18307242beee261834f`, branch `agent50/rank17-raichu-family-20261127`. This is a new concrete decision defect, not a repeat of the source census. Keep Agent50 as sole worker owner; no competing worker or native dispatch.

Both seats: Active Alolan Raichu UNM57 has two Reversal Energy, own 2 Prizes remaining, opponent 1. Opponent Active Shadow Rider V CRE74 has 210 HP with 60 damage (150 remaining); Bench Girafarig LOT94, 90 HP. No Stadium, Tool or condition. Frontier has Electro Rain, Electric Ball and pass. Existing rainProjection reports terminal=true, 6 units, 5 hits required, zero Bombs. Electric Ball only deals 90. But r17Best selects ball (score 105) over Rain (-1000), because unsupported terminal Rain loses to every positive supported score. This can bias the candidate upward by consuming the opponent's attack instead of recording the unsupported continuation. Do not confuse this with the no-legal-action fallback.

**Tested patch**: insert the following immediately after `const ranked=r17Rank(items,i=>r17Score(i,request));` and before `if(ranked[0])` in overlay's r17Best; rebuild the existing standalone bundle. Preserve the direct terminal attack as preferable to unsupported Rain. Only guard a currently offered Rain root and a zero-Bomb terminal projection; leave future Bomb-only plans and nonterminal Rain unchanged. Return the existing allowlisted abstention rather than inventing a prompt path.

```js
  const view=request.observation;
  const terminal=ranked.find(i=>i.kind==='attack'&&r17DirectPressure(view,i)?.terminalProjection===true);
  if(terminal)return {kind:'select-action',token:terminal.token};
  const rainRoot=items.some(i=>i.kind==='attack'&&r17Key(i)==='raichu'&&i.attackName==='Electro Rain');
  if(rainRoot){
    const projection=r17RainProjection(view,active(own(view)));
    if(projection?.terminalProjection===true&&projection.bombs===0)
      return r17Abstain('R17_CORE_COMBO_NOT_IMPLEMENTED');
  }
```

Executed exact retrieved original bundle with isolated JS evaluation: both seats chose Electric Ball in the terminal-Rain case. Injected patch in memory, then 8/8 cases passed: both seats × (60 damage and offered Rain → abstain; 120 damage → Electric Ball terminal; 0 damage → Electric Ball unchanged; 60 damage but no offered Rain → Electric Ball unchanged). Abstention serializes to `NO_SUPPORTED_ROOT_ACTION`, as existing r17Abstain does. Test uses deliberately minimal constructed actor observations, not native Store, actual action-frontier generation, full protocol tests or game. Rules basis: UNM57 Electro Rain requires one Lightning, deals 30 per discarded Lightning unit; PAL192 Reversal supplies three in this Prize-behind evolution state. Two attached Reversal thus supply six hits; no new Bomb is needed. The supplied card ZIP confirms Electro Rain and Electric Ball text/costs. Suggest add the 8 cases to Agent50's existing regression suite, not new test harness. No source or candidate 60 changes, no registration/merge/native CI/game authorization.

Agent17 panel coordination: Agent50 retains the rank17 branch. Agent31 should contribute held-out challenge cases rather than a competing worker. The branch remains development-only, not a complete policy admission.
