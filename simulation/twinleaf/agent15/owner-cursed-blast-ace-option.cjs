'use strict';

const ACE='Ace Trainer AOR';
const DONORS=new Set(['Dusclops PRE','Dusclops SFA']);
const COUNTERS=5;
const VERSION='agent15-owner-cursed-blast-ace-trainer-public-opportunity-v1';

/**
 * Conditional, nonlethal Cursed Blast that can turn a held Ace Trainer
 * from illegal into legal by giving the opposing player one Prize.
 * Opposing hand identities remain hidden: only its public size is read.
 *
 * This is a tactical proposal that must be executed on a real Store and
 * checked against all Ability and Supporter locks. It is deliberately
 * conservative because the self-KO gives up a Prize irreversibly.
 *
 * @param {object} view Detached acting-owner root actorObservation.
 * @returns {object|null}
 */
function chooseOwnerCursedBlastAceTrainerOpportunity(view){
  if(view?.decisionKind!=='owner-root'||view.globalTurn<=1)return null;
  const own=view.ownPublic,opp=view.opponentPublic;
  const hand=view.ownHand??[];
  const r=view.ownTurnResources??{};
  if(!own||!opp||!hand.includes(ACE)||hand.length>3||
      !Number.isSafeInteger(own.prizeCount)||
      !Number.isSafeInteger(opp.prizeCount)||
      own.prizeCount!==opp.prizeCount||own.prizeCount<=1||
      !Number.isSafeInteger(opp.handCount)||opp.handCount<5||
      !Number.isSafeInteger(r.supporterPlayedTurn)||
      r.supporterPlayedTurn!==0||
      r.supporterPlayLocked===true||
      own.publicTurnRestrictions?.supporterPlayLocked===true||
      !Array.isArray(own.bench)||!Array.isArray(opp.bench))return null;
  const index=own.bench.findIndex(p=>p&&DONORS.has(p.printing)&&
    p.abilities?.includes('Cursed Blast'));
  if(index<0)return null;
  const options=[
    {slot:'ACTIVE',index:0,pokemon:opp.active},
    ...opp.bench.map((pokemon,index)=>({slot:'BENCH',index,pokemon}))
  ].filter(o=>o.pokemon&&typeof o.pokemon.printing==='string'&&
    Number.isFinite(o.pokemon.hp)&&Number.isFinite(o.pokemon.damage)&&
    o.pokemon.hp-o.pokemon.damage>COUNTERS*10);
  if(options.length===0)return null;
  const target=options[0];
  return {
    version:VERSION,mode:'ace-enable',sourcePrinting:own.bench[index].printing,
    sourceBenchIndex:index,abilityName:'Cursed Blast',
    damageCounters:COUNTERS,targetPrinting:target.pokemon.printing,
    targetSlot:target.slot,targetIndex:target.index,
    targetRemainingHp:target.pokemon.hp-target.pokemon.damage,
    nextSupporterPrinting:ACE,
    precondition:'public equal Prizes; self-KO makes owner behind one Prize',
    handBefore:hand.length,opponentPublicHandBefore:opp.handCount,
    printedPrizeCostToOpponent:1,
    requiresNativeAbilityLegality:true,
    requiresNativeTargetLegality:true,
    requiresNativeAceTrainerLegality:true,
    outcomeCertified:false,qualifiedCompetitiveGame:false
  };
}
module.exports={ACE,DONORS,COUNTERS,VERSION,chooseOwnerCursedBlastAceTrainerOpportunity};
