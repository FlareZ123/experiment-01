'use strict';
/*
 * New Moon Dusknoir v3 — exact actor-frontier finisher continuation.
 * Research-only. Not an admitted policy or full-game simulation.
 * Retains state ONLY within one candidate policy process; resets on changed
 * global turn, changed actor, invalid opponent board, or missing continuation.
 * No hidden cards / opponent-hand contents / native Store state.
 */
const oldSetup=require('./agent1-newmoon-v2-jammer-decision.cjs');
const POLICY_VERSION='agent1-newmoon-dusknoir-v3-finisher-research-v1';
const DECK_PATH='results/als/new-moon-dusknoir-shadow-bind-v3-60.json';
const DECK_SHA='0db19a75d0d1ce43128b9a9fdc4fe3013833eaaba4641972af7af30f4b41e7dd'; // sorted UTF-8 id:count lines + final newline
const has=(v,s)=>typeof v==='string'&&v.includes(s);
const isInt=x=>Number.isSafeInteger(x);
const slots=p=>[p?.active,...(Array.isArray(p?.bench)?p.bench:[])].filter(Boolean);
function live(slot,ability){
 if(!Array.isArray(slot?.abilities)||!slot.abilities.includes(ability))return false;
 const s=slot.abilitySuppressions?.find(x=>x.abilityName===ability);
 return s?.suppressed===false;
}
const noTool=p=>Array.isArray(p?.tools)&&p.tools.length===0;
const attackSafe=p=>Array.isArray(p?.specialConditions)&&!p.specialConditions.some(x=>
    isInt(x)||['ASLEEP','PARALYZED','CONFUSED'].includes(String(x).toUpperCase()));
const targets=[
 {name:'Regidrago VSTAR',hp:280,attack:'Night Watch',damage:150},
 {name:'Mega Absol ex',hp:280,attack:'Night Watch',damage:150},
 {name:'Mega Lopunny ex',hp:330,attack:'Miraculous Duo-GX',damage:200},
 {name:'Mega Kangaskhan ex',hp:300,attack:'Miraculous Duo-GX',damage:200},
 {name:'Iron Thorns ex',hp:230,attack:'Miraculous Duo-GX',damage:200}
];
const select=(item,why)=>item?{decision:{kind:'select-action',token:item.token},reason:why}:null;
function verifiedAttackDamage(x,expected) {
 const m=x?.publicMetadata;
 if(!m||m.attackCostPayable!==true||
    m.damagePrevented===true || m.hasUnmodeledModifier===true ||
    (Number.isFinite(m.damageReduced)&&m.damageReduced>0) ||
    (Number.isFinite(m.damageAfterResistance)&&m.damageAfterResistance<expected)) return false;
 return true;
}

function sourceAttack(items,own,attackName) {
 const active=own.active;
 if(!active||!attackSafe(active))return null;
 return items.find(x=>{
   if(x.kind!=='attack'||x.attackName!==attackName||
       !verifiedAttackDamage(x,attackName==='Night Watch'?150:200))return false;
   const s=x.publicMetadata?.attackSource;
   if(attackName==='Miraculous Duo-GX'){
     return has(active.printing,'Mewtwo & Mew-GX') &&
       x.actorPrinting===active.printing &&
       s?.sourceKind==='active-pokemon' && s.sourceSlot==='ACTIVE' &&
       s.sourceCardFullName===active.printing &&
       own.publicTurnRestrictions?.gxUsed===false;
   }
   if(has(active.printing,'Trevenant & Dusknoir-GX')){
     return x.actorPrinting===active.printing&&
       s?.sourceKind==='active-pokemon'&&s.sourceSlot==='ACTIVE'&&
       s.sourceCardFullName===active.printing;
   }
   if(!has(active.printing,'Mewtwo & Mew-GX')||!live(active,'Perfection')||
      !Array.isArray(own.bench))return false;
   return own.bench.some((d,i)=>has(d?.printing,'Trevenant & Dusknoir-GX') &&
     x.actorPrinting===d.printing &&
     s?.sourceKind==='bench-pokemon'&&s.sourceSlot==='BENCH'&&
     s.sourceIndex===i&&s.sourceCardFullName===d.printing&&
     s.attackName==='Night Watch');
 });
}
function validTarget(view){
 const opp=view?.opponentPublic,own=view?.ownPublic,t=opp?.active;
 if(!own||!opp||!t||!Array.isArray(own.bench)||
   !isInt(view.globalTurn)||!isInt(own.prizeCount)||
   !isInt(opp.prizeCount)||!isInt(t.hp)||!isInt(t.damage)||
   !Number.isFinite(t.hp-t.damage)||t.damage>=t.hp||
   opp.prizeCount<=1||own.prizeCount<1||
   !noTool(t))return null;
 // No uncertain target Tool effects, variable HP printing, or previously
 // established damage prevention: these narrow printing gates are hypotheses,
 // not damage certifiers.
 const row=targets.find(x=>has(t.printing,x.name)&&t.hp===x.hp);
 if(!row)return null;
 const rem=t.hp-t.damage;
 if(rem<=row.damage||rem>row.damage+130)return null;
 return {row,rem};
}
function ready(view,items) {
 const check=validTarget(view);
 if(!check||!Array.isArray(items))return null;
 const own=view.ownPublic;
 const donors=own.bench.map((s,i)=>({s,i})).filter(x=>
   has(x.s?.printing,'Dusknoir')&&
   !has(x.s?.printing,'Trevenant & Dusknoir-GX')&&live(x.s,'Cursed Blast'));
 if(!donors.length)return null;
 const attack=sourceAttack(items,own,check.row.attack);
 if(!attack)return null;
 const ability=items.find(x=>x.kind==='use-ability'&&
   x.publicMetadata?.abilityName==='Cursed Blast'&&
   x.publicMetadata?.sourceZone==='bench'&&
   donors.some(d=>d.i===x.publicMetadata.sourceIndex&&
     (!x.actorPrinting||x.actorPrinting===d.s.printing)));
 return ability?{ability,attack,check,donor:donors.find(d=>d.i===ability.publicMetadata.sourceIndex)}:null;
}

/*
 * Structural v3 alternative: a paid Stage2 Shadow Bind takes the 140HP
 * Hooded BUS Vileplume directly. Unlike Cursed Blast it concedes no Prize.
 * The printed Stage2 attacker is not subject to BUS's Basic-only attack ban.
 */
function shadowBindBus(view,items) {
 const active=view?.ownPublic?.active,target=view?.opponentPublic?.active;
 if(!active||!target||!Array.isArray(items)||
   !has(active.printing,'Dusknoir')||has(active.printing,'Trevenant & Dusknoir-GX')||
   !has(target.printing,'Vileplume BUS')||target.hp!==140||
   !isInt(target.damage)||target.damage>=140||!attackSafe(active)||
   !Array.isArray(target.tools)||!target.tools.every(x=>has(x,'Stealthy Hood')))
   return null;
 const attack=items.find(x=>x.kind==='attack'&&x.attackName==='Shadow Bind'&&
   x.actorPrinting===active.printing&&verifiedAttackDamage(x,150)&&
   x.publicMetadata?.attackSource?.sourceKind==='active-pokemon'&&
   x.publicMetadata.attackSource.sourceSlot==='ACTIVE'&&
   x.publicMetadata.attackSource.sourceCardFullName===active.printing);
 return select(attack,'V3_PAID_STAGE2_SHADOW_BIND_KOS_HOODED_BUS_WITHOUT_SELF_KO');
}



function chooseStage2BusEscape(view,items) {
 const own=view?.ownPublic,opp=view?.opponentPublic;
 const target=opp?.active,active=own?.active;
 if(!own||!opp||!active||!target||!Array.isArray(own.bench)||
  !Array.isArray(items)||!has(target.printing,'Vileplume BUS')||
  target.hp!==140||!Array.isArray(target.tools)||
  !target.tools.some(x=>has(x,'Stealthy Hood'))||
  !live(target,'Disgusting Pollen'))return null;
 const pendingStage2=Array.isArray(view.ownHand)&&view.ownHand.some(x=>
  has(x,'Dusknoir')&&!has(x,'Trevenant & Dusknoir-GX'));
 const all=[{s:active,zone:'active',index:0},...own.bench.map((s,index)=>
  ({s,zone:'bench',index}))].filter(({s})=>s);
 const nPsi=x=>Array.isArray(x.s?.energies)?x.s.energies.filter(e=>
   has(e,'Basic Psychic Energy')||has(e,'Telepathic Psychic Energy')).length:0;
 const shadow=all.find(x=>has(x.s.printing,'Dusknoir')&&
  !has(x.s.printing,'Trevenant & Dusknoir-GX')&&x.zone==='bench'&&nPsi(x)>=3);
 if(shadow){
  const retire=items.find(i=>i.kind==='retreat'&&
    i.publicMetadata?.targetSeat==='actor'&&
    i.publicMetadata?.targetZone==='bench'&&
    i.publicMetadata.targetIndex===shadow.index&&
    i.targetPrinting===shadow.s.printing);
  if(retire)return select(retire,'V3_PROMOTE_PAID_STAGE2_SHADOW_BIND_ATTACKER');
 }
 const d=all.filter(x=>has(x.s.printing,'Dusclops')&&
  !has(x.s.printing,'Dusknoir'));
 const base=all.filter(x=>has(x.s.printing,'Duskull'));
 if(!d.length && base.length && Array.isArray(view.ownHand) &&
   view.ownHand.some(x=>has(x,'Dusclops'))) {
   for(const x of base) {
     const evolve=items.find(i=>i.kind==='play-card'&&
      i.publicMetadata?.cardType==='pokemon'&&
      has(i.actorPrinting,'Dusclops')&&
      i.publicMetadata?.targetSeat==='actor'&&
      i.publicMetadata?.targetZone===x.zone&&
      (x.zone==='active'||i.publicMetadata.targetIndex===x.index)&&
      (!i.targetPrinting||i.targetPrinting===x.s.printing));
     if(evolve)return select(evolve,'V3_EVOLVE_ESTABLISHED_DUSKULL_INTO_LOCK_BREAKER');
   }
 }
 if(!d.length&&!base.length&&Array.isArray(view.ownHand)&&
   view.ownHand.some(x=>has(x,'Duskull'))&&
   own.bench.filter(Boolean).length<5) {
   const benchDusk=items.find(i=>i.kind==='play-card'&&
    i.publicMetadata?.cardType==='pokemon'&&has(i.actorPrinting,'Duskull')&&
    (i.publicMetadata?.targetZone===undefined||
    (i.publicMetadata.targetZone==='bench'&&
     i.publicMetadata.targetSeat==='actor')));
   if(benchDusk)return select(benchDusk,'V3_BENCH_DUSKULL_FOR_STAGE2_LOCK_BREAK');
 }
 if(!d.length&&!base.length&&
   own.bench.filter(Boolean).length<5&&
   view.ownTurnResources?.energyPlayedTurn===0&&
   active.printed?.types?.includes('Psychic')===true) {
   const tpe=items.find(i=>i.kind==='play-card'&&
    i.publicMetadata?.cardType==='energy'&&
    has(i.actorPrinting,'Telepathic Psychic Energy')&&
    i.publicMetadata?.targetSeat==='actor'&&
    i.publicMetadata.targetZone==='active'&&
    (!i.targetPrinting||i.targetPrinting===active.printing));
   if(tpe)return select(tpe,'V3_TPE_RECRUIT_DUSKULL_UNDER_ITEM_AND_BASIC_LOCK');
 }

 if(!d.length&&!base.length)return null;
 // Strongest currently funded Stage1 is developed first; the actual host
 // action frontier certifies whether today's evolution is legal.
 const ordered=(d.length?d:base).slice().sort((a,b)=>nPsi(b)-nPsi(a)||
  (a.zone==='active'?-1:1));
 if(pendingStage2)for(const x of d){
  const evo=items.find(i=>i.kind==='play-card'&&
   i.publicMetadata?.cardType==='pokemon'&&
   has(i.actorPrinting,'Dusknoir')&&
   i.publicMetadata?.targetSeat==='actor'&&
   i.publicMetadata.targetZone===x.zone&&
   (x.zone==='active'||i.publicMetadata.targetIndex===x.index)&&
   (!i.targetPrinting||i.targetPrinting===x.s.printing));
  if(evo)return select(evo,'V3_EVOLVE_DUSCLOPS_TO_HOODED_BUS_SHADOW_BIND_ATTACKER');
 }
 if(view.ownTurnResources?.energyPlayedTurn!==0)return null;
 const energy=items.find(i=>i.kind==='play-card'&&
  i.publicMetadata?.cardType==='energy'&&
  i.publicMetadata?.targetSeat==='actor'&&
  ordered.some(x=>nPsi(x)<3&&
   i.publicMetadata.targetZone===x.zone&&
   (x.zone==='active'||i.publicMetadata.targetIndex===x.index)&&
   (!i.targetPrinting||i.targetPrinting===x.s.printing))&&
  (has(i.actorPrinting,'Basic Psychic Energy')||
    has(i.actorPrinting,'Telepathic Psychic Energy')));
 return energy?select(energy,'V3_FUND_STAGE2_SHADOW_BIND_THROUGH_BUS_LOCK'):null;
}

function aceSafe(view){
 const hand=view?.ownHand;
 if(!Array.isArray(hand))return false; // unknown hand cannot price its own loss
 if(hand.some(x=>has(x,'Secret Box')))return false;
 if(view?.ownPublic?.publicTurnRestrictions?.vstarUsed===false &&
    hand.some(x=>has(x,'Forest Seal Stone')))return false;
 return true;
}


const COMMON_SETUP_REASONS = new Set([
 'NEWMOON_PREFER_GO_SECOND_FOR_FIRST_HORROR_HOUSE',
 'STARTER_GENGAR_PERFECTION_AND_BACKUP','NO_STARTING_BASIC_ELIGIBLE',
 'MULLIGAN_MAXIMUM_EXTRA_CARDS','BENCH_HELD_GENGAR_DONOR_BEFORE_SEARCH',
 'ATTACH_TPE_FOR_ATTACK_AND_SEARCH','ATTACH_BASIC_PSYCHIC_TO_ATTACK',
 'FIRST_TURN_BATTLE_VIP_BEFORE_ATTACK','FOG_CRYSTAL_FIND_ENERGY_OR_GENGAR',
 'FOG_CRYSTAL_CHOOSE_MISSING_PIECE','VIP_BASIC_BENCH_SEARCH',
 'TPE_BASIC_PSYCHIC_BENCH_SEARCH',
 'EARLY_NATIVE_HORROR_HOUSE_HAND_LOCK',
 'PERFECTION_DIRECT_COPIED_GENGAR_ATTACK',
 'LILLIE_DRAW_TO_FIND_MISSING_PSYCHIC'
]);
function preservedCommonSetup(request,policy){
 const x=policy.decideWithAudit(request),rule=x?.policyAudit?.selectionRuleCode;
 if(!COMMON_SETUP_REASONS.has(rule)||x.decision?.kind==='abstain')return null;
 // The old tool-jammer 60 is not v3: never use its Jammer search/lock line.
 // Even its generic Lillie draw is unsuitable with a critical held Dusknoir.
 if(rule==='LILLIE_DRAW_TO_FIND_MISSING_PSYCHIC'&&
    (request.observation?.ownHand??[]).some(y=>
       has(y,'Dusknoir')||has(y,'Secret Box')||has(y,'Forest Seal Stone')))
    return null;
 return {decision:x.decision,reason:'V3_REUSE_'+rule};
}

function createPolicy({role,seat,policyVersion,config}) {
 if(role!=='candidate'||![0,1].includes(seat)||
   policyVersion!==POLICY_VERSION||!config||typeof config!=='object'||
   Array.isArray(config)||Object.keys(config).length!==0)throw Error('V3_RESEARCH_PROFILE_MISMATCH');
 const baseSetup=oldSetup.createPolicy({role,seat,policyVersion:oldSetup.POLICY_VERSION,config:{}});
 let pending=null;
 function decideOne(request){
   if(request?.seat!==seat||request?.role!==role||
      request.observation?.actorSeat!==seat){pending=null;return null;}
   const v=request.observation;
   if(!isInt(v.globalTurn)){pending=null;return null;}
   if(pending && v.globalTurn!==pending.turn)pending=null;
   if(v.decisionKind==='owner-prompt'){
     const p=request.prompt;
     if(!pending||pending.phase!=='target'||p?.actingSeat!==seat||
       p?.source?.classification!=='actor-choice'||
       p?.source?.sourceKind!=='card-effect'||
       p?.source?.effectName!=='Cursed Blast'||
       !has(p?.source?.sourcePrinting,'Dusknoir')||
       p.promptType!=='ChoosePokemonPrompt'||
       p.publicMetadata?.selectionType!=='pokemon'||
       p.publicMetadata?.minimumCount!==1||
       p.publicMetadata?.maximumCount!==1||!Array.isArray(p.choices)){
         pending=null;return null;
     }
     const opponent=v.opponentPublic?.active;
     if(!opponent||opponent.printing!==pending.target ||
        opponent.damage!==pending.initialDamage){pending=null;return null;}
     const c=p.choices.find(x=>x.kind==='pokemon'&&
       x.publicMetadata?.isOwnerVisible===true&&
       x.publicMetadata?.ownerSeat==='opponent'&&
       x.publicMetadata?.targetZone==='active'&&x.printing===pending.target);
     if(!c){pending=null;return null;}
     pending.phase='settle';
     return {decision:{kind:'select-choices',tokens:[c.token]},
       reason:'V3_TARGET_ACTIVE_FOR_SAME_TURN_FINISH'};
   }
   if(v.decisionKind!=='owner-root'||request.prompt!==null||
      !Array.isArray(request.actionFrontier?.items)){pending=null;return null;}
   const items=request.actionFrontier.items;
   const own=v.ownPublic,opp=v.opponentPublic;
   if(pending){
     const target=opp?.active;
     const valid=target?.printing===pending.target&&
       target?.hp===pending.hp&&
       target?.damage>=pending.initialDamage+130&&
       target?.damage<target?.hp&&
       opp.prizeCount===pending.opponentPrizesBefore-1&&
       own?.prizeCount===pending.ownPrizesBefore&&
       own?.active?.printing===pending.attacker;
     if(!valid){pending=null;return null;}
     const attack=sourceAttack(items,own,pending.attackName);
     if(!attack){pending=null;return null;}
     const rem=target.hp-target.damage;
     if(rem>pending.attackDamage){pending=null;return null;}
     if(pending.phase==='settle'&&aceSafe(v)&&
         own.prizeCount>pending.targetPrizeValue&&
         own.prizeCount>opp.prizeCount&&
         opp.handCount>3&&
         v.ownTurnResources?.supporterPlayedTurn===0){
       const ace=items.find(x=>x.kind==='play-card'&&has(x.actorPrinting,'Ace Trainer'));
       if(ace){pending.phase='ace';
         return select(ace,'V3_ACE_TRAINER_ONLY_AFTER_CONFIRMED_BLAST');}
     }
     pending=null;
     return select(attack,'V3_FINISH_ATTACK_AFTER_SETTLED_BLAST');
   }
   const p=ready(v,items);
   if(!p)return shadowBindBus(v,items)??chooseStage2BusEscape(v,items);
   pending={
     turn:v.globalTurn,phase:'target',target:opp.active.printing,
     hp:opp.active.hp,initialDamage:opp.active.damage,
     opponentPrizesBefore:opp.prizeCount,ownPrizesBefore:own.prizeCount,
     attacker:own.active.printing,attackName:p.check.row.attack,
     attackDamage:p.check.row.damage,
     targetPrizeValue:has(opp.active.printing,'Mega ')?3:
       has(opp.active.printing,'Regidrago VSTAR')?2:2
   };
   return select(p.ability,'V3_BEGIN_PAID_SAME_TURN_DUSKNOIR_FINISH');
 }
 function decideWithAudit(request) {
   const x=decideOne(request)??preservedCommonSetup(request,baseSetup);
   const decision=x?.decision??{kind:'abstain',reasonCode:'NO_SUPPORTED_V3_FINISH'};
   const source=request?.prompt?.choices??request?.actionFrontier?.items??[];
   const selected=decision.token?[decision.token]:decision.tokens??[];
   return {decision,policyAudit:{
     schema:'agent6-policy-audit-v1',policyVersion:POLICY_VERSION,
     decisionKind:request?.observation?.decisionKind??'unknown',
     decisionType:decision.kind,selectionRuleCode:x?.reason??'V3_ABSTAIN',
     tieBreakCode:'NONE',selectedTokens:selected,
     evaluations:source.map(i=>({token:i.token,
       status:selected.includes(i.token)?'rule-selected':'not-evaluated',
       score:null,reasonCode:selected.includes(i.token)?x.reason:'UNSUPPORTED_IN_V3_SLICE'}))
   }};
 }
 return {decide:r=>decideWithAudit(r).decision,decideWithAudit};
}
module.exports={POLICY_VERSION,DECK_PATH,DECK_SHA,createPolicy,ready,validTarget,sourceAttack,shadowBindBus,aceSafe,verifiedAttackDamage,preservedCommonSetup,COMMON_SETUP_REASONS,chooseStage2BusEscape};
