'use strict';
// Apply-ready development handoff only; do not merge or run native CI from this file.
// Exact successor baseline 8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae, worker blob 727a6d65a6fb2567b0f39e8f3e9db76b9befe333.
// All replacements must match exactly once. Run in authorized successor checkout only.
const edits = [
  [
    "Wob invalidator",
    "function gatePivotView(view) {",
    "function invalidateDepartedWobbuffet(view, old) {\n  if (!hasName(old?.printing,'Wobbuffet') ||\n      hasName(view.ownPublic.active?.printing,'Wobbuffet') ||\n      hasName(view.opponentPublic.active?.printing,'Wobbuffet')) return view;\n  const clear = slot => !slot || !Array.isArray(slot.abilitySuppressions) ? slot :\n    {...slot, abilitySuppressions:slot.abilitySuppressions.filter(row =>\n      !(row.suppressed===true && hasName(row.sourcePrinting??row.sourceName??'','Wobbuffet')))};\n  const player = p => ({...p,active:clear(p.active),bench:p.bench.map(clear)});\n  return {...view,ownPublic:player(view.ownPublic),opponentPublic:player(view.opponentPublic)};\n}\nfunction gatePivotView(view) {"
  ],
  [
    "Wob projected Gate",
    "if(canPlayRadiantForGate(moved))return moved;",
    "const projected=invalidateDepartedWobbuffet(moved,active); if(canPlayRadiantForGate(projected))return projected;"
  ],
  [
    "Wob retreat score",
    "canPlayRadiantForGate(movedView);",
    "canPlayRadiantForGate(invalidateDepartedWobbuffet(movedView,old));"
  ],
  [
    "Stadium helpers",
    "function usefulTemple(view) {",
    "function projectedStadium(view, printing) {\n  const next = viewAfterRemovingAbilityStadiums(view);\n  return {...next, ownPublic:{...next.ownPublic, stadium:[printing]}};\n}\nfunction usefulCandidateStadium(view,printing) {\n  const sky=hasName(printing,'Sky Field'), valley=hasName(printing,'Dimension Valley');\n  if ((!sky&&!valley)||view.ownTurnResources?.stadiumPlayedTurn===true||\n      view.ownTurnResources?.stadiumPlayLocked===true||\n      view.ownPublic.publicTurnRestrictions?.stadiumPlayLocked===true||\n      stadiumAndToolEffectsLive(view)!==true||\n      [...view.ownPublic.stadium,...view.opponentPublic.stadium].some(p=>hasName(p,sky?'Sky Field':'Dimension Valley')))return -Infinity;\n  if(!sky&&(countBench(view.ownPublic)>5||countBench(view.opponentPublic)>5))return -Infinity;\n  const next=projectedStadium(view,printing);\n  const before=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);\n  const after=bestAttackForSlot(next.ownPublic.active,next,next.opponentPublic.active);\n  if((before?.score??0)>=10000&&(after?.score??0)<10000)return -Infinity;\n  if((after?.score??0)>=10000&&(before?.score??0)<10000)return 1900;\n  if(handHas(view,'Radiant Eternatus')&&!canPlayRadiantForGate(view)&&canPlayRadiantForGate(next))return 1500;\n  if(hasStadiumRemovalTarget(view))return 850;\n  if(valley&&after&&(!before||after.score>before.score))return 800;\n  return -Infinity;\n}\nfunction usefulTemple(view) {"
  ],
  [
    "Stadium overflow",
    "if (countBench(view.ownPublic)>5) return -Infinity;",
    "if (countBench(view.ownPublic)>5||countBench(view.opponentPublic)>5) return -Infinity;"
  ],
  [
    "Temple projection",
    "const after=bestAttackForSlot(attacker,projectedStadium(view,'Temple of Sinnoh ASR'),target);",
    "const next=projectedStadium(view,'Temple of Sinnoh ASR');\nconst after=bestAttackForSlot(next.ownPublic.active,next,next.opponentPublic.active);"
  ],
  [
    "Stone Tool guard",
    "function hasStarAlchemyLock(view, target) {\n  if (hasActiveStadiumLock(view, 'Path to the Peak')) return true;\n  if (hasActiveGarbotoxin(view)) return true;\n  if (isShadowRiderVTarget(target) && hasActiveIronThorns(view)) return true;\n  if (isBasicShadowRiderV(target) &&\n      hasActiveStadiumLock(view, 'Silent Lab')) return true;\n  return false;\n}",
    "function hasStarAlchemyLock(view, target) {\n  return toolsEffectiveForRetreat(view,target,'actor')!==true;\n}"
  ],
  [
    "Terminal direct parameter",
    "function cleanPublicTerminalView(view){",
    "function cleanPublicTerminalView(view,direct=false){"
  ],
  [
    "Harmless direct/projected effects",
    "opponentBoard(view).every(slot=>!(slot.abilities??[]).length&&!(slot.tools??[]).length&&\n      (slot.energies??[]).every(isBasicEnergyPrinting))",
    "opponentBoard(view).every(slot=>\n  (slot.abilities??[]).every(a=>\n    (direct&&a==='Legacy Star'&&hasName(slot.printing,'Regidrago VSTAR')) ||\n    (a==='Garbotoxin'&&hasName(slot.printing,'Garbodor'))) &&\n  (slot.tools??[]).every(t=>hasName(t,'Float Stone')) &&\n  (slot.energies??[]).every(p=>\n    isBasicEnergyPrinting(p) ||\n    (direct&&hasName(p,'Double Dragon Energy')&&isDragon(slot))))"
  ],
  [
    "Terminal view invocation",
    "if(!cleanPublicTerminalView(view))return null;",
    "if(!cleanPublicTerminalView(view,allowedNames!==null))return null;"
  ],
  [
    "Terminal board wipe",
    "if(prizeLiability(target)<view.ownPublic.prizeCount||remaining<=0)return null;",
    "if((prizeLiability(target)<view.ownPublic.prizeCount&&view.opponentPublic.bench.some(Boolean))||remaining<=0)return null;"
  ],
  [
    "Damage lower bound option",
    "function estimatedDamage(attacker, attack, view, target) {",
    "function estimatedDamage(attacker, attack, view, target, ignoreWeakness=false) {"
  ],
  [
    "Damage lower bound",
    "const multiplier=bypass?1:weaknessMultiplier(attacker,target,view);",
    "const multiplier=bypass||ignoreWeakness?1:weaknessMultiplier(attacker,target,view);"
  ],
  [
    "Projected Garbotoxin terminal damage",
    ".map(attack=>({attack,damage:estimatedDamage(attacker,attack,view,target)}))",
    ".map(attack=>({attack,damage:estimatedDamage(attacker,attack,view,target,allowedNames===null&&opponentBoard(view).some(slot=>(slot.abilities??[]).includes('Garbotoxin')))}))"
  ],
  [
    "Float terminal lookahead",
    "    if(item.kind==='retreat'){\n      const index=item.publicMetadata?.benchIndex,cost=ownRetreatCost(view),slot=view.ownPublic.bench[index];",
    "if(item.kind==='play-card'&&hasName(item.actorPrinting,'Float Stone')&&\n    actionTargetSlot(view,item.publicMetadata)===view.ownPublic.active&&\n    view.ownPublic.active.tools?.length===0&&\n    view.ownTurnResources?.retreatedTurn===0&&\n    view.ownTurnResources?.toolPlayLocked!==true&&\n    view.ownPublic.publicTurnRestrictions?.toolPlayLocked!==true&&\n    (ownRetreatCost(view)??0)>0&&\n    toolsEffectiveForRetreat(view,view.ownPublic.active,'actor')===true){\n  const equipped={...view.ownPublic.active,tools:[item.actorPrinting]};\n  const withTool={...view,ownPublic:{...view.ownPublic,active:equipped}};\n  if(ownRetreatCost(withTool)===0)for(const [index,slot] of withTool.ownPublic.bench.entries()){\n    if(slot)offer(item,switchedPublic(withTool,'ownPublic',index),225,'ROOT_FINAL_BY_FLOAT_STONE_RETREAT');\n  }\n}\n    if(item.kind==='retreat'){\n      const index=item.publicMetadata?.benchIndex,cost=ownRetreatCost(view),slot=view.ownPublic.bench[index];"
  ],
  [
    "Revealed Radiant recovery",
    "return !boardHas(view,'Radiant Eternatus') && !handHas(view,'Radiant Eternatus') &&\n      canPlayRadiantForGate(view) ? 100 : -5;",
    "return !boardHas(view,'Radiant Eternatus') && !handHas(view,'Radiant Eternatus') &&\n  (canPlayRadiantForGate(view)||gatePivotView(view)!==null) ? 100 : -5;"
  ],
  [
    "Ranger usable item",
    "const unlockItems = itemLocked(view) && view.ownHand.some(isItem);",
    "const unlocked={...view,\n  ownTurnResources:{...view.ownTurnResources,itemPlayLocked:false,supporterPlayedTurn:1},\n  ownPublic:{...view.ownPublic,publicTurnRestrictions:{\n    ...view.ownPublic.publicTurnRestrictions,itemPlayLocked:false}}};\nconst unlockItems = itemLocked(view) && view.ownHand.some(p=>\n  isItem(p)&&!hasName(p,'VS Seeker')&&\n  Number.isFinite(scoreTrainerPlay({actorPrinting:p},unlocked,null,null)));"
  ],
  [
    "Lele-only capacity declaration",
    "  const context = { lockbridge, radiantAvailable, pivotAvailable };",
    "const directRadiant = visible.some(p=>hasName(p,'Radiant Eternatus')) ||\n  (payment&&hand.some(p=>hasAnyName(p,['Mysterious Treasure','Quick Ball']))) ||\n  (hasV&&hand.some(p=>hasAnyName(p,['Forest Seal Stone','Arven'])));\nconst leleOnlyGate = hasV && visible.some(p=>hasName(p,'Tapu Lele-GX')) && !directRadiant &&\n  !hand.some(p=>hasName(p,'Sky Field'));\nconst heldFloat = hand.some(p=>hasName(p,'Float Stone'));\n  const context = {lockbridge,radiantAvailable,pivotAvailable:pivotAvailable&&!(leleOnlyGate&&!heldFloat&&hasV)};"
  ],
  [
    "Lele-only capacity",
    "const benchLimit = radiantSpent ? 4 : 2;",
    "const benchLimit = radiantSpent ? 4 : leleOnlyGate ? 1 : 2;"
  ],
  [
    "Arven paid Gate",
    "  if (hasName(printing, 'Radiant Eternatus')) return gateAccessNeed(view) ? 120 : -5;",
    "  if (effectName === 'Arven' && hasAnyName(printing,['Mysterious Treasure','Quick Ball']) && gateAccessNeed(view) && !itemLocked(view)) {\n    const next={...view,ownHand:[...view.ownHand,printing],ownPublic:{...view.ownPublic,handCount:view.ownPublic.handCount+1,deckCount:view.ownPublic.deckCount-1}};\n    if(hasDiscardableHand(next,1,printing))return 112;\n  }\n  if (hasName(printing, 'Radiant Eternatus')) return gateAccessNeed(view) ? 120 : -5;"
  ],
  [
    "Preserve Stone tool",
    "  if (gateAccessNeed(view) || (heavyBallNeed(view)>=1000 && !handHas(view,'Hisuian Heavy Ball') && !knownFullyPrized(view,'Hisuian Heavy Ball'))) return true;",
    "  const paidGateTutor = !itemLocked(view) && view.ownHand.some(p=>hasAnyName(p,['Mysterious Treasure','Quick Ball'])&&hasDiscardableHand(view,1,p));\n  if ((gateAccessNeed(view)&&!paidGateTutor) || (heavyBallNeed(view)>=1000 && !handHas(view,'Hisuian Heavy Ball') && !knownFullyPrized(view,'Hisuian Heavy Ball'))) return true;"
  ],
  [
    "Held Gate supplies VMAX",
    "!handHas(view, 'Shadow Rider Calyrex VMAX');\n  const missingDialga",
    "!handHas(view, 'Shadow Rider Calyrex VMAX') && !(handHas(view,'Radiant Eternatus') && canPlayRadiantForGate(view));\n  const missingDialga"
  ]
];
function apply(source) {
  let out=source;
  for(const [name,before,after] of edits){
    if(out.split(before).length!==2)throw new Error('Exact preimage mismatch: '+name);
    out=out.replace(before,after);
  }
  return out;
}
module.exports={apply,edits};
if(require.main===module){
  const fs=require('node:fs');
  const crypto=require('node:crypto');
  const file=process.argv[2];
  if(!file)throw new Error('Provide the exact successor worker path; writes to stdout only');
  const buf=fs.readFileSync(file);
  const blob=crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');
  if(blob!=="727a6d65a6fb2567b0f39e8f3e9db76b9befe333")throw new Error('Wrong worker blob: '+blob);
  process.stdout.write(apply(buf.toString('utf8')));
}
