'use strict';
// Candidate reply movement with an explicit physical Basic Psychic retreat payment.
// Only the twelve fixed-candidate Pokémon identities are admitted.
const targets=require('./agent23-rank19-candidate-targets.cjs');
const list=x=>Array.isArray(x)?x:[];
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const is=(p,re)=>re.test(name(p));
const PSY=/^(?:Basic )?Psychic Energy(?: [A-Z0-9]+(?: \d+)?)?$/;
const FLOAT=/^Float Stone BKT(?: 137)?$/;
const LAT=/^Latias ex SSP(?: 76)?$/;
const VMAX=/^Shadow Rider Calyrex VMAX CRE(?: 75)?$/;
const COSTS=[
 [/^Shadow Rider Calyrex V CRE(?: 74)?$/,2],[VMAX,2],
 [/^Lillie's Clefairy ex JTG(?: 56)?$/,1],[/^Trevenant & Dusknoir-GX SMP(?: (?:SM)?217)?$/,3],
 [/^Tapu Lele-GX GRI(?: 60)?$/,1],[LAT,2],[/^Dialga-GX UPR(?: 100)?$/,3],
 [/^Mimikyu GRI(?: 58)?$/,1],[/^Girafarig LOT(?: 94)?$/,1],[/^Marshadow UNB(?: 81)?$/,1],
 [/^Radiant Eternatus CRZ(?: 105)?$/,2],[/^Wobbuffet PHF(?: 36)?$/,2]
];
const board=p=>[p?.active,...list(p?.bench)].filter(Boolean);
const psychic=p=>Array.isArray(p?.energies)&&p.energies.every(e=>is(e,PSY))?p.energies.length:null;
const ability=(p,a)=>list(p?.abilitySuppressions).some(x=>x?.abilityName===a&&x.suppressed===false);
function retreatPayment(o,own,defender,survivors){
 const r=defender.publicRestrictions??{},foe=o.opponentPublic;
 if(!Array.isArray(defender.specialConditions)||defender.specialConditions.length||r.cannotRetreat||r.cannotRetreatNextTurn||r.cannotRetreatWhileActive||r.retreatCostIncreaseNextTurn>0||r.retreatCostIncreaseWhileActive>0)return null;
 const base=COSTS.find(x=>is(defender,x[0]))?.[1];
 if(!Number.isSafeInteger(base)||Array.isArray(defender.printed?.retreatCost)&&defender.printed.retreatCost.length!==base)return null;
 const stadium=[...own.stadium,...foe.stadium];
 const floatLive=!(foe.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0)&&!stadium.some(x=>/^Jamming Tower /.test(name(x)))&&!list(own.active?.tools).some(t=>/^Tool Jammer /.test(name(t)));
 if(floatLive&&list(defender.tools).some(x=>is(x,FLOAT)))return 0;
 if(!is(defender,VMAX)&&survivors.some(p=>is(p,LAT)&&ability(p,'Skyliner')))return 0;
 return psychic(defender)>=base?base:null;
}
function routes(o,own,defender,attack){
 const foe=o?.opponentPublic;
 if(!foe||!own||!Array.isArray(own.stadium)||!Array.isArray(foe.stadium)||!attack)return null;
 const before=board(foe);
 if(before.filter(p=>p===defender).length!==1||new Set(before).size!==before.length||before.some(p=>!targets.target(p)||psychic(p)===null))return null;
 const survivors=attack.lethal?before.filter(p=>p!==defender):before;
 if(!survivors.length)return null;
 const total=survivors.reduce((n,p)=>n+psychic(p),0);
 const options=attack.lethal?survivors.map(p=>({pokemon:p,totalPsychic:total,paidRetreat:0,route:'promote-after-ko'})):[{pokemon:defender,totalPsychic:total,paidRetreat:0,route:'already-active'}];
 if(!attack.lethal&&survivors.length>1){
  const paid=retreatPayment(o,own,defender,survivors);
  if(paid!==null)for(const p of survivors)if(p!==defender)options.push({pokemon:p,totalPsychic:total-paid,paidRetreat:paid,route:'retreat'});
 }
 return {survivors,options};
}
module.exports={routes,psychic,retreatPayment};
