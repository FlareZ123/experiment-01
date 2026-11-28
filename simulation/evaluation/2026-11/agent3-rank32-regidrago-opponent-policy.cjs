'use strict';

/*
 * Aichi rank-32 original-source Regidrago policy prototype.
 * Source-specific overrides for the rank-12 family worker. In particular,
 * this sixty has Battle Compressor, Goodra VSTAR and Mega Dragonite ex, but
 * lacks Koraidon, Path to the Peak and Echoing Horn. Only actor-visible
 * observations, native-offered action tokens and prompt choices are used.
 * Development only: no claim of complete-game competence or field wins.
 */

const family = require('./agent1-rank12-regidrago-opponent-policy-v2.cjs');
const { evaluateApexAttackChoice } = require('./agent43-regidrago-apex-choice.cjs');

const POLICY_VERSION = 'agent3-rank32-regidrago-opponent-v1';
const SOURCE_RANK = 32;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const EXECUTABLE = new Set(['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass']);
const DONOR = Object.freeze({
  dragonite: /^Mega Dragonite ex ASC 152\b/i,
  goodra: /^Hisuian Goodra VSTAR LOR 136\b/i,
  dialga: /^Dialga-GX UPR 100\b/i,
  noivern: /^Noivern ex PAL 153\b/i,
  kyurem: /^Kyurem SFA 47\b/i,
  dragapult: /^Dragapult ex TWM 130\b/i
});

function list(v) { return Array.isArray(v) ? v : []; }
function print(v) {
  if (typeof v === 'string') return v;
  return v?.printing ?? v?.actorPrinting ?? v?.targetPrinting ??
    v?.publicMetadata?.cardPrinting ?? v?.publicMetadata?.sourcePrinting ??
    v?.label ?? '';
}
function has(x, re) { return re.test(print(x)); }
function slots(p) { return [p?.active, ...list(p?.bench)].filter(Boolean); }
function countDonors(own) {
  return Object.entries(DONOR).filter(([name,re]) => name !== 'dragapult' &&
    list(own?.discard).some(card => has(card, re))).length;
}
function context(prompt) {
  const s = prompt?.source ?? {};
  return [s.sourcePrinting, s.effectName, s.sourceEffect, s.sourceAttack,
    s.copiedSourcePrinting, s.copiedAttackName, prompt?.description,
    prompt?.publicMetadata?.sourceEffect, prompt?.publicMetadata?.effectName]
    .filter(Boolean).join(' ').toLowerCase();
}
function nativeOwnerTarget(action, observation) {
  const meta=action?.publicMetadata ?? {};
  if (meta.targetSeat !== 'actor' || typeof action.targetPrinting !== 'string') return null;
  const target=meta.targetZone === 'active' ? observation?.ownPublic?.active :
    (meta.targetZone === 'bench' && Number.isSafeInteger(meta.targetIndex) ?
      list(observation?.ownPublic?.bench)[meta.targetIndex] : null);
  return target && print(target) === action.targetPrinting ? target : null;
}
function apexTypedDeficit(pokemon, observation) {
  const energies=list(pokemon?.energies);
  const basicsGrass=energies.filter(e=>/^Grass Energy\b/i.test(print(e))).length;
  const basicsFire=energies.filter(e=>/^Fire Energy\b/i.test(print(e))).length;
  const temple=list(observation?.opponentPublic?.stadium)
    .concat(list(observation?.ownPublic?.stadium))
    .some(s=>/^Temple of Sinnoh ASR 155\b/i.test(print(s)));
  const specialDde=temple?0:energies.filter(e=>/^Double Dragon Energy ROS 97\b/i.test(print(e))).length;
  return Math.max(0,Math.max(0,2-basicsGrass)+Math.max(0,1-basicsFire)-2*specialDde);
}
function scoreEnergyAttachment(action, observation) {
  const card=print(action);
  if (!/^(?:Grass Energy|Fire Energy|Double Dragon Energy)\b/i.test(card)) return null;
  const target=nativeOwnerTarget(action,observation);
  if (!target || !/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(target))) return 0;
  const own=observation?.ownPublic ?? {};
  const isVstar=/^Regidrago VSTAR SIT 136\b/i.test(print(target));
  if (!isVstar && slots(own).some(p=>/^Regidrago VSTAR SIT 136\b/i.test(print(p))))
    return 0;
  const before=apexTypedDeficit(target,observation);
  const after=apexTypedDeficit({...target,energies:[...list(target.energies),card]},observation);
  if (after >= before) return 0;
  // Regidrago requires Grass+Grass+Fire. DDE counts as two flexible typed
  // Energy only while Temple of Sinnoh is not suppressing its effect.
  const reduction=before-after;
  const isActive=target===own.active;
  return 220 + (reduction*20) + (isVstar?22:0) +
    (isActive?10:0) + (after===0?30:0);
}
function isSourceSupporter(value) {
  return /^(?:Guzma BUS 115|Crispin SCR 133|Raihan EVS 152|Professor Sycamore BKP 107|Lillie's Determination MEG 119|N FCO 105|Marnie SSH 169|Pokémon Ranger STS 104|Cynthia & Caitlin CEC 189)\b/i.test(print(value));
}
function cynthiaRecoverPriority(choice, observation) {
  const name=print(choice),own=observation?.ownPublic??{};
  if (!isSourceSupporter(choice) || /^Cynthia & Caitlin CEC 189\b/i.test(name)) return 0;
  if (/^Guzma BUS 115\b/i.test(name) &&
      slots(observation?.opponentPublic).length>1) return 240;
  if (/^Crispin SCR 133\b/i.test(name) &&
      slots(own).some(p=>/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)) &&
        apexTypedDeficit(p,observation)>0)) return 230;
  if (/^Raihan EVS 152\b/i.test(name)) return 175;
  if (/^Lillie's Determination MEG 119\b/i.test(name))
    return list(observation?.ownHand).length<=4?205:155;
  if (/^Professor Sycamore BKP 107\b/i.test(name))
    return list(observation?.ownHand).length<=3?190:135;
  if (/^Pokémon Ranger STS 104\b/i.test(name))
    return own.publicTurnRestrictions?.attackLockTurnsRemaining>0?225:90;
  if (/^N FCO 105\b/i.test(name)) return 150;
  if (/^Marnie SSH 169\b/i.test(name)) return 145;
  if (/^Guzma BUS 115\b/i.test(name)) return 130;
  return 30;
}
function legacyRecoverPriority(card, observation) {
  const value=print(card),own=observation?.ownPublic??{};
  const attackers=slots(own).filter(x=>
    /^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(x)));
  const needsFunding=attackers.some(x=>apexTypedDeficit(x,observation)>0);
  const hasActiveVstar=attackers.some(x=>/^Regidrago VSTAR SIT 136\b/i.test(print(x)));
  const hasBasicV=attackers.some(x=>/^Regidrago V SIT 135\b/i.test(print(x)));
  if (/^Double Dragon Energy ROS 97\b/i.test(value))
    return needsFunding?290:175;
  if (/^Grass Energy|^Fire Energy/i.test(value))
    return needsFunding?220:75;
  if (/^Regidrago VSTAR SIT 136\b/i.test(value))
    return hasBasicV&&!hasActiveVstar?265:0;
  if (/^Regidrago V SIT 135\b/i.test(value))
    return attackers.length===0?255:40;
  if (/^Battle Compressor PHF 92\b/i.test(value))
    return countDonors(own)===0?245:95;
  if (/^Guzma BUS 115\b/i.test(value))
    return slots(observation?.opponentPublic).length>1?235:70;
  if (/^Crispin SCR 133\b/i.test(value))return needsFunding?205:75;
  if (/^Lillie's Determination MEG 119\b/i.test(value))
    return list(observation?.ownHand).length<=3?200:70;
  if (/^VS Seeker PHF 109\b/i.test(value))
    return list(own.discard).some(isSourceSupporter)?190:65;
  if (/^Megaton Blower SSP 182\b/i.test(value))return 150;
  if (/^Super Rod PAL 188\b/i.test(value))return attackers.length===0?160:50;
  if (/^Raihan EVS 152\b/i.test(value))return 140;
  if (isSourceSupporter(card))return 90;
  // Goodra, Dragonite and other copied attacks must stay in the discard.
  // Filler is not worth using an optional recovery slot.
  return 0;
}
function superRodRecoverPriority(card, observation) {
  const value=print(card),own=observation?.ownPublic??{};
  const attackers=slots(own).filter(p=>
    /^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)));
  const vstar=attackers.some(p=>/^Regidrago VSTAR SIT 136\b/i.test(print(p)));
  const basic=attackers.some(p=>/^Regidrago V SIT 135\b/i.test(print(p)));
  if (/^(?:Hisuian Goodra VSTAR LOR 136|Mega Dragonite ex ASC 152|Dialga-GX UPR 100|Noivern ex PAL 153|Kyurem SFA 47|Dragapult ex TWM 130)\b/i.test(value))
    return 0; // Apex donors should stay discarded, not shuffled into deck.
  if (/^Regidrago VSTAR SIT 136\b/i.test(value))return basic&&!vstar?260:105;
  if (/^Regidrago V SIT 135\b/i.test(value))return attackers.length<2?250:110;
  if (/^Grass Energy|^Fire Energy/i.test(value)) {
    const needs=attackers.some(p=>apexTypedDeficit(p,observation)>0);
    return needs?210:125;
  }
  if (/^Budew ASC 16\b/i.test(value))
    return slots(own).some(p=>/^Budew ASC 16\b/i.test(print(p)))?0:150;
  if (/^Dedenne-GX UNB 57|^Tapu Lele-GX GRI 60\b/i.test(value))
    return slots(own).length<4?85:0;
  return 0;
}
function canUseLegacyStar(observation) {
  const own=observation?.ownPublic??{};
  const deckCount=own.deckCount;
  if(!Number.isSafeInteger(deckCount)||deckCount<8||
      own.publicTurnRestrictions?.vstarUsed!==false)return false;
  return slots(own).some(p=>/^Regidrago VSTAR SIT 136\b/i.test(print(p)));
}
function prizeValue(pokemon,observation=null) {
  const types=list(pokemon?.printed?.subtypes);
  const name=print(pokemon);
  let prizes=1;
  if(types.some(x=>['VMAX','TAG TEAM','V-UNION'].includes(x)) ||
      /^Mega .+ ex\b/i.test(name) ||
      types.some(x=>/MEGA.*EX|MEGA_EVOLUTION_EX/i.test(x)))prizes=3;
  else if(types.some(x=>['V','VSTAR','GX','ex','EX'].includes(x)))prizes=2;
  // Treat unobserved once-per-game Legacy Energy consumption conservatively.
  // One fewer Prize on a KO is not a terminal Prize condition.
  // Temple of Sinnoh suppresses Legacy Energy's Prize-reduction effect.
  // An unobserved prior consumption is still treated conservatively.
  const temple=list(observation?.ownPublic?.stadium)
    .concat(list(observation?.opponentPublic?.stadium))
    .some(s=>/^Temple of Sinnoh ASR 155\b/i.test(print(s)));
  if(!temple && list(pokemon?.energies).some(e=>/^Legacy Energy TWM 167\b/i.test(print(e))))
    prizes=Math.max(1,prizes-1);
  return prizes;
}
function remainingHP(pokemon) {
  return Number.isFinite(pokemon?.hp)&&Number.isFinite(pokemon?.damage)?
    Math.max(0,pokemon.hp-pokemon.damage):Infinity;
}
function strongestCopiedDamage(observation,target) {
  const own=observation?.ownPublic??{};
  if(countDonors(own)===0)return 0;
  const discard=list(own.discard);
  let best=0;
  if(discard.some(x=>DONOR.dragonite.test(print(x))))
    best=Math.max(best,estimatedDragonDamage(330,observation,target));
  if(discard.some(x=>DONOR.goodra.test(print(x))))
    best=Math.max(best,estimatedDragonDamage(200,observation,target));
  if(own.publicTurnRestrictions?.gxUsed===false &&
      discard.some(x=>DONOR.dialga.test(print(x))))
    best=Math.max(best,estimatedDragonDamage(150,observation,target));
  return best;
}
function canAttackNow(pokemon,observation) {
  return /^Regidrago VSTAR SIT 136\b/i.test(print(pokemon)) &&
    apexTypedDeficit(pokemon,observation)===0 &&
    countDonors(observation?.ownPublic??{})>0;
}
function gustTargetPriority(pokemon,observation,attacker) {
  if(!pokemon||!attacker||!canAttackNow(attacker,observation))return 0;
  const targetHP=remainingHP(pokemon);
  const damage=strongestCopiedDamage({...observation,
    ownPublic:{...observation.ownPublic,active:attacker}},pokemon);
  if(!Number.isFinite(targetHP)||targetHP<=0||targetHP>damage)return 0;
  const prizes=prizeValue(pokemon,observation), ownPrizes=observation?.ownPublic?.prizeCount;
  return (Number.isSafeInteger(ownPrizes)&&prizes>=ownPrizes?400:260)+prizes*12;
}
function readyMimikyuCounterAls(pokemon,observation) {
  // Mimikyu's Copycat can answer an exposed Apex with Timeless-GX only
  // when the opposing Dialga donor is public in their discard, its GX
  // allowance remains unused, and Mimikyu is already attack-funded.
  const opponent=observation?.opponentPublic??{};
  const energies=list(pokemon?.energies);
  return /^Mimikyu GRI 58\b/i.test(print(pokemon)) &&
    list(opponent.discard).some(c=>/^Dialga-GX UPR 100\b/i.test(print(c))) &&
    opponent.publicTurnRestrictions?.gxUsed===false &&
    energies.length>=2 &&
    energies.some(e=>/^Psychic Energy\b/i.test(print(e)));
}
function strategicGustPriority(pokemon,observation,attacker) {
  const ordinary=gustTargetPriority(pokemon,observation,attacker);
  // Do not treat a fragile one-Prize Mimikyu as equivalent to a generic
  // one-Prizer when it threatens the specific Copycat->Apex->Timeless ALS.
  return ordinary>0 && readyMimikyuCounterAls(pokemon,observation)
    ? Math.max(350,ordinary) : ordinary;
}
function zeroRetreatGuzmaPivot(observation) {
  const own=observation?.ownPublic??{}, resources=observation?.ownTurnResources??{};
  if(!canAttackNow(own.active,observation) ||
      !Number.isSafeInteger(observation?.globalTurn) ||
      !Number.isSafeInteger(resources.retreatedTurn) ||
      resources.retreatedTurn===observation.globalTurn ||
      own.publicTurnRestrictions?.cannotRetreat===true)return null;
  return list(own.bench).find(p=>
    /^Budew ASC 16\b/i.test(print(p)) &&
    Array.isArray(p?.printed?.retreatCost) && p.printed.retreatCost.length===0 &&
    p?.publicRestrictions?.cannotRetreat!==true &&
    p?.publicRestrictions?.cannotRetreatNextTurn!==true &&
    p?.publicRestrictions?.cannotRetreatWhileActive!==true)??null;
}
function tacticalGustScore(action,observation) {
  const own=observation?.ownPublic??{},opp=observation?.opponentPublic??{};
  const actorActive=own.active, opponentActive=opp.active;
  const name=print(action);
  const isCounter=/^Counter Catcher PAR 160\b/i.test(name);
  const isGuzma=/^Guzma BUS 115\b/i.test(name);
  if(!isCounter&&!isGuzma)return null;
  const benchedAttacker=list(own.bench).find(p=>canAttackNow(p,observation));
  const pivot=isGuzma&&!benchedAttacker?zeroRetreatGuzmaPivot(observation):null;
  const attacker=isCounter?actorActive:(benchedAttacker??(pivot?actorActive:null));
  // Forced self-switch is safe only with an independently funded attacker,
  // or a certified unspent zero-retreat Budew pivot back to the Active.
  if(isGuzma && canAttackNow(actorActive,observation)&&!attacker)return 0;
  if(!attacker)return isCounter?0:null;
  const bestBench=list(opp.bench).reduce((best,p)=>
    Math.max(best,strategicGustPriority(p,observation,attacker)),0);
  const urgentMimikyu=list(opp.bench).some(p=>
    readyMimikyuCounterAls(p,observation) &&
    gustTargetPriority(p,observation,attacker)>0);
  if(bestBench<=0)return isCounter?0:20;
  if(pivot&&bestBench<400&&!urgentMimikyu)return 0;
  // Otherwise spend the single forced switch on a final KO or to remove
  // an already-funded opponent Copycat -> Timeless counter-ALS threat.
  const currentCanKO=gustTargetPriority(opponentActive,observation,attacker)>0;
  if(currentCanKO&&bestBench<400)return isCounter?0:20;
  return isCounter?Math.min(410,bestBench+30):
    Math.min(395,bestBench+10);
}
function targetFromGustChoice(choice,observation) {
  const meta=choice?.publicMetadata??{};
  const player=meta.ownerSeat==='opponent'?observation?.opponentPublic:
    (meta.ownerSeat==='actor'?observation?.ownPublic:null);
  // V3 ChoosePokemon projection's selectionIndex is the ordinal in
  // currently offered choices, not the real board's bench slot.
  const index=Number.isSafeInteger(meta.benchIndex)?meta.benchIndex:
    (Number.isSafeInteger(meta.targetIndex)?meta.targetIndex:
      (Number.isSafeInteger(meta.slotIndex)?meta.slotIndex:null));
  const zone=meta.targetZone??meta.sourceZone;
  if(player&&zone==='bench'&&index!==null)
    return list(player.bench)[index]??null;
  if(player&&zone==='active')return player.active;
  const printing=print(choice);
  if(!player||typeof printing!=='string')return null;
  return slots(player).find(p=>print(p)===printing)??null;
}
function aceSpecBlowerPriority(observation) {
  const own=observation?.ownPublic??{},opp=observation?.opponentPublic??{};
  const active=own.active,target=opp.active;
  const canOHKO=canAttackNow(active,observation)&&remainingHP(target)>0 &&
    strongestCopiedDamage(observation,target)>=remainingHP(target);
  const prizeNeed=Number(own.prizeCount??6);
  const protection=list(target?.energies).filter(e=>
    /^Legacy Energy TWM 167\b/i.test(print(e)));
  if(canOHKO&&protection.length) {
    const cleared={...target,energies:list(target.energies).filter(e=>
      !/^Legacy Energy TWM 167\b/i.test(print(e)))};
    // Megaton's all-Special-Energy removal can convert an otherwise
    // nonterminal KO into a same-turn Prize win. This discrete win line
    // dominates saving the ACE SPEC or attacking through Legacy Energy.
    if(prizeValue(target,observation)<prizeNeed&&prizeValue(cleared,observation)>=prizeNeed)
      return 385;
  }
  if(canOHKO&&prizeValue(target,observation)>=prizeNeed)
    return 0; // Already winning; save the ACE SPEC.
  const energy=list(opp.active?.energies)
    .concat(list(opp.bench).flatMap(p=>list(p?.energies)));
  // Basic Energy has exactly one of the nine canonical type names; unlike
  // a finite handpicked list this detects Jet, Strong, Legacy, Double Dragon,
  // etc. as Special Energy from the actor-visible printing alone.
  const basicEnergyName=/^(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy\b/i;
  const special=energy.filter(e=>print(e)!=='' && !basicEnergyName.test(print(e))).length;
  const tools=slots(opp).reduce((n,p)=>n+list(p.tools).length,0);
  const temple=list(opp.stadium).concat(list(own.stadium))
    .some(st=>/^Temple of Sinnoh ASR 155\b/i.test(print(st)));
  const impededDde=slots(own).some(p=>
    list(p.energies).some(e=>/^Double Dragon Energy ROS 97\b/i.test(print(e)))) ||
    list(observation?.ownHand).some(e=>/^Double Dragon Energy ROS 97\b/i.test(print(e)));
  if(temple&&impededDde)return 265;
  if(special>=3)return 285;
  if(special>=2)return 245;
  if(tools>=3)return 245;
  if(tools>=2)return 225;
  if(special===1)return 145;
  if(tools===1)return 75;
  if(list(opp.stadium).length)return 90;
  return 0;
}
function muscleBandPriority(action,observation) {
  const target=nativeOwnerTarget(action,observation);
  if(!target || !/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(target)) ||
      list(target.tools).length>0)return 0;
  const own=observation?.ownPublic??{},opp=observation?.opponentPublic??{};
  const targetIsActive=own.active===target;
  const realTarget=opp.active,remaining=remainingHP(realTarget);
  const projected={...target,tools:[...list(target.tools),{printing:'Muscle Band XY 121'}]};
  const before=strongestCopiedDamage({...observation,
    ownPublic:{...own,active:target}},realTarget);
  const after=strongestCopiedDamage({...observation,
    ownPublic:{...own,active:projected}},realTarget);
  if(targetIsActive&&canAttackNow(target,observation) &&
      Number.isFinite(remaining)&&remaining>before&&remaining<=after)
    return 310; // Exact threshold-crossing for immediate KO
  if(targetIsActive&&canAttackNow(target,observation) &&
      Number.isFinite(remaining)&&remaining>0&&remaining<=before)
    return 30;
  return targetIsActive?135:95;
}
function evolveRegidragoPriority(action,observation) {
  const target=nativeOwnerTarget(action,observation);
  if(!target||!/^Regidrago V SIT 135\b/i.test(print(target)))return 0;
  const own=observation?.ownPublic??{};
  const energies=list(target.energies);
  const hasAttack=apexTypedDeficit(target,observation)===0&&countDonors(own)>0;
  const attached=energies.length;
  const base=265+Math.min(55,attached*18)+(own.active===target?15:0);
  return hasAttack?Math.min(365,base+60):base;
}
function retreatToAttackerPriority(action,observation) {
  const target=nativeOwnerTarget(action,observation),own=observation?.ownPublic??{};
  if(!target||own.active===target)return 0;
  if(canAttackNow(own.active,observation))return 0;
  if(canAttackNow(target,observation))return 330;
  if(/^Regidrago VSTAR SIT 136\b/i.test(print(target)) &&
      apexTypedDeficit(target,observation)<=1)return 175;
  if(/^Regidrago V SIT 135\b/i.test(print(target)) &&
      list(target.energies).length>=1)return 115;
  return 0;
}
function crispinAccelerationPriority(observation) {
  const own=observation?.ownPublic??{};
  const targets=slots(own).filter(p=>
    /^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)) &&
    apexTypedDeficit(p,observation)>0);
  if(!targets.length)return 0;
  const desired=targets.some(p=>/^Regidrago VSTAR SIT 136\b/i.test(print(p)));
  const funding=Math.max(...targets.map(p=>apexTypedDeficit(p,observation)));
  return 235+(desired?25:0)+Math.min(15,funding*5);
}
function crispinDeckEnergyChoice(prompt,observation,choices) {
  const meta=prompt.publicMetadata??{};
  const min=meta.minimumCount,max=meta.maximumCount;
  if(meta.selectionType!=='card-combination' || meta.sourceZone!=='deck' ||
      !Number.isSafeInteger(min)||!Number.isSafeInteger(max) ||
      min<0||max<min)return null;
  const basics=list(choices).filter(c=>
    c.kind==='card'&&typeof c.token==='string' &&
    /^(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy\b/i.test(print(c)));
  const seen=new Set(),selected=[];
  // Paper Crispin requires different basic types: do not select two Grass
  // just because both are highly ranked in an untyped search heuristic.
  const ranked=basics.slice().sort((a,b)=>{
    const rank=x=>/^Fire Energy\b/i.test(print(x))?3:
      (/^Grass Energy\b/i.test(print(x))?2:1);
    return rank(b)-rank(a);
  });
  for(const c of ranked){
    const m=print(c).match(/^(.+?) Energy\b/i);
    const type=m?.[1]?.toLowerCase();
    if(!type||seen.has(type))continue;
    seen.add(type);selected.push(c);
    if(selected.length>=max)break;
  }
  if(selected.length>=Math.max(1,min))
    return {kind:'select-choices',tokens:selected.map(c=>c.token)};
  const none=choices.find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
  return min===0&&none?{kind:'select-choice',token:none.token}:
    {kind:'abstain',reasonCode:'RANK32_CRISPIN_NO_DISTINCT_BASIC_TYPES'};
}
function protectedDdeInHand(observation) {
  const hand=list(observation?.ownHand);
  if(!hand.some(c=>/^Double Dragon Energy ROS 97\b/i.test(print(c))))
    return false;
  const attackers=slots(observation?.ownPublic).filter(p=>
    /^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)));
  // Preserve scarce flexible Energy when there is no safe second attacker
  // or a current attacker still lacks the requisite Grass/Fire types.
  return attackers.length<2 || attackers.some(p=>apexTypedDeficit(p,observation)>0);
}
function seekerSupporterPriority(card,request) {
  const name=print(card),observation=request?.observation??{};
  const own=observation.ownPublic??{},opponent=observation.opponentPublic??{};
  const hand=list(observation.ownHand).length;
  if(/^Guzma BUS 115\b/i.test(name)) {
    const tactical=tacticalGustScore({kind:'play-card',actorPrinting:name},observation);
    return tactical>=185?(tactical>=390?320:265):0;
  }
  if(/^Crispin SCR 133\b/i.test(name))
    return crispinAccelerationPriority(observation)>0?285:0;
  if(/^Raihan EVS 152\b/i.test(name)) {
    const priorKO=request?.publicEventReceipt?.priorOpponentTurnKO?.any===true;
    const basic=list(own.discard).some(e=>/^(?:Grass|Fire) Energy\b/i.test(print(e)));
    return priorKO&&basic?285:0;
  }
  if(/^Pokémon Ranger STS 104\b/i.test(name)) {
    const locked=own.publicTurnRestrictions?.attackLockTurnsRemaining>0 ||
      own.active?.publicRestrictions?.cannotAttackNextTurn===true ||
      own.publicTurnRestrictions?.itemPlayLocked===true;
    return locked?305:0;
  }
  if(/^Lillie's Determination MEG 119\b/i.test(name))
    return hand<=3?230:(hand<=5?155:30);
  if(/^Professor Sycamore BKP 107\b/i.test(name) ||
      /^Professor's Research JTG 155\b/i.test(name))
    return protectedDdeInHand(observation)?0:(hand<=3?215:35);
  if(/^Carmine TWM 145\b/i.test(name))
    return protectedDdeInHand(observation)?0:(hand<=3?210:25);
  if(/^N FCO 105\b/i.test(name)) {
    const ownPrizes=Number(own.prizeCount),oppPrizes=Number(opponent.prizeCount);
    return hand<=3?205:(Number.isFinite(ownPrizes)&&Number.isFinite(oppPrizes)&&
      ownPrizes>oppPrizes?160:25);
  }
  if(/^Marnie SSH 169\b/i.test(name))
    return hand<=3?190:35;
  if(/^Cynthia & Caitlin CEC 189\b/i.test(name))
    return hand<=3?165:45;
  return 0;
}
function scoreAction(action, request) {
  const obs = request?.observation ?? {};
  const own = obs.ownPublic ?? {};
  const opp = obs.opponentPublic ?? {};
  const name = print(action);
  const hand = list(obs.ownHand).length;
  const active = own.active;
  const enabledVstar = slots(own).some(p => /^Regidrago VSTAR SIT 136\b/i.test(print(p)));
  if(action.kind==='play-card'&&/^VS Seeker PHF 109\b/i.test(name)) {
    const max=Math.max(0,...list(own.discard).map(c=>seekerSupporterPriority(c,request)));
    return max>=150?Math.min(205,Math.floor(max*0.67)):0;
  }
  if(protectedDdeInHand(obs) && (
      (action.kind==='play-card' &&
        (/^Dedenne-GX UNB 57\b/i.test(name) ||
         /^Professor Sycamore BKP 107\b/i.test(name))) ||
      (action.kind==='use-ability' &&
        /Dedechange/i.test(action?.publicMetadata?.abilityName??action?.label??''))))
    return 0;
  if(action.kind==='play-card'&&/^Crispin SCR 133\b/i.test(name))
    return crispinAccelerationPriority(obs);
  if(action.kind==='retreat') return retreatToAttackerPriority(action,obs);
  if(action.kind==='play-card'&&/^Regidrago VSTAR SIT 136\b/i.test(name))
    return evolveRegidragoPriority(action,obs);
  if(action.kind==='play-card'&&/^Regidrago V SIT 135\b/i.test(name)) {
    const attackers=slots(own).filter(p=>/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)));
    // The inherited rank-12 worker declines a second Basic V while the
    // first is still unevolved. Establish a backup once, not a Bench clog.
    if(attackers.length===1 &&
        /^Regidrago V SIT 135\b/i.test(print(attackers[0])))return 175;
    if(attackers.length>=2)return 0;
  }
  const gustScore=tacticalGustScore(action,obs);
  if(gustScore !== null) return gustScore;
  if(action.kind==='play-card'&&/^Megaton Blower SSP 182\b/i.test(name))
    return aceSpecBlowerPriority(obs);
  if(action.kind==='play-card'&&/^Muscle Band XY 121\b/i.test(name))
    return muscleBandPriority(action,obs);
  const enabledV = slots(own).some(p => /^Regidrago V SIT 135\b/i.test(print(p)));
  if (action.kind === 'attack' && /^(Apex Dragon)$/i.test(action.attackName ?? action.label ?? '')) {
    return countDonors(own) ? 230 : 0;
  }
  if (action.kind === 'use-ability' &&
      /Legacy Star/i.test(action?.publicMetadata?.abilityName??action?.label??'')) {
    if (!canUseLegacyStar(obs)) return 0;
    const useful=list(own.discard).some(c=>legacyRecoverPriority(c,obs)>0);
    if (useful && hand<=4) return 275;
    if (countDonors(own)===0 && own.deckCount>=16) return 210;
    return 50;
  }
  if (action.kind === 'play-card') {
    const attachScore=scoreEnergyAttachment(action,obs);
    if (attachScore !== null) return attachScore;
    if (/^(Ultra Ball MEG 131|Mysterious Treasure FLI 113|Quick Ball FST 237)\b/i.test(name)) {
      const required = /^Ultra Ball\b/i.test(name) ? 2 : 1;
      const safe = list(obs.ownHand).filter(card=>print(card)!==name)
        .filter(card=>safeBallCost(card,obs)>0).length;
      if (safe < required) return 0;
    }
    if (/^Super Rod PAL 188\b/i.test(name)) {
      const useful=list(own.discard).filter(c=>superRodRecoverPriority(c,obs)>0).length;
      const underdeveloped=slots(own).filter(p=>
        /^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p))).length<2;
      return useful? (underdeveloped?170:125):0;
    }
    if (/^Battle Compressor(?: Team Flare Gear)? PHF 92\b/i.test(name)) {
      // Not an unconditional burn: a non-Regidrago board should prioritize setup.
      return enabledVstar && countDonors(own) < 3 ? 255 :
        (enabledV && countDonors(own) < 2 ? 175 : 25);
    }
    if (/^Lillie's Determination MEG 119\b/i.test(name)) return hand <= 4 ? 170 : 25;
    if (/^N FCO 105\b/i.test(name)) {
      return hand <= 3 ? 165 : (Number(own.prizeCount ?? 6) > Number(opp.prizeCount ?? 6) ? 135 : 25);
    }
    if (/^Cynthia & Caitlin CEC 189\b/i.test(name)) {
      const available=list(own.discard).some(isSourceSupporter);
      return available && hand<=4?155:(available?40:0);
    }
    if (/^Pokémon Ranger STS 104\b/i.test(name)) {
      return active?.publicRestrictions?.cannotAttackNextTurn === true ||
        active?.publicRestrictions?.cannotRetreatNextTurn === true ||
        own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ? 155 : 0;
    }
    const temple = list(opp.stadium).concat(list(own.stadium))
      .some(x=>/^Temple of Sinnoh ASR 155\b/i.test(print(x)));
    const attachedDde = slots(own).some(p=>
      list(p.energies).some(e=>/^Double Dragon Energy ROS 97\b/i.test(print(e))));
    const pendingDde = list(obs.ownHand).some(e=>
      /^Double Dragon Energy ROS 97\b/i.test(print(e))) &&
      slots(own).some(p=>/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)) &&
        apexTypedDeficit(p,obs)>0);
    const threatenedDde = temple && (attachedDde || pendingDde);
    const ownUnusedBasicSupport = slots(own).some(p =>
      /Dedenne-GX|Crobat V|Tapu Lele-GX|Fezandipiti ex/i.test(print(p)) &&
      list(p?.abilityDetails).length > 0);
    // Lockbridge's Temple turns DDE colorless, removing the typed Energy
    // which funds Apex. Prefer a regular Stadium to consuming our ACE SPEC.
    if (/^Parallel City BKT 145\b/i.test(name) && threatenedDde) return 270;
    if (/^Silent Lab PRC 140\b/i.test(name)) {
      if (threatenedDde && !ownUnusedBasicSupport) return 255;
      const opponentBasicAbility = slots(opp).some(p =>
        list(p?.printed?.subtypes).includes('Basic') &&
        list(p?.abilityDetails).length > 0);
      return opponentBasicAbility && !ownUnusedBasicSupport ? 115 : 0;
    }
    if (/^Stealthy Hood UNB 186\b/i.test(name)) {
      const enemyWobbuffet = /^Wobbuffet PHF 36\b/i.test(print(opp.active));
      const unusedVstar = own.publicTurnRestrictions?.vstarUsed === false;
      // Play-card root items carry their actual targetPrinting and targetSeat.
      // An otherwise strong Hood line must never choose a token that attaches
      // the Tool to a utility Basic instead of the threatened Regidrago VSTAR.
      const targetPrinting = action?.targetPrinting ?? '';
      const targetSeat = action?.publicMetadata?.targetSeat;
      const targetZone = action?.publicMetadata?.targetZone;
      const targetIndex = action?.publicMetadata?.targetIndex;
      const exactTarget = targetZone === 'active' ? own.active :
        (targetZone === 'bench' && Number.isSafeInteger(targetIndex) ?
          list(own.bench)[targetIndex] : null);
      const aligned = exactTarget &&
        /^Regidrago VSTAR SIT 136\b/i.test(targetPrinting) &&
        targetSeat === 'actor' && print(exactTarget) === targetPrinting &&
        list(exactTarget.tools).length === 0;
      return enemyWobbuffet && unusedVstar && aligned ? 265 : 0;
    }
    // Stage-2 Mega Dragonite has no evolution chain in the original 60:
    // it is an Apex donor, never proactively benched/evolved by this policy.
    if (DONOR.dragonite.test(name) || DONOR.goodra.test(name) ||
        DONOR.dialga.test(name) || DONOR.kyurem.test(name) ||
        DONOR.noivern.test(name) || DONOR.dragapult.test(name)) return 0;
  }
  return family.scoreAction(action, request);
}
function estimatedDragonDamage(base, observation, chosenTarget=null) {
  // Approximation with printed Weakness/Resistance and a known Muscle Band;
  // native engine remains authoritative for effects, prevention and modifiers.
  const target=chosenTarget??observation?.opponentPublic?.active ?? {};
  const attacker=observation?.ownPublic?.active ?? {};
  const band=list(attacker.tools).some(x=>/^Muscle Band XY 121\b/i.test(print(x)))?20:0;
  let damage=base+band;
  const weakness=list(target?.printed?.weakness).find(x=>x?.type==='Dragon');
  if(weakness){
    const w=String(weakness.value??'×2').replace(/\s/g,'').replace('×','x').toLowerCase();
    const multi=Number.parseFloat(w.replace(/^x/,'').replace(/x$/,''));
    damage*=Number.isFinite(multi)&&multi>1?multi:2;
  }
  const resistance=list(target?.printed?.resistance).find(x=>x?.type==='Dragon');
  if(resistance){
    const minus=Number.parseInt(String(resistance.value??'-30').replace(/[^0-9-]/g,''),10);
    damage-=Number.isFinite(minus)?Math.abs(minus):30;
  }
  return Math.max(0,damage);
}
function chooseRank32Apex(choices, observation) {
  const target = observation?.opponentPublic?.active;
  const hp = Number(target?.hp) - Number(target?.damage ?? 0);
  const energyCards = list(observation?.ownPublic?.active?.energies).length;
  const ownPrizes = Number(observation?.ownPublic?.prizeCount ?? 6);
  const rollingChoice = list(choices).find(c=>
    (c?.publicMetadata?.sourceAttack??c?.attackName??c?.label)==='Rolling Iron' &&
    c?.publicMetadata?.eligible!==false &&
    c?.publicMetadata?.attackCostPayable!==false);
  const rolling = rollingChoice ? evaluateApexAttackChoice(rollingChoice,observation):null;
  const rows = list(choices).map((choice, index) => {
    const name = choice?.publicMetadata?.sourceAttack ?? choice?.attackName ?? choice?.label ?? '';
    let score = Number(evaluateApexAttackChoice(choice, observation)?.score ?? -1);
    if (choice?.publicMetadata?.eligible === false || choice?.publicMetadata?.attackCostPayable === false) score = -1;
    else if (name === 'Ryuno Glide') {
      // Printed 330 attack, two attached Energy discarded. Native computes
      // actual damage, prevention and energy-discard requirements; this is only
      // a decision heuristic based on visible HP.
      const knockout = Number.isFinite(hp) && hp > 0 &&
        hp <= estimatedDragonDamage(330,observation);
      // When a legal Rolling Iron already Knocks Out the same Active,
      // discard-two Ryuno is connector-dominated: it loses future Energy
      // and the 80-damage defensive reduction for no additional Prize.
      if (rolling?.activeKnockout === true) score=65;
      else score = knockout ? (ownPrizes <= 2 ? 300 : 240) : 125;
      if (energyCards <= 2 && rolling?.activeKnockout!==true) score -= 20;
    } else if (name === 'Dominating Echo') {
      const hasStadium = list(observation?.opponentPublic?.stadium).length > 0;
      const hasSpecial = slots(observation?.opponentPublic).some(p =>
        list(p.energies).some(e => /Special Energy|Double Dragon|Double Colorless/i.test(print(e))));
      score = hasStadium || hasSpecial ? 255 : 175;
    } else if (name === 'Covert Flight') {
      score = list(target?.printed?.subtypes).includes('Basic') ? 165 : 50;
    } else if (name === 'Phantom Dive') {
      // Until native PutDamagePrompt is projected, do not start an unfinishable
      // copied attack merely because the base helper scores it highly.
      score = -1;
    }
    return { choice, index, score };
  }).filter(r => typeof r.choice?.token === 'string' && r.choice.token &&
      r.score > 0).sort((a,b) => b.score-a.score || a.index-b.index);
  return rows.length ? { kind: 'select-choice', token: rows[0].choice.token } :
    { kind: 'abstain', reasonCode: 'RANK32_APEX_NO_COMPLETE_SUPPORTED_ATTACK' };
}
function chooseMany(choices, scoreFn, minimum, maximum, reason) {
  const rows = list(choices).map((choice,index)=>({choice,index,score:scoreFn(choice)}))
    .filter(r=>r.score>0 && typeof r.choice?.token==='string')
    .sort((a,b)=>b.score-a.score || a.index-b.index)
    .slice(0,maximum);
  if (rows.length >= minimum && rows.length) {
    return {kind:'select-choices', tokens:rows.map(r=>r.choice.token)};
  }
  if (minimum === 0) {
    const empty = list(choices).find(c=>c.kind==='empty-selection' && typeof c.token==='string');
    if (empty) return {kind:'select-choice',token:empty.token};
  }
  return {kind:'abstain',reasonCode:reason};
}
function donorScore(card, observation, aggressive) {
  const name = print(card);
  const own = observation?.ownPublic ?? {};
  const already = Object.values(DONOR).some(re => re.test(name) &&
    list(own.discard).some(x=>has(x,re)));
  if (already) return 0;
  // Goodra and Mega Dragonite are in the 60 solely as copyable attacks.
  if (DONOR.dragonite.test(name)) return 245;
  if (DONOR.goodra.test(name)) return 225;
  if (DONOR.dialga.test(name)) return own.publicTurnRestrictions?.gxUsed === true ? 110 : 220;
  if (DONOR.noivern.test(name)) return 210;
  if (DONOR.kyurem.test(name)) return 185;
  if (DONOR.dragapult.test(name)) return 0; // Native damage-allocation continuation is not supported.
  if (!aggressive) return 0;
  // Battle Compressor says 'up to 3': never pad a donor selection by
  // discarding a valuable Energy or an attacker just to reach three cards.
  return 0;
}
function safeBallCost(card, observation) {
  const own = observation?.ownPublic ?? {};
  const name = print(card);
  const donor = donorScore(card, observation, false);
  if (donor > 0) return donor;
  const energyAttached = slots(own).reduce((n,p)=>n+list(p.energies).length,0);
  const handBasicEnergy = list(observation?.ownHand)
    .filter(x=>/^Grass Energy|^Fire Energy/i.test(print(x))).length;
  // Keep basic energy while the attacker is still unfunded. DDE is protected.
  if (/^Grass Energy|^Fire Energy/i.test(name) &&
      energyAttached >= 3 && handBasicEnergy >= 2) return 25;
  if (/^Regidrago V SIT 135\b/i.test(name) &&
      slots(own).filter(x=>/^Regidrago V SIT 135\b/i.test(print(x))).length >= 2)
    return 30;
  if (/^Stealthy Hood UNB 186\b/i.test(name) &&
      slots(own).some(x=>list(x.tools).some(t=>/^Stealthy Hood UNB 186\b/i.test(print(t)))))
    return 20;
  return 0;
}
function setupActiveScore(printing) {
  if (/^Regidrago V SIT 135\b/i.test(printing)) return 100;
  if (/^Budew ASC 16\b/i.test(printing)) return 82;
  if (/^Latias ex SSP 76\b/i.test(printing)) return 62;
  if (/^Fezandipiti ex ASC 142\b/i.test(printing)) return 42;
  if (/^Marshadow UNB 81\b/i.test(printing)) return 32;
  if (/^Crobat V DAA 104\b/i.test(printing)) return 25;
  if (/^Dedenne-GX UNB 57\b/i.test(printing)) return 20;
  if (/^Tapu Lele-GX GRI 60\b/i.test(printing)) return 15;
  return 1;
}
function setupBenchScore(printing, alreadyPicked) {
  // Setup benching is not equivalent to playing a Basic from hand during
  // the turn: it cannot trigger Dedechange, Dark Asset, Wonder Tag, or Let Loose.
  if (/^Regidrago V SIT 135\b/i.test(printing))
    return alreadyPicked.filter(x=>/^Regidrago V SIT 135\b/i.test(x)).length < 3 ? 100 : 0;
  if (/^Latias ex SSP 76\b/i.test(printing)) return 75;
  if (/^Budew ASC 16\b/i.test(printing))
    return alreadyPicked.some(x=>/^Budew ASC 16\b/i.test(x)) ? 0 : 60;
  return 0;
}
function engineSetupDecision(prompt, observation, choices) {
  const meta=prompt?.publicMetadata ?? {};
  if (observation?.phase !== 1 || prompt?.source?.sourceKind !== 'engine' ||
      prompt?.source?.sourcePrinting !== null ||
      prompt?.source?.classification !== 'actor-choice') return null;
  const name=prompt.description;
  if (name === 'CHOOSE_STARTING_POKEMONS' && prompt.promptType === 'ChooseCardsPrompt') {
    const min=meta.minimumCount,max=meta.maximumCount;
    if (meta.selectionType!=='card-combination' || meta.sourceZone!=='hand' ||
        meta.ownerSeat!=='actor' || meta.isOwnerVisible!==true ||
        meta.allowCancel!==false || meta.isSecret!==false ||
        !Number.isSafeInteger(min) || !Number.isSafeInteger(max) ||
        min < 0 || max < min)
      return {kind:'abstain',reasonCode:'INVALID_STARTING_POKEMON_PROMPT'};
    const bench=list(observation?.ownPublic?.bench);
    if (!Array.isArray(observation?.ownPublic?.bench))
      return {kind:'abstain',reasonCode:'MISSING_PUBLIC_BENCH_FOR_SETUP'};
    const capacity=bench.filter(x=>x===null).length;
    const handChoices=choices.filter(c=>c.kind==='card' &&
      typeof c.token==='string' && typeof c.printing==='string' &&
      c.publicMetadata?.sourceZone==='hand' &&
      c.publicMetadata?.ownerSeat==='actor' &&
      c.publicMetadata?.isOwnerVisible===true);
    const picks=[];
    if (min === 1) {
      if (observation.ownPublic.active!==null || handChoices.length===0)
        return {kind:'abstain',reasonCode:'NO_VISIBLE_STARTING_POKEMON'};
      const selected=handChoices.slice().sort((a,b)=>
        setupActiveScore(b.printing)-setupActiveScore(a.printing));
      picks.push(selected[0]);
      const remainder=selected.slice(1);
      while (picks.length < Math.min(max,1+capacity)) {
        let index=-1,best=0;
        for(let i=0;i<remainder.length;i++) {
          const score=setupBenchScore(remainder[i].printing,picks.map(x=>x.printing));
          if(score>best){best=score;index=i;}
        }
        if(index<0)break;
        picks.push(remainder.splice(index,1)[0]);
      }
    } else if (min === 0) {
      if (observation.ownPublic.active===null)
        return {kind:'abstain',reasonCode:'MISSING_ACTIVE_FOR_EXTRA_BENCH'};
      const remainder=handChoices.slice(),onBoard=[observation.ownPublic.active.printing];
      while(picks.length < Math.min(max,capacity)) {
        let index=-1,best=0;
        for(let i=0;i<remainder.length;i++){
          const score=setupBenchScore(remainder[i].printing,
            [...onBoard,...picks.map(x=>x.printing)]);
          if(score>best){best=score;index=i;}
        }
        if(index<0)break;
        picks.push(remainder.splice(index,1)[0]);
      }
    } else return {kind:'abstain',reasonCode:'UNSUPPORTED_STARTING_POKEMON_CARDINALITY'};
    if(picks.length>=Math.max(min,1))
      return {kind:'select-choices',tokens:picks.map(c=>c.token)};
    const empty=choices.find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
    return min===0 && empty ?
      {kind:'select-choice',token:empty.token} :
      {kind:'abstain',reasonCode:'NO_EMPTY_BENCH_SELECTION'};
  }
  if (name === 'GO_FIRST' && prompt.promptType === 'ConfirmPrompt') {
    if (meta.selectionType!=='confirm')
      return {kind:'abstain',reasonCode:'INVALID_GO_FIRST_CONFIRMATION'};
    const yes=choices.find(c=>c.kind==='confirm'&&/^Yes$/i.test(c.label??''));
    const no=choices.find(c=>c.kind==='confirm'&&/^No$/i.test(c.label??''));
    if (!yes||!no) return {kind:'abstain',reasonCode:'UNRECOGNIZED_GO_FIRST_CHOICES'};
    // Regidrago has a meaningful first turn going second: Supporter,
    // Celestial Roar and Budew's Item-lock attack. This is a policy
    // assumption; choosing second is not a demonstrated win-rate result.
    return {kind:'select-choice',token:no.token};
  }
  if (name === 'WANT_TO_DRAW_CARDS' && prompt.promptType === 'SelectPrompt') {
    const count=meta.count;
    if(meta.selectionType!=='option'||!Number.isSafeInteger(count)||count<1)
      return {kind:'abstain',reasonCode:'INVALID_MULLIGAN_DRAW_OPTIONS'};
    const options=choices.filter(c=>c.kind==='option');
    if(options.length!==count)return {kind:'abstain',reasonCode:'INCOMPLETE_MULLIGAN_DRAW_OPTIONS'};
    const seen=new Set(),ranked=[];
    for(const c of options) {
      const index=c.publicMetadata?.choiceIndex;
      const match=String(c.label??'').match(/^Draw (\d+) card\(s\)$/i);
      if(!Number.isSafeInteger(index)||index<0||index>=count||seen.has(index)||
          !match||Number(match[1])!==count-1-index)
        return {kind:'abstain',reasonCode:'INVALID_MULLIGAN_DRAW_INDEX'};
      seen.add(index);
      ranked.push({choice:c,count:count-1-index});
    }
    return {kind:'select-choice',token:ranked.sort((a,b)=>b.count-a.count)[0].choice.token};
  }
  return null;
}
function chooseTrifrostTargets(prompt,observation) {
  // Printed SFA47: damage exactly three opposing Pokémon, or every
  // opposing Pokémon when fewer than three exist (Rulebook D-04).
  // The current native prompt may offer 1..3; choosing just one with three
  // available is not paper-legal. Never exploit that native under-selection.
  const meta=prompt?.publicMetadata??{},choices=list(prompt?.choices);
  const opponent=observation?.opponentPublic??{};
  const targets=slots(opponent);
  const needed=Math.min(3,targets.length);
  if(prompt?.promptType!=='ChoosePokemonPrompt' ||
      meta.selectionType!=='pokemon' || needed<=0 ||
      !Number.isSafeInteger(meta.maximumCount) ||
      !Number.isSafeInteger(meta.minimumCount) ||
      meta.maximumCount<needed || meta.minimumCount>needed)
    return {kind:'abstain',reasonCode:'RANK32_TRIFROST_POKEMON_CHOICE_UNAVAILABLE'};
  const ranked=[];
  const seen=new Set();
  for(const choice of choices) {
    const metaChoice=choice?.publicMetadata??{};
    if(choice?.kind!=='pokemon' || !choice?.token ||
        metaChoice.ownerSeat!=='opponent')continue;
    const pokemon=targetFromGustChoice(choice,observation);
    if(!pokemon || !targets.includes(pokemon) || seen.has(pokemon))continue;
    seen.add(pokemon);
    const active=pokemon===opponent.active;
    const damage=active?estimatedDragonDamage(110,observation,pokemon):110;
    const knockout=remainingHP(pokemon)>0 && remainingHP(pokemon)<=damage;
    const prizes=prizeValue(pokemon,observation);
    const score=(knockout?1000+prizes*100:0)+
      (active?25:0)+Math.max(0,350-Math.min(350,remainingHP(pokemon)));
    ranked.push({choice,pokemon,score});
  }
  ranked.sort((a,b)=>b.score-a.score);
  if(ranked.length<needed)
    return {kind:'abstain',reasonCode:'RANK32_TRIFROST_POKEMON_CHOICE_UNAVAILABLE'};
  return {kind:'select-choices',tokens:ranked.slice(0,needed).map(row=>row.choice.token)};
}
function raihanAttachPriority(choice,observation) {
  const meta=choice?.publicMetadata??{},own=observation?.ownPublic??{};
  if(choice?.kind!=='energy'||typeof choice.token!=='string'||
      meta.sourceZone!=='discard'||meta.ownerSeat!=='actor' ||
      meta.isOwnerVisible!==true)return 0;
  const target=meta.zone==='active'?own.active:
    (meta.zone==='bench'&&Number.isSafeInteger(meta.benchIndex)?
      list(own.bench)[meta.benchIndex]:null);
  if(!target)return 0;
  const card=print(choice);
  if(!/^(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy\b/i.test(card))
    return 0;
  const action={
    kind:'play-card',actorPrinting:card,targetPrinting:print(target),
    publicMetadata:{targetSeat:'actor',targetZone:meta.zone,
      ...(meta.zone==='bench'?{targetIndex:meta.benchIndex}:{})}
  };
  const scored=scoreEnergyAttachment(action,observation);
  if(scored>0)return scored;
  if(/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(target)))
    return 95;
  // Native selection can require an otherwise suboptimal attachment.
  // Choose from the actor's actual targets rather than abstaining or
  // inventing an illegal typed-energy assignment.
  return 15;
}
function promptDecision(request) {
  const p = request?.prompt ?? {};
  const choices = list(p.choices);
  const source = context(p);
  const obs = request?.observation ?? {};
  const meta = p.publicMetadata ?? {};
  if(protectedDdeInHand(obs) && /dedechange/.test(source) &&
      (p.promptType==='ConfirmPrompt'||p.promptType==='SelectPrompt')) {
    const no=choices.find(c=>c.kind==='confirm'&&/^(?:no|false|decline)$/i.test(c.label??''));
    return no?{kind:'select-choice',token:no.token}:
      {kind:'abstain',reasonCode:'RANK32_DDE_PROTECTED_DRAWDISCARD_PROMPT'};
  }
  const engine = engineSetupDecision(p,obs,choices);
  if (engine !== null) return engine;
  const min = Number.isSafeInteger(meta.minimumCount) ? meta.minimumCount : 1;
  const max = Number.isSafeInteger(meta.maximumCount) ? meta.maximumCount :
    (Number.isSafeInteger(meta.count) ? meta.count : Math.max(1,min));
  if (p.promptType === 'ChooseAttackPrompt' && /apex dragon/.test(source)) {
    return chooseRank32Apex(choices, obs);
  }
  if (/trifrost|kyurem sfa 47/.test(source) &&
      p.promptType==='ChoosePokemonPrompt') {
    return chooseTrifrostTargets(p,obs);
  }
  if (/legacy star/.test(source)) {
    // The native seven-card mill has already resolved before this prompt;
    // its offered tokens are authoritative even if the observation's earlier
    // discard snapshot or VSTAR-used flag has not yet been updated.
    if (p.promptType==='ChooseCardsPrompt' &&
        meta.selectionType==='card-combination'&&
        meta.sourceZone==='discard') {
      return chooseMany(choices,c=>legacyRecoverPriority(c,obs),min,Math.min(max,2),
        'RANK32_LEGACY_NO_SAFE_RECOVERY');
    }
    if (p.promptType==='ConfirmPrompt' && meta.selectionType==='confirm') {
      const useful=list(obs.ownPublic?.discard).some(c=>legacyRecoverPriority(c,obs)>0);
      const enabled=canUseLegacyStar(obs)&&
        (useful||countDonors(obs.ownPublic??{})===0);
      const target=choices.find(c=>c.kind==='confirm' &&
        new RegExp(enabled?'^yes$':'^no$','i').test(c.label??''));
      return target?{kind:'select-choice',token:target.token}:
        {kind:'abstain',reasonCode:'UNRECOGNIZED_SIMPLE_PROMPT'};
    }
    return {kind:'abstain',reasonCode:'RANK32_LEGACY_PROMPT_UNPROJECTED'};
  }
  if (/counter catcher|guzma/.test(source) && meta.selectionType==='pokemon') {
    const own=obs.ownPublic??{};
    const isGuzma=/guzma/.test(source);
    const benched=isGuzma?list(own.bench).find(p=>canAttackNow(p,obs)):null;
    const pivot=isGuzma&&!benched?zeroRetreatGuzmaPivot(obs):null;
    const attacker=isGuzma?(benched??(pivot?own.active:null)):own.active;
    return chooseMany(choices,c=>{
      const target=targetFromGustChoice(c,obs);
      if(c?.publicMetadata?.ownerSeat==='actor') {
        return isGuzma&&(canAttackNow(target,obs)||pivot===target)?300:0;
      }
      return strategicGustPriority(target,obs,attacker);
    },min,Math.min(max,1),'RANK32_GUST_NO_LETHAL_TARGET');
  }
  if (/crispin/.test(source)) {
    if(p.promptType==='ChooseCardsPrompt' && meta.sourceZone==='deck') {
      const picked=crispinDeckEnergyChoice(p,obs,choices);
      if(picked!==null)return picked;
    }
    if(p.promptType==='ChoosePokemonPrompt' && meta.selectionType==='pokemon')
      return chooseMany(choices,c=>{
        if(c?.publicMetadata?.ownerSeat!=='actor')return 0;
        const target=targetFromGustChoice(c,obs);
        if(!target || !/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(target)))
          return 0;
        const deficit=apexTypedDeficit(target,obs);
        return deficit>0? 220+
          (/^Regidrago VSTAR SIT 136\b/i.test(print(target))?50:0)
          -Math.min(20,deficit*4):0;
      },min,Math.min(max,1),'RANK32_CRISPIN_NO_ENERGY_TARGET');
    // Do not attempt unknown intermediate energy-to-hand prompt families:
    // only native-offered, correctly projected token types are supported.
    return {kind:'abstain',reasonCode:'RANK32_CRISPIN_UNPROJECTED'};
  }
  if (/cynthia\s*&\s*caitlin/.test(source)) {
    if (p.promptType === 'ChooseCardsPrompt' &&
        meta.selectionType === 'card-combination') {
      if (meta.sourceZone === 'discard') {
        return chooseMany(choices,c=>cynthiaRecoverPriority(c,obs),min,Math.min(max,1),
          'RANK32_CYNTHIA_NO_SUPPORTER_TO_RECOVER');
      }
      if (meta.sourceZone === 'hand') {
        return chooseMany(choices,c=>donorScore(c,obs,false),min,Math.min(max,1),
          'RANK32_CYNTHIA_NO_SAFE_DRAW_DISCARD');
      }
    }
    if (p.promptType === 'ConfirmPrompt' && meta.selectionType === 'confirm') {
      const safe=list(obs.ownHand).some(c=>donorScore(c,obs,false)>0);
      const desired=choices.find(c=>c.kind==='confirm'&&
        new RegExp(safe?'^yes$':'^no$','i').test(c.label??''));
      return desired?
        {kind:'select-choice',token:desired.token}:
        {kind:'abstain',reasonCode:'UNRECOGNIZED_SIMPLE_PROMPT'};
    }
    return {kind:'abstain',reasonCode:'RANK32_CYNTHIA_PROMPT_UNPROJECTED'};
  }
  if (/raihan/.test(source) &&
      p.promptType==='AttachEnergyPrompt' &&
      meta.selectionType==='energy-attachment'&&
      meta.sourceZone==='discard'&&meta.ownerSeat==='actor') {
    return chooseMany(choices,c=>raihanAttachPriority(c,obs),1,1,
      'RANK32_RAIHAN_NO_SAFE_PUBLIC_ASSIGNMENT');
  }
  if (/vs seeker/.test(source) &&
      p.promptType==='ChooseCardsPrompt' &&
      meta.selectionType==='card-combination'&&meta.sourceZone==='discard') {
    return chooseMany(choices,c=>seekerSupporterPriority(c,request),min,Math.min(max,1),
      'RANK32_VS_SEEKER_NO_USEFUL_SUPPORTER');
  }
  if (/super rod/.test(source)) {
    if (p.promptType==='ChooseCardsPrompt' &&
        meta.selectionType==='card-combination' && meta.sourceZone==='discard')
      return chooseMany(choices,c=>superRodRecoverPriority(c,obs),min,Math.min(max,3),
        'RANK32_SUPER_ROD_NO_SAFE_RECOVERY');
    return {kind:'abstain',reasonCode:'RANK32_SUPER_ROD_PROMPT_UNPROJECTED'};
  }
  if (/battle compressor/.test(source) && p.promptType === 'ChooseCardsPrompt') {
    return chooseMany(choices, c=>donorScore(c,obs,true), min, Math.min(max,3),
      'RANK32_COMPRESSOR_NO_SAFE_PAYLOAD');
  }
  if (/mysterious treasure|quick ball|ultra ball/.test(source) && /discard/.test(source) &&
      p.promptType === 'ChooseCardsPrompt') {
    return chooseMany(choices,c=>safeBallCost(c,obs), min,max,
      'RANK32_BALL_NO_SAFE_DISCARD');
  }
  if (/ryuno glide/.test(source) && p.promptType === 'ChooseEnergyPrompt') {
    // V3 protocol represents energy-payment as ChooseEnergyPrompt, not
    // DiscardEnergyPrompt. Its cardinality is 1..energyCount, NOT min/max.
    if (meta.selectionType !== 'energy-payment' ||
        !Number.isSafeInteger(meta.energyCount) || meta.energyCount < 1 ||
        meta.energyCount > choices.length ||
        choices.some(c=>c.kind !== 'energy' || typeof c.token !== 'string')) {
      return {kind:'abstain',reasonCode:'RANK32_RYUNO_ENERGY_PROMPT_UNPROJECTED'};
    }
    const basic = choices.filter(c=>/^Grass Energy|^Fire Energy/i.test(print(c)));
    const dde = choices.filter(c=>/^Double Dragon Energy/i.test(print(c)));
    // Two separate Basic Energy cards pay a two-Energy discard without
    // sacrificing DDE; one DDE may provide two Energy if needed.
    if (basic.length >= 2) {
      return {kind:'select-choices',tokens:basic.slice(0,2).map(c=>c.token)};
    }
    if (dde.length) return {kind:'select-choices',tokens:[dde[0].token]};
    return {kind:'abstain',reasonCode:'RANK32_RYUNO_NO_SUPPORTED_ENERGY_PAYMENT'};
  }
  if (/stealthy hood/.test(source) && meta.selectionType === 'pokemon') {
    const enemyWobbuffet = /^Wobbuffet PHF 36\b/i.test(print(obs?.opponentPublic?.active));
    if (!enemyWobbuffet || obs?.ownPublic?.publicTurnRestrictions?.vstarUsed !== false) {
      return {kind:'abstain',reasonCode:'RANK32_HOOD_LOCK_WINDOW_ABSENT'};
    }
    return chooseMany(choices,c=>/^Regidrago VSTAR SIT 136\b/i.test(print(c)) ? 250 : 0,
      min,Math.min(max,1),'RANK32_HOOD_NO_SAFE_VSTAR_TARGET');
  }
  if (/ryuno glide/.test(source)) {
    return {kind:'abstain',reasonCode:'RANK32_RYUNO_ENERGY_PROMPT_UNPROJECTED'};
  }
  const inherited = family.promptDecision(request);
  if (inherited?.kind === 'abstain' && typeof inherited.reasonCode === 'string') {
    return {...inherited, reasonCode:inherited.reasonCode.replaceAll('RANK12','RANK32')};
  }
  return inherited;
}
function bestAction(request) {
  const actions = list(request?.actionFrontier?.items).filter(a=>EXECUTABLE.has(a.kind));
  if (!actions.length) return {kind:'abstain',reasonCode:'RANK32_NO_EXECUTABLE_ACTION'};
  const ranked = actions.map((a,index)=>({a,index,score:scoreAction(a,request)}))
    .sort((a,b)=>b.score-a.score || a.index-b.index);
  if (ranked[0].score > 0) return {kind:'select-action',token:ranked[0].a.token};
  const pass = actions.find(a=>a.kind==='pass');
  return pass ? {kind:'select-action',token:pass.token} :
    {kind:'abstain',reasonCode:'RANK32_NO_SUPPORTED_ACTION'};
}
function protocolSafeDecision(decision, request) {
  if (!decision || decision.kind !== 'abstain') return decision;
  const reason = decision.reasonCode ?? '';
  if (reason === 'ROLE_SEAT_BINDING_MISMATCH') return decision;
  // The production V3 worker has a frozen, finite abstention codebook.
  // Internal diagnostic reason codes can be source-specific, but the worker
  // must publish only protocol-enumerated codes.
  let code = 'UNSUPPORTED_PROMPT_TYPE';
  if (request?.prompt === null || request?.prompt === undefined)
    code = 'NO_SUPPORTED_ROOT_ACTION';
  else if (/PRIZE|HEAVY_BALL/i.test(reason)) code = 'NO_VISIBLE_PRIZE_SLOT';
  else if (/RYUNO|ENERGY_PAYMENT|ENERGY_PROMPT/i.test(reason))
    code = 'NO_SUPPORTED_ENERGY_PAYMENT';
  else if (/APEX|ATTACK/i.test(reason)) code = 'NO_SUPPORTED_ATTACK_CHOICE';
  else if (/POKEMON|HOOD|SKY_TRANSPORT|GUST/i.test(reason))
    code = 'NO_SUPPORTED_POKEMON_CHOICE';
  else if (/CARD|BALL|DISCARD|COMPRESSOR|SUPPORTER|SEARCH/i.test(reason))
    code = 'NO_SUPPORTED_CARD_SELECTION';
  return {kind:'abstain',reasonCode:code};
}
function createPolicy({role,seat,policyVersion,config,rng}) {
  if (role!=='opponent' || (seat!==0 && seat!==1) ||
      policyVersion!==POLICY_VERSION || !config ||
      typeof config!=='object' || Array.isArray(config) ||
      Object.keys(config).length!==0 || typeof rng!=='function') {
    throw Error('AGENT3_RANK32_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role!=='opponent' || request.seat!==seat ||
          request.observation?.actorSeat!==seat) {
        return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
      }
      const decision = request.prompt !== null && request.prompt !== undefined ?
        promptDecision(request) : bestAction(request);
      return protocolSafeDecision(decision,request);
    }
  });
}
module.exports = {POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,ENGINE_PIN,
  createPolicy,scoreAction,promptDecision,bestAction,chooseRank32Apex,donorScore,
  protocolSafeDecision,apexTypedDeficit,scoreEnergyAttachment,nativeOwnerTarget,
  engineSetupDecision,setupActiveScore,setupBenchScore,
  isSourceSupporter,cynthiaRecoverPriority,
  legacyRecoverPriority,canUseLegacyStar,superRodRecoverPriority,estimatedDragonDamage,
  strongestCopiedDamage,canAttackNow,tacticalGustScore,gustTargetPriority,targetFromGustChoice,
  aceSpecBlowerPriority,muscleBandPriority,evolveRegidragoPriority,retreatToAttackerPriority,
  prizeValue,crispinAccelerationPriority,crispinDeckEnergyChoice,
  chooseTrifrostTargets,protectedDdeInHand,seekerSupporterPriority,
  readyMimikyuCounterAls,raihanAttachPriority};
