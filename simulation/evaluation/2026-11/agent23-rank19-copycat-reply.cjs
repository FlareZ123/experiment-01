'use strict';
// Rank19 source-side, visible one-reply tactical advisory. Not a copied-attack
// resolver, game simulator, registration, or claim of opponent competence.
const movement=require('./agent23-rank19-funded-reply-routes.cjs');
const list = x => Array.isArray(x) ? x : [];
const name = x => typeof x === 'string' ? x : x?.printing ?? x?.fullName ?? '';
const is = (x,re) => re.test(name(x));
const MIM = /^Mimikyu GRI(?: 58)?$/;
const CLEF = /^Lillie's Clefairy ex JTG(?: 56)?$/;
const MOL = /^Galarian Moltres V CRE(?: 97)?$/;
const ADP = /^Arceus & Dialga & Palkia-? ?GX CEC(?: 156)?$/;
const BOLT = /^Raging Bolt ex TEF(?: 123)?$/;
const PSY = /^(?:Basic )?Psychic Energy(?: [A-Z0-9]+(?: \d+)?)?$/;
const VALLEY = /^Dimension Valley PHF(?: 93)?$/;
const TOOL = /^(?:Float Stone BKT(?: 137)?|Forest Seal Stone SIT(?: 156)?)$/;
const board = side => [side?.active,...list(side?.bench)].filter(Boolean);
const hp = p => Number.isFinite(p?.hp)&&Number.isFinite(p?.damage)&&p.damage>=0&&p.hp>p.damage?p.hp-p.damage:null;
function canCopy(p,foe,valley){
  if(!is(p,MIM)||hp(p)===null||!Array.isArray(p.energies)||!p.energies.every(e=>is(e,PSY))||!Array.isArray(p.specialConditions)||p.specialConditions.length)return false;
  const r=p.publicRestrictions??{};
  if(r.cannotAttackNextTurn||r.attackCostIncreaseNextTurn>0||r.attackCostIncreaseWhileActive>0||list(r.cannotUseAttacksNextTurn).includes('Copycat')||r.blockedAttackNameNextTurn==='Copycat'||r.blockedAttackNameUntilLeavesActive==='Copycat'||r.onlyAllowedAttackNameNextTurn&&r.onlyAllowedAttackNameNextTurn!=='Copycat'||foe.publicTurnRestrictions?.attackLockTurnsRemaining>0)return false;
  return p.energies.length >= (valley?1:2);
}
function fairyZone(survivors){
  return survivors.some(p=>is(p,CLEF)&&hp(p)!==null&&list(p.abilitySuppressions).some(a=>a.abilityName==='Fairy Zone'&&a.suppressed===false));
}
function reply(observation,own,defender,attack){
  const foe=observation?.opponentPublic,source=own?.active;
  if(!foe||!source||!attack||typeof attack.lethal!=='boolean'||attack.terminal||!Number.isSafeInteger(attack.prizes)||(attack.lethal?(attack.prizes<1||attack.prizes>3):attack.prizes!==0||!Number.isFinite(attack.damage)||attack.damage<0)||!Number.isSafeInteger(own.prizeCount)||!Number.isSafeInteger(foe.prizeCount)||foe.prizeCount<1||foe.prizeCount>6)return null;
  // Do not disfavor a possibly terminal source attack if the projected
  // public observation has not resolved whether ADP's extra Prize is live.
  const possibleExtra=own.publicTurnRestrictions?.gxUsed===false?0:1;
  if(attack.lethal&&own.prizeCount<=attack.prizes+possibleExtra)return null;
  const plan=movement.routes(observation,own,defender,attack);
  if(!plan||!Array.isArray(source.tools)||source.tools.some(t=>!is(t,TOOL))||hp(source)===null)return null;
  const {survivors,options}=plan;
  if(!Array.isArray(own.stadium)||!Array.isArray(foe.stadium))return null;
  const valley=[...own.stadium,...foe.stadium].some(x=>is(x,VALLEY))&&!(foe.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0);
  const postHP=p=>hp(p)-(!attack.lethal&&p===defender?attack.damage:0);
  const mims=options.filter(x=>canCopy(x.pokemon,foe,valley)&&postHP(x.pokemon)>0);
  if(!mims.length)return null;
  const fairy=fairyZone(survivors),weak=fairy?2:1;
  let damage=0,remaining=hp(source),prizes=0,minimumBasics=0,route=mims[0];
  if(attack.attackName==='Aura Burn'&&is(source,MOL)){
    remaining-=30;
    route=mims.find(x=>postHP(x.pokemon)>30);
    if(remaining<=0||!route)return null;
    damage=190;prizes=2;
  }else if(attack.attackName==='Ultimate Ray'&&is(source,ADP)){
    damage=150*weak;prizes=3;
  }else if(attack.attackName==='Bellowing Thunder'&&is(source,BOLT)){
    minimumBasics=Math.ceil(remaining/(70*weak));
    route=mims.find(x=>x.totalPsychic>=minimumBasics);
    if(!route)return null;
    damage=70*weak*minimumBasics;prizes=2;
  }else return null;
  if(damage<remaining||foe.prizeCount>prizes)return null;
  return Object.freeze({kind:'visible-terminal-copycat-reply',attackName:attack.attackName,copycatCost:valley?1:2,fairyZone:fairy,damage,remaining,prizes,minimumBasics,replyRoute:route.route,paidRetreat:route.paidRetreat});
}
// Preserve all scored options. This is an advisory ordering, not a forced
// pass, hidden-hand prediction, or veto when every alternative is risky.
function adjust(observation,own,defender,attack){
  const threat=reply(observation,own,defender,attack);
  return threat?{...attack,score:Math.min(attack.score,1),copycatReply:threat}:attack;
}
module.exports={reply,adjust};
