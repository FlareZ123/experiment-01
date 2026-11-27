# Agent31: tested Float Stone terminal route sketch

On exact worker head 8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae, add a constrained two-action terminal lookahead to finalPublicStep, not global Hood reservation changes.

Starting from prior terminal-priority repair, expand the harmless opponent ability whitelist to include Garbotoxin on Garbodor, and Tool whitelist to include Float Stone. For projected terminal damage in a Garbotoxin board use a lower bound that ignores weakness boosts (keep Resistance and all represented damage reductions). In estimatedDamage add optional `ignoreWeakness=false`, set multiplier to `bypass||ignoreWeakness?1:weaknessMultiplier(attacker,target,view)`; publicFinalAttack passes true only for projected views with an opposing Garbotoxin Ability. Unknown Tools/Abilities, special conditions, and other existing exclusions remain fail-closed. This is a local sketch, not a complete effects proof.

Insert in finalPublicStep before retreat branch:
```js
if(item.kind==='play-card'&&hasName(item.actorPrinting,'Float Stone')&&
    actionTargetSlot(view,item.publicMetadata)===view.ownPublic.active&&
    view.ownPublic.active.tools?.length===0&&
    view.ownTurnResources?.retreatedTurn===0&&
    view.ownTurnResources?.toolPlayLocked!==true&&
    view.ownPublic.publicTurnRestrictions?.toolPlayLocked!==true&&
    (ownRetreatCost(view)??0)>0&&
    toolsEffectiveForRetreat(view,view.ownPublic.active,'actor')===true){
  const equipped={...view.ownPublic.active,tools:[item.actorPrinting]};
  const withTool={...view,ownPublic:{...view.ownPublic,active:equipped}};
  if(ownRetreatCost(withTool)===0)for(const [index,slot] of withTool.ownPublic.bench.entries()){
    if(slot)offer(item,switchedPublic(withTool,'ownPublic',index),225,'ROOT_FINAL_BY_FLOAT_STONE_RETREAT');
  }
}
```
If multiple bench targets certify, the subsequent retreat terminal layer chooses one from actual frontier; require matching exact retreat payment in continuation. For production, invalidate stale lock metadata on topology transitions and restrict certificate to attack-specific harmless effect assumptions (in particular, do not assume all future unknown rules are absent). This sketch only establishes the concrete route.

Lockbridge, both seats × 11 synthetic variants = 22 applicable decisions, no exceptions. Also ran 22 same-board out-of-profile Hood cases as robustness probes, not legitimate Hood deck states; excluded from evidence.
- Live tool-bearing Garb: Float via ROOT_FINAL_BY_FLOAT_STONE_RETREAT.
- No Garb tool / VMAX with Hood: Float via same terminal rule.
- Float already attached to Wob: retreat via ROOT_FINAL_BY_RETREAT.
- After free retreat: Max Geist via ROOT_PUBLIC_FINAL_PRIZE_ATTACK.
- After paid retreat: Max Geist ordinary scoring only (100 damage).
- Already used retreat, cannot retreat, Tool play locked, unknown Tool, target needs 170 instead of 160: no terminal Float override.
Negative controls deliberately expose malformed synthetic frontiers in some cases to challenge local guards, not native legality. No game or production branch change.
