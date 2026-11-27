'use strict';
// Optional actor-visible valuation overlay. Apply after approved Agent31 repair bundle.
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
  ]
];
module.exports={edits,apply(source){for(const [label,a,b] of edits){if(source.split(a).length!==2)throw Error(label);source=source.replace(a,b)}return source}};
