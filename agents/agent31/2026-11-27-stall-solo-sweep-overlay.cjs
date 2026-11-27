'use strict';
// Optional, public-observation heuristic; exact source inventory is NOT an actor input.
const edits=[
  [
    "stall solo readiness",
    "function gateWantedIgnoringPrize(view) {",
    "function preserveStallSoloNightWatch(view){\n  const active=view.ownPublic.active,target=view.opponentPublic.active;\n  if(!hasName(active?.printing,'Trevenant & Dusknoir-GX')||\n     view.ownPublic.bench.some(Boolean)||active.hp-active.damage<=150)return false;\n  const board=opponentBoard(view);\n  if(!board.some(p=>hasName(p.printing,'Snorlax PGO'))||\n     !board.every(p=>hasAnyName(p.printing,['Snorlax PGO','Mimikyu PAL','Regirock PR','Wobbuffet PHF','Girafarig LOT'])))return false;\n  const used=[...view.opponentPublic.discard,...(view.opponentPublic.lostZone??[])];\n  if(!used.some(p=>hasName(p,'Target Whistle'))||!used.some(p=>hasName(p,'Captivating Poké Puff')))return false;\n  const night=active.attacks?.find(a=>a.name==='Night Watch');\n  return !!night&&canPayAttack(active,night,view)&&\n    Number.isFinite(estimatedDamage(active,night,view,target))&&\n    estimatedDamage(active,night,view,target)>=target.hp-target.damage;\n}\nfunction gateWantedIgnoringPrize(view) {\n  if(preserveStallSoloNightWatch(view))return false;"
  ],
  [
    "avoid ending turn with Gate",
    "function scoreClimacticGatePlay(item, view) {",
    "function scoreClimacticGatePlay(item, view) {\n  if(preserveStallSoloNightWatch(view))return -Infinity;"
  ],
  [
    "avoid new gust targets",
    "  if (!hasOpenBench(view)) return -Infinity;\n  if(optionalBenchHazard",
    "  if (!hasOpenBench(view)||preserveStallSoloNightWatch(view)) return -Infinity;\n  if(optionalBenchHazard"
  ],
  [
    "avoid redundant basic tutors",
    "  if (hasName(printing, 'Radiant Eternatus')) return gateAccessNeed(view) ? 120 : -5;",
    "  if(preserveStallSoloNightWatch(view)&&hasAnyName(printing,['Radiant Eternatus','Latias ex','Tapu Lele-GX','Shadow Rider Calyrex V','Girafarig','Wobbuffet','Marshadow',\"Lillie's Clefairy ex\",'Mimikyu','Dialga-GX']))return -5;\n  if (hasName(printing, 'Radiant Eternatus')) return gateAccessNeed(view) ? 120 : -5;"
  ],
  [
    "buffer energy denial",
    "  const count = slotEnergyCount(target);\n  const chargedView=viewAfterPsychicAttachment",
    "  const count = slotEnergyCount(target);\n  if(target===view.ownPublic.active&&preserveStallSoloNightWatch(view)&&\n     count<3+view.ownPublic.prizeCount+2)return 1200;\n  const chargedView=viewAfterPsychicAttachment"
  ]
];
module.exports={edits,apply(source){for(const [name,a,b] of edits){if(source.split(a).length!==2)throw Error(name);source=source.replace(a,b)}return source}};
