'use strict';
// Actor-visible, already-funded terminal reply advisory. Not a game solver.
const targets=require('./agent23-rank19-candidate-targets.cjs');
const list=x=>Array.isArray(x)?x:[];
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const is=(x,re)=>re.test(name(x));
const board=x=>[x?.active,...list(x?.bench)].filter(Boolean);
const PSY=/^(?:Basic )?Psychic Energy(?: [A-Z0-9]+(?: \d+)?)?$/;
const BASIC=/^(?:Basic )?(?:Darkness|Fighting|Lightning) Energy(?: [A-Z0-9]+(?: \d+)?)?$/;
const DDE=/^Double Dragon Energy ROS(?: 97)?$/;
const VAL=/^Dimension Valley PHF(?: 93)?$/;
const TEMPLE=/^Temple of Sinnoh ASR(?: 155)?$/;
const TOOL=/^(?:Float Stone BKT(?: 137)?|Forest Seal Stone SIT(?: 156)?)$/;
const DRAGON=/^(?:Raging Bolt ex TEF(?: 123)?|Arceus & Dialga & Palkia-? ?GX CEC(?: 156)?)$/;
const ADP=/^Arceus & Dialga & Palkia-? ?GX CEC(?: 156)?$/;
const CLEF=/^Lillie's Clefairy ex JTG(?: 56)?$/;
const VMAX=/^Shadow Rider Calyrex VMAX CRE(?: 75)?$/;
const V=/^Shadow Rider Calyrex V CRE(?: 74)?$/;
const MOL=/^Galarian Moltres V CRE(?: 97)?$/;
const ONE=/^(?:Marshadow UNB(?: 81)?|Sudowoodo GRI(?: 66)?|Flutter Mane TEF(?: 78)?|Tapu Koko (?:♢|◇|Prism Star) TEU(?: 51)?)$/;
const TWO=/^(?:Raging Bolt ex TEF(?: 123)?|Sandy Shocks ex PAR(?: 108)?|Galarian Moltres V CRE(?: 97)?|Ho-Oh-? ?EX DRX(?: 22)?|Dedenne-? ?GX UNB(?: 57)?|Crobat V DAA(?: 104)?|Squawkabilly ex PAL(?: 169)?|Tapu Lele-? ?GX GRI(?: 60)?|Latias ex SSP(?: 76)?)$/;
const attacks=new Set(['Aura Burn','Bellowing Thunder','Burst Roar','Altered Creation-GX','Ultimate Ray','Earthen Spike','Rainbow Burn','Energy Drive','Rock Throw']);
function hp(p){return Number.isFinite(p?.hp)&&Number.isFinite(p?.damage)&&p.damage>=0&&p.hp>p.damage?p.hp-p.damage:null;}
function sourcePrize(p){return is(p,ADP)?3:is(p,TWO)?2:is(p,ONE)?1:0;}
function sourceKnown(p){return sourcePrize(p)>0&&hp(p)!==null&&Array.isArray(p.tools)&&p.tools.every(t=>is(t,TOOL));}
function psychic(p){return Array.isArray(p?.energies)&&p.energies.every(e=>is(e,PSY))?p.energies.length:null;}
function permitted(p,foe,attack){
 const r=p.publicRestrictions??{};
 return Array.isArray(p.specialConditions)&&!p.specialConditions.length&&!r.cannotAttackNextTurn&&!(r.attackCostIncreaseNextTurn>0)&&!(r.attackCostIncreaseWhileActive>0)&&!list(r.cannotUseAttacksNextTurn).includes(attack)&&r.blockedAttackNameNextTurn!==attack&&r.blockedAttackNameUntilLeavesActive!==attack&&(!r.onlyAllowedAttackNameNextTurn||r.onlyAllowedAttackNameNextTurn===attack)&&!(foe.publicTurnRestrictions?.attackLockTurnsRemaining>0);
}
function reply(o,own,defender,attack){
 const foe=o?.opponentPublic,source=own?.active;
 if(!foe||!sourceKnown(source)||!attack||!attacks.has(attack.attackName)||attack.terminal||!Number.isSafeInteger(own.prizeCount)||!Number.isSafeInteger(foe.prizeCount)||foe.prizeCount<1||foe.prizeCount>6)return null;
 // Do not disfavor a possibly terminal source attack when ADP bonus is unknown.
 const extra=own.publicTurnRestrictions?.gxUsed===false?0:1;
 if(attack.lethal&&own.prizeCount<=attack.prizes+extra)return null;
 const before=board(foe),src=board(own);
 if(before.filter(p=>p===defender).length!==1||before.some(p=>!targets.target(p)||psychic(p)===null)||new Set(before).size!==before.length||new Set(src).size!==src.length)return null;
 const survivors=attack.lethal?before.filter(p=>p!==defender):before;
 if(!survivors.length||!Array.isArray(own.stadium)||!Array.isArray(foe.stadium))return null;
 const recoil=attack.attackName==='Aura Burn'&&is(source,MOL)?30:0,remaining=hp(source)-recoil;
 if(remaining<=0)return null;
 // A KO permits any survivor's promotion. Otherwise evaluate defender only.
 const options=attack.lethal?survivors:[defender];
 const stadium=[...own.stadium,...foe.stadium],stadiumLive=!(foe.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0);
 const valley=stadiumLive&&stadium.some(x=>is(x,VAL));
 const fairy=survivors.some(p=>is(p,CLEF)&&list(p.abilitySuppressions).some(a=>a.abilityName==='Fairy Zone'&&a.suppressed===false));
 const weakness=fairy&&is(source,DRAGON)?2:1;
 const total=survivors.reduce((n,p)=>n+psychic(p),0),benches=survivors.length-1+src.length-1;
 const prizes=sourcePrize(source),need=foe.prizeCount;
 // All Basic discards may come from Active; DDE is not a Basic.
 const physical=Array.isArray(source.energies)&&source.energies.every(e=>is(e,BASIC)||is(e,DDE)&&is(source,DRAGON));
 const donors=attack.attackName==='Bellowing Thunder'?attack.donors:0;
 const activeUnits=physical&&Number.isSafeInteger(donors)&&donors>=0?
 Math.max(0,source.energies.filter(e=>is(e,BASIC)).length-donors)+source.energies.filter(e=>is(e,DDE)).length*(stadium.some(x=>is(x,TEMPLE))?1:2):null;
 const hit=(p,a,c,d,ignore=false)=>{
  if(psychic(p)<c||!permitted(p,foe,a)||prizes<need||d*(ignore?1:weakness)<remaining)return null;
  return {kind:'visible-terminal-native-attack-reply',printing:name(p),attackName:a,damage:d*(ignore?1:weakness),prizes,remaining};
 };
 for(const p of options){
  let r=null;
  if(is(p,VMAX))r=hit(p,'Max Geist',valley?2:3,10+30*total);
  else if(is(p,CLEF))r=hit(p,'Full Moon Rondo',valley?1:2,20+20*benches);
  else if(is(p,/^Trevenant & Dusknoir-GX SMP(?: (?:SM)?217)?$/))r=hit(p,'Night Watch',3,150);
  else if(is(p,/^Latias ex SSP(?: 76)?$/))r=hit(p,'Eon Blade',valley?2:3,200);
  else if(is(p,/^Tapu Lele-GX GRI(?: 60)?$/)&&activeUnits!==null)r=hit(p,'Energy Drive',valley?1:2,20*(psychic(p)+activeUnits),true);
  else if(is(p,/^Wobbuffet PHF(?: 36)?$/))r=hit(p,'Psychic Assault',valley?1:2,10+source.damage+recoil);
  else if(is(p,/^Girafarig LOT(?: 94)?$/))r=hit(p,'Mind Shock',valley?2:3,70,true);
  else if(is(p,/^Marshadow UNB(?: 81)?$/))r=hit(p,'Red Knuckles',valley?0:1,10);
  else if(is(p,V)){
   r=hit(p,'Shadow Mist',1,10);
   if(!r&&psychic(p)>=(valley?2:3)&&permitted(p,foe,'Astral Barrage')){
    const kos=src.filter(s=>sourceKnown(s)&&(s===source?remaining:hp(s))<=50).map(s=>({printing:name(s),prizes:sourcePrize(s)})).sort((a,b)=>b.prizes-a.prizes).slice(0,2);
    const taken=kos.reduce((n,s)=>n+s.prizes,0);
    if(taken>=need)r={kind:'visible-terminal-native-attack-reply',printing:name(p),attackName:'Astral Barrage',prizes:taken,targets:kos};
   }
  }
  if(r)return Object.freeze(r);
 }
 return null;
}
function adjust(o,own,defender,attack){
 const threat=reply(o,own,defender,attack);
 return threat?{...attack,score:Math.min(attack.score,1),nativeTerminalReply:threat}:attack;
}
module.exports={reply,adjust,sourcePrize};
