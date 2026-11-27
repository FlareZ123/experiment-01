'use strict';
// Rank19 ADP attack ordering: already-funded public replies, not a complete
// candidate policy, inferred hidden hand, or guarantee of surviving a turn.
const targets=require('./agent23-rank19-candidate-targets.cjs');
const list=x=>Array.isArray(x)?x:[];
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const ADP=/^Arceus & Dialga & Palkia-? ?GX CEC(?: 156)?$/;
const VMAX=/^Shadow Rider Calyrex VMAX CRE(?: 75)?$/;
const CLEF=/^Lillie's Clefairy ex JTG(?: 56)?$/;
const TRE=/^Trevenant & Dusknoir-GX SMP(?: (?:SM)?217)?$/;
const MIM=/^Mimikyu GRI(?: 58)?$/;
const LAT=/^Latias ex SSP(?: 76)?$/;
const VAL=/^Dimension Valley PHF(?: 93)?$/;
const PSY=/^(?:Basic )?Psychic Energy(?: [A-Z0-9]+(?: \d+)?)?$/;
const FLOAT=/^Float Stone BKT(?: 137)?$/;
const SAFE_TOOL=/^(?:Float Stone BKT(?: 137)?|Forest Seal Stone SIT(?: 156)?)$/;
const board=p=>[p?.active,...list(p?.bench)].filter(Boolean);
const count=p=>Array.isArray(p?.energies)&&p.energies.every(e=>PSY.test(name(e)))?p.energies.length:null;
const ability=(p,a)=>list(p?.abilitySuppressions).some(x=>x?.abilityName===a&&x.suppressed===false);
function permitted(p,foe,attack){
 const r=p.publicRestrictions??{};
 return Array.isArray(p.specialConditions)&&!p.specialConditions.length&&!r.cannotAttackNextTurn&&!(r.attackCostIncreaseNextTurn>0)&&!(r.attackCostIncreaseWhileActive>0)&&!list(r.cannotUseAttacksNextTurn).includes(attack)&&r.blockedAttackNameNextTurn!==attack&&r.blockedAttackNameUntilLeavesActive!==attack&&(!r.onlyAllowedAttackNameNextTurn||r.onlyAllowedAttackNameNextTurn===attack)&&!(foe.publicTurnRestrictions?.attackLockTurnsRemaining>0);
}
function freePivot(p,foe,survivors){
 const r=p?.publicRestrictions??{};
 if(!Array.isArray(p?.specialConditions)||p.specialConditions.length||r.cannotRetreat||r.cannotRetreatNextTurn||r.cannotRetreatWhileActive)return false;
 if(Array.isArray(p.printed?.retreatCost)&&p.printed.retreatCost.length===0)return true;
 if(!(foe.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0)&&list(p.tools).some(t=>FLOAT.test(name(t))))return true;
 return !VMAX.test(name(p))&&survivors.some(x=>LAT.test(name(x))&&ability(x,'Skyliner'));
}
function replies(o,own,defender,sourceAttack){
 const foe=o?.opponentPublic,adp=own?.active,t=targets.target(defender);
 if(!foe||!ADP.test(name(adp))||!t||!Number.isFinite(adp.hp)||!Number.isFinite(adp.damage)||adp.hp<=adp.damage||!Array.isArray(adp.tools)||adp.tools.some(x=>!SAFE_TOOL.test(name(x)))||!Array.isArray(own.stadium)||!Array.isArray(foe.stadium)||!['Altered Creation-GX','Ultimate Ray'].includes(sourceAttack))return [];
 const original=board(foe);
 if(original.filter(p=>p===defender).length!==1||original.some(p=>!targets.target(p)||count(p)===null))return [];
 const ko=sourceAttack==='Ultimate Ray'&&t.remaining<=150;
 const survivors=ko?original.filter(p=>p!==defender):original;
 if(!survivors.length)return [];
 const activeOptions=ko||freePivot(defender,foe,survivors)?survivors:[defender];
 const valley=[...own.stadium,...foe.stadium].some(x=>VAL.test(name(x)))&&!(foe.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0);
 const fairy=survivors.some(x=>CLEF.test(name(x))&&ability(x,'Fairy Zone'));
 const weak=fairy?2:1,total=survivors.reduce((s,p)=>s+count(p),0),bench=Math.max(0,survivors.length-1)+list(own.bench).filter(Boolean).length;
 const remaining=adp.hp-adp.damage,out=[];
 for(const p of activeOptions){
  let attack,damage,cost;
  const n=name(p);
  if(VMAX.test(n)){attack='Max Geist';damage=(10+30*total)*weak;cost=3;}
  else if(CLEF.test(n)){attack='Full Moon Rondo';damage=(20+20*bench)*weak;cost=2;}
  else if(TRE.test(n)){attack='Night Watch';damage=150*weak;cost=3; if(count(p)<3)continue;}
  else if(LAT.test(n)){attack='Eon Blade';damage=200*weak;cost=3;}
  else if(MIM.test(n)&&sourceAttack==='Ultimate Ray'){attack='Copycat';damage=150*weak;cost=2;}
  else continue;
  if(count(p)<cost-(valley&&!TRE.test(n)?1:0)||!permitted(p,foe,attack)||damage<remaining)continue;
  out.push({printing:n,attack,damage,remaining,prizes:3,terminal:Number.isSafeInteger(foe.prizeCount)&&foe.prizeCount<=3});
 }
 return out;
}
function preferRay(o,own,defender){
 const t=targets.target(defender);
 if(!t)return false;
 const emptyBoard=Array.isArray(o.opponentPublic?.bench)&&o.opponentPublic.active===defender&&!o.opponentPublic.bench.some(Boolean);
 if(t.remaining<=150&&(emptyBoard||Number.isSafeInteger(own.prizeCount)&&own.prizeCount>0&&own.prizeCount<=t.prizes))return true;
 const gx=replies(o,own,defender,'Altered Creation-GX'),ray=replies(o,own,defender,'Ultimate Ray');
 // Explicit risk differential, not a certificate that the no-reply side is safe.
 if(gx.length&&!ray.length)return true;
 // Both attacks expose a known KO. If it doesn't end the game, a real
 // knockout plus board acceleration is better immediate compensation.
 if(gx.length&&ray.length&&t.remaining<=150&&gx.every(x=>!x.terminal)&&ray.every(x=>!x.terminal))return true;
 return false;
}
module.exports={replies,preferRay};
