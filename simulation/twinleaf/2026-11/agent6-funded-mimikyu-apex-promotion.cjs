'use strict';

const assert=require('node:assert/strict');
const {twoUnitPayment}=
  require('../agent42-public-two-unit-paid-retreat-proposal.cjs');
const {publicEnergyContext,publicSpecialAttackPayable}=
  require('../agent17-public-context-special-energy.cjs');
const {observedOpponentActiveForbidsRetreat}=
  require('../agent35-opponent-active-retreat-lock.cjs');
const {wouldLoseActivePositionAbility}=
  require('../agent47-active-position-retreat-veto.cjs');

const VERSION='agent6-funded-mimikyu-post-apex-paid-promotion-v1';
const MIMIKYU='Mimikyu GRI';
const DIALGA='Dialga-GX UPR';
const REGIDRAGO='Regidrago VSTAR SIT';
const FLOAT_STONE='Float Stone BKT';

/**
 * Propose one actor-owned, actual-Store-subject Retreat into an already
 * completely funded Mimikyu when the previous public opponent turn exposed
 * non-GX Apex Dragon, the owner's GX allowance is unused, and the physical
 * Dialga-GX Timeless-GX donor is already in the own public discard.
 *
 * The line is deliberately conditional: no deck/prize identities, no
 * opponent hidden state, no forecast of future attacks or Ability uses.
 * The pinned Store still determines Retreat legality, payments, promotion,
 * ChooseAttackPrompt targets and eventual damage/effects.
 *
 * @param {object} view Detached actorObservation with publicEventReceipt.
 * @param {object} catalog Public pinned card and Energy printing catalog.
 * @returns {object|null} Native-neutral Retreat intent.
 */
function chooseFundedMimikyuApexPromotion(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const active=own?.active;
  const r=view.ownTurnResources;
  const receipt=view.publicEventReceipt;
  if(view.globalTurn<=1||!active||active.printing===MIMIKYU||
      !r||!Number.isSafeInteger(r.retreatedTurn)||
      r.retreatedTurn===view.globalTurn||
      own.publicTurnRestrictions?.gxUsed===true||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      !own.discard?.includes(DIALGA)||
      receipt?.actorSeat!==view.actorSeat||
      receipt.turn!==view.globalTurn||
      !Number.isSafeInteger(receipt.opponentLastTurnTurn)||
      receipt.opponentLastTurnTurn>=view.globalTurn||
      !Array.isArray(receipt.opponentCopycatChoices)||
      !receipt.opponentCopycatChoices.some(row=>
        row.turn===receipt.opponentLastTurnTurn&&
        row.sourcePrinting===REGIDRAGO&&
        row.attackName==='Apex Dragon'&&
        row.gxAttack===false))
    return null;

  if(observedOpponentActiveForbidsRetreat(view)||
      active.publicRestrictions?.cannotRetreatWhileActive===true||
      active.publicRestrictions?.cannotRetreatNextTurn===true||
      (active.specialConditions??[]).some(c=>
        c===catalog.specialConditions?.ASLEEP||
        c===catalog.specialConditions?.PARALYZED))
    return null;

  // Do not displace an already payable Active attack without comparing
  // its tactical value; this conditional slice resolves only a stranded
  // Active whose current attack is unavailable.
  if((active.attacks??[]).some(a=>
    publicSpecialAttackPayable(view,catalog,active,a)))return null;

  const psychic=catalog.basicEnergyTypes?.Psychic;
  const colorless=catalog.colorlessEnergyType;
  if(!Number.isSafeInteger(psychic)||!Number.isSafeInteger(colorless))
    return null;

  const benchIndex=own.bench?.findIndex(p=>{
    if(p?.printing!==MIMIKYU||p.energies?.length!==2||
        !p.energies.every(e=>
          catalog.basicEnergies?.has(e)===true&&
          e.startsWith('Psychic Energy '))||
        p.publicRestrictions?.cannotAttackNextTurn===true)return false;
    const copycat=p.attacks?.find(a=>a.name==='Copycat');
    return copycat?.gxAttack===false&&
      Array.isArray(copycat.cost)&&copycat.cost.length===2&&
      copycat.cost[0]===psychic&&copycat.cost[1]===colorless;
  })??-1;
  if(benchIndex<0||
      wouldLoseActivePositionAbility(view,benchIndex))return null;

  const stadiums=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const jamming=stadiums.some(s=>s.startsWith('Jamming Tower '))||
    view.opponentPublic?.active?.tools?.some(s=>
      s.startsWith('Tool Jammer '))===true;
  const cost=active.printed?.retreatCost;
  if(!Array.isArray(cost)||!Array.isArray(active.energies))return null;

  let payment=null,mode=null;
  if(active.tools?.includes(FLOAT_STONE)&&!jamming&&
      cost.length<=2){
    mode='float-stone-free';
    payment={indices:[],printings:[]};
  }else if(cost.length===0){
    mode='printed-zero';
    payment={indices:[],printings:[]};
  }else if(cost.length===2&&cost.every(c=>c===colorless)&&
      active.tools?.length===0&&stadiums.length===0&&
      active.energies.every(e=>catalog.basicEnergies?.has(e)===true)){
    payment=twoUnitPayment(active.energies,
      publicEnergyContext(view,active,catalog));
    if(payment)mode='two-unit-basic-paid';
  }
  if(!payment)return null;

  return {
    kind:'paid-retreat',source:VERSION,
    benchIndex,printing:MIMIKYU,
    previousOpponentAttack:'Apex Dragon',
    previousOpponentSource:REGIDRAGO,
    ownerDiscardDonor:DIALGA,
    paymentMode:mode,
    predictedPaymentIndices:payment.indices,
    predictedPaymentPrintings:payment.printings,
    exactOwnerVisibleCondition:true,
    nativeRetreatAndCopycatUnverified:true,
    competitiveGameQualified:false
  };
}

module.exports={VERSION,chooseFundedMimikyuApexPromotion};
