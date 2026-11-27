'use strict';
// Optional actor-visible control denial overlay. Apply after Agent31 repair bundle.
const edits=[
  [
    "control helpers",
    "function getLostValue(view,printing) {",
    "function observedThornsControl(view) {\n  const board=opponentBoard(view);\n  return board.length>0&&board.every(slot=>hasName(slot.printing,'Iron Thorns ex'));\n}\nfunction publicTempleResettingHoleRisk(view) {\n  const board=opponentBoard(view);\n  return stadiumAndToolEffectsLive(view)===true&&\n    view.ownPublic.stadium.some(p=>hasName(p,'Temple of Sinnoh'))&&\n    board.some(p=>hasAnyName(p.printing,['Alolan Raichu','Electrode-GX']))&&\n    board.some(p=>(p.energies??[]).some(e=>!isBasicEnergyPrinting(e)))&&\n    !board.some(p=>(p.energies??[]).some(isBasicEnergyPrinting));\n}\nfunction controlPairBonus(view,names) {\n  if(!observedThornsControl(view))return 0;\n  const ls=names.filter(n=>hasName(n,'Lusamine')).length;\n  if(ls===2)return 500;\n  if(ls===1&&names.some(n=>hasName(n,'Cynthia & Caitlin')))return 300;\n  return 0;\n}\nfunction getLostValue(view,printing) {\n  if(hasName(printing,'Marshadow UNB')&&publicTempleResettingHoleRisk(view))return 950;\n  if(observedThornsControl(view)){\n    if(hasAnyName(printing,[\"Team Rocket's Handiwork\",\"Bellelba & Brycen-Man\"]))\n      return view.ownPublic.deckCount<=8?1200:600;\n    if(hasName(printing,'Faba'))return view.ownPublic.stadium.some(p=>hasName(p,'Temple of Sinnoh'))||\n      ownBoard(view).some(p=>(p.tools??[]).some(t=>hasAnyName(t,['Stealthy Hood','Float Stone'])))?900:500;\n    if(hasName(printing,'Lusamine'))return 230;\n    if(hasName(printing,'Cynthia & Caitlin'))return 190;\n  }\n"
  ],
  [
    "pair bonus",
    "getLostValue(view,a.printing)+getLostValue(view,b.printing);",
    "getLostValue(view,a.printing)+getLostValue(view,b.printing)+controlPairBonus(view,names);"
  ],
  [
    "pair eligibility",
    "if(values.length<2||values[0]<300)return -Infinity;\n  const best=getLostPairs(view,discard.map((printing,index)=>({printing,index})));",
    "if(values.length<2)return -Infinity;\n  const best=getLostPairs(view,discard.map((printing,index)=>({printing,index})));\n  if(values[0]<300&&(!best||controlPairBonus(view,best.rows.map(r=>r.printing))===0))return -Infinity;"
  ],
  [
    "access feasibility",
    "function getLostValue(view,printing) {",
    "function affordableControlGetLostAccess(view){\n  if(!observedThornsControl(view)&&!publicTempleResettingHoleRisk(view))return false;\n  if(!hasOpenBench(view)||boardHas(view,'Girafarig')||\n     view.ownTurnResources.retreatedTurn!==0||view.globalTurn<=1||\n     view.ownTurnResources.pokemonPlayLocked||\n     view.ownPublic.publicTurnRestrictions?.attackLockTurnsRemaining!==0)return false;\n  const cost=ownRetreatCost(view);\n  if(cost===null||cost>1||slotEnergyCount(view.ownPublic.active)<cost)return false;\n  if(dimensionValleyStatus(view)!==true&&\n     (view.ownTurnResources.energyPlayedTurn!==false||view.ownTurnResources.energyPlayLocked||!handHas(view,'Psychic Energy')))return false;\n  const plan=getLostPlan(view);\n  if(!Number.isFinite(plan))return false;\n  const current=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);\n  return plan>(current?.score??0)+cost*350+100;\n}\nfunction needControlGirafarig(view){\n return affordableControlGetLostAccess(view)&&!handHas(view,'Girafarig')&&\n    !knownFullyPrized(view,'Girafarig');\n}\nfunction getLostValue(view,printing) {"
  ],
  [
    "search target",
    "  if (hasName(printing, 'Radiant Eternatus')) return gateAccessNeed(view) ? 120 : -5;",
    "  if(hasName(printing,'Girafarig')&&needControlGirafarig(view))return 106;\n  if (hasName(printing, 'Radiant Eternatus')) return gateAccessNeed(view) ? 120 : -5;"
  ],
  [
    "bench only when immediately feasible",
    "  const reserveGate = handHas(view,'Radiant Eternatus') &&",
    "  if(hasName(printing,'Girafarig')&&affordableControlGetLostAccess(view))return 1080;\n  const reserveGate = handHas(view,'Radiant Eternatus') &&"
  ],
  [
    "search root Fog",
    "(missingBasicV ||\n       (opponentHasDragon(view)",
    "(missingBasicV || needControlGirafarig(view) ||\n       (opponentHasDragon(view)"
  ],
  [
    "search root MT",
    "(gateAccessNeed(view) || missingBasicV || needNightWatch ||",
    "(gateAccessNeed(view) || missingBasicV || needNightWatch || needControlGirafarig(view) ||"
  ],
  [
    "search root Quick",
    "(missingBasicV || needNightWatch || gateAccessNeed(view)))",
    "(missingBasicV || needNightWatch || gateAccessNeed(view) || needControlGirafarig(view)))"
  ],
  [
    "preserve required denial body",
    "  const duplicates = view.ownHand.filter(item => item === printing).length;",
    "  if(hasName(printing,'Girafarig')&&affordableControlGetLostAccess(view))return 900;\n  const duplicates = view.ownHand.filter(item => item === printing).length;"
  ],
  [
    "rain potential",
    "function publicTempleResettingHoleRisk(view) {",
    "function observedElectroRainThreat(view){\n return opponentBoard(view).some(p=>hasAnyName(p.printing,['Alolan Raichu UNM','Electrode-GX CES']));\n}\nfunction rainDiscardEnergyValue(view,printing){\n if(!observedElectroRainThreat(view)||\n   !hasAnyName(printing,['Reversal Energy','Counter Energy','Unit Energy LPM']))return null;\n if(hasActiveStadiumLock(view,'Temple of Sinnoh'))return 100;\n const bombs=opponentBoard(view).filter(p=>hasName(p.printing,'Electrode-GX CES')).length;\n const own=view.ownPublic.prizeCount,opp=view.opponentPublic.prizeCount;\n const usable=Math.min(bombs,Math.floor((own-1)/2));\n const behind=opp>own-2*usable;\n if(hasName(printing,'Reversal Energy'))return behind?900:180;\n if(hasName(printing,'Counter Energy'))return behind?600:180;\n return 300;\n}\nfunction publicTempleResettingHoleRisk(view) {"
  ],
  [
    "rain discard value",
    "  if(hasName(printing,'Marshadow UNB')&&publicTempleResettingHoleRisk(view))return 950;",
    "  if(hasName(printing,'Marshadow UNB')&&publicTempleResettingHoleRisk(view))return 950;\n  const rain=rainDiscardEnergyValue(view,printing);if(rain!==null)return rain;"
  ],
  [
    "rain access",
    "if(!observedThornsControl(view)&&!publicTempleResettingHoleRisk(view))return false;",
    "if(!observedThornsControl(view)&&!observedElectroRainThreat(view))return false;"
  ]
];
module.exports={edits,apply(source){for(const [label,a,b] of edits){if(source.split(a).length!==2)throw Error(label);source=source.replace(a,b)}return source}};
