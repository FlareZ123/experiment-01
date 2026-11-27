# Arven paid Gate route: avoid spending the VSTAR power when an ordinary tutor works

Development handoff against 8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae. Both profiles, both seats; actual worker executed in-memory with neutral stubs for the unrelated missing stadium helpers (no stadium plays offered). No production branch edit, CI, native game, or admission claim.

With a live three-slot Gate opportunity, Arven search offering Mysterious Treasure, Quick Ball and Forest Seal Stone, and a disposable card in hand, the worker selects Stone only. It ignores the cheaper Item access line (both Items search Radiant Eternatus). With Treasure, a disposable card, and Stone already held, the worker attaches Stone first, needlessly occupying a tool slot that could be used by Hood; the ordinary tutor would keep the once-per-game VSTAR option free. The root should prioritize the paid tutor when its payment is available, unless a separate certified tactical objective overrides.

Minimal tested change to searchNeedScore, before Radiant branch:
```js
  if (effectName === 'Arven' && hasAnyName(printing,['Mysterious Treasure','Quick Ball']) && gateAccessNeed(view) && !itemLocked(view)) {
    const next={...view,ownHand:[...view.ownHand,printing],ownPublic:{...view.ownPublic,handCount:view.ownPublic.handCount+1,deckCount:view.ownPublic.deckCount-1}};
    if(hasDiscardableHand(next,1,printing))return 112;
  }
```

In hasStarAlchemyBottleneck replace the unconditional gateAccessNeed early return with:
```js
  const paidGateTutor = !itemLocked(view) && view.ownHand.some(p=>hasAnyName(p,['Mysterious Treasure','Quick Ball'])&&hasDiscardableHand(view,1,p));
  if ((gateAccessNeed(view)&&!paidGateTutor) || (heavyBallNeed(view)>=1000 && !handHas(view,'Hisuian Heavy Ball') && !knownFullyPrized(view,'Hisuian Heavy Ball'))) return true;
```

Tested both profiles x both seats: paid Arven now selects Treasure+Stone, held paid tutor selects Treasure rather than Stone attachment (8 changed roots/prompts). No-payment and Item-lock controls continue choosing Stone only; held Radiant control continues declining unnecessary search (12 unchanged). Other bottleneck and terminal paths remain available. This is a heuristic improvement, not a guarantee a hidden search target exists: the gateAccessNeed predicate already excludes known fully Prized Radiant; root must be reranked after any failed legal tutor. No hidden-zone inspection.

Do not interpret a separate preliminary Star Alchemy probe with malformed abilitySource metadata as evidence of an activation defect. The actionable tested result here is the Arven search and held-Treasure root change. Integrate alongside the earlier missing-helper and Gate repairs, not as a competing worker.
