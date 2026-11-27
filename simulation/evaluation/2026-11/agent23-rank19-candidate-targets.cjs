'use strict';
// Exact Pokémon identities in the two unchanged candidate profiles.
// Printed weaknesses from the supplied English card pool; no inferred ADP
// boost, dynamic weakness override or unmodeled damage reduction.
const targets=Object.freeze([
 [/^Shadow Rider Calyrex V CRE(?: 74)?$/,2,true],
 [/^Shadow Rider Calyrex VMAX CRE(?: 75)?$/,3,true],
 [/^Lillie's Clefairy ex JTG(?: 56)?$/,2,false],
 [/^Trevenant & Dusknoir-GX SMP(?: (?:SM)?217)?$/,3,true],
 [/^Tapu Lele-GX GRI(?: 60)?$/,2,false],
 [/^Latias ex SSP(?: 76)?$/,2,true],
 [/^Dialga-GX UPR(?: 100)?$/,2,false],
 [/^Mimikyu GRI(?: 58)?$/,1,false],
 [/^Girafarig LOT(?: 94)?$/,1,false],
 [/^Marshadow UNB(?: 81)?$/,1,true],
 [/^Radiant Eternatus CRZ(?: 105)?$/,1,false],
 [/^Wobbuffet PHF(?: 36)?$/,1,false]
]);
const harmlessTool=/^(?:Stealthy Hood UNB(?: 186)?|Float Stone BKT(?: 137)?|Forest Seal Stone SIT(?: 156)?)$/;
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
function target(p){
 const row=targets.find(x=>x[0].test(name(p)));
 if(!row||!Array.isArray(p?.tools)||p.tools.some(t=>!harmlessTool.test(name(t)))||!Number.isFinite(p.hp)||!Number.isFinite(p.damage)||p.damage<0||p.hp<=p.damage)return null;
 return {prizes:row[1],darkWeak:row[2],remaining:p.hp-p.damage};
}
function auraPrizeValue(p){
 const t=target(p);
 return t&&t.remaining<=190*(t.darkWeak?2:1)?t.prizes:0;
}
function knockoutCost(p){const t=target(p);return t?Math.ceil(t.remaining/70):null;}
module.exports={target,auraPrizeValue,knockoutCost};
