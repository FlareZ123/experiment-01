# Agent31: tested minimal stadium/Stone repair sketch

Independent in-memory patch on exact successor worker at 8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae. No production branch edits. Both profiles × both seats × 13 constructed cases = 52/52 expected root choices, zero exceptions.

Insert before usefulTemple:

```js
function projectedStadium(view, printing) {
  const next = viewAfterRemovingAbilityStadiums(view);
  return {...next, ownPublic:{...next.ownPublic, stadium:[printing]}};
}
function usefulCandidateStadium(view,printing) {
  const sky=hasName(printing,'Sky Field'), valley=hasName(printing,'Dimension Valley');
  if ((!sky&&!valley)||view.ownTurnResources?.stadiumPlayedTurn===true||
      view.ownTurnResources?.stadiumPlayLocked===true||
      view.ownPublic.publicTurnRestrictions?.stadiumPlayLocked===true||
      stadiumAndToolEffectsLive(view)!==true||
      [...view.ownPublic.stadium,...view.opponentPublic.stadium].some(p=>hasName(p,sky?'Sky Field':'Dimension Valley')))return -Infinity;
  if(!sky&&(countBench(view.ownPublic)>5||countBench(view.opponentPublic)>5))return -Infinity;
  const next=projectedStadium(view,printing);
  const before=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);
  const after=bestAttackForSlot(next.ownPublic.active,next,next.opponentPublic.active);
  if((before?.score??0)>=10000&&(after?.score??0)<10000)return -Infinity;
  if((after?.score??0)>=10000&&(before?.score??0)<10000)return 1900;
  if(handHas(view,'Radiant Eternatus')&&!canPlayRadiantForGate(view)&&canPlayRadiantForGate(next))return 1500;
  if(hasStadiumRemovalTarget(view))return 850;
  if(valley&&after&&(!before||after.score>before.score))return 800;
  return -Infinity;
}
```

In usefulTemple guard both bench counts >5 (do not project away mandatory discard). Replace old attacker/target passed into projected view with cloned projected slots:
```js
const next=projectedStadium(view,'Temple of Sinnoh ASR');
const after=bestAttackForSlot(next.ownPublic.active,next,next.opponentPublic.active);
```
Replace hasStarAlchemyLock with `return toolsEffectiveForRetreat(view,target,'actor')!==true;` (rename helper to toolEffectsLiveForSlot if desired). Stone is a Tool-granted VSTAR power; printed Pokemon Ability locks are not blanket Tool-effect suppression.

Regression decisions per profile/seat:
- Sky Field opens Gate at own bench 4 -> Sky.
- Idle DV with no available attack -> pass.
- DV newly makes Max Geist payable with two Active P + three Bench P and 160 remaining HP -> DV.
- Temple vs DDE (no existing attack) -> Lockbridge only.
- Temple vs basic Psychic -> pass.
- Temple when Sky Field has own 6 Bench -> pass.
- Existing DV enables KO; Temple would lose affordability -> attack, both profiles.
- Stone attach/use separately under Path, Silent Lab -> Stone; under Jamming Tower -> pass.

Scope caveats: these scores are narrow policy heuristics, not certified KO logic (Get Lost etc. can exceed 10k); replace score threshold with independent KO/terminal evaluator in production. Stadium projection does not model forced bench discard, all unknown/new lock dependencies, or native prompts. Existing helper removes only Path/Silent Lab source-attributed suppression. No full test-suite or native execution; exact synthetic roots only. Agent46 retains implementation authority. Do not merge this sketch as a second competing branch.
