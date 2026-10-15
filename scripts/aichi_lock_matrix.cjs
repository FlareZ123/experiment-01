'use strict';
const fs=require('node:fs');
const path=require('node:path');
/** Exact-print threats: [set,number,name,category,activation,scope,precondition]. */
const LOCKS=[
  [
    "ASC",
    "16",
    "Budew",
    "Item",
    "attack",
    "opponent next turn",
    "Itchy Pollen attack resolves"
  ],
  [
    "AOR",
    "3",
    "Vileplume",
    "Item",
    "passive Ability",
    "both players",
    "Stage 2 in play with Ability active"
  ],
  [
    "BUS",
    "6",
    "Vileplume",
    "Basic attacks",
    "passive Ability",
    "opponent",
    "Stage 2 Active with Ability active"
  ],
  [
    "LTR",
    "68",
    "Garbodor",
    "Abilities",
    "passive Ability",
    "both players",
    "Stage 1 holding Tool with Ability active"
  ],
  [
    "BKP",
    "57",
    "Garbodor",
    "Abilities",
    "passive Ability",
    "both players",
    "Stage 1 holding Tool with Ability active"
  ],
  [
    "BCR",
    "122",
    "Stoutland",
    "Supporters",
    "passive Ability",
    "opponent",
    "Stage 2 Active with Ability active"
  ],
  [
    "TWM",
    "77",
    "Iron Thorns ex",
    "Rule Box Abilities",
    "passive Ability",
    "both players except Future",
    "Basic Active with Ability active"
  ],
  [
    "PGO",
    "55",
    "Snorlax",
    "retreat",
    "passive Ability",
    "opponent Active",
    "Basic Active with Ability active"
  ],
  [
    "SVI",
    "96",
    "Klefki",
    "Basic Abilities",
    "passive Ability",
    "both players",
    "Basic Active with Ability active"
  ],
  [
    "PHF",
    "36",
    "Wobbuffet",
    "non-Psychic Abilities",
    "passive Ability",
    "both players",
    "Basic Active with Ability active"
  ],
  [
    "CRE",
    "148",
    "Path to the Peak",
    "Rule Box Abilities",
    "Stadium",
    "both players",
    "Stadium in play"
  ],
  [
    "PRC",
    "140",
    "Silent Lab",
    "Basic Abilities",
    "Stadium",
    "both players",
    "Stadium in play"
  ]
];
/** @param {Array<{rank:number,archetype:string,cards:Array<{name:string,count:number,printing:{set:string,number:string}}>}>} decks */
function audit(decks){
 const affected=new Set();
 const entries=LOCKS.map(([set,number,name,kind,activation,scope,precondition])=>{
  const matches=decks.flatMap(d=>d.cards.filter(c=>c.name===name&&c.printing.set===set&&c.printing.number===number).map(c=>({rank:d.rank,archetype:d.archetype,copies:c.count})));
  for(const m of matches)affected.add(m.rank);
  return {set,number,name,kind,activation,scope,precondition,decks:matches.length,slots:matches.reduce((a,b)=>a+b.copies,0),matches};
 });
 return {coverage:'Exact-print presence only; availability of effects is not measured',totalPublished:decks.length,placementsWithKnownLock:affected.size,entries};
}
function validate(x){
 if(x.totalPublished!==29||x.placementsWithKnownLock!==24)throw Error('Cohort changed');
 const a=new Map(x.entries.map(e=>[e.set+'/'+e.number,e]));
 for(const [k,decks,slots] of [['ASC/16',14,19],['AOR/3',2,4],['BUS/6',1,1],['LTR/68',2,4],['BKP/57',3,5],['BCR/122',1,1],['TWM/77',3,12],['PGO/55',2,5],['SVI/96',2,2],['PHF/36',3,5],['CRE/148',7,8],['PRC/140',4,5]]){
  const row=a.get(k);if(!row||row.decks!==decks||row.slots!==slots)throw Error('Lock prevalence changed '+k);
 }
}
if(require.main===module){
 const root=path.resolve(__dirname,'..');
 const source=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
 const output=audit(source.decks);validate(output);
 process.stdout.write(JSON.stringify(output,null,2)+'\n');
}
module.exports={LOCKS,audit,validate};
