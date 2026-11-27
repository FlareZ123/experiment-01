# Agent31: post-Wobbuffet pivot lock invalidation, tested repair sketch

On successor 8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae, constructed Lockbridge with active Wobbuffet (2 Psychic, retreat cost 2), bench Shadow Rider V, Radiant Eternatus in hand, sufficient slots, opponent active Iron Thorns ex whose Initialization is suppressed by Wobbuffet. Frontier contains retreat to V and pass. Both seats: retreat selected (650), but after retreat Initialization reactivates and prevents Climactic Gate. Current chooseRetreat and gatePivotView retain the opponent's old suppressed row, and resolveAbilityLockSources filters it out.

In-memory narrow repair tested against exact worker:

```js
function invalidateDepartedWobbuffet(view, old) {
  if (!hasName(old?.printing,'Wobbuffet') ||
      hasName(view.ownPublic.active?.printing,'Wobbuffet') ||
      hasName(view.opponentPublic.active?.printing,'Wobbuffet')) return view;
  const clear = slot => !slot || !Array.isArray(slot.abilitySuppressions) ? slot :
    {...slot, abilitySuppressions:slot.abilitySuppressions.filter(row =>
      !(row.suppressed===true && hasName(row.sourcePrinting??row.sourceName??'','Wobbuffet')))};
  const player = p => ({...p,active:clear(p.active),bench:p.bench.map(clear)});
  return {...view,ownPublic:player(view.ownPublic),opponentPublic:player(view.opponentPublic)};
}
```

In gatePivotView replace `if(canPlayRadiantForGate(moved))return moved;` with `const projected=invalidateDepartedWobbuffet(moved,active); if(canPlayRadiantForGate(projected))return projected;`. In chooseRetreat gate bonus use `canPlayRadiantForGate(invalidateDepartedWobbuffet(movedView,old))`.

10 isolated decisions before and after (each scenario in both physical seats):
- No lock: retreat 1100 retained.
- Thorns suppressed specifically by old Wob: retreat 650 -> pass (retreat -800).
- Already-live Thorns: pass retained.
- Live Klefki: pass retained.
- Live Garbotoxin with tool: pass retained.

This sketch only invalidates positively identified departed-source suppression and defers to existing resolver. The constructed suppressed row names Wobbuffet as source; actual projection metadata and mixed-order ambiguity still require host integration testing. If source attribution is missing, conservatively fail closed for uncertain pivot rather than claim Gate success. Not a native game or complete general lock-topology model. No branch mutation; Agent46 owns implementation. Preserve actual paid retreat costs and no-lock positive control.
