'use strict';

const assert=require('node:assert/strict');
const {isGuzma}=require('./agent2-held-guzma-mobility-frontier.cjs');

const VERSION='agent41-owner-mew-vmax-guzma-retreat-reset-v1';
const MEW='Mew VMAX FST';
const GENESECT='Genesect V FST';
const DCE='Double Colorless Energy SUM';

/**
 * One known two-Colorless Cross Fusion Strike funded by precisely one DCE.
 * Checks only public cards; excludes unknown cost modifiers and effects.
 * @param {object} pokemon
 * @param {object} catalog
 * @returns {boolean}
 */
function publicDceCrossFusionReady(pokemon,catalog){
  if(pokemon?.printing!==MEW||pokemon.energies?.length!==1||
     pokemon.energies[0]!==DCE)return false;
  return (pokemon.attacks??[]).some(a=>
    a.name==='Cross Fusion Strike'&&
    Array.isArray(a.cost)&&a.cost.length===2&&
    a.cost.every(t=>t===catalog.colorlessEnergyType));
}

/**
 * Player-wide and turn-budget restrictions shared by the two phases.
 * @param {object} view Owner-visible detached observation.
 * @param {object} catalog Public static numeric catalog.
 * @returns {boolean}
 */
function canRetreatIntoMew(view,catalog){
  const own=view.ownPublic,r=view.ownTurnResources;
  if(view.decisionKind!=='owner-root'||!own?.active||
     view.globalTurn<=1||!Number.isSafeInteger(r?.retreatedTurn)||
     r.retreatedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return false;
  const active=own.active;
  if(!Array.isArray(active.printed?.retreatCost)||
     active.printed.retreatCost.length!==0||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(t=>
       t===catalog.specialConditions?.ASLEEP||
       t===catalog.specialConditions?.PARALYZED))return false;
  return true;
}

/**
 * Any newly gusted Active Pokémon that continuously forbids ordinary Retreat
 * defeats the second step, even when the temporary Mew itself has zero printed
 * retreat. Exact Snorlax PGO is grounded by its Block Ability; other visible
 * printed Ability texts are conservatively screened for the same effect.
 * An Ability lock can sometimes suppress these effects, so this is a
 * conservative opportunity veto, not a proof that native Retreat is illegal.
 * @param {object} pokemon Opponent publicly visible Bench Pokémon.
 * @returns {boolean}
 */
function mayBlockRetreatWhenGusted(pokemon){
  if(pokemon?.printing==='Snorlax PGO')return true;
  return (pokemon?.abilityDetails??[]).some(power=>
    typeof power.text==='string'&&
    /opponent['’]s active pok[eé]mon can['’]t retreat/i.test(power.text));
}

/**
 * Propose a held Guzma to Bench a Techno-Blast-restricted Active Mew VMAX,
 * promoting a DIFFERENT zero-Retreat Mew VMAX. A subsequent ordinary Retreat
 * can then return to the original DCE-bearing attacker, if the native Store
 * clears its attack restriction on moving to Bench as the paper rules require.
 *
 * This is an OWNER-ONLY intent, NOT verified native root/prompt/payments.
 * The opponent's actual Bench and target printing are public.
 * @param {object} view
 * @param {object} catalog
 * @returns {object|null}
 */
function chooseGuzmaMewCooldownReset(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,opp=view.opponentPublic,r=view.ownTurnResources;
  if(!own?.active||!Array.isArray(own.bench)||
     !Array.isArray(opp?.bench)||!opp.bench.some(Boolean)||
     !Array.isArray(view.ownHand)||r?.supporterPlayedTurn!==0||
     r.supporterPlayLocked!==false||
     own.publicTurnRestrictions?.supporterPlayLocked===true||
     (own.resolvingSupporter?.length??0)>0||
     !canRetreatIntoMew(view,catalog)||
     !publicDceCrossFusionReady(own.active,catalog)||
     own.active.publicRestrictions?.cannotAttackNextTurn!==true||
     !own.bench.some(p=>p?.printing===GENESECT)||
     [...(own.stadium??[]),...(opp.stadium??[])]
       .some(s=>s.startsWith('Temple of Sinnoh ')))return null;
  const handIndex=view.ownHand.findIndex(isGuzma);
  if(handIndex<0)return null;
  // Require the promoted temporary Active to be a printed free-retreat
  // Mew VMAX, to leave all other printed retreat costs outside this proof.
  const benchIndex=own.bench.findIndex(p=>p?.printing===MEW&&
    p.energies?.length===0&&
    Array.isArray(p.printed?.retreatCost)&&
    p.printed.retreatCost.length===0&&
    p.publicRestrictions?.cannotRetreatNextTurn!==true&&
    p.publicRestrictions?.cannotRetreatWhileActive!==true);
  if(benchIndex<0)return null;
  const opponents=opp.bench.map((p,index)=>({p,index})).filter(x=>
    x.p&&!mayBlockRetreatWhenGusted(x.p)&&
    Number.isSafeInteger(x.p.hp)&&
    Number.isSafeInteger(x.p.damage)&&
    x.p.hp>x.p.damage);
  if(!opponents.length)return null;
  opponents.sort((a,b)=>
    (a.p.hp-a.p.damage)-(b.p.hp-b.p.damage)||a.index-b.index);
  return {
    kind:'play-guzma-mew-cooldown-reset',
    printing:view.ownHand[handIndex],handIndex,benchIndex,
    opponentBenchIndex:opponents[0].index,
    expectedReturnPrinting:MEW,expectedDonorPrinting:GENESECT,
    secondPhase:'free-retreat-to-dce-mew',
    attackName:'Cross Fusion Strike',
    nativePromptPaymentEffectVerified:false
  };
}

/**
 * Once the previous Mew moved to Bench, propose the genuine existing
 * free-retreat intent back to its DCE-bearing position. This phase does
 * not assume Guzma happened: every prerequisite remains owner-public.
 *
 * @param {object} view
 * @param {object} catalog
 * @returns {object|null}
 */
function chooseFreeRetreatToDceMew(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,opp=view.opponentPublic;
  if(!canRetreatIntoMew(view,catalog)||own.active.printing!==MEW||
     own.active.energies?.length!==0||
     !Array.isArray(own.bench)||
     !own.bench.some(p=>p?.printing===GENESECT)||
     [...(own.stadium??[]),...(opp?.stadium??[])]
       .some(s=>s.startsWith('Temple of Sinnoh ')))return null;
  const benchIndex=own.bench.findIndex(p=>
    publicDceCrossFusionReady(p,catalog)&&
    p.publicRestrictions?.cannotAttackNextTurn!==true&&
    !p.specialConditions?.some(t=>
      t===catalog.specialConditions?.ASLEEP||
      t===catalog.specialConditions?.PARALYZED));
  if(benchIndex<0)return null;
  return {
    kind:'free-retreat',benchIndex,printing:MEW,
    attackName:'Cross Fusion Strike',
    source:VERSION,attackingEffectClearedUnverified:true
  };
}

module.exports={VERSION,MEW,GENESECT,DCE,publicDceCrossFusionReady,
  mayBlockRetreatWhenGusted,
  canRetreatIntoMew,chooseGuzmaMewCooldownReset,
  chooseFreeRetreatToDceMew};
